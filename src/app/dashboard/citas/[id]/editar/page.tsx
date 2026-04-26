// ============================================================
// JuridIQ - Editar Cita Page
// ============================================================
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/lib/hooks/useAuth';
import { updateCita, deleteCita } from '@/lib/services/citas.service';
import type { Cita } from '@/types/database';

export default function EditarCitaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [cita, setCita] = useState<Cita | null>(null);
  const [clientes, setClientes] = useState<{ cliente_id: string; nombre_completo: string }[]>([]);
  const [abogados, setAbogados] = useState<{ id: string; nombre_completo: string }[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadData() {
      if (!profile?.despacho_id) return;
      
      try {
        const [{ data: citaData }, { data: cData }, { data: pData }] = await Promise.all([
          supabase.from('citas').select('*').eq('cita_id', id).single(),
          supabase.from('clientes').select('cliente_id, nombre_completo').eq('despacho_id', profile.despacho_id).eq('estado', 'activo'),
          supabase.from('profiles').select('id, nombre_completo').eq('despacho_id', profile.despacho_id)
        ]);

        setCita(citaData as Cita);
        if (cData) setClientes(cData);
        if (pData) setAbogados(pData);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [id, profile?.despacho_id, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const updates: Partial<Cita> = {
      titulo_asunto: formData.get('titulo_asunto') as string,
      abogado_id: formData.get('abogado_id') as string,
      cliente_id: (formData.get('cliente_id') as string) || undefined,
      fecha_hora: new Date(formData.get('fecha_hora') as string).toISOString(),
      duracion_minutos: parseInt(formData.get('duracion_minutos') as string),
      tipo_cita: formData.get('tipo_cita') as any,
      enlace_reunion: (formData.get('enlace_reunion') as string) || undefined,
      notas: (formData.get('notas') as string) || undefined,
      confirmada: formData.get('confirmada') === 'on',
    };

    const { error: submitError } = await updateCita(id, updates);

    if (submitError) {
      console.error('Error al actualizar cita:', submitError);
      setError(submitError);
      setLoading(false);
    } else {
      router.push('/dashboard/citas');
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.')) {
      setLoading(true);
      await deleteCita(id);
      router.push('/dashboard/citas');
      router.refresh();
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!cita) return <div>Cita no encontrada.</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard/citas" className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Citas
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium">Editar Cita</span>
        </div>
        <button 
          type="button" 
          onClick={handleDelete}
          className="btn btn-sm text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200"
        >
          <Trash2 className="w-4 h-4" /> Eliminar Cita
        </button>
      </div>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Editar Cita</h1>
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Asunto *</label>
              <input name="titulo_asunto" type="text" className="input" defaultValue={cita.titulo_asunto} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado *</label>
              <select name="abogado_id" className="input" defaultValue={cita.abogado_id} required>
                <option value="">Seleccionar</option>
                {abogados.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente</label>
              <select name="cliente_id" className="input" defaultValue={cita.cliente_id || ''}>
                <option value="">Prospecto / sin asignar</option>
                {clientes.map((c) => (
                  <option key={c.cliente_id} value={c.cliente_id}>{c.nombre_completo}</option>
                ))}
                {!clientes.find(c => c.cliente_id === cita.cliente_id) && cita.cliente_id && (
                  <option value={cita.cliente_id}>(Cliente Actual)</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha y hora *</label>
              <input name="fecha_hora" type="datetime-local" className="input" defaultValue={new Date(cita.fecha_hora).toISOString().slice(0, 16)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duración</label>
              <select name="duracion_minutos" className="input" defaultValue={cita.duracion_minutos.toString()}>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
                <option value="90">90 minutos</option>
                <option value="120">2 horas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de cita *</label>
              <select name="tipo_cita" className="input" defaultValue={cita.tipo_cita} required>
                <option value="presencial">🏢 Presencial</option>
                <option value="virtual">💻 Virtual</option>
                <option value="telefonica">📞 Telefónica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Enlace Zoom/Meet</label>
              <input name="enlace_reunion" type="url" className="input" defaultValue={cita.enlace_reunion || ''} placeholder="https://zoom.us/j/..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción / Notas</label>
            <textarea name="notas" className="input min-h-[80px] resize-y" defaultValue={cita.notas || ''} placeholder="Notas sobre la cita..." />
          </div>

          <label className="flex items-center gap-2">
            <input name="confirmada" type="checkbox" className="rounded border-slate-300 text-blue-600" defaultChecked={cita.confirmada} />
            <span className="text-sm font-medium text-slate-700">Cita confirmada</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/dashboard/citas" className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar Cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
