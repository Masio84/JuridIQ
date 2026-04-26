// ============================================================
// JuridIQ - Citas Page (Conectado a DB Real)
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, CalendarDays, ChevronLeft, ChevronRight,
  Clock, MapPin, Video, Phone, CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn, getInitials, formatHora, formatFecha } from '@/lib/utils';
import { getCitas } from '@/lib/services/citas.service';
import type { Cita } from '@/types/database';

type ViewMode = 'lista' | 'semana';

export default function CitasPage() {
  const [view, setView] = useState<ViewMode>('lista');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to load all appointments for the visible range
  useEffect(() => {
    async function loadCitas() {
      setLoading(true);
      try {
        // Fetch a broad range around current date (e.g. 1 month before/after)
        const d = new Date(currentDate);
        const desde = new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString();
        const hasta = new Date(d.getFullYear(), d.getMonth() + 2, 0).toISOString();
        
        const { data } = await getCitas({
          fecha_desde: desde,
          fecha_hasta: hasta,
        });
        
        setCitas(data || []);
      } catch (error) {
        console.error('Error loading citas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCitas();
  }, [currentDate]);

  const today = new Date();
  
  // Filter for list view (show all fetched, ordered)
  const citasOrdered = [...citas].sort(
    (a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
  );

  // Group by day for list view
  const grouped = citasOrdered.reduce((acc, cita) => {
    const day = new Date(cita.fecha_hora).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(cita);
    return acc;
  }, {} as Record<string, Cita[]>);

  const getTipoCitaIcon = (tipo: string) => {
    switch (tipo) {
      case 'presencial': return <MapPin className="w-3.5 h-3.5" />;
      case 'virtual': return <Video className="w-3.5 h-3.5" />;
      case 'telefonica': return <Phone className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  // Generate week days for week view
  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7AM to 6PM

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda de Citas</h1>
          <p className="text-sm text-slate-500 mt-1">{citas.length} citas programadas este mes</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + '/agendar');
              alert('Enlace de autoagendado público copiado al portapapeles');
            }}
            className="btn btn-secondary hidden sm:flex"
            title="Copiar enlace público para clientes"
          >
            📋 Compartir Enlace
          </button>
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
            {(['lista', 'semana'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  view === v ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {v === 'lista' ? 'Lista' : 'Semana'}
              </button>
            ))}
          </div>
          <Link href="/dashboard/citas/nueva" className="btn btn-primary">
            <Plus className="w-4 h-4" /> Nueva Cita
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : citas.length === 0 ? (
         <div className="empty-state card py-16">
          <CalendarDays className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No hay citas programadas</p>
          <p className="text-sm text-slate-400 mt-1">Crea una nueva cita para empezar</p>
        </div>
      ) : view === 'lista' ? (
        /* LIST VIEW */
        <div className="space-y-6">
          {Object.entries(grouped).map(([day, citasDia]) => {
            const date = new Date(day);
            const isToday = date.toDateString() === today.toDateString();

            return (
              <div key={day}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0',
                    isToday ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                  )}>
                    <span className="text-xs font-medium leading-none">
                      {formatFecha(date, 'EEE').slice(0, 3)}
                    </span>
                    <span className="text-lg font-bold leading-none mt-0.5">
                      {date.getDate()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {isToday ? 'Hoy' : formatFecha(date, "EEEE dd 'de' MMMM")}
                    </div>
                    <div className="text-xs text-slate-400">{citasDia.length} cita{citasDia.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>

                <div className="space-y-2 ml-[60px]">
                  {citasDia.map((cita) => (
                    <Link
                      href={`/dashboard/citas/${cita.cita_id}/editar`}
                      key={cita.cita_id}
                      className={cn(
                        'block card p-4 border-l-4 cursor-pointer hover:shadow-md transition-all',
                        cita.tipo_cita === 'presencial' ? 'border-l-emerald-500' :
                        cita.tipo_cita === 'virtual' ? 'border-l-blue-500' : 'border-l-purple-500'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-blue-600">
                              {formatHora(cita.fecha_hora)}
                            </span>
                            <span className="text-xs text-slate-400">· {cita.duracion_minutos} min</span>
                          </div>
                          <h3 className="text-sm font-medium text-slate-900">{cita.titulo_asunto}</h3>
                          <div className="text-xs text-slate-500 mt-1 truncate">
                            {cita.cliente?.nombre_completo || cita.nombre_publico || 'Prospecto'}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                          <div className={cn(
                            'flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap',
                            cita.tipo_cita === 'presencial' ? 'bg-emerald-50 text-emerald-700' :
                            cita.tipo_cita === 'virtual' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          )}>
                            {getTipoCitaIcon(cita.tipo_cita)}
                            {cita.tipo_cita}
                          </div>
                          {cita.confirmada ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-amber-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1.5">
                          <div className="avatar avatar-sm bg-slate-100 text-slate-600 text-[10px]">
                            {getInitials(cita.abogado?.nombre_completo || '')}
                          </div>
                          <span className="text-xs text-slate-400 truncate max-w-[150px]">
                            {cita.abogado?.nombre_completo.split(' ').slice(1, 3).join(' ')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* WEEK VIEW */
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <button
              onClick={() => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() - 7);
                setCurrentDate(d);
              }}
              className="btn btn-ghost btn-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-900">
              {formatFecha(weekDays[0], "dd MMM")} - {formatFecha(weekDays[6], "dd MMM yyyy")}
            </span>
            <button
              onClick={() => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() + 7);
                setCurrentDate(d);
              }}
              className="btn btn-ghost btn-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-8 border-b border-slate-200">
                <div className="p-2 text-xs text-slate-400 text-center">Hora</div>
                {weekDays.map((day) => {
                  const isToday = day.toDateString() === today.toDateString();
                  return (
                    <div key={day.toISOString()} className={cn(
                      'p-2 text-center border-l border-slate-100',
                      isToday && 'bg-blue-50'
                    )}>
                      <div className="text-xs text-slate-400">{formatFecha(day, 'EEE').slice(0, 3)}</div>
                      <div className={cn(
                        'text-sm font-semibold mt-0.5',
                        isToday ? 'text-blue-600' : 'text-slate-700'
                      )}>
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time slots */}
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-slate-50 min-h-[48px]">
                  <div className="p-2 text-xs text-slate-400 text-right pr-3 border-r border-slate-100">
                    {hour}:00
                  </div>
                  {weekDays.map((day) => {
                    const dayCitas = citas.filter((c) => {
                      const d = new Date(c.fecha_hora);
                      return d.toDateString() === day.toDateString() && d.getHours() === hour;
                    });

                    return (
                      <div key={day.toISOString()} className="p-1 border-l border-slate-50 relative">
                        {dayCitas.map((cita) => (
                          <Link
                            href={`/dashboard/citas/${cita.cita_id}/editar`}
                            key={cita.cita_id}
                            className={cn(
                              'block text-[10px] px-1.5 py-1 rounded font-medium truncate cursor-pointer mb-1',
                              cita.tipo_cita === 'presencial' ? 'bg-emerald-100 text-emerald-800' :
                              cita.tipo_cita === 'virtual' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            )}
                            title={cita.titulo_asunto}
                          >
                            {cita.cliente?.nombre_completo?.split(' ')[0] || cita.nombre_publico?.split(' ')[0] || 'Prospecto'}
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
