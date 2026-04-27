'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import {
  CalendarDays, ChevronLeft, ChevronRight, Loader2, Clock,
  User, Video, Phone, MapPin, Check, X, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  format, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Cita {
  cita_id: string;
  nombre_cliente: string;
  fecha_hora: string;
  tipo_cita: string;
  estado: string;
  motivo: string;
  abogado?: { nombre_completo: string };
}

const TIPO_ICONS: Record<string, React.ElementType> = {
  presencial: MapPin,
  virtual: Video,
  telefonica: Phone,
};

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmada: 'bg-blue-100 text-blue-800 border-blue-200',
  completada: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200',
};

export default function CalendarioPage() {
  const { profile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'agenda'>('month');

  useEffect(() => {
    if (!profile?.despacho_id) return;
    loadCitas();
  }, [profile, currentMonth]);

  const loadCitas = async () => {
    if (!profile?.despacho_id) return;
    setIsLoading(true);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data } = await supabase
      .from('citas')
      .select('*, abogado:profiles!abogado_id(nombre_completo)')
      .eq('despacho_id', profile.despacho_id)
      .gte('fecha_hora', start.toISOString())
      .lte('fecha_hora', end.toISOString())
      .order('fecha_hora', { ascending: true });

    setCitas((data as any) || []);
    setIsLoading(false);
  };

  const updateCitaEstado = async (citaId: string, nuevoEstado: string) => {
    await supabase.from('citas').update({ estado: nuevoEstado } as any).eq('cita_id', citaId);
    setCitas(prev => prev.map(c => c.cita_id === citaId ? { ...c, estado: nuevoEstado } : c));
  };

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getCitasForDay = (day: Date) =>
    citas.filter(c => isSameDay(parseISO(c.fecha_hora), day));

  const selectedDayCitas = selectedDay ? getCitasForDay(selectedDay) : [];

  const upcomingCitas = citas
    .filter(c => new Date(c.fecha_hora) >= new Date() && c.estado !== 'cancelada')
    .slice(0, 10);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Calendario
          </h1>
          <p className="text-sm text-slate-500 mt-1">Vista mensual de citas y agenda</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center">
            <button onClick={() => setView('month')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", view === 'month' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Mes</button>
            <button onClick={() => setView('agenda')} className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", view === 'agenda' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Agenda</button>
          </div>
          <Link href="/dashboard/citas/nueva" className="btn btn-primary btn-sm">
            + Nueva Cita
          </Link>
        </div>
      </div>

      {view === 'month' ? (
        <div className="grid lg:grid-cols-[1fr_300px] gap-4">
          {/* Calendar */}
          <div className="card p-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 hover:bg-slate-100 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-base font-semibold text-slate-900 capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h2>
              <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 hover:bg-slate-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
              ))}
            </div>

            {/* Days */}
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : (
              <div className="grid grid-cols-7">
                {days.map(day => {
                  const dayCitas = getCitasForDay(day);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => setSelectedDay(isSameDay(day, selectedDay!) ? null : day)}
                      className={cn(
                        "min-h-[70px] p-1 border border-transparent cursor-pointer rounded-lg hover:bg-slate-50 transition-colors",
                        !isSameMonth(day, currentMonth) && "opacity-30",
                        isToday(day) && "bg-blue-50/50 border-blue-200",
                        isSelected && "bg-blue-100 border-blue-400"
                      )}
                    >
                      <div className={cn(
                        "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mx-auto",
                        isToday(day) ? "bg-blue-600 text-white" : "text-slate-700"
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {dayCitas.slice(0, 2).map(c => {
                          const Icon = TIPO_ICONS[c.tipo_cita] || Clock;
                          return (
                            <div key={c.cita_id} className={cn("text-[10px] rounded px-1 py-0.5 truncate flex items-center gap-0.5 border", ESTADO_COLORS[c.estado] || 'bg-slate-100 text-slate-600 border-slate-200')}>
                              <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate">{c.nombre_cliente}</span>
                            </div>
                          );
                        })}
                        {dayCitas.length > 2 && (
                          <div className="text-[10px] text-slate-400 text-center">+{dayCitas.length - 2} más</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {selectedDay ? (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 capitalize">
                  {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
                </h3>
                {selectedDayCitas.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Sin citas este día</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDayCitas.map(c => {
                      const Icon = TIPO_ICONS[c.tipo_cita] || Clock;
                      return (
                        <div key={c.cita_id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium text-slate-900 text-sm truncate">{c.nombre_cliente}</div>
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                {format(parseISO(c.fecha_hora), 'HH:mm')}
                                <Icon className="w-3 h-3 ml-1" />
                                <span className="capitalize">{c.tipo_cita}</span>
                              </div>
                              {c.motivo && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.motivo}</p>}
                            </div>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 capitalize", ESTADO_COLORS[c.estado] || '')}>
                              {c.estado}
                            </span>
                          </div>
                          {c.estado === 'pendiente' && (
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => updateCitaEstado(c.cita_id, 'confirmada')} className="btn btn-secondary text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-xs py-1 px-2 flex-1 gap-1">
                                <Check className="w-3 h-3" /> Confirmar
                              </button>
                              <button onClick={() => updateCitaEstado(c.cita_id, 'cancelada')} className="btn btn-secondary text-red-600 hover:bg-red-50 border-red-200 text-xs py-1 px-2 flex-1 gap-1">
                                <X className="w-3 h-3" /> Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Próximas Citas</h3>
                {upcomingCitas.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Sin citas próximas</p>
                ) : (
                  <div className="space-y-2">
                    {upcomingCitas.map(c => {
                      const Icon = TIPO_ICONS[c.tipo_cita] || Clock;
                      return (
                        <div key={c.cita_id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-900 truncate">{c.nombre_cliente}</div>
                            <div className="text-xs text-slate-400">
                              {format(parseISO(c.fecha_hora), "d MMM · HH:mm", { locale: es })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Agenda view */
        <div className="card divide-y divide-slate-100">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
          ) : citas.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Sin citas este mes</p>
            </div>
          ) : (
            citas.map(c => {
              const Icon = TIPO_ICONS[c.tipo_cita] || Clock;
              return (
                <div key={c.cita_id} className="p-4 hover:bg-slate-50 flex items-start gap-4">
                  <div className="text-center min-w-[48px]">
                    <div className="text-xs text-slate-400 uppercase">{format(parseISO(c.fecha_hora), 'MMM', { locale: es })}</div>
                    <div className="text-xl font-bold text-slate-900">{format(parseISO(c.fecha_hora), 'd')}</div>
                    <div className="text-xs text-slate-400">{format(parseISO(c.fecha_hora), 'HH:mm')}</div>
                  </div>
                  <div className="w-px self-stretch bg-slate-200" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{c.nombre_cliente}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize", ESTADO_COLORS[c.estado] || '')}>{c.estado}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="capitalize">{c.tipo_cita}</span>
                      {c.abogado?.nombre_completo && <><span>·</span><User className="w-3.5 h-3.5" /><span>{c.abogado.nombre_completo}</span></>}
                    </div>
                    {c.motivo && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{c.motivo}</p>}
                  </div>
                  {c.estado === 'pendiente' && (
                    <div className="flex gap-1">
                      <button onClick={() => updateCitaEstado(c.cita_id, 'confirmada')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Confirmar">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateCitaEstado(c.cita_id, 'cancelada')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Cancelar">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
