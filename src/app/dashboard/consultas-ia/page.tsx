// ============================================================
// JuridIQ - Consultas IA Page (Conectado a API y DB Real)
// ============================================================
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit, Send, Loader2, Copy, BookmarkPlus, Share2,
  Clock, Search, ChevronDown, Sparkles, Check
} from 'lucide-react';
import { cn, formatFecha, getInitials } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/lib/hooks/useAuth';
import type { ConsultaIA } from '@/types/database';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConsultasIAPage() {
  const { profile } = useAuth();
  const [pregunta, setPregunta] = useState('');
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [buscarDocs, setBuscarDocs] = useState(true);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // History state
  const [historial, setHistorial] = useState<ConsultaIA[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load history
  useEffect(() => {
    if (!profile?.id) return;

    async function loadHistory() {
      try {
        const { data, error } = await supabase
          .from('consultas_ia')
          .select('*, abogado:profiles(nombre_completo)')
          .eq('abogado_id', profile!.id)
          .order('fecha_consulta', { ascending: false })
          .limit(20);

        if (error) throw error;
        setHistorial(data as any[] || []);
      } catch (error) {
        console.error('Error loading AI history:', error);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [profile, respuesta]); // Reload history when a new response is generated

  const handleConsultar = async () => {
    if (!pregunta.trim()) return;
    setLoading(true);
    setRespuesta('');

    try {
      const res = await fetch('/api/ai/consulta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pregunta,
          tipo_consulta: 'general',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar la consulta');
      }

      setRespuesta(data.respuesta);
    } catch (error: any) {
      console.error('AI Consultation error:', error);
      setRespuesta(`Error: ${error.message || 'Hubo un problema al contactar con la Inteligencia Artificial. Por favor intenta de nuevo.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [pregunta]);

  const copyToClipboard = () => {
    if (!respuesta) return;
    navigator.clipboard.writeText(respuesta);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sugerencias = [
    '¿Cuál es el plazo de prescripción para créditos fiscales según el CFF?',
    '¿Qué requisitos debe tener una demanda de amparo indirecto?',
    '¿Cómo se calcula el pago de prima vacacional según la LFT?',
    '¿Cuáles son las causales de despido justificado?',
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
            Consulta leyes, jurisprudencia y redacción legal (Claude 3.5 Sonnet)
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn btn-secondary btn-sm"
        >
          <Clock className="w-4 h-4" />
          Historial ({historial.length})
          <ChevronDown className={cn('w-4 h-4 transition-transform', showHistory && 'rotate-180')} />
        </button>
      </div>

      {showHistory && (
        <div className="card p-4 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Historial de Consultas</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar historial..."
                className="input h-8 pl-8 text-xs py-1"
              />
            </div>
          </div>
          
          {loadingHistory ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-slate-400 animate-spin" /></div>
          ) : historial.length === 0 ? (
            <div className="text-center py-4 text-sm text-slate-500">No hay consultas previas</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {historial.map((item) => (
                <div key={item.consulta_id} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors group">
                  <div className="text-sm font-medium text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {item.pregunta_original}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatFecha(item.fecha_consulta)}
                    </div>
                    <span className="text-[10px] text-slate-400">{item.tokens_utilizados} tokens</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Input Box */}
          <div className="card p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <label htmlFor="pregunta" className="block text-sm font-semibold text-slate-900 mb-2">
                ¿Qué necesitas investigar hoy?
              </label>
              <div className="relative">
                <textarea
                  id="pregunta"
                  ref={textareaRef}
                  value={pregunta}
                  onChange={(e) => setPregunta(e.target.value)}
                  placeholder="Ej: ¿Cuáles son las causales de despido justificado sin responsabilidad para el patrón según la Ley Federal del Trabajo?"
                  className="w-full resize-none p-4 pb-14 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white transition-all text-sm min-h-[120px] shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleConsultar();
                    }
                  }}
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={buscarDocs}
                      onChange={(e) => setBuscarDocs(e.target.checked)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-600"
                    />
                    <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5" />
                      Incluir mis expedientes
                    </span>
                  </label>
                  
                  <button
                    onClick={handleConsultar}
                    disabled={!pregunta.trim() || loading}
                    className="btn bg-purple-600 hover:bg-purple-700 text-white border-transparent disabled:bg-purple-300 shadow-sm shadow-purple-600/20 px-4 py-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Consultar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {!respuesta && !loading && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">
                  Sugerencias
                </p>
                <div className="flex flex-wrap gap-2">
                  {sugerencias.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => setPregunta(sug)}
                      className="text-xs bg-slate-50 text-slate-600 hover:bg-purple-50 hover:text-purple-700 px-3 py-1.5 rounded-full transition-colors border border-slate-100"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Response Box */}
          {(respuesta || loading) && (
            <div className="card p-6 border-purple-100 animate-slide-up">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-inner">
                    <BrainCircuit className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Respuesta de JuridIQ AI</h2>
                    <p className="text-xs text-slate-500">Basado en leyes mexicanas y SCJN</p>
                  </div>
                </div>
                {!loading && respuesta && (
                  <div className="flex gap-2">
                    <button onClick={copyToClipboard} className="btn btn-ghost btn-sm text-slate-500 hover:text-slate-700">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button className="btn btn-ghost btn-sm text-slate-500 hover:text-slate-700">
                      <BookmarkPlus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-purple-600">
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{respuesta}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="space-y-4">
          <div className="card p-5 bg-gradient-to-b from-purple-50 to-white border-purple-100">
            <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Tips de búsqueda
            </h3>
            <ul className="space-y-3 text-sm text-purple-800/80">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                <p>Menciona la ley específica para respuestas más precisas (ej. &quot;Según el CFF...&quot;).</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                <p>Pide redacción de documentos: &quot;Redacta un amparo indirecto contra...&quot;.</p>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                <p>Solicita tesis jurisprudenciales de la Suprema Corte de Justicia.</p>
              </li>
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Base de Conocimiento</h3>
            <div className="space-y-2">
              {[
                { name: 'Código Civil Federal', type: 'Ley Vigente' },
                { name: 'Código Penal Federal', type: 'Ley Vigente' },
                { name: 'Ley Federal del Trabajo', type: 'Ley Vigente' },
                { name: 'Tesis de SCJN (2020-2024)', type: 'Jurisprudencia' },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-2 rounded hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <BookmarkPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">{doc.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{doc.type}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 btn btn-ghost btn-sm text-xs text-blue-600">
              Subir documento propio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
