'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { mockClientes, mockProfiles } from '@/lib/mock-data';

export default function NuevaCitaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    router.push('/dashboard/citas');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/citas" className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Citas
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium">Nueva Cita</span>
      </div>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Agendar Cita</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Asunto *</label>
              <input type="text" className="input" placeholder="Ej: Revisión de documentos" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado *</label>
              <select className="input" required>
                <option value="">Seleccionar</option>
                {mockProfiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label>
              <select className="input">
                <option value="">Prospecto / sin asignar</option>
                {mockClientes.filter(c => c.estado === 'activo').map((c) => (
                  <option key={c.cliente_id} value={c.cliente_id}>{c.nombre_completo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha y hora *</label>
              <input type="datetime-local" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duración</label>
              <select className="input">
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60" selected>60 minutos</option>
                <option value="90">90 minutos</option>
                <option value="120">2 horas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de cita *</label>
              <select className="input" required>
                <option value="presencial">🏢 Presencial</option>
                <option value="virtual">💻 Virtual</option>
                <option value="telefonica">📞 Telefónica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Enlace Zoom/Meet</label>
              <input type="url" className="input" placeholder="https://zoom.us/j/..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción / Notas</label>
            <textarea className="input min-h-[80px] resize-y" placeholder="Notas sobre la cita..." />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-slate-300 text-blue-600" />
            <span className="text-sm text-slate-600">Enviar recordatorio por WhatsApp 24h antes</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/dashboard/citas" className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Agendar Cita</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
