-- ============================================
-- JuridIQ - Database Schema
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Despachos (Multi-tenant base)
CREATE TABLE despachos (
  despacho_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_despacho TEXT NOT NULL,
  email_principal TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  ciudad TEXT,
  plan TEXT DEFAULT 'basico' CHECK (plan IN ('basico', 'profesional', 'enterprise')),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  activo BOOLEAN DEFAULT TRUE,
  logo_url TEXT
);

-- 2. Profiles (Extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nombre_completo TEXT NOT NULL,
  role TEXT DEFAULT 'abogado' CHECK (role IN ('abogado', 'admin_despacho', 'practicante')),
  especialidad TEXT CHECK (especialidad IN ('penal', 'civil', 'mercantil', 'laboral', 'familiar', 'fiscal', 'administrativo', 'corporativo')),
  despacho_id UUID REFERENCES despachos(despacho_id) ON DELETE SET NULL,
  avatar_url TEXT,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clientes
CREATE TABLE clientes (
  cliente_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  despacho_id UUID REFERENCES despachos(despacho_id) ON DELETE CASCADE NOT NULL,
  nombre_completo TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  tipo_identificacion TEXT,
  numero_identificacion TEXT,
  domicilio TEXT,
  notas_generales TEXT,
  abogado_asignado_id UUID REFERENCES profiles(id),
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'archivado')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Expedientes
CREATE TABLE expedientes (
  expediente_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(cliente_id) ON DELETE CASCADE NOT NULL,
  despacho_id UUID REFERENCES despachos(despacho_id) ON DELETE CASCADE NOT NULL,
  abogado_responsable_id UUID REFERENCES profiles(id),
  tipo_caso TEXT CHECK (tipo_caso IN ('penal', 'civil', 'laboral', 'mercantil', 'familiar', 'fiscal', 'administrativo', 'amparo', 'otro')),
  titulo TEXT NOT NULL,
  descripcion_inicial TEXT,
  estado_caso TEXT DEFAULT 'apertura' CHECK (estado_caso IN ('apertura', 'en_proceso', 'sentenciado', 'archivado')),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_cierre TIMESTAMPTZ,
  monto_demanda NUMERIC(15,2),
  juzgado TEXT,
  numero_expediente TEXT,
  fecha_proxima_audiencia TIMESTAMPTZ,
  json_metadatos JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Expediente Documentos
CREATE TABLE expediente_documentos (
  doc_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expediente_id UUID REFERENCES expedientes(expediente_id) ON DELETE CASCADE NOT NULL,
  nombre_archivo TEXT NOT NULL,
  tipo_documento TEXT CHECK (tipo_documento IN ('demanda', 'sentencia', 'contrato', 'escritura', 'acta', 'recurso', 'prueba', 'otro')),
  fecha_subida TIMESTAMPTZ DEFAULT NOW(),
  ruta_storage TEXT NOT NULL,
  subido_por_id UUID REFERENCES profiles(id),
  tamano_bytes BIGINT
);

-- 6. Expediente Tareas (Cronograma)
CREATE TABLE expediente_tareas (
  tarea_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expediente_id UUID REFERENCES expedientes(expediente_id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_limite TIMESTAMPTZ NOT NULL,
  fecha_completada TIMESTAMPTZ,
  responsable_id UUID REFERENCES profiles(id),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'vencida')),
  prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Citas
CREATE TABLE citas (
  cita_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  despacho_id UUID REFERENCES despachos(despacho_id) ON DELETE CASCADE NOT NULL,
  abogado_id UUID REFERENCES profiles(id),
  cliente_id UUID REFERENCES clientes(cliente_id),
  fecha_hora TIMESTAMPTZ NOT NULL,
  duracion_minutos INTEGER DEFAULT 60,
  titulo_asunto TEXT NOT NULL,
  descripcion_cliente TEXT,
  confirmada BOOLEAN DEFAULT FALSE,
  enviado_recordatorio BOOLEAN DEFAULT FALSE,
  tipo_cita TEXT DEFAULT 'presencial' CHECK (tipo_cita IN ('presencial', 'virtual', 'telefonica')),
  enlace_zoom TEXT,
  nombre_publico TEXT,
  email_publico TEXT,
  telefono_publico TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Historial de Citas
CREATE TABLE historial_citas (
  registro_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cita_id UUID REFERENCES citas(cita_id) ON DELETE CASCADE NOT NULL,
  notas_post_cita TEXT,
  accionables_siguientes TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Consultas IA
CREATE TABLE consultas_ia (
  consulta_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  despacho_id UUID REFERENCES despachos(despacho_id) ON DELETE CASCADE NOT NULL,
  abogado_id UUID REFERENCES profiles(id),
  pregunta_original TEXT NOT NULL,
  respuesta_claude TEXT,
  tokens_utilizados INTEGER DEFAULT 0,
  tipo_consulta TEXT CHECK (tipo_consulta IN ('ley', 'jurisprudencia', 'redaccion', 'estrategia', 'general')),
  documentos_referenciados JSONB DEFAULT '[]',
  fecha_consulta TIMESTAMPTZ DEFAULT NOW(),
  compartida_con_cliente BOOLEAN DEFAULT FALSE,
  expediente_id UUID REFERENCES expedientes(expediente_id)
);

-- 10. Base de Conocimiento
CREATE TABLE base_conocimiento (
  doc_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  despacho_id UUID REFERENCES despachos(despacho_id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT,
  contenido_texto TEXT,
  fecha_publicacion DATE,
  fuente TEXT,
  tags TEXT[] DEFAULT '{}',
  subido_por_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_base_conocimiento_fts ON base_conocimiento USING GIN (to_tsvector('spanish', contenido_texto));

-- 11. Notificaciones
CREATE TABLE notificaciones (
  notificacion_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  despacho_id UUID REFERENCES despachos(despacho_id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES profiles(id),
  tipo TEXT CHECK (tipo IN ('cita_recordatorio', 'tarea_vencida', 'expediente_audiencia', 'general')),
  titulo TEXT NOT NULL,
  mensaje TEXT,
  leida BOOLEAN DEFAULT FALSE,
  canal TEXT DEFAULT 'web' CHECK (canal IN ('web', 'whatsapp', 'email')),
  enviada BOOLEAN DEFAULT FALSE,
  fecha_envio TIMESTAMPTZ,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_profiles_despacho ON profiles(despacho_id);
CREATE INDEX idx_clientes_despacho ON clientes(despacho_id);
CREATE INDEX idx_clientes_abogado ON clientes(abogado_asignado_id);
CREATE INDEX idx_expedientes_despacho ON expedientes(despacho_id);
CREATE INDEX idx_expedientes_cliente ON expedientes(cliente_id);
CREATE INDEX idx_expedientes_abogado ON expedientes(abogado_responsable_id);
CREATE INDEX idx_tareas_expediente ON expediente_tareas(expediente_id);
CREATE INDEX idx_citas_despacho ON citas(despacho_id);
CREATE INDEX idx_citas_abogado ON citas(abogado_id);
CREATE INDEX idx_citas_fecha ON citas(fecha_hora);
CREATE INDEX idx_consultas_despacho ON consultas_ia(despacho_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(usuario_id, leida);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE despachos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expediente_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE expediente_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE base_conocimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's despacho_id
CREATE OR REPLACE FUNCTION get_user_despacho_id()
RETURNS UUID AS $$
  SELECT despacho_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Profiles: Users can read members of their own despacho
CREATE POLICY "profiles_select_own_despacho" ON profiles
  FOR SELECT USING (despacho_id = get_user_despacho_id());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Clientes: Users see clients from their despacho
CREATE POLICY "clientes_select_despacho" ON clientes
  FOR SELECT USING (despacho_id = get_user_despacho_id());

CREATE POLICY "clientes_insert_despacho" ON clientes
  FOR INSERT WITH CHECK (despacho_id = get_user_despacho_id());

CREATE POLICY "clientes_update_despacho" ON clientes
  FOR UPDATE USING (despacho_id = get_user_despacho_id());

-- Expedientes: Users see cases from their despacho
CREATE POLICY "expedientes_select_despacho" ON expedientes
  FOR SELECT USING (despacho_id = get_user_despacho_id());

CREATE POLICY "expedientes_insert_despacho" ON expedientes
  FOR INSERT WITH CHECK (despacho_id = get_user_despacho_id());

CREATE POLICY "expedientes_update_despacho" ON expedientes
  FOR UPDATE USING (despacho_id = get_user_despacho_id());

-- Expediente Documentos
CREATE POLICY "docs_select_via_expediente" ON expediente_documentos
  FOR SELECT USING (
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

CREATE POLICY "docs_insert_via_expediente" ON expediente_documentos
  FOR INSERT WITH CHECK (
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

-- Tareas
CREATE POLICY "tareas_select_via_expediente" ON expediente_tareas
  FOR SELECT USING (
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

CREATE POLICY "tareas_insert_via_expediente" ON expediente_tareas
  FOR INSERT WITH CHECK (
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

CREATE POLICY "tareas_update_via_expediente" ON expediente_tareas
  FOR UPDATE USING (
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

-- Citas
CREATE POLICY "citas_select_despacho" ON citas
  FOR SELECT USING (despacho_id = get_user_despacho_id());

CREATE POLICY "citas_insert_despacho" ON citas
  FOR INSERT WITH CHECK (despacho_id = get_user_despacho_id());

-- Citas insert for public (anonymous)
CREATE POLICY "citas_insert_public" ON citas
  FOR INSERT WITH CHECK (TRUE);

-- Consultas IA
CREATE POLICY "consultas_select_despacho" ON consultas_ia
  FOR SELECT USING (despacho_id = get_user_despacho_id());

CREATE POLICY "consultas_insert_despacho" ON consultas_ia
  FOR INSERT WITH CHECK (despacho_id = get_user_despacho_id());

-- Base Conocimiento
CREATE POLICY "base_select_despacho" ON base_conocimiento
  FOR SELECT USING (despacho_id = get_user_despacho_id());

CREATE POLICY "base_insert_despacho" ON base_conocimiento
  FOR INSERT WITH CHECK (despacho_id = get_user_despacho_id());

-- Notificaciones
CREATE POLICY "notif_select_own" ON notificaciones
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "notif_update_own" ON notificaciones
  FOR UPDATE USING (usuario_id = auth.uid());

-- ============================================
-- Triggers
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, nombre_completo, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'abogado')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clientes_timestamp
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_expedientes_timestamp
  BEFORE UPDATE ON expedientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tareas_timestamp
  BEFORE UPDATE ON expediente_tareas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Storage Bucket
-- ============================================
-- Run separately in Supabase Dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('expedientes', 'expedientes', false);
