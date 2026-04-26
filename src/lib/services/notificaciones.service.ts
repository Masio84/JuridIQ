// ============================================================
// JuridIQ - Servicio de Notificaciones (Supabase Realtime)
// ============================================================

import { createBrowserClient } from '@supabase/ssr';
import type { Notificacion } from '@/types/database';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getNotificaciones(userId: string, soloNoLeidas = false) {
  let query = supabase
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', userId)
    .order('fecha_creacion', { ascending: false })
    .limit(20);

  if (soloNoLeidas) query = query.eq('leida', false);

  const { data, error } = await query;
  if (error) return { data: [], error: error.message };
  return { data: data as Notificacion[], error: null };
}

export async function marcarLeida(notificacionId: string): Promise<void> {
  await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('notificacion_id', notificacionId);
}

export async function marcarTodasLeidas(userId: string): Promise<void> {
  await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('usuario_id', userId)
    .eq('leida', false);
}

// Suscripción en tiempo real a nuevas notificaciones
export function subscribeToNotificaciones(
  userId: string,
  onNew: (notif: Notificacion) => void
) {
  const channel = supabase
    .channel(`notificaciones:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notificaciones',
        filter: `usuario_id=eq.${userId}`,
      },
      (payload) => onNew(payload.new as Notificacion)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function eliminarNotificacion(notificacionId: string): Promise<void> {
  await supabase
    .from('notificaciones')
    .delete()
    .eq('notificacion_id', notificacionId);
}
