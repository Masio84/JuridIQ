'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';
import {
  Timer, Play, Pause, Square, Plus, FileText,
  Clock, DollarSign, Loader2, Trash2, Check, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RegistroHora {
  id: string;
  expediente_id: string;
  descripcion: string;
  duracion_minutos: number;
  tarifa_hora: number;
  fecha: string;
  tipo: string;
  facturado: boolean;
  expediente?: { titulo: string };
}

const TIPOS_ACTIVIDAD = [
  { value: 'reunion', label: 'Reunión', color: 'bg-blue-100 text-blue-700' },
  { value: 'redaccion', label: 'Redacción', color: 'bg-purple-100 text-purple-700' },
  { value: 'audiencia', label: 'Audiencia', color: 'bg-red-100 text-red-700' },
  { value: 'investigacion', label: 'Investigación', color: 'bg-amber-100 text-amber-700' },
  { value: 'llamada', label: 'Llamada', color: 'bg-green-100 text-green-700' },
  { value: 'general', label: 'General', color: 'bg-slate-100 text-slate-700' },
];

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function HorasPage() {
  const { user, profile } = useAuth();
  const [registros, setRegistros] = useState<RegistroHora[]>([]);
  const [expedientes, setExpedientes] = useState<{ expediente_id: string; titulo: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'todos' | 'no_facturados'>('todos');
  const [showForm, setShowForm] = useState(false);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    expediente_id: '',
    descripcion: '',
    duracion_minutos: 0,
    tarifa_hora: 0,
    tipo: 'general',
    fecha: new Date().toISOString().split('T')[0],
    usar_timer: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile?.despacho_id) return;
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile?.despacho_id) return;
    setIsLoading(true);

    const [horasRes, expsRes] = await Promise.all([
      supabase
        .from('registro_horas')
        .select('*, expediente:expedientes(titulo)')
        .eq('despacho_id', profile.despacho_id)
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('expedientes')
        .select('expediente_id, titulo')
        .eq('despacho_id', profile.despacho_id)
        .eq('estado_caso', 'en_proceso'),
    ]);

    if (horasRes.data) setRegistros(horasRes.data as any);
    if (expsRes.data) setExpedientes(expsRes.data);
    setIsLoading(false);
  };

  // Timer logic
  const startTimer = useCallback(() => {
    setTimerRunning(true);
    timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const stopTimer = useCallback(() => {
    pauseTimer();
    const minutes = Math.ceil(timerSeconds / 60);
    setFormData(prev => ({ ...prev, duracion_minutos: minutes, usar_timer: true }));
    setShowForm(true);
    setTimerSeconds(0);
  }, [timerSeconds, pauseTimer]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !formData.expediente_id || !formData.descripcion) return;
    setSaving(true);

    const { error } = await supabase.from('registro_horas').insert({
      expediente_id: formData.expediente_id,
      usuario_id: user!.id,
      despacho_id: profile.despacho_id,
      descripcion: formData.descripcion,
      duracion_minutos: formData.duracion_minutos,
      tarifa_hora: formData.tarifa_hora,
      tipo: formData.tipo,
      fecha: formData.fecha,
      facturado: false,
    });

    if (!error) {
      setShowForm(false);
      setFormData({ expediente_id: '', descripcion: '', duracion_minutos: 0, tarifa_hora: 0, tipo: 'general', fecha: new Date().toISOString().split('T')[0], usar_timer: false });
      loadData();
    } else {
      alert('Error al guardar: ' + error.message);
    }
    setSaving(false);
  };

  const toggleFacturado = async (id: string, current: boolean) => {
    await supabase.from('registro_horas').update({ facturado: !current }).eq('id', id);
    setRegistros(prev => prev.map(r => r.id === id ? { ...r, facturado: !current } : r));
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar este registro de horas?')) return;
    await supabase.from('registro_horas').delete().eq('id', id);
    setRegistros(prev => prev.filter(r => r.id !== id));
  };

  const filtered = registros.filter(r => filter === 'todos' || !r.facturado);

  const totalHoras = filtered.reduce((sum, r) => sum + r.duracion_minutos, 0);
  const totalFacturable = filtered.reduce((sum, r) => sum + (r.duracion_minutos / 60) * (r.tarifa_hora || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Registro de Horas
          </h1>
          <p className="text-sm text-slate-500 mt-1">Registra el tiempo dedicado a cada expediente para facturación</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Agregar Registro
        </button>
      </div>

      {/* Timer Widget */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-mono font-bold text-slate-900 tabular-nums tracking-wider">
              {formatTimer(timerSeconds)}
            </div>
            <div className="text-xs text-slate-400 mt-1">Temporizador de actividad</div>
          </div>
          <div className="flex items-center gap-3">
            {!timerRunning ? (
              <button onClick={startTimer} className="btn btn-primary gap-2">
                <Play className="w-4 h-4 fill-current" /> Iniciar
              </button>
            ) : (
              <button onClick={pauseTimer} className="btn btn-secondary gap-2 border-amber-300 text-amber-700 hover:bg-amber-50">
                <Pause className="w-4 h-4" /> Pausar
              </button>
            )}
            <button
              onClick={stopTimer}
              disabled={timerSeconds === 0}
              className="btn btn-secondary gap-2 border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
            >
              <Square className="w-4 h-4 fill-current" /> Detener y Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-2xl font-bold text-slate-900">{formatMinutes(totalHoras)}</div>
          <div className="text-xs text-slate-500">Horas registradas</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold text-emerald-600">${totalFacturable.toLocaleString('es-MX', { minimumFractionDigits: 0 })}</div>
          <div className="text-xs text-slate-500">Monto facturable</div>
        </div>
        <div className="card p-4 col-span-2 sm:col-span-1">
          <div className="text-2xl font-bold text-blue-600">{registros.filter(r => !r.facturado).length}</div>
          <div className="text-xs text-slate-500">Pendientes de facturar</div>
        </div>
      </div>

      {/* Filter and List */}
      <div className="flex items-center gap-3 justify-between">
        <div className="bg-slate-100 p-1 rounded-lg flex items-center">
          <button onClick={() => setFilter('todos')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", filter === 'todos' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Todos</button>
          <button onClick={() => setFilter('no_facturados')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", filter === 'no_facturados' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Pendientes</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-slate-700 font-medium">Sin registros</h3>
          <p className="text-sm text-slate-400">Usa el temporizador o agrega un registro manualmente</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-left">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Actividad</th>
                <th className="px-4 py-3 font-medium">Expediente</th>
                <th className="px-4 py-3 font-medium text-right">Duración</th>
                <th className="px-4 py-3 font-medium text-right">Monto</th>
                <th className="px-4 py-3 font-medium text-center">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => {
                const tipoInfo = TIPOS_ACTIVIDAD.find(t => t.value === r.tipo);
                const monto = (r.duracion_minutos / 60) * (r.tarifa_hora || 0);
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.fecha}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 line-clamp-1">{r.descripcion}</div>
                      <span className={cn("inline-flex mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium", tipoInfo?.color || 'bg-slate-100 text-slate-600')}>
                        {tipoInfo?.label || r.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 line-clamp-1">{(r.expediente as any)?.titulo || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">{formatMinutes(r.duracion_minutos)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                      {monto > 0 ? `$${monto.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleFacturado(r.id, r.facturado)} className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors", r.facturado ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200")}>
                        {r.facturado ? <><Check className="w-3 h-3" /> Facturado</> : 'Pendiente'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => eliminar(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-600" /> Registrar Actividad
              </h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Expediente *</label>
                  <select className="input" required value={formData.expediente_id} onChange={e => setFormData({...formData, expediente_id: e.target.value})}>
                    <option value="">Seleccionar expediente...</option>
                    {expedientes.map(e => <option key={e.expediente_id} value={e.expediente_id}>{e.titulo}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción de la actividad *</label>
                  <input className="input" required placeholder="Ej: Redacción de demanda inicial" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
                    <select className="input" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                      {TIPOS_ACTIVIDAD.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label>
                    <input type="date" className="input" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Duración (min) *</label>
                    <input type="number" className="input" required min="1" value={formData.duracion_minutos || ''} onChange={e => setFormData({...formData, duracion_minutos: parseInt(e.target.value) || 0})} placeholder="60" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tarifa/hora ($)</label>
                    <input type="number" className="input" min="0" value={formData.tarifa_hora || ''} onChange={e => setFormData({...formData, tarifa_hora: parseFloat(e.target.value) || 0})} placeholder="1500" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary flex-1">Cancelar</button>
                  <button type="submit" disabled={saving} className="btn btn-primary flex-1">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
