-- ==========================================
-- Módulo de Solicitudes de Registro (Leads)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.solicitudes_registro (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefono TEXT,
  nombre_despacho TEXT NOT NULL,
  plan_interes TEXT NOT NULL DEFAULT 'profesional',
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')),
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notas_admin TEXT
);

-- RLS
ALTER TABLE public.solicitudes_registro ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (ya que es público)
CREATE POLICY "Permitir insertar solicitudes a cualquier usuario anon o autenticado"
  ON public.solicitudes_registro FOR INSERT
  WITH CHECK (true);

-- Solo los superadmins pueden ver y modificar
CREATE POLICY "Superadmins pueden ver solicitudes"
  ON public.solicitudes_registro FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins pueden actualizar solicitudes"
  ON public.solicitudes_registro FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'superadmin'
    )
  );

-- Opcional: Insertar un par de registros mock para visualizar
-- INSERT INTO public.solicitudes_registro (nombre_completo, email, telefono, nombre_despacho, plan_interes)
-- VALUES 
-- ('Juan Pérez', 'juan.perez@bufete.com', '555-1234', 'Bufete Pérez & Asociados', 'institucional'),
-- ('Ana Gómez', 'ana.gomez@lexcorp.com', '555-5678', 'LexCorp Abogados', 'profesional');
