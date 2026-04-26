// ============================================================
// JuridIQ - Servicio de Clientes (Supabase Real)
// ============================================================

import { createBrowserClient } from '@supabase/ssr';
import type { Cliente } from '@/types/database';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ClienteFilters {
  search?: string;
  estado?: string;
  abogado_id?: string;
  page?: number;
  pageSize?: number;
}

export interface ClientesResult {
  data: Cliente[];
  count: number;
  error: string | null;
}

export async function getClientes(filters: ClienteFilters = {}): Promise<ClientesResult> {
  const { search, estado, abogado_id, page = 1, pageSize = 20 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('clientes')
    .select(`
      *,
      abogado:profiles!clientes_abogado_asignado_id_fkey(id, nombre_completo, email, especialidad),
      expedientes_count:expedientes(count)
    `, { count: 'exact' })
    .order('fecha_registro', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `nombre_completo.ilike.%${search}%,email.ilike.%${search}%,numero_identificacion.ilike.%${search}%`
    );
  }

  if (estado && estado !== 'todos') {
    query = query.eq('estado', estado);
  }

  if (abogado_id) {
    query = query.eq('abogado_asignado_id', abogado_id);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching clientes:', error);
    return { data: [], count: 0, error: error.message };
  }

  // Normalizar expedientes_count
  const normalized = (data || []).map((c: Record<string, unknown>) => ({
    ...c,
    expedientes_count: Array.isArray(c.expedientes_count)
      ? (c.expedientes_count[0] as { count: number })?.count ?? 0
      : 0,
  })) as Cliente[];

  return { data: normalized, count: count ?? 0, error: null };
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const { data, error } = await supabase
    .from('clientes')
    .select(`
      *,
      abogado:profiles!clientes_abogado_asignado_id_fkey(id, nombre_completo, email, especialidad),
      expedientes:expedientes(expediente_id, titulo, tipo_caso, estado_caso, fecha_creacion)
    `)
    .eq('cliente_id', id)
    .single();

  if (error) return null;
  return data as Cliente;
}

export async function createCliente(
  clienteData: Omit<Cliente, 'cliente_id' | 'fecha_registro' | 'updated_at' | 'abogado' | 'expedientes_count'>
): Promise<{ data: Cliente | null; error: string | null }> {
  const { data, error } = await supabase
    .from('clientes')
    .insert(clienteData)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Cliente, error: null };
}

export async function updateCliente(
  id: string,
  updates: Partial<Cliente>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('clientes')
    .update(updates)
    .eq('cliente_id', id);

  return { error: error?.message ?? null };
}

export async function deleteCliente(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('cliente_id', id);

  return { error: error?.message ?? null };
}
