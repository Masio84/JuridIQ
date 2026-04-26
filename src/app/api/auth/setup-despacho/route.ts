// ============================================================
// JuridIQ - API Route: Setup Despacho post-registro
// Usa service_role para crear el despacho y vincularlo al perfil
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente admin con service_role (bypass de RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: Request) {
  try {
    const { userId, nombreDespacho, emailPrincipal } = await request.json();

    if (!userId || !nombreDespacho || !emailPrincipal) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // 1. Crear el despacho
    const { data: despacho, error: despachoError } = await supabaseAdmin
      .from('despachos')
      .insert({
        nombre_despacho: nombreDespacho,
        email_principal: emailPrincipal,
        plan: 'basico',
        activo: true,
      })
      .select('despacho_id')
      .single();

    if (despachoError) {
      console.error('Error creating despacho:', despachoError);
      return NextResponse.json({ error: 'Error al crear el despacho' }, { status: 500 });
    }

    // 2. Vincular perfil al despacho y asignar rol admin_despacho
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        despacho_id: despacho.despacho_id,
        role: 'admin_despacho',
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Rollback: eliminar el despacho creado
      await supabaseAdmin.from('despachos').delete().eq('despacho_id', despacho.despacho_id);
      return NextResponse.json({ error: 'Error al configurar el perfil' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      despacho_id: despacho.despacho_id,
    });
  } catch (error) {
    console.error('Setup despacho error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
