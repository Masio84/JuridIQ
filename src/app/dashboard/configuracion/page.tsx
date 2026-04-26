'use client';

import { useState, useEffect } from 'react';
import { Settings, Building2, Users, CreditCard, Shield, Bell, Loader2, CheckCircle } from 'lucide-react';
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
        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div>
            <div className="text-lg font-bold capitalize">Plan {despacho?.plan || 'Profesional'}</div>
            <div className="text-sm text-blue-200">Facturación activa</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Activo</div>
          </div>
        </div>
      </div>
    </div>
  );
}
