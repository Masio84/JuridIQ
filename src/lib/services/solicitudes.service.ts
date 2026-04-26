'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SolicitudRegistro } from '@/types/database';

export async function getSolicitudes(estado?: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  let query = supabase
    .from('solicitudes_registro')
    .select('*')
    .order('fecha_solicitud', { ascending: false });

  if (estado) {
    query = query.eq('estado', estado);
  }

  const { data, error } = await query;
  return { data: data as SolicitudRegistro[] | null, error };
}

export async function updateSolicitudEstado(id: string, estado: 'aprobada' | 'rechazada', notas_admin?: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const updates: any = { estado };
  if (notas_admin !== undefined) updates.notas_admin = notas_admin;

  const { error } = await supabase
    .from('solicitudes_registro')
    .update(updates)
    .eq('id', id);

  return { error: error?.message || null };
}
