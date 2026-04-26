// ============================================================
// JuridIQ - Nueva Cita Page (Conectado a DB Real)
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/lib/hooks/useAuth';
import { createCita } from '@/lib/services/citas.service';

export default function NuevaCitaPage() {
  const router = useRouter();
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [clientes, setClientes] = useState<{ cliente_id: string; nombre_completo: string }[]>([]);
  const [abogados, setAbogados] = useState<{ id: string; nombre_completo: string }[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadOptions() {
      if (!profile?.despacho_id) return;
      
      // Load Clientes
      const { data: cData } = await supabase
        .from('clientes')
        .select('cliente_id, nombre_completo')
        .eq('despacho_id', profile.despacho_id)
        .eq('estado', 'activo');
        
      if (cData) setClientes(cData);
      
      // Load Abogados
      const { data: pData } = await supabase
        .from('profiles')
        .select('id, nombre_completo')
        .eq('despacho_id', profile.despacho_id);
        
      if (pData) setAbogados(pData);
    }
    loadOptions();
  }, [profile?.despacho_id, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile?.despacho_id) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const recordatorio = formData.get('recordatorio_whatsapp') === 'on';

    const nuevaCita = {
      despacho_id: profile.despacho_id,
      titulo_asunto: formData.get('titulo_asunto') as string,
      abogado_id: formData.get('abogado_id') as string,
      cliente_id: formData.get('cliente_id') as string || null,
      nombre_publico: null, // As it is not public auto-schedule
      email_publico: null,
      telefono_publico: null,
      fecha_hora: new Date(formData.get('fecha_hora') as string).toISOString(),
      duracion_minutos: parseInt(formData.get('duracion_minutos') as string),
      tipo_cita: formData.get('tipo_cita') as string,
      enlace_reunion: formData.get('enlace_reunion') as string || null,
      notas: formData.get('notas') as string || null,
      confirmada: true, // Internal creation usually means confirmed
    };

    const { error: submitError } = await createCita(nuevaCita);

    if (submitError) {
      console.error('Error al crear cita:', submitError);
      setError(submitError);
      setLoading(false);
    } else {
      router.push('/dashboard/citas');
      router.refresh();
    }
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
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Asunto *</label>
              <input name="titulo_asunto" type="text" className="input" placeholder="Ej: Revisión de documentos" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado *</label>
              <select name="abogado_id" className="input" required>
                <option value="">Seleccionar</option>
                {abogados.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label>
              <select name="cliente_id" className="input">
                <option value="">Prospecto / sin asignar</option>
                {clientes.map((c) => (
                  <option key={c.cliente_id} value={c.cliente_id}>{c.nombre_completo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha y hora *</label>
              <input name="fecha_hora" type="datetime-local" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duración</label>
              <select name="duracion_minutos" className="input" defaultValue="60">
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
                <option value="90">90 minutos</option>
                <option value="120">2 horas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de cita *</label>
              <select name="tipo_cita" className="input" required>
                <option value="presencial">🏢 Presencial</option>
                <option value="virtual">💻 Virtual</option>
                <option value="telefonica">📞 Telefónica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Enlace Zoom/Meet</label>
              <input name="enlace_reunion" type="url" className="input" placeholder="https://zoom.us/j/..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción / Notas</label>
            <textarea name="notas" className="input min-h-[80px] resize-y" placeholder="Notas sobre la cita..." />
          </div>

          <label className="flex items-center gap-2">
            <input name="recordatorio_whatsapp" type="checkbox" className="rounded border-slate-300 text-blue-600" />
            <span className="text-sm text-slate-600">Enviar recordatorio por WhatsApp 24h antes</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/dashboard/citas" className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={loading || !profile?.despacho_id}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Agendar Cita</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
