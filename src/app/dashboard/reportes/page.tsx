'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';
import { BarChart3, TrendingUp, Users, FileText, Calendar, DollarSign, Clock, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Stats {
  totalClientes: number;
  clientesNuevosMes: number;
  totalExpedientes: number;
  expedientesActivos: number;
  expedientesCerrados: number;
  totalCitas: number;
  citasPendientes: number;
  totalConsultasIA: number;
  horasRegistradas: number;
  montoFacturable: number;
  expedientesPorEstado: { estado: string; count: number }[];
  expedientesPorTipo: { tipo: string; count: number }[];
  citasPorTipo: { tipo: string; count: number }[];
}

const ESTADO_COLORS: Record<string, string> = {
  en_proceso: 'bg-blue-500',
  pendiente: 'bg-amber-500',
  cerrado_ganado: 'bg-emerald-500',
  cerrado_perdido: 'bg-red-400',
  suspendido: 'bg-slate-400',
};

const ESTADO_LABELS: Record<string, string> = {
  en_proceso: 'En Proceso',
  pendiente: 'Pendiente',
  cerrado_ganado: 'Ganado',
  cerrado_perdido: 'Perdido',
  suspendido: 'Suspendido',
};

export default function ReportesPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [periodoMeses, setPeriodoMeses] = useState(3);

  useEffect(() => {
    if (!profile?.despacho_id) return;
    loadStats();
  }, [profile, periodoMeses]);

  const loadStats = async () => {
    if (!profile?.despacho_id) return;
    setIsLoading(true);

    const fechaInicio = new Date();
    fechaInicio.setMonth(fechaInicio.getMonth() - periodoMeses);
    const fechaInicioMes = new Date();
    fechaInicioMes.setDate(1);

    const [
      clientesRes,
      clientesMesRes,
      expedientesRes,
      citasRes,
      consultasRes,
      horasRes,
      expEstadoRes,
      expTipoRes,
      citasTipoRes,
    ] = await Promise.all([
      supabase.from('clientes').select('cliente_id', { count: 'exact' }).eq('despacho_id', profile.despacho_id),
      supabase.from('clientes').select('cliente_id', { count: 'exact' }).eq('despacho_id', profile.despacho_id).gte('fecha_registro', fechaInicioMes.toISOString()),
      supabase.from('expedientes').select('expediente_id, estado_caso', { count: 'exact' }).eq('despacho_id', profile.despacho_id),
      supabase.from('citas').select('cita_id, estado', { count: 'exact' }).eq('despacho_id', profile.despacho_id),
      supabase.from('consultas_ia').select('id', { count: 'exact' }).eq('despacho_id', profile.despacho_id),
      supabase.from('registro_horas').select('duracion_minutos, tarifa_hora').eq('despacho_id', profile.despacho_id),
      supabase.from('expedientes').select('estado_caso').eq('despacho_id', profile.despacho_id),
      supabase.from('expedientes').select('tipo_caso').eq('despacho_id', profile.despacho_id),
      supabase.from('citas').select('tipo_cita').eq('despacho_id', profile.despacho_id),
    ]);

    // Process estado distribution
    const estadoCounts: Record<string, number> = {};
    expEstadoRes.data?.forEach(e => {
      estadoCounts[e.estado_caso] = (estadoCounts[e.estado_caso] || 0) + 1;
    });

    const tipoCounts: Record<string, number> = {};
    expTipoRes.data?.forEach(e => {
      tipoCounts[e.tipo_caso] = (tipoCounts[e.tipo_caso] || 0) + 1;
    });

    const citaTipoCounts: Record<string, number> = {};
    citasTipoRes.data?.forEach(c => {
      citaTipoCounts[c.tipo_cita] = (citaTipoCounts[c.tipo_cita] || 0) + 1;
    });

    const horasTotales = horasRes.data?.reduce((sum, r) => sum + r.duracion_minutos, 0) || 0;
    const montoTotal = horasRes.data?.reduce((sum, r) => sum + (r.duracion_minutos / 60) * (r.tarifa_hora || 0), 0) || 0;

    setStats({
      totalClientes: clientesRes.count || 0,
      clientesNuevosMes: clientesMesRes.count || 0,
      totalExpedientes: expedientesRes.count || 0,
      expedientesActivos: expEstadoRes.data?.filter(e => e.estado_caso === 'en_proceso').length || 0,
      expedientesCerrados: expEstadoRes.data?.filter(e => e.estado_caso.startsWith('cerrado')).length || 0,
      totalCitas: citasRes.count || 0,
      citasPendientes: citasRes.data?.filter((c: any) => c.estado === 'pendiente').length || 0,
      totalConsultasIA: consultasRes.count || 0,
      horasRegistradas: horasTotales,
      montoFacturable: montoTotal,
      expedientesPorEstado: Object.entries(estadoCounts).map(([estado, count]) => ({ estado, count })).sort((a, b) => b.count - a.count),
      expedientesPorTipo: Object.entries(tipoCounts).map(([tipo, count]) => ({ tipo, count })).sort((a, b) => b.count - a.count),
      citasPorTipo: Object.entries(citaTipoCounts).map(([tipo, count]) => ({ tipo, count })),
    });
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const maxEstado = Math.max(...(stats?.expedientesPorEstado.map(e => e.count) || [1]));
  const maxTipo = Math.max(...(stats?.expedientesPorTipo.map(e => e.count) || [1]));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Reportes y Estadísticas
          </h1>
          <p className="text-sm text-slate-500 mt-1">Métricas reales de tu despacho</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={periodoMeses}
            onChange={e => setPeriodoMeses(Number(e.target.value))}
            className="input text-sm py-1.5"
          >
            <option value={1}>Último mes</option>
            <option value={3}>Últimos 3 meses</option>
            <option value={6}>Últimos 6 meses</option>
            <option value={12}>Último año</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Clientes', value: stats?.totalClientes, sub: `+${stats?.clientesNuevosMes} este mes`, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: FileText, label: 'Expedientes Activos', value: stats?.expedientesActivos, sub: `${stats?.expedientesCerrados} cerrados`, color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: Calendar, label: 'Citas Pendientes', value: stats?.citasPendientes, sub: `${stats?.totalCitas} total`, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: Clock, label: 'Horas Registradas', value: `${Math.floor((stats?.horasRegistradas || 0) / 60)}h`, sub: `$${(stats?.montoFacturable || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })} facturable`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(kpi => (
          <div key={kpi.label} className="card p-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", kpi.bg)}>
              <kpi.icon className={cn("w-5 h-5", kpi.color)} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpi.value ?? '—'}</div>
            <div className="text-sm font-medium text-slate-700 mt-0.5">{kpi.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Expedientes por Estado */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Expedientes por Estado</h3>
          {stats?.expedientesPorEstado.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {stats?.expedientesPorEstado.map(({ estado, count }) => (
                <div key={estado}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{ESTADO_LABELS[estado] || estado}</span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", ESTADO_COLORS[estado] || 'bg-slate-400')}
                      style={{ width: `${(count / maxEstado) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expedientes por Tipo */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Expedientes por Área</h3>
          {stats?.expedientesPorTipo.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {stats?.expedientesPorTipo.map(({ tipo, count }) => (
                <div key={tipo}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 capitalize">{tipo.replace('_', ' ')}</span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${(count / maxTipo) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citas por tipo */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Citas por Modalidad</h3>
          <div className="flex gap-4">
            {stats?.citasPorTipo.map(({ tipo, count }) => (
              <div key={tipo} className="flex-1 text-center p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-900">{count}</div>
                <div className="text-xs text-slate-500 mt-1 capitalize">{tipo}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Consultas IA */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Uso de IA</h3>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-blue-600">{stats?.totalConsultasIA}</div>
            <div className="text-sm text-slate-500 mt-1">Consultas realizadas</div>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(((stats?.totalConsultasIA || 0) / 100) * 100, 100)}%` }} />
            </div>
            <div className="text-xs text-slate-400 mt-1">{stats?.totalConsultasIA || 0} / 100 del plan</div>
          </div>
        </div>
      </div>
    </div>
  );
}
