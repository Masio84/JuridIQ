'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  Scale, FileText, Calendar, Clock, User, Phone, Mail,
  Loader2, AlertCircle, ChevronRight, ExternalLink,
  Shield, LogOut, FolderOpen, CheckCircle2, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ClienteData {
  cliente_id: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  numero_identificacion?: string;
}

interface Expediente {
  expediente_id: string;
  numero_expediente: string;
  titulo: string;
  tipo_caso: string;
  estado: string;
  fecha_inicio: string;
  descripcion?: string;
  juzgado?: string;
}

interface Cita {
  cita_id: string;
  fecha_hora: string;
  tipo_cita: string;
  estado: string;
  motivo: string;
}

interface AccesoData {
  cliente_id: string;
  despacho_id: string;
  email: string;
  fecha_expiracion: string;
}

export default function PortalClientePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthorized'>('loading');
  const [cliente, setCliente] = useState<ClienteData | null>(null);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [activeTab, setActiveTab] = useState<'resumen' | 'expedientes' | 'citas'>('resumen');
  const [despachoNombre, setDespachoNombre] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      try {
        // 1. Validar token en DB
        const { data: acceso, error } = await supabase
          .from('cliente_accesos')
          .select('*')
          .eq('token_acceso', params.token)
          .eq('activo', true)
          .single();

        if (error || !acceso) { setStatus('unauthorized'); return; }

        const accesoData = acceso as AccesoData;

        // 2. Verificar expiración
        if (accesoData.fecha_expiracion && new Date(accesoData.fecha_expiracion) < new Date()) {
          setStatus('unauthorized');
          return;
        }

        // 3. Cargar datos del cliente
        const { data: clienteData } = await supabase
          .from('clientes')
          .select('cliente_id, nombre_completo, email, telefono, numero_identificacion')
          .eq('cliente_id', accesoData.cliente_id)
          .single();

        if (!clienteData) { setStatus('unauthorized'); return; }
        setCliente(clienteData as ClienteData);

        // 4. Cargar expedientes del cliente
        const { data: exps } = await supabase
          .from('expedientes')
          .select('expediente_id, numero_expediente, titulo, tipo_caso, estado, fecha_inicio, descripcion, juzgado')
          .eq('cliente_id', accesoData.cliente_id)
          .eq('despacho_id', accesoData.despacho_id)
          .order('fecha_inicio', { ascending: false });

        setExpedientes((exps as Expediente[]) || []);

        // 5. Cargar próximas citas del cliente (por email)
        const { data: citasData } = await supabase
          .from('citas')
          .select('cita_id, fecha_hora, tipo_cita, estado, motivo')
          .eq('email_cliente', accesoData.email)
          .eq('despacho_id', accesoData.despacho_id)
          .gte('fecha_hora', new Date().toISOString())
          .order('fecha_hora', { ascending: true })
          .limit(5);

        setCitas((citasData as Cita[]) || []);

        // 6. Nombre del despacho
        const { data: despacho } = await supabase
          .from('despachos')
          .select('nombre_despacho')
          .eq('despacho_id', accesoData.despacho_id)
          .single();
        setDespachoNombre(despacho?.nombre_despacho || 'Su Despacho');

        setStatus('authenticated');
      } catch {
        setStatus('unauthorized');
      }
    };

    validateToken();
  }, [params.token]);

  const getEstadoColor = (estado: string) => {
    const map: Record<string, string> = {
      'activo': 'bg-blue-100 text-blue-700',
      'en_proceso': 'bg-amber-100 text-amber-700',
      'ganado': 'bg-emerald-100 text-emerald-700',
      'cerrado': 'bg-slate-100 text-slate-600',
      'perdido': 'bg-red-100 text-red-600',
      'confirmada': 'bg-emerald-100 text-emerald-700',
      'pendiente': 'bg-amber-100 text-amber-700',
      'cancelada': 'bg-red-100 text-red-600',
    };
    return map[estado] || 'bg-slate-100 text-slate-600';
  };

  const getEstadoLabel = (estado: string) => {
    const map: Record<string, string> = {
      'activo': 'Activo', 'en_proceso': 'En Proceso', 'ganado': 'Ganado',
      'cerrado': 'Cerrado', 'perdido': 'Perdido',
      'confirmada': 'Confirmada', 'pendiente': 'Pendiente', 'cancelada': 'Cancelada',
    };
    return map[estado] || estado;
  };

  // ── Loading ────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // ── Unauthorized ───────────────────────────────────────────
  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Acceso No Válido</h1>
          <p className="text-sm text-slate-500 mb-6">
            Este enlace ha expirado o no es válido. Solicita un nuevo enlace de acceso a tu abogado.
          </p>
          <button onClick={() => router.push('/portal')} className="btn btn-primary w-full">
            Ir al Portal
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Scale className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-none">JuridIQ</div>
              <div className="text-xs text-blue-200">{despachoNombre}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-blue-200">
              <Shield className="w-3.5 h-3.5" />
              <span>Acceso Seguro</span>
            </div>
            <button
              onClick={() => { sessionStorage.clear(); router.push('/portal'); }}
              className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700">
              {cliente?.nombre_completo.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Hola, {cliente?.nombre_completo.split(' ')[0]}</h1>
              <p className="text-sm text-slate-500">Bienvenido a tu portal personal de seguimiento legal</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{expedientes.length}</div>
              <div className="text-xs text-blue-600">Expedientes</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-amber-700">
                {expedientes.filter(e => e.estado === 'en_proceso' || e.estado === 'activo').length}
              </div>
              <div className="text-xs text-amber-600">En Proceso</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-700">{citas.length}</div>
              <div className="text-xs text-emerald-600">Citas Próximas</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
          {(['resumen', 'expedientes', 'citas'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize',
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}>
              {tab === 'resumen' ? '📋 Resumen' : tab === 'expedientes' ? '📁 Expedientes' : '📅 Citas'}
            </button>
          ))}
        </div>

        {/* Resumen */}
        {activeTab === 'resumen' && (
          <div className="space-y-4">
            {/* Mis datos */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Mis Datos
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />{cliente?.email}
                </div>
                {cliente?.telefono && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />{cliente.telefono}
                  </div>
                )}
              </div>
            </div>

            {/* Expedientes activos */}
            {expedientes.filter(e => e.estado === 'activo' || e.estado === 'en_proceso').length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-600" /> Casos Activos
                </h2>
                <div className="space-y-2">
                  {expedientes.filter(e => e.estado === 'activo' || e.estado === 'en_proceso').map(exp => (
                    <div key={exp.expediente_id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{exp.titulo}</div>
                        <div className="text-xs text-slate-500">{exp.numero_expediente} · {exp.tipo_caso}</div>
                      </div>
                      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', getEstadoColor(exp.estado))}>
                        {getEstadoLabel(exp.estado)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Próximas citas */}
            {citas.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Próximas Citas
                </h2>
                {citas.slice(0, 3).map(cita => (
                  <div key={cita.cita_id} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} · {cita.tipo_cita}
                      </div>
                    </div>
                    <span className={cn('ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full', getEstadoColor(cita.estado))}>
                      {getEstadoLabel(cita.estado)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Expedientes tab */}
        {activeTab === 'expedientes' && (
          <div className="space-y-3">
            {expedientes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No hay expedientes registrados aún</p>
              </div>
            ) : (
              expedientes.map(exp => (
                <div key={exp.expediente_id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{exp.titulo}</h3>
                      <p className="text-sm text-slate-500">{exp.numero_expediente}</p>
                    </div>
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', getEstadoColor(exp.estado))}>
                      {getEstadoLabel(exp.estado)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
                    <div><span className="font-medium text-slate-700">Tipo:</span> {exp.tipo_caso}</div>
                    <div><span className="font-medium text-slate-700">Inicio:</span> {new Date(exp.fecha_inicio).toLocaleDateString('es-MX')}</div>
                    {exp.juzgado && <div className="col-span-2"><span className="font-medium text-slate-700">Juzgado:</span> {exp.juzgado}</div>}
                  </div>
                  {exp.descripcion && (
                    <p className="text-xs text-slate-500 mt-3 border-t border-slate-100 pt-3 line-clamp-3">
                      {exp.descripcion}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Citas tab */}
        {activeTab === 'citas' && (
          <div className="space-y-3">
            {citas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No tienes citas programadas próximamente</p>
              </div>
            ) : (
              citas.map(cita => (
                <div key={cita.cita_id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {new Date(cita.fecha_hora).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        {new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} · {cita.tipo_cita}
                      </div>
                      {cita.motivo && <p className="text-xs text-slate-400 mt-2">{cita.motivo}</p>}
                    </div>
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0', getEstadoColor(cita.estado))}>
                      {getEstadoLabel(cita.estado)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 pb-4">
          Portal seguro de JuridIQ · Tu información es confidencial
        </p>
      </div>
    </div>
  );
}
