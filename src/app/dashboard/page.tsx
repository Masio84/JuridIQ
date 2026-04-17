'use client';

import Link from 'next/link';
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
import {
  mockCurrentUser,
  mockStats,
  mockCitas,
  mockExpedientes,
  mockTareas,
  mockConsultasIA,
  mockClientes,
} from '@/lib/mock-data';

export default function DashboardPage() {
  const citasHoy = mockCitas.filter((c) => {
    const d = new Date(c.fecha_hora);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const expedientesProximos = mockExpedientes
    .filter((e) => e.fecha_proxima_audiencia && e.estado_caso !== 'archivado')
    .sort((a, b) => new Date(a.fecha_proxima_audiencia!).getTime() - new Date(b.fecha_proxima_audiencia!).getTime())
    .slice(0, 4);

  const tareasPendientes = mockTareas
    .filter((t) => t.estado !== 'completada')
    .sort((a, b) => new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {mockCurrentUser.nombre_completo.split(' ')[1]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
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
            value: mockStats.clientesActivos,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/dashboard/clientes',
          },
          {
            label: 'Expedientes Abiertos',
            value: mockStats.expedientesAbiertos,
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
            value: mockStats.consultasIA,
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
                        {tipoInfo?.icon} {tipoInfo?.label} · {exp.juzgado?.split(' - ')[0]}
                      </div>
                    </div>
                    <span className={cn('badge text-[10px]', estadoInfo?.bg, estadoInfo?.color)}>
                      {estadoInfo?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">
                      {exp.cliente?.nombre_completo}
                    </span>
                    <span className={cn(
                      'text-xs font-medium',
                      dias <= 3 ? 'text-red-600' : dias <= 7 ? 'text-amber-600' : 'text-slate-500'
                    )}>
                      {dias <= 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
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

          <div className="space-y-2">
            {tareasPendientes.map((tarea) => {
              const dias = diasRestantes(tarea.fecha_limite);
              const prioridadInfo = PRIORIDAD_LABELS[tarea.prioridad];

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
        </div>
      </div>

      {/* Bottom Row: Charts & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cases chart (simplified visual) */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Resumen de Casos
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600">{mockStats.casosAbiertos}</div>
              <div className="text-xs text-blue-500 mt-1">Casos Abiertos</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <div className="text-3xl font-bold text-emerald-600">{mockStats.casosCerrados}</div>
              <div className="text-xs text-emerald-500 mt-1">Casos Cerrados</div>
            </div>
          </div>

          {/* Visual bar chart */}
          <div className="mt-4 space-y-3">
            {Object.entries(
              mockExpedientes.reduce((acc, exp) => {
                acc[exp.tipo_caso] = (acc[exp.tipo_caso] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([tipo, count]) => {
              const tipoInfo = TIPO_CASO_LABELS[tipo];
              const percentage = (count / mockExpedientes.length) * 100;
              return (
                <div key={tipo} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 truncate">{tipoInfo?.label || tipo}</span>
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

          <div className="space-y-3">
            {mockConsultasIA.slice(0, 3).map((consulta) => (
              <div key={consulta.consulta_id} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="text-sm font-medium text-slate-900 line-clamp-2">
                  {consulta.pregunta_original}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="avatar avatar-sm bg-purple-100 text-purple-600 text-[10px]">
                      {getInitials(consulta.abogado?.nombre_completo || '')}
                    </div>
                    <span className="text-xs text-slate-500">
                      {consulta.abogado?.nombre_completo.split(' ').slice(1, 3).join(' ')}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatFecha(consulta.fecha_consulta)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {consulta.tokens_utilizados} tokens
                  </span>
                </div>
              </div>
            ))}
          </div>
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
              {mockClientes.slice(0, 5).map((cliente) => (
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
                    <div className="text-sm text-slate-600">
                      {cliente.abogado?.nombre_completo.split(' ').slice(1, 3).join(' ')}
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
      </div>
    </div>
  );
}
