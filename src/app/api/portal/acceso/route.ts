// ============================================================
// JuridIQ - API: Generar token de acceso para portal cliente
// ============================================================
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { cliente_id, email_cliente, dias_vigencia = 30 } = await request.json();

    if (!cliente_id || !email_cliente) {
      return NextResponse.json({ error: 'cliente_id y email_cliente son requeridos' }, { status: 400 });
    }

    // Verificar que el cliente pertenece al despacho
    const { data: profile } = await supabase
      .from('profiles').select('despacho_id').eq('id', user.id).single();

    if (!profile?.despacho_id) {
      return NextResponse.json({ error: 'Sin despacho asociado' }, { status: 403 });
    }

    const { data: cliente } = await supabase
      .from('clientes')
      .select('cliente_id')
      .eq('cliente_id', cliente_id)
      .eq('despacho_id', profile.despacho_id)
      .single();

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado en tu despacho' }, { status: 404 });
    }

    // Generar token único
    const token = randomBytes(32).toString('hex');
    const expiracion = new Date();
    expiracion.setDate(expiracion.getDate() + dias_vigencia);

    // Desactivar accesos previos del mismo cliente
    await supabase
      .from('cliente_accesos')
      .update({ activo: false })
      .eq('cliente_id', cliente_id);

    // Crear nuevo acceso
    const { data: acceso, error } = await supabase
      .from('cliente_accesos')
      .insert({
        cliente_id,
        despacho_id: profile.despacho_id,
        email: email_cliente,
        token_acceso: token,
        activo: true,
        fecha_expiracion: expiracion.toISOString(),
      })
      .select('id, token_acceso, fecha_expiracion')
      .single();

    if (error) throw error;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://juridiq.vercel.app';
    const linkAcceso = `${baseUrl}/portal/${token}`;

    return NextResponse.json({ 
      token: acceso.token_acceso, 
      link: linkAcceso,
      expira: acceso.fecha_expiracion 
    });
  } catch (err: any) {
    console.error('Portal acceso error:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
