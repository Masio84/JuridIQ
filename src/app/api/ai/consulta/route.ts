import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pregunta, buscarDocs } = body;

    if (!pregunta || typeof pregunta !== 'string') {
      return NextResponse.json(
        { error: 'La pregunta es requerida' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
      // Return mock response when API key is not configured
      return NextResponse.json({
        respuesta: `## Modo Demo\n\nLa API de Claude no está configurada. Esta es una respuesta de demostración.\n\n**Tu pregunta fue:** ${pregunta}\n\n### Para habilitar consultas reales:\n1. Obtén una API key de [Anthropic](https://console.anthropic.com)\n2. Agrega \`ANTHROPIC_API_KEY\` a tu archivo \`.env.local\`\n3. Reinicia el servidor de desarrollo`,
        tokens: 0,
        mock: true,
      });
    }

    // Real Claude API call
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `Eres un asistente jurídico experto en derecho mexicano. Tu rol es ayudar a abogados con:
- Consultas sobre leyes, códigos y reglamentos mexicanos
- Jurisprudencia de la SCJN y tribunales federales
- Redacción legal y estrategia procesal
- Interpretación de artículos legales

REGLAS:
1. Siempre cita las fuentes legales específicas (artículos, tesis, leyes)
2. Usa lenguaje profesional pero claro
3. Estructura tu respuesta con encabezados markdown
4. Si no estás seguro, indícalo claramente
5. Responde en español`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: pregunta }],
    });

    const respuesta = message.content[0].type === 'text'
      ? message.content[0].text
      : 'No se pudo generar una respuesta.';

    return NextResponse.json({
      respuesta,
      tokens: message.usage.input_tokens + message.usage.output_tokens,
      mock: false,
    });
  } catch (error) {
    console.error('AI Consultation Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la consulta. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
