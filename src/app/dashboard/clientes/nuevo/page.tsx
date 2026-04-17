'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { mockProfiles } from '@/lib/mock-data';

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    router.push('/dashboard/clientes');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/clientes" className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Clientes
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium">Nuevo Cliente</span>
      </div>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Registrar Nuevo Cliente</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
              Información Personal
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo *</label>
                <input type="text" className="input" placeholder="Juan Pérez Hernández" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                <input type="email" className="input" placeholder="juan@email.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono *</label>
                <input type="tel" className="input" placeholder="+52 55 1234 5678" required />
              </div>
            </div>
          </div>

          {/* Identification */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
              Identificación
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de identificación</label>
                <select className="input">
                  <option value="RFC">RFC</option>
                  <option value="CURP">CURP</option>
                  <option value="INE">INE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Número</label>
                <input type="text" className="input" placeholder="PEHJ850101AB1" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Domicilio</label>
                <input type="text" className="input" placeholder="Calle, Col., Ciudad, Estado" />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
              Asignación
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado asignado *</label>
                <select className="input" required>
                  <option value="">Seleccionar abogado</option>
                  {mockProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado</label>
                <select className="input">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas generales</label>
            <textarea className="input min-h-[100px] resize-y" placeholder="Información adicional del cliente..." />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/dashboard/clientes" className="btn btn-secondary">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
