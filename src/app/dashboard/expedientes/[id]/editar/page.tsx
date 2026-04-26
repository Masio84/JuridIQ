// ============================================================
// JuridIQ - Editar Expediente Page
// ============================================================
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/lib/hooks/useAuth';
import { getExpedienteById, updateExpediente } from '@/lib/services/expedientes.service';
import type { Expediente } from '@/types/database';

export default function EditarExpedientePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [expediente, setExpediente] = useState<Expediente | null>(null);
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
        const [expData, { data: cData }, { data: pData }] = await Promise.all([
          getExpedienteById(id),
          supabase.from('clientes').select('cliente_id, nombre_completo').eq('despacho_id', profile.despacho_id).eq('estado', 'activo'),
          supabase.from('profiles').select('id, nombre_completo').eq('despacho_id', profile.despacho_id)
        ]);

        setExpediente(expData);
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
    
    // Check if empty values and convert to null/undefined where appropriate
    const monto = formData.get('monto_demanda') as string;
    const fecha = formData.get('fecha_proxima_audiencia') as string;

    const updates: Partial<Expediente> = {
      titulo: formData.get('titulo') as string,
      cliente_id: formData.get('cliente_id') as string,
      tipo_caso: formData.get('tipo_caso') as any,
      abogado_responsable_id: formData.get('abogado_responsable_id') as string,
      estado_caso: formData.get('estado_caso') as any,
      numero_expediente: (formData.get('numero_expediente') as string) || undefined,
      juzgado: (formData.get('juzgado') as string) || undefined,
      monto_demanda: monto ? parseFloat(monto) : undefined,
      fecha_proxima_audiencia: fecha ? new Date(fecha).toISOString() : undefined,
      descripcion_inicial: formData.get('descripcion_inicial') as string,
    };

    const { error: submitError } = await updateExpediente(id, updates);

    if (submitError) {
      console.error('Error al actualizar expediente:', submitError);
      setError(submitError);
      setLoading(false);
    } else {
      router.push(`/dashboard/expedientes/${id}`);
      router.refresh();
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!expediente) return <div>Expediente no encontrado.</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-2 text-sm">
        <Link href={`/dashboard/expedientes/${id}`} className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Volver al Expediente
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium">Editar Expediente</span>
      </div>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Editar Expediente</h1>
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Información del Caso</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Título del caso *</label>
                <input name="titulo" type="text" className="input" defaultValue={expediente.titulo} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente *</label>
                <select name="cliente_id" className="input" defaultValue={expediente.cliente_id} required>
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((c) => (
                    <option key={c.cliente_id} value={c.cliente_id}>{c.nombre_completo}</option>
                  ))}
                  {/* Si el cliente asignado ya no está activo, agregarlo temporalmente a la lista si es necesario, 
                      pero asumiremos que está en la lista o el defaultValue es suficiente */}
                  {!clientes.find(c => c.cliente_id === expediente.cliente_id) && expediente.cliente_id && (
                    <option value={expediente.cliente_id}>(Cliente Actual)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de caso *</label>
                <select name="tipo_caso" className="input" defaultValue={expediente.tipo_caso} required>
                  <option value="">Seleccionar tipo</option>
                  {['penal', 'civil', 'laboral', 'mercantil', 'familiar', 'fiscal', 'administrativo', 'amparo', 'otro'].map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado responsable *</label>
                <select name="abogado_responsable_id" className="input" defaultValue={expediente.abogado_responsable_id || ''} required>
                  <option value="">Seleccionar abogado</option>
                  {abogados.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado</label>
                <select name="estado_caso" className="input" defaultValue={expediente.estado_caso}>
                  <option value="apertura">Apertura</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="en_espera">En Espera</option>
                  <option value="sentencia">Sentencia</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">Detalles Judiciales</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Número de expediente</label>
                <input name="numero_expediente" type="text" className="input" defaultValue={expediente.numero_expediente || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Juzgado</label>
                <input name="juzgado" type="text" className="input" defaultValue={expediente.juzgado || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto de demanda</label>
                <input name="monto_demanda" type="number" className="input" defaultValue={expediente.monto_demanda || ''} step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Próxima audiencia</label>
                <input name="fecha_proxima_audiencia" type="datetime-local" className="input" defaultValue={expediente.fecha_proxima_audiencia ? new Date(expediente.fecha_proxima_audiencia).toISOString().slice(0, 16) : ''} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción del caso *</label>
            <textarea name="descripcion_inicial" className="input min-h-[120px] resize-y" defaultValue={expediente.descripcion_inicial || ''} required />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href={`/dashboard/expedientes/${id}`} className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar Cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
