// ============================================================
// JuridIQ - Dashboard Page (Conectado a DB Real)
// ============================================================
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Users,
  FolderOpen,
  CalendarDays,
  BrainCircuit,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { cn, getGreeting, formatHora, formatFecha, diasRestantes, getInitials } from '@/lib/utils';
import { ESTADO_CASO_LABELS, TIPO_CASO_LABELS, PRIORIDAD_LABELS } from '@/lib/constants';
import { useAuth } from '@/lib/hooks/useAuth';
import { getClientes } from '@/lib/services/clientes.service';
import { getExpedientes } from '@/lib/services/expedientes.service';
import { getCitasHoy } from '@/lib/services/citas.service';
import { createBrowserClient } from '@supabase/ssr';
import type { Cliente, Expediente, Cita, ConsultaIA } from '@/types/database';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Estados de datos reales
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [consultasIA, setConsultasIA] = useState<ConsultaIA[]>([]);
  const [tareasPendientes, setTareasPendientes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    clientesActivos: 0,
    expedientesAbiertos: 0,
    casosCerrados: 0,
    consultasIA: 0,
  });

  useEffect(() => {
    if (authLoading || !profile?.despacho_id) return;

    async function loadDashboardData() {
      try {
        // 1. Citas de hoy
        const { data: citas } = await getCitasHoy();
        setCitasHoy(citas || []);

        // 2. Clientes recientes
        const { data: clientesData, count: totalClientes } = await getClientes({ pageSize: 5 });
        setClientes(clientesData || []);
        setStats(s => ({ ...s, clientesActivos: totalClientes }));

        // 3. Expedientes
        const { data: expedientesData, count: totalExpedientes } = await getExpedientes();
        setExpedientes(expedientesData || []);
        const casosCerrados = (expedientesData || []).filter(e => e.estado_caso === 'archivado').length;
        setStats(s => ({ 
          ...s, 
          expedientesAbiertos: totalExpedientes - casosCerrados,
          casosCerrados
        }));

        // 4. Últimas consultas IA
        const { data: consultas } = await supabase
          .from('consultas_ia')
          .select('*, abogado:profiles(id, nombre_completo)')
          .order('fecha_consulta', { ascending: false })
          .limit(3);
        
        setConsultasIA(consultas as any[] || []);
        
        // Count total consultas
        const { count: consultasCount } = await supabase
          .from('consultas_ia')
          .select('consulta_id', { count: 'exact', head: true });
        
        setStats(s => ({ ...s, consultasIA: consultasCount || 0 }));

        // 5. Tareas pendientes (próximas a vencer)
        const { data: tareas } = await supabase
          .from('expediente_tareas')
          .select('*')
          .neq('estado', 'completada')
          .order('fecha_limite', { ascending: true })
          .limit(5);
        
        setTareasPendientes(tareas || []);

      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [profile, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-1/3 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  const expedientesProximos = expedientes
    .filter((e) => e.fecha_proxima_audiencia && e.estado_caso !== 'archivado')
    .sort((a, b) => new Date(a.fecha_proxima_audiencia!).getTime() - new Date(b.fecha_proxima_audiencia!).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" suppressHydrationWarning>
            {getGreeting()}, {profile?.nombre_completo.split(' ').slice(0, 2).join(' ')}
          </h1>
          <p className="text-sm text-slate-500 mt-1" suppressHydrationWarning>
            Aquí tienes el resumen de tu despacho hoy, {formatFecha(new Date(), "EEEE dd 'de' MMMM")}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/clientes/nuevo" className="btn btn-secondary btn-sm">
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </Link>
          <Link href="/dashboard/consultas-ia" className="btn btn-primary btn-sm">
            <BrainCircuit className="w-4 h-4" />
            Consultar IA
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          {
            label: 'Clientes Activos',
            value: stats.clientesActivos,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/dashboard/clientes',
          },
          {
            label: 'Expedientes Abiertos',
            value: stats.expedientesAbiertos,
            icon: FolderOpen,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            href: '/dashboard/expedientes',
          },
          {
            label: 'Citas Hoy',
            value: citasHoy.length,
            icon: CalendarDays,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/dashboard/citas',
          },
          {
            label: 'Consultas IA',
            value: stats.consultasIA,
            icon: BrainCircuit,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            href: '/dashboard/consultas-ia',
          },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className="stat-card group">
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Citas de Hoy - Left Column */}
        <div className="lg:col-span-1 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Citas de Hoy
            </h2>
            <Link href="/dashboard/citas" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Ver todas
            </Link>
          </div>

          {citasHoy.length === 0 ? (
            <div className="empty-state py-8">
              <CalendarDays className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm">No tienes citas hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citasHoy.map((cita) => (
                <div
                  key={cita.cita_id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0 text-center">
                    <div className="text-lg font-bold text-blue-600 leading-none">
                      {formatHora(cita.fecha_hora)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {cita.duracion_minutos} min
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 truncate">
                      {cita.cliente?.nombre_completo || cita.nombre_publico || 'Sin asignar'}
                    </div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {cita.titulo_asunto}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full',
                        cita.tipo_cita === 'presencial' ? 'bg-emerald-100 text-emerald-700' :
                        cita.tipo_cita === 'virtual' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      )}>
                        {cita.tipo_cita === 'presencial' ? '🏢' : cita.tipo_cita === 'virtual' ? '💻' : '📞'}
                        {cita.tipo_cita}
                      </span>
                      {cita.confirmada ? (
                        <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Confirmada
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600">Pendiente</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expedientes Próximos - Center Column */}
        <div className="lg:col-span-1 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Próximas Audiencias
            </h2>
            <Link href="/dashboard/expedientes" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Ver todos
            </Link>
          </div>

          {expedientesProximos.length === 0 ? (
            <div className="empty-state py-8">
              <FolderOpen className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm">No hay audiencias próximas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expedientesProximos.map((exp) => {
                const dias = diasRestantes(exp.fecha_proxima_audiencia!);
                const estadoInfo = ESTADO_CASO_LABELS[exp.estado_caso];
                const tipoInfo = TIPO_CASO_LABELS[exp.tipo_caso];

                return (
                  <Link
                    key={exp.expediente_id}
                    href={`/dashboard/expedientes/${exp.expediente_id}`}
                    className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {exp.titulo}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {tipoInfo?.icon} {tipoInfo?.label} · {exp.juzgado?.split(' - ')[0] || 'Sin juzgado'}
                        </div>
                      </div>
                      <span className={cn('badge text-[10px]', estadoInfo?.bg, estadoInfo?.color)}>
                        {estadoInfo?.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400 truncate pr-2">
                        {exp.cliente?.nombre_completo}
                      </span>
                      <span className={cn(
                        'text-xs font-medium whitespace-nowrap',
                        dias <= 3 ? 'text-red-600' : dias <= 7 ? 'text-amber-600' : 'text-slate-500'
                      )}>
                        {dias <= 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Tareas Pendientes - Right Column */}
        <div className="lg:col-span-1 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-blue-500" />
              Tareas Pendientes
            </h2>
            <span className="text-xs text-slate-400">
              {tareasPendientes.length} pendientes
            </span>
          </div>

          {tareasPendientes.length === 0 ? (
            <div className="empty-state py-8">
              <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm">Todo al día</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tareasPendientes.map((tarea) => {
                const dias = diasRestantes(tarea.fecha_limite);
                const prioridadInfo = PRIORIDAD_LABELS[tarea.prioridad as keyof typeof PRIORIDAD_LABELS];

                return (
                  <div
                    key={tarea.tarea_id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                      tarea.prioridad === 'urgente' ? 'bg-red-500' :
                      tarea.prioridad === 'alta' ? 'bg-amber-500' :
                      tarea.prioridad === 'media' ? 'bg-blue-500' : 'bg-slate-300'
                    )} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {tarea.titulo}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', prioridadInfo?.bg, prioridadInfo?.color)}>
                          {prioridadInfo?.label}
                        </span>
                        <span className={cn(
                          'text-[10px]',
                          dias <= 1 ? 'text-red-600 font-medium' : dias <= 3 ? 'text-amber-600' : 'text-slate-400'
                        )}>
                          {dias <= 0 ? 'Vence hoy' : dias === 1 ? 'Vence mañana' : `${dias} días`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Charts & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cases chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Resumen de Casos
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600">{stats.expedientesAbiertos}</div>
              <div className="text-xs text-blue-500 mt-1">Casos Abiertos</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-3xl font-bold text-emerald-600">{stats.casosCerrados}</div>
              <div className="text-xs text-emerald-500 mt-1">Casos Cerrados</div>
            </div>
          </div>

          {/* Visual bar chart */}
          {expedientes.length > 0 && (
            <div className="mt-4 space-y-3">
              {Object.entries(
                expedientes.reduce((acc, exp) => {
                  acc[exp.tipo_caso] = (acc[exp.tipo_caso] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([tipo, count]) => {
                const tipoInfo = TIPO_CASO_LABELS[tipo as keyof typeof TIPO_CASO_LABELS];
                const percentage = (count / expedientes.length) * 100;
                return (
                  <div key={tipo} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-24 truncate">{tipoInfo?.label || tipo}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent AI Queries */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-500" />
              Últimas Consultas IA
            </h2>
            <Link href="/dashboard/consultas-ia" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Ver historial
            </Link>
          </div>

          {consultasIA.length === 0 ? (
            <div className="empty-state py-8">
              <BrainCircuit className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm">No has realizado consultas a la IA</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultasIA.map((consulta) => (
                <Link 
                  key={consulta.consulta_id} 
                  href="/dashboard/consultas-ia"
                  className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="text-sm font-medium text-slate-900 line-clamp-2">
                    {consulta.pregunta_original}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="avatar avatar-sm bg-purple-100 text-purple-600 text-[10px]">
                        {getInitials(consulta.abogado?.nombre_completo || '')}
                      </div>
                      <span className="text-xs text-slate-500 truncate max-w-[100px]">
                        {consulta.abogado?.nombre_completo.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatFecha(consulta.fecha_consulta)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {consulta.tokens_utilizados} tokens
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick client list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Clientes Recientes
          </h2>
          <Link href="/dashboard/clientes" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            Ver todos
          </Link>
        </div>
        
        {clientes.length === 0 ? (
          <div className="empty-state py-8">
            <Users className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm">No hay clientes registrados</p>
          </div>
        ) : (
          <div className="table-container border-0 rounded-none">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th className="hidden sm:table-cell">Contacto</th>
                  <th className="hidden md:table-cell">Abogado</th>
                  <th>Expedientes</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.cliente_id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-sm bg-brand-50 text-brand-700 text-xs">
                          {getInitials(cliente.nombre_completo)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{cliente.nombre_completo}</div>
                          <div className="text-xs text-slate-400 sm:hidden">{cliente.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      <div className="text-sm text-slate-600">{cliente.email}</div>
                      <div className="text-xs text-slate-400">{cliente.telefono}</div>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="text-sm text-slate-600 truncate max-w-[150px]">
                        {cliente.abogado?.nombre_completo || 'Sin asignar'}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-slate-700">{cliente.expedientes_count || 0}</span>
                    </td>
                    <td>
                      <span className={cn(
                        'badge',
                        cliente.estado === 'activo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        cliente.estado === 'archivado' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      )}>
                        {cliente.estado === 'activo' ? '● Activo' : cliente.estado === 'archivado' ? 'Archivado' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
