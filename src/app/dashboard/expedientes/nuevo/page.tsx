// ============================================================
// JuridIQ - Nuevo Expediente Page (Conectado a DB Real)
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/lib/hooks/useAuth';
import { createExpediente } from '@/lib/services/expedientes.service';

export default function NuevoExpedientePage() {
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
    
    // Check if empty values and convert to null/undefined where appropriate
    const monto = formData.get('monto_demanda') as string;
    const fecha = formData.get('fecha_proxima_audiencia') as string;

    const nuevoExpediente = {
      despacho_id: profile.despacho_id,
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
      fecha_cierre: undefined,
    };

    const { error: submitError } = await createExpediente(nuevoExpediente);

    if (submitError) {
      console.error('Error al crear expediente:', submitError);
      setError(submitError);
      setLoading(false);
    } else {
      router.push('/dashboard/expedientes');
      router.refresh(); // Refresh list
    }
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
                <input name="titulo" type="text" className="input" placeholder="Ej: Fraude Fiscal - Pérez Hernández" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cliente *</label>
                <select name="cliente_id" className="input" required>
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((c) => (
                    <option key={c.cliente_id} value={c.cliente_id}>{c.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de caso *</label>
                <select name="tipo_caso" className="input" required>
                  <option value="">Seleccionar tipo</option>
                  {['penal', 'civil', 'laboral', 'mercantil', 'familiar', 'fiscal', 'administrativo', 'amparo', 'otro'].map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado responsable *</label>
                <select name="abogado_responsable_id" className="input" required>
                  <option value="">Seleccionar abogado</option>
                  {abogados.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado inicial</label>
                <select name="estado_caso" className="input" defaultValue="apertura">
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
                <input name="numero_expediente" type="text" className="input" placeholder="TFA/2024/1234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Juzgado</label>
                <input name="juzgado" type="text" className="input" placeholder="Tribunal Federal de Justicia..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto de demanda</label>
                <input name="monto_demanda" type="number" className="input" placeholder="0.00" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Próxima audiencia</label>
                <input name="fecha_proxima_audiencia" type="datetime-local" className="input" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción del caso *</label>
            <textarea name="descripcion_inicial" className="input min-h-[120px] resize-y" placeholder="Describe los hechos, antecedentes y objetivo del caso..." required />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/dashboard/expedientes" className="btn btn-secondary">Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={loading || !profile?.despacho_id}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Crear Expediente</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
