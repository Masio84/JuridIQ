// ============================================================
// JuridIQ - API: Automatización de Notificaciones
// Generar notificaciones automáticas por citas próximas,
// tareas vencidas, y audiencias.
// Invocar desde un cron job externo (ej. Vercel Cron, GitHub Actions)
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  // Verificar token de autorización para cron jobs
  const authHeader = request.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET_KEY;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const notificacionesCreadas: string[] = [];

  try {
    const ahora = new Date();
    const manana = new Date(ahora);
    manana.setDate(manana.getDate() + 1);
    manana.setHours(23, 59, 59, 999);
    const hoy = new Date(ahora);
    hoy.setHours(0, 0, 0, 0);

    // ============================================================
    // 1. Recordatorios de citas (24h antes)
    // ============================================================
    const manaña24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    const manaña26h = new Date(ahora.getTime() + 26 * 60 * 60 * 1000);

    const { data: citasProximas } = await supabaseAdmin
      .from('citas')
      .select('cita_id, nombre_cliente, fecha_hora, abogado_id, despacho_id, enviado_recordatorio')
      .eq('estado', 'confirmada')
      .eq('enviado_recordatorio', false)
      .gte('fecha_hora', manaña24h.toISOString())
      .lte('fecha_hora', manaña26h.toISOString());

    for (const cita of citasProximas || []) {
      if (!cita.abogado_id) continue;
      
      const fechaCita = new Date(cita.fecha_hora);
      const hora = fechaCita.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

      await supabaseAdmin.from('notificaciones').insert({
        despacho_id: cita.despacho_id,
        usuario_id: cita.abogado_id,
        tipo: 'cita_recordatorio',
        titulo: `Cita mañana a las ${hora}`,
        mensaje: `Tienes una cita con ${cita.nombre_cliente} mañana a las ${hora}. Confirma los detalles.`,
        leida: false,
        canal: 'web',
        enviada: true,
        prioridad: 'media',
        ruta_destino: `/dashboard/citas`,
        fecha_envio: new Date().toISOString(),
      });

      // Marcar como enviado para no duplicar
      await supabaseAdmin
        .from('citas')
        .update({ enviado_recordatorio: true } as any)
        .eq('cita_id', cita.cita_id);

      notificacionesCreadas.push(`cita_recordatorio:${cita.cita_id}`);
    }

    // ============================================================
    // 2. Tareas vencidas (fecha_limite pasada y no completadas)
    // ============================================================
    const { data: tareasVencidas } = await supabaseAdmin
      .from('expediente_tareas')
      .select(`
        tarea_id, titulo, fecha_limite,
        expediente:expedientes(expediente_id, titulo, despacho_id),
        responsable:profiles!responsable_id(id, despacho_id)
      `)
      .in('estado', ['pendiente', 'en_progreso'])
      .lt('fecha_limite', hoy.toISOString());

    for (const tarea of tareasVencidas || []) {
      const exp = tarea.expediente as any;
      const resp = tarea.responsable as any;
      if (!exp || !resp) continue;

      // Evitar duplicar: verificar que no exista notificación de esta tarea en las últimas 24h
      const { data: existing } = await supabaseAdmin
        .from('notificaciones')
        .select('notificacion_id')
        .eq('usuario_id', resp.id)
        .eq('tipo', 'tarea_vencida')
        .like('mensaje', `%${tarea.tarea_id}%`)
        .gte('fecha_creacion', new Date(ahora.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      if (existing && existing.length > 0) continue;

      await supabaseAdmin.from('notificaciones').insert({
        despacho_id: exp.despacho_id,
        usuario_id: resp.id,
        tipo: 'tarea_vencida',
        titulo: `Tarea vencida: ${tarea.titulo}`,
        mensaje: `La tarea "${tarea.titulo}" en el expediente "${exp.titulo}" venció hace ${Math.floor((ahora.getTime() - new Date(tarea.fecha_limite).getTime()) / (1000 * 60 * 60 * 24))} días. ID:${tarea.tarea_id}`,
        leida: false,
        canal: 'web',
        enviada: true,
        prioridad: 'alta',
        ruta_destino: `/dashboard/expedientes/${exp.expediente_id}`,
        fecha_envio: new Date().toISOString(),
      });

      notificacionesCreadas.push(`tarea_vencida:${tarea.tarea_id}`);
    }

    // ============================================================
    // 3. Audiencias próximas (3 días antes)
    // ============================================================
    const en3Dias = new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000);
    const en3Dias1h = new Date(en3Dias.getTime() + 60 * 60 * 1000);

    const { data: audienciasProximas } = await supabaseAdmin
      .from('expediente_tareas')
      .select(`
        tarea_id, titulo, fecha_limite,
        expediente:expedientes(expediente_id, titulo, despacho_id, abogado_responsable_id)
      `)
      .ilike('titulo', '%audiencia%')
      .in('estado', ['pendiente', 'en_progreso'])
      .gte('fecha_limite', en3Dias.toISOString())
      .lte('fecha_limite', en3Dias1h.toISOString());

    for (const audiencia of audienciasProximas || []) {
      const exp = audiencia.expediente as any;
      if (!exp?.abogado_responsable_id) continue;

      await supabaseAdmin.from('notificaciones').insert({
        despacho_id: exp.despacho_id,
        usuario_id: exp.abogado_responsable_id,
        tipo: 'expediente_audiencia',
        titulo: `Audiencia en 3 días: ${audiencia.titulo}`,
        mensaje: `Tienes una audiencia próxima en el expediente "${exp.titulo}". Asegúrate de tener todo preparado.`,
        leida: false,
        canal: 'web',
        enviada: true,
        prioridad: 'alta',
        ruta_destino: `/dashboard/expedientes/${exp.expediente_id}`,
        fecha_envio: new Date().toISOString(),
      });

      notificacionesCreadas.push(`audiencia:${audiencia.tarea_id}`);
    }

    return NextResponse.json({
      success: true,
      notificaciones_creadas: notificacionesCreadas.length,
      detalle: notificacionesCreadas,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error en automatización de notificaciones:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// GET para invocar manualmente desde el navegador (solo en desarrollo)
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Solo disponible en desarrollo' }, { status: 403 });
  }
  return POST(new Request('http://localhost/api/notificaciones/auto'));
}
