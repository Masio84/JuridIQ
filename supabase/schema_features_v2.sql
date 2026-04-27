-- =============================================
-- JuridIQ - Schema completo de nuevas features
-- =============================================

-- 1. RLS DELETE para notificaciones
CREATE POLICY IF NOT EXISTS "notif_delete_own" ON notificaciones
  FOR DELETE USING (is_superadmin() OR usuario_id = auth.uid());

-- 2. Tabla de registro de horas facturables
CREATE TABLE IF NOT EXISTS public.registro_horas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expediente_id UUID REFERENCES expedientes(expediente_id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES profiles(id) NOT NULL,
  despacho_id UUID REFERENCES despachos(despacho_id) ON DELETE CASCADE NOT NULL,
  descripcion TEXT NOT NULL,
  duracion_minutos INTEGER NOT NULL DEFAULT 0,
  tarifa_hora NUMERIC(10,2) DEFAULT 0,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT DEFAULT 'general' CHECK (tipo IN ('reunion', 'redaccion', 'audiencia', 'investigacion', 'llamada', 'general')),
  facturado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.registro_horas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "horas_select" ON public.registro_horas
  FOR SELECT USING (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "horas_insert" ON public.registro_horas
  FOR INSERT WITH CHECK (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "horas_update" ON public.registro_horas
  FOR UPDATE USING (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "horas_delete" ON public.registro_horas
  FOR DELETE USING (is_superadmin() OR despacho_id = get_user_despacho_id());

-- 3. Agregar estado_pago a solicitudes_registro
ALTER TABLE public.solicitudes_registro
ADD COLUMN IF NOT EXISTS estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'rechazado')),
ADD COLUMN IF NOT EXISTS plan_asignado TEXT;

-- 4. Portal del cliente: accesos
CREATE TABLE IF NOT EXISTS public.cliente_accesos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(cliente_id) ON DELETE CASCADE NOT NULL,
  despacho_id UUID REFERENCES despachos(despacho_id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  token_acceso TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_expiracion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cliente_accesos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cliente_accesos_despacho" ON public.cliente_accesos
  FOR ALL USING (is_superadmin() OR despacho_id = get_user_despacho_id());

-- 5. Agregar Storage bucket policy (ejecutar en Supabase Dashboard)
-- Bucket: 'expedientes' (ya debería existir)
-- Policies: autenticados pueden subir/leer solo sus archivos

-- 6. Index para performance en registro_horas
CREATE INDEX IF NOT EXISTS idx_registro_horas_expediente ON registro_horas(expediente_id);
CREATE INDEX IF NOT EXISTS idx_registro_horas_usuario ON registro_horas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_registro_horas_despacho ON registro_horas(despacho_id);
