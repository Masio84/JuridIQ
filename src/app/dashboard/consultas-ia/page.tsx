'use client';

import { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit, Send, Loader2, Copy, BookmarkPlus, Share2,
  Clock, Search, ChevronDown, Sparkles,
} from 'lucide-react';
import { cn, formatFecha, getInitials } from '@/lib/utils';
import { mockConsultasIA, mockCurrentUser } from '@/lib/mock-data';

export default function ConsultasIAPage() {
  const [pregunta, setPregunta] = useState('');
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [buscarDocs, setBuscarDocs] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleConsultar = async () => {
    if (!pregunta.trim()) return;
    setLoading(true);
    setRespuesta('');

    // Simulate streaming response
    const mockResponse = `## Respuesta a tu consulta

Basado en la legislación mexicana vigente y jurisprudencia relevante:

### Análisis

${pregunta.toLowerCase().includes('prescripción') 
  ? `Los plazos de prescripción varían según el tipo de delito o acción legal:

1. **Materia Civil**: La regla general es de **10 años** para acciones personales (Art. 1159 CC Federal)
2. **Materia Penal**: Varía de **3 a 15 años** dependiendo de la penalidad (Art. 104-105 CPF)
3. **Materia Fiscal**: **5 años** para créditos fiscales (Art. 146 CFF)

### Excepciones Importantes
- Delitos imprescriptibles: genocidio, desaparición forzada
- Interrupción de la prescripción por gestión de cobro notificada`
  : `Esta consulta requiere un análisis detallado del marco legal aplicable. Los elementos principales a considerar son:

1. **Marco normativo aplicable**: Se deben revisar las disposiciones constitucionales y legales pertinentes
2. **Jurisprudencia relevante**: Existen tesis aisladas y contradictorias que pueden influir
3. **Criterios de la SCJN**: La Suprema Corte ha establecido lineamientos importantes al respecto`}

### Fuentes
- Código Civil Federal, Arts. 1159-1176
- Código Penal Federal, Arts. 100-115
- Tesis: 2a./J. 12/2020 - SCJN
- Constitución Política, Art. 14 y 16

> **Nota**: Esta respuesta es orientativa. Se recomienda consultar la legislación vigente completa para su caso específico.`;

    // Simulate character-by-character streaming
    for (let i = 0; i < mockResponse.length; i += 3) {
      await new Promise((r) => setTimeout(r, 5));
      setRespuesta(mockResponse.slice(0, i + 3));
    }
    setRespuesta(mockResponse);
    setLoading(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [pregunta]);

  const sugerencias = [
    '¿Cuál es el plazo de prescripción para delitos fiscales?',
    '¿Qué requisitos tiene una demanda de amparo indirecto?',
    '¿Cómo se calcula la pensión alimenticia?',
    '¿Cuáles son los tipos de despido en la Ley Federal del Trabajo?',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-500" />
            Consultar IA
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulta leyes, jurisprudencia y redacción legal con inteligencia artificial
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn btn-secondary btn-sm"
        >
          <Clock className="w-4 h-4" />
          Historial ({mockConsultasIA.length})
          <ChevronDown className={cn('w-4 h-4 transition-transform', showHistory && 'rotate-180')} />
        </button>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="card p-4 animate-slide-down">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Consultas Anteriores</h3>
          <div className="space-y-2">
            {mockConsultasIA.map((consulta) => (
              <button
                key={consulta.consulta_id}
                onClick={() => {
                  setPregunta(consulta.pregunta_original);
                  setRespuesta(consulta.respuesta_claude);
                  setShowHistory(false);
                }}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="text-sm font-medium text-slate-900 truncate">
                  {consulta.pregunta_original}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-400">{formatFecha(consulta.fecha_consulta)}</span>
                  <span className="text-xs text-slate-400">{consulta.tokens_utilizados} tokens</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                    {consulta.tipo_consulta}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query interface */}
      <div className="card p-6">
        <div className="flex items-start gap-3">
          <div className="avatar avatar-md bg-brand-800 text-white flex-shrink-0">
            {getInitials(mockCurrentUser.nombre_completo)}
          </div>
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleConsultar();
                }
              }}
              placeholder="Escribe tu pregunta legal aquí... (Ej: ¿Cuál es la prescripción en delitos fiscales?)"
              className="input min-h-[60px] resize-none text-base"
              rows={2}
            />

            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={buscarDocs}
                  onChange={(e) => setBuscarDocs(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5" />
                  Buscar en documentos propios
                </span>
              </label>

              <button
                onClick={handleConsultar}
                disabled={loading || !pregunta.trim()}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Consultar IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions (when no response) */}
      {!respuesta && !loading && (
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-3">Sugerencias de consulta</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {sugerencias.map((sug) => (
              <button
                key={sug}
                onClick={() => setPregunta(sug)}
                className="text-left p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-sm text-slate-600"
              >
                <span className="text-purple-500 mr-1.5">→</span>
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Response */}
      {(respuesta || loading) && (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-slate-900">Respuesta de JuridIQ AI</div>
                {!loading && (
                  <div className="flex items-center gap-1">
                    <button className="btn btn-ghost btn-sm" title="Copiar">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Guardar en expediente">
                      <BookmarkPlus className="w-3.5 h-3.5" />
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Compartir con cliente">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Render markdown-like content */}
              <div className="prose prose-sm prose-slate max-w-none">
                {respuesta.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace('## ', '')}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-base font-semibold text-slate-800 mt-3 mb-1">{line.replace('### ', '')}</h3>;
                  }
                  if (line.startsWith('> ')) {
                    return (
                      <blockquote key={i} className="border-l-4 border-blue-300 pl-4 py-2 my-3 bg-blue-50/50 rounded-r-lg text-sm text-slate-600 italic">
                        {line.replace('> ', '').replace('**', '').replace('**', '')}
                      </blockquote>
                    );
                  }
                  if (line.startsWith('- ')) {
                    return (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-600 ml-2 my-0.5">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span dangerouslySetInnerHTML={{
                          __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        }} />
                      </div>
                    );
                  }
                  if (line.match(/^\d+\./)) {
                    return (
                      <div key={i} className="text-sm text-slate-600 ml-2 my-0.5" dangerouslySetInnerHTML={{
                        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }} />
                    );
                  }
                  if (line.trim() === '') return <div key={i} className="h-2" />;
                  return (
                    <p key={i} className="text-sm text-slate-600" dangerouslySetInnerHTML={{
                      __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                  );
                })}
              </div>

              {loading && (
                <div className="flex items-center gap-2 mt-3 text-sm text-purple-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando respuesta...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
