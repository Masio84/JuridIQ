import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { token, email } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    // 1. Validar el token en la base de datos
    let query = supabase
      .from('cliente_accesos')
      .select('*')
      .eq('token_acceso', token)
      .eq('activo', true);

    if (email) {
      query = query.eq('email', email.trim().toLowerCase());
    }

    const { data: acceso, error: accesoError } = await query.single();

    if (accesoError || !acceso) {
      return NextResponse.json({ error: 'Acceso inválido o denegado' }, { status: 401 });
    }

    // 2. Verificar expiración
    if (acceso.fecha_expiracion && new Date(acceso.fecha_expiracion) < new Date()) {
      return NextResponse.json({ error: 'Enlace expirado' }, { status: 401 });
    }

    // 3. Cargar datos del cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('cliente_id, nombre_completo, email, telefono, numero_identificacion')
      .eq('cliente_id', acceso.cliente_id)
      .single();

    // 4. Cargar expedientes del cliente
    const { data: expedientes } = await supabase
      .from('expedientes')
      .select('expediente_id, numero_expediente, titulo, tipo_caso, estado, fecha_inicio, descripcion, juzgado')
      .eq('cliente_id', acceso.cliente_id)
      .eq('despacho_id', acceso.despacho_id)
      .order('fecha_inicio', { ascending: false });

    // 5. Cargar próximas citas del cliente
    const { data: citas } = await supabase
      .from('citas')
      .select('cita_id, fecha_hora, tipo_cita, estado, motivo')
      .eq('email_cliente', acceso.email)
      .eq('despacho_id', acceso.despacho_id)
      .gte('fecha_hora', new Date().toISOString())
      .order('fecha_hora', { ascending: true })
      .limit(5);

    // 6. Nombre del despacho
    const { data: despacho } = await supabase
      .from('despachos')
      .select('nombre_despacho')
      .eq('despacho_id', acceso.despacho_id)
      .single();

    return NextResponse.json({
      cliente: cliente || null,
      expedientes: expedientes || [],
      citas: citas || [],
      despachoNombre: despacho?.nombre_despacho || 'Su Despacho',
    });

  } catch (err: any) {
    console.error('Portal API Data error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
