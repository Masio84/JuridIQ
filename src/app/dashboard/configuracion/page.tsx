'use client';

import { Settings, Building2, Users, CreditCard, Shield, Bell } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { mockDespacho, mockProfiles, mockCurrentUser } from '@/lib/mock-data';

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">Administra tu despacho, equipo y preferencias</p>
      </div>

      {/* Despacho Info */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-slate-900">Información del Despacho</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre del despacho</label>
            <input type="text" className="input" defaultValue={mockDespacho.nombre_despacho} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email principal</label>
            <input type="email" className="input" defaultValue={mockDespacho.email_principal} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
            <input type="tel" className="input" defaultValue={mockDespacho.telefono} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ciudad</label>
            <input type="text" className="input" defaultValue={mockDespacho.ciudad} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección</label>
            <input type="text" className="input" defaultValue={mockDespacho.direccion} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary btn-sm">Guardar Cambios</button>
        </div>
      </div>

      {/* Team */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-slate-900">Equipo ({mockProfiles.length})</h2>
          </div>
          <button className="btn btn-primary btn-sm">+ Invitar Miembro</button>
        </div>
        <div className="space-y-3">
          {mockProfiles.map((profile) => (
            <div key={profile.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="avatar avatar-md bg-brand-800 text-white text-sm">
                  {getInitials(profile.nombre_completo)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{profile.nombre_completo}</div>
                  <div className="text-xs text-slate-500">{profile.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  'badge text-[10px]',
                  profile.role === 'admin_despacho' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                )}>
                  {profile.role === 'admin_despacho' ? 'Admin' : 'Abogado'}
                </span>
                <span className="text-xs text-slate-400 capitalize">{profile.especialidad}</span>
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
            <div className="text-lg font-bold">Plan Profesional</div>
            <div className="text-sm text-blue-200">4 usuarios · Expedientes ilimitados · 100 consultas IA/mes</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">$2,499</div>
            <div className="text-xs text-blue-200">/mes · Renueva 15 May 2026</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-slate-900">Notificaciones</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Recordatorios de citas (24h antes)', desc: 'Via WhatsApp y email', checked: true },
            { label: 'Tareas vencidas', desc: 'Notificación cuando una tarea supera su fecha límite', checked: true },
            { label: 'Audiencias próximas', desc: 'Aviso 3 días antes de cada audiencia', checked: true },
            { label: 'Nuevas citas públicas', desc: 'Cuando un cliente agenda vía formulario público', checked: false },
          ].map((notif) => (
            <label key={notif.label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={notif.checked}
                className="mt-0.5 rounded border-slate-300 text-blue-600"
              />
              <div>
                <div className="text-sm font-medium text-slate-900">{notif.label}</div>
                <div className="text-xs text-slate-500">{notif.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
