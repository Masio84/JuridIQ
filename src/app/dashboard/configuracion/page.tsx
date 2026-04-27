'use client';

import { useState, useEffect } from 'react';
import { Settings, Building2, Users, CreditCard, Shield, Bell, Loader2, CheckCircle, ChevronRight, ArrowUpCircle, X, AlertCircle } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';
import type { Despacho, Profile } from '@/types/database';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConfiguracionPage() {
  const { user, profile } = useAuth();
  const [despacho, setDespacho] = useState<Despacho | null>(null);
  const [equipo, setEquipo] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre_despacho: '',
    email_principal: '',
    telefono: '',
    ciudad: '',
    direccion: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Plan change state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planSolicitado, setPlanSolicitado] = useState('');
  const [notaPlan, setNotaPlan] = useState('');
  const [enviandoPlan, setEnviandoPlan] = useState(false);
  const [planEnviado, setPlanEnviado] = useState(false);

  useEffect(() => {
    if (!profile?.despacho_id) return;

    const fetchData = async () => {
      // Fetch Despacho
      const { data: dData } = await supabase
        .from('despachos')
        .select('*')
        .eq('despacho_id', profile.despacho_id)
        .single();
      
      if (dData) {
        setDespacho(dData);
        setFormData({
          nombre_despacho: dData.nombre_despacho || '',
          email_principal: dData.email_principal || '',
          telefono: dData.telefono || '',
          ciudad: dData.ciudad || '',
          direccion: dData.direccion || ''
        });
      }

      // Fetch Team
      const { data: teamData } = await supabase
        .from('profiles')
        .select('*')
        .eq('despacho_id', profile.despacho_id);
        
      if (teamData) {
        setEquipo(teamData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.despacho_id) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('despachos')
        .update({
          nombre_despacho: formData.nombre_despacho,
          email_principal: formData.email_principal,
          telefono: formData.telefono,
          ciudad: formData.ciudad,
          direccion: formData.direccion,
        })
        .eq('despacho_id', profile.despacho_id);

      if (!error) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Error al guardar: ' + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const PLANES = [
    { id: 'basico', label: 'Básico', precio: '$499/mes', desc: 'Hasta 2 abogados, 50 expedientes' },
    { id: 'profesional', label: 'Profesional', precio: '$999/mes', desc: 'Hasta 5 abogados, expedientes ilimitados' },
    { id: 'enterprise', label: 'Enterprise', precio: '$1,999/mes', desc: 'Abogados ilimitados, soporte prioritario' },
  ];

  const handleSolicitarCambioPlan = async () => {
    if (!planSolicitado || !profile?.despacho_id || !user) return;
    setEnviandoPlan(true);

    try {
      // 1. Buscar al superadmin para enviarle la notificación
      const { data: superadmins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'superadmin')
        .limit(1);

      const superadminId = superadmins?.[0]?.id;

      const planActual = despacho?.plan || 'desconocido';
      const planLabel = PLANES.find(p => p.id === planSolicitado)?.label || planSolicitado;
      const despachoNombre = despacho?.nombre_despacho || 'Sin nombre';

      // 2. Registrar la solicitud en la tabla solicitudes_registro (reutilizamos)
      // O mejor, insertar directamente en notificaciones del superadmin
      if (superadminId) {
        const { error: notifError } = await supabase.from('notificaciones').insert({
          usuario_id: superadminId,
          despacho_id: profile.despacho_id,
          tipo: 'solicitud_cambio_plan',
          titulo: `Solicitud de cambio de plan: ${despachoNombre}`,
          mensaje: `El despacho "${despachoNombre}" solicita cambiar del Plan ${planActual.toUpperCase()} al Plan ${planLabel.toUpperCase()}.${ notaPlan ? ` Nota: ${notaPlan}` : '' } Por favor verifica el depósito correspondiente antes de autorizar.`,
          prioridad: 'alta',
          leida: false,
          canal: 'web',
          enviada: true,
          ruta_destino: '/dashboard/solicitudes',
          fecha_envio: new Date().toISOString(),
        });

        if (notifError) throw notifError;
      }

      setPlanEnviado(true);
      setTimeout(() => {
        setShowPlanModal(false);
        setPlanSolicitado('');
        setNotaPlan('');
        setPlanEnviado(false);
      }, 2500);
    } catch (err) {
      alert('Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setEnviandoPlan(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">Administra tu despacho, equipo y preferencias</p>
      </div>

      {/* Despacho Info */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-900">Información del Despacho</h2>
          </div>
          {saveSuccess && (
            <span className="text-sm text-emerald-600 flex items-center gap-1 animate-fade-in">
              <CheckCircle className="w-4 h-4" /> Guardado correctamente
            </span>
          )}
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre del despacho</label>
            <input 
              type="text" 
              className="input" 
              value={formData.nombre_despacho} 
              onChange={e => setFormData({...formData, nombre_despacho: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email principal</label>
            <input 
              type="email" 
              className="input" 
              value={formData.email_principal} 
              onChange={e => setFormData({...formData, email_principal: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
            <input 
              type="tel" 
              className="input" 
              value={formData.telefono} 
              onChange={e => setFormData({...formData, telefono: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ciudad</label>
            <input 
              type="text" 
              className="input" 
              value={formData.ciudad} 
              onChange={e => setFormData({...formData, ciudad: e.target.value})}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección completa</label>
            <input 
              type="text" 
              className="input" 
              value={formData.direccion} 
              onChange={e => setFormData({...formData, direccion: e.target.value})}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={isSaving || profile?.role !== 'admin_despacho' && profile?.role !== 'superadmin'}
            className="btn btn-primary btn-sm min-w-[140px]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Team */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-slate-900">Equipo ({equipo.length})</h2>
          </div>
          <button className="btn btn-primary btn-sm opacity-50 cursor-not-allowed" title="Próximamente">
            + Invitar Miembro
          </button>
        </div>
        <div className="space-y-3">
          {equipo.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="avatar avatar-md bg-brand-800 text-white text-sm">
                  {getInitials(member.nombre_completo)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{member.nombre_completo}</div>
                  <div className="text-xs text-slate-500">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  'badge text-[10px]',
                  member.role === 'admin_despacho' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                )}>
                  {member.role === 'admin_despacho' ? 'Admin' : 'Abogado'}
                </span>
                <span className="text-xs text-slate-400 capitalize">{member.especialidad || 'General'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">Plan Actual</h2>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white mb-4">
          <div>
            <div className="text-lg font-bold capitalize">Plan {despacho?.plan || 'Profesional'}</div>
            <div className="text-sm text-blue-200">Facturación activa</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Activo</div>
          </div>
        </div>
        <button
          onClick={() => setShowPlanModal(true)}
          className="btn btn-secondary w-full gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
        >
          <ArrowUpCircle className="w-4 h-4" />
          Solicitar Cambio de Plan
          <ChevronRight className="w-4 h-4 ml-auto" />
        </button>
        <p className="text-xs text-slate-400 mt-2 text-center">
          El cambio será procesado por el administrador al verificar tu depósito
        </p>
      </div>

      {/* Modal Cambio de Plan */}
      {showPlanModal && (
        <>
          <div className="fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm" onClick={() => setShowPlanModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scale-in p-6">
              {planEnviado ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">¡Solicitud Enviada!</h3>
                  <p className="text-sm text-slate-500">El administrador recibirá tu solicitud y te contactará para confirmar el depósito.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <ArrowUpCircle className="w-5 h-5 text-blue-600" />
                      Cambiar de Plan
                    </h3>
                    <button onClick={() => setShowPlanModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>

                  <p className="text-sm text-slate-500 mb-4">
                    Selecciona el plan al que deseas cambiar. Se enviará una notificación al administrador para verificar tu depósito.
                  </p>

                  <div className="space-y-2 mb-4">
                    {PLANES.filter(p => p.id !== (despacho?.plan || '')).map(plan => (
                      <label key={plan.id} className="cursor-pointer block">
                        <input
                          type="radio"
                          name="plan"
                          value={plan.id}
                          checked={planSolicitado === plan.id}
                          onChange={() => setPlanSolicitado(plan.id)}
                          className="peer hidden"
                        />
                        <div className={cn(
                          'flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                          planSolicitado === plan.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        )}>
                          <div>
                            <div className="font-semibold text-slate-900">{plan.label}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{plan.desc}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-700">{plan.precio}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nota adicional (opcional)</label>
                    <textarea
                      className="input min-h-[80px] resize-none"
                      placeholder="Ej: Necesito más usuarios, o tenemos proyección de crecimiento..."
                      value={notaPlan}
                      onChange={e => setNotaPlan(e.target.value)}
                    />
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg mb-4 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      El cambio de plan se activará después de que el administrador verifique tu depósito. Contacta a soporte para los datos bancarios.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setShowPlanModal(false)} className="btn btn-secondary flex-1">Cancelar</button>
                    <button
                      onClick={handleSolicitarCambioPlan}
                      disabled={!planSolicitado || enviandoPlan}
                      className="btn btn-primary flex-1 gap-2"
                    >
                      {enviandoPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpCircle className="w-4 h-4" />}
                      Enviar Solicitud
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
