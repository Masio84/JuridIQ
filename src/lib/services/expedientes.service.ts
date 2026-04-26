// ============================================================
// JuridIQ - Servicio de Expedientes (Supabase Real)
// ============================================================

import { createBrowserClient } from '@supabase/ssr';
import type { Expediente, ExpedienteTarea, ExpedienteDocumento } from '@/types/database';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ExpedienteFilters {
  search?: string;
  estado?: string;
  tipo_caso?: string;
  abogado_id?: string;
  cliente_id?: string;
  page?: number;
  pageSize?: number;
}

export async function getExpedientes(filters: ExpedienteFilters = {}) {
  const { search, estado, tipo_caso, abogado_id, cliente_id, page = 1, pageSize = 20 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('expedientes')
    .select(`
      *,
      cliente:clientes(cliente_id, nombre_completo, email, telefono),
      abogado:profiles!expedientes_abogado_responsable_id_fkey(id, nombre_completo, especialidad)
    `, { count: 'exact' })
    .order('fecha_creacion', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `titulo.ilike.%${search}%,numero_expediente.ilike.%${search}%,juzgado.ilike.%${search}%`
    );
  }
  if (estado && estado !== 'todos') query = query.eq('estado_caso', estado);
  if (tipo_caso && tipo_caso !== 'todos') query = query.eq('tipo_caso', tipo_caso);
  if (abogado_id) query = query.eq('abogado_responsable_id', abogado_id);
  if (cliente_id) query = query.eq('cliente_id', cliente_id);

  const { data, count, error } = await query;
  if (error) return { data: [], count: 0, error: error.message };
  return { data: data as Expediente[], count: count ?? 0, error: null };
}

export async function getExpedienteById(id: string): Promise<Expediente | null> {
  const { data, error } = await supabase
    .from('expedientes')
    .select(`
      *,
      cliente:clientes(cliente_id, nombre_completo, email, telefono, domicilio),
      abogado:profiles!expedientes_abogado_responsable_id_fkey(id, nombre_completo, especialidad, email),
      tareas:expediente_tareas(
        *,
        responsable:profiles(id, nombre_completo)
      ),
      documentos:expediente_documentos(
        *,
        subido_por:profiles(id, nombre_completo)
      )
    `)
    .eq('expediente_id', id)
    .single();

  if (error) return null;
  return data as Expediente;
}

export async function createExpediente(
  expedienteData: Omit<Expediente, 'expediente_id' | 'fecha_creacion' | 'updated_at' | 'cliente' | 'abogado' | 'tareas' | 'documentos'>
): Promise<{ data: Expediente | null; error: string | null }> {
  const { data, error } = await supabase
    .from('expedientes')
    .insert(expedienteData)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Expediente, error: null };
}

export async function updateExpediente(
  id: string,
  updates: Partial<Expediente>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('expedientes')
    .update(updates)
    .eq('expediente_id', id);

  return { error: error?.message ?? null };
}

// ---- Tareas ----
export async function createTarea(
  tareaData: Omit<ExpedienteTarea, 'tarea_id' | 'created_at' | 'updated_at' | 'responsable'>
): Promise<{ data: ExpedienteTarea | null; error: string | null }> {
  const { data, error } = await supabase
    .from('expediente_tareas')
    .insert(tareaData)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as ExpedienteTarea, error: null };
}

export async function updateTareaEstado(
  tareaId: string,
  estado: string,
  fechaCompletada?: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('expediente_tareas')
    .update({
      estado,
      fecha_completada: fechaCompletada ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('tarea_id', tareaId);

  return { error: error?.message ?? null };
}

// ---- Documentos (Storage) ----
export async function uploadDocumento(
  expedienteId: string,
  file: File,
  tipoDocumento: string,
  subidoPorId: string
): Promise<{ data: ExpedienteDocumento | null; error: string | null }> {
  // 1. Subir archivo a Storage
  const filePath = `${expedienteId}/${Date.now()}_${file.name}`;
  const { error: storageError } = await supabase.storage
    .from('expedientes')
    .upload(filePath, file);

  if (storageError) return { data: null, error: storageError.message };

  // 2. Registrar en la tabla
  const { data, error } = await supabase
    .from('expediente_documentos')
    .insert({
      expediente_id: expedienteId,
      nombre_archivo: file.name,
      tipo_documento: tipoDocumento,
      ruta_storage: filePath,
      subido_por_id: subidoPorId,
      tamano_bytes: file.size,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as ExpedienteDocumento, error: null };
}

export async function getDocumentoUrl(ruta: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from('expedientes')
    .createSignedUrl(ruta, 3600); // URL válida por 1 hora

  return data?.signedUrl ?? null;
}
