// ============================================================
// JuridIQ - Nuevo Cliente Page (Conectado a DB Real)
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { createCliente } from '@/lib/services/clientes.service';
import { useAuth } from '@/lib/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';

export default function NuevoClientePage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [abogados, setAbogados] = useState<{ id: string; nombre_completo: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadAbogados() {
      if (!profile?.despacho_id) return;
      const { data } = await supabase
        .from('profiles')
        .select('id, nombre_completo')
        .eq('despacho_id', profile.despacho_id);
      
      setAbogados(data || []);
    }
    loadAbogados();
  }, [profile?.despacho_id, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile?.despacho_id) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    const nuevoCliente = {
      despacho_id: profile.despacho_id,
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

    const { error: submitError } = await createCliente(nuevoCliente);

    if (submitError) {
      console.error('Error al crear cliente:', submitError);
      setError(submitError);
      setLoading(false);
    } else {
      router.push('/dashboard/clientes');
      router.refresh(); // Refresh the list
    }
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

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">
              Información Personal
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo *</label>
                <input name="nombre_completo" type="text" className="input" placeholder="Juan Pérez Hernández" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input name="email" type="email" className="input" placeholder="juan@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                <input name="telefono" type="tel" className="input" placeholder="+52 55 1234 5678" />
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
                <select name="tipo_identificacion" className="input">
                  <option value="">Seleccionar...</option>
                  <option value="RFC">RFC</option>
                  <option value="CURP">CURP</option>
                  <option value="INE">INE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Número</label>
                <input name="numero_identificacion" type="text" className="input" placeholder="PEHJ850101AB1" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Domicilio</label>
                <input name="domicilio" type="text" className="input" placeholder="Calle, Col., Ciudad, Estado" />
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado asignado</label>
                <select name="abogado_asignado_id" className="input">
                  <option value="">Sin asignar</option>
                  {abogados.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado</label>
                <select name="estado" className="input" defaultValue="activo">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas generales</label>
            <textarea name="notas_generales" className="input min-h-[100px] resize-y" placeholder="Información adicional del cliente..." />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/dashboard/clientes" className="btn btn-secondary">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading || !profile?.despacho_id}>
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
