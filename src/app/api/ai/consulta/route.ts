// ============================================================
// JuridIQ - API Route: Consultas IA (Protegida con Auth)
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Rate limit: máx 30 consultas por hora por usuario
const RATE_LIMIT_PER_HOUR = 30;

async function checkRateLimit(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('consultas_ia')
    .select('consulta_id', { count: 'exact', head: true })
    .eq('abogado_id', userId)
    .gte('fecha_consulta', oneHourAgo);

  return (count ?? 0) < RATE_LIMIT_PER_HOUR;
}

export async function POST(request: Request) {
  try {
    // 1. Verificar autenticación
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión.' },
        { status: 401 }
      );
    }

    // 2. Obtener perfil y despacho
    const { data: profile } = await supabase
      .from('profiles')
      .select('despacho_id, nombre_completo')
      .eq('id', user.id)
      .single();

    if (!profile?.despacho_id) {
      return NextResponse.json(
        { error: 'Tu cuenta no está vinculada a un despacho.' },
        { status: 403 }
      );
    }

    // 3. Rate limiting
    const withinLimit = await checkRateLimit(supabase, user.id);
    if (!withinLimit) {
      return NextResponse.json(
        { error: `Límite de consultas alcanzado (${RATE_LIMIT_PER_HOUR}/hora). Intenta más tarde.` },
        { status: 429 }
      );
    }

    // 4. Parsear body
    const body = await request.json();
    const { pregunta, tipo_consulta = 'general', expediente_id } = body;

    if (!pregunta || typeof pregunta !== 'string' || pregunta.trim().length === 0) {
      return NextResponse.json(
        { error: 'La pregunta es requerida.' },
        { status: 400 }
      );
    }

    if (pregunta.length > 5000) {
      return NextResponse.json(
        { error: 'La pregunta no puede superar 5000 caracteres.' },
        { status: 400 }
      );
    }

    // 5. Verificar API key de Claude
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'El servicio de IA no está configurado.' },
        { status: 503 }
      );
    }

    // 6. Llamar a Claude
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `Eres JuridIQ AI, un asistente jurídico experto en derecho mexicano. Ayudas a abogados profesionales con:

- Consultas sobre leyes, códigos y reglamentos mexicanos vigentes
- Jurisprudencia de la SCJN, TCC y tribunales federales
- Análisis de casos y estrategia procesal
- Redacción legal (demandas, contratos, recursos)
- Interpretación de artículos y tesis jurídicas

REGLAS ESTRICTAS:
1. Cita SIEMPRE las fuentes legales específicas (artículo, ley, tesis, expediente)
2. Usa lenguaje jurídico profesional pero claro
3. Estructura tu respuesta con encabezados markdown
4. Si no estás seguro de algo, indícalo explícitamente
5. Responde exclusivamente en español
6. No inventes jurisprudencia ni artículos que no existan
7. Agrega siempre una nota aclaratoria sobre consultar la legislación vigente`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: pregunta.trim() }],
    });

    const respuesta = message.content[0].type === 'text'
      ? message.content[0].text
      : 'No se pudo generar una respuesta.';

    const tokensUsados = message.usage.input_tokens + message.usage.output_tokens;

    // 7. Guardar consulta en la DB
    const { data: consultaGuardada } = await supabase
      .from('consultas_ia')
      .insert({
        despacho_id: profile.despacho_id,
        abogado_id: user.id,
        pregunta_original: pregunta.trim(),
        respuesta_claude: respuesta,
        tokens_utilizados: tokensUsados,
        tipo_consulta,
        expediente_id: expediente_id || null,
        compartida_con_cliente: false,
      })
      .select('consulta_id')
      .single();

    return NextResponse.json({
      respuesta,
      tokens: tokensUsados,
      consulta_id: consultaGuardada?.consulta_id,
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
