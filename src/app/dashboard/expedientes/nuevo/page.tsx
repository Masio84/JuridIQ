'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { mockClientes, mockProfiles } from '@/lib/mock-data';

export default function NuevoExpedientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    router.push('/dashboard/expedientes');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/expedientes" className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Expedientes
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium">Nuevo Expediente</span>
      </div>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Crear Expediente</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Información del Caso</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Título del caso *</label>
                <input type="text" className="input" placeholder="Ej: Fraude Fiscal - Pérez Hernández" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente *</label>
                <select className="input" required>
                  <option value="">Seleccionar cliente</option>
                  {mockClientes.filter(c => c.estado === 'activo').map((c) => (
                    <option key={c.cliente_id} value={c.cliente_id}>{c.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de caso *</label>
                <select className="input" required>
                  <option value="">Seleccionar tipo</option>
                  {['penal', 'civil', 'laboral', 'mercantil', 'familiar', 'fiscal', 'administrativo', 'amparo', 'otro'].map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado responsable *</label>
                <select className="input" required>
                  <option value="">Seleccionar abogado</option>
                  {mockProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado inicial</label>
                <select className="input">
                  <option value="apertura">Apertura</option>
                  <option value="en_proceso">En Proceso</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Detalles Judiciales</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Número de expediente</label>
                <input type="text" className="input" placeholder="TFA/2024/1234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Juzgado</label>
                <input type="text" className="input" placeholder="Tribunal Federal de Justicia..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto de demanda</label>
                <input type="number" className="input" placeholder="0.00" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Próxima audiencia</label>
                <input type="datetime-local" className="input" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción del caso *</label>
            <textarea className="input min-h-[120px] resize-y" placeholder="Describe los hechos, antecedentes y objetivo del caso..." required />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/dashboard/expedientes" className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Crear Expediente</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
