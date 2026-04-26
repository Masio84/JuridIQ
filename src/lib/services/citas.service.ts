// ============================================================
// JuridIQ - Servicio de Citas (Supabase Real)
// ============================================================

import { createBrowserClient } from '@supabase/ssr';
import type { Cita } from '@/types/database';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getCitas(filters: {
  fecha_desde?: string;
  fecha_hasta?: string;
  abogado_id?: string;
  confirmada?: boolean;
} = {}) {
  let query = supabase
    .from('citas')
    .select(`
      *,
      cliente:clientes(cliente_id, nombre_completo, email, telefono),
      abogado:profiles!citas_abogado_id_fkey(id, nombre_completo, especialidad)
    `)
    .order('fecha_hora', { ascending: true });

  if (filters.fecha_desde) query = query.gte('fecha_hora', filters.fecha_desde);
  if (filters.fecha_hasta) query = query.lte('fecha_hora', filters.fecha_hasta);
  if (filters.abogado_id) query = query.eq('abogado_id', filters.abogado_id);
  if (filters.confirmada !== undefined) query = query.eq('confirmada', filters.confirmada);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: data as Cita[], error: null };
}

export async function getCitasHoy() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return getCitas({
    fecha_desde: startOfDay.toISOString(),
    fecha_hasta: endOfDay.toISOString(),
  });
}

export async function createCita(
  citaData: Omit<Cita, 'cita_id' | 'created_at' | 'cliente' | 'abogado'>
): Promise<{ data: Cita | null; error: string | null }> {
  const { data, error } = await supabase
    .from('citas')
    .insert(citaData)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Cita, error: null };
}

export async function updateCita(
  id: string,
  updates: Partial<Cita>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('citas')
    .update(updates)
    .eq('cita_id', id);

  return { error: error?.message ?? null };
}

export async function confirmarCita(id: string): Promise<{ error: string | null }> {
  return updateCita(id, { confirmada: true });
}

export async function deleteCita(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('citas').delete().eq('cita_id', id);
  return { error: error?.message ?? null };
}
