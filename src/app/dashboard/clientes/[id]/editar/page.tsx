// ============================================================
// JuridIQ - Editar Cliente Page
// ============================================================
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { getClienteById, updateCliente } from '@/lib/services/clientes.service';
import { useAuth } from '@/lib/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';
import type { Cliente } from '@/types/database';

export default function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [abogados, setAbogados] = useState<{ id: string; nombre_completo: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadData() {
      if (!profile?.despacho_id) return;
      
      try {
        const [clienteData, { data: abogadosData }] = await Promise.all([
          getClienteById(id),
          supabase.from('profiles').select('id, nombre_completo').eq('despacho_id', profile.despacho_id)
        ]);
        
        setCliente(clienteData);
        setAbogados(abogadosData || []);
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
    
    const updates = {
      nombre_completo: formData.get('nombre_completo') as string,
      email: formData.get('email') as string,
      telefono: formData.get('telefono') as string,
      tipo_identificacion: formData.get('tipo_identificacion') as string || null,
      numero_identificacion: formData.get('numero_identificacion') as string || null,
      domicilio: formData.get('domicilio') as string || null,
      abogado_asignado_id: formData.get('abogado_asignado_id') as string || null,
      estado: formData.get('estado') as string,
      notas_generales: formData.get('notas_generales') as string || null,
    };

    const { error: submitError } = await updateCliente(id, updates);

    if (submitError) {
      console.error('Error al actualizar cliente:', submitError);
      setError(submitError);
      setLoading(false);
    } else {
      router.push(`/dashboard/clientes/${id}`);
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

  if (!cliente) return <div>Cliente no encontrado.</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-2 text-sm">
        <Link href={`/dashboard/clientes/${id}`} className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Volver al Cliente
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium">Editar Cliente</span>
      </div>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Editar Cliente</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
              Información Personal
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo *</label>
                <input name="nombre_completo" type="text" className="input" defaultValue={cliente.nombre_completo} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input name="email" type="email" className="input" defaultValue={cliente.email || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                <input name="telefono" type="tel" className="input" defaultValue={cliente.telefono || ''} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
              Identificación
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de identificación</label>
                <select name="tipo_identificacion" className="input" defaultValue={cliente.tipo_identificacion || ''}>
                  <option value="">Seleccionar...</option>
                  <option value="RFC">RFC</option>
                  <option value="CURP">CURP</option>
                  <option value="INE">INE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Número</label>
                <input name="numero_identificacion" type="text" className="input" defaultValue={cliente.numero_identificacion || ''} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Domicilio</label>
                <input name="domicilio" type="text" className="input" defaultValue={cliente.domicilio || ''} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
              Asignación
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado asignado</label>
                <select name="abogado_asignado_id" className="input" defaultValue={cliente.abogado_asignado_id || ''}>
                  <option value="">Sin asignar</option>
                  {abogados.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado</label>
                <select name="estado" className="input" defaultValue={cliente.estado}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="archivado">Archivado</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas generales</label>
            <textarea name="notas_generales" className="input min-h-[100px] resize-y" defaultValue={cliente.notas_generales || ''} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href={`/dashboard/clientes/${id}`} className="btn btn-secondary">
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
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
