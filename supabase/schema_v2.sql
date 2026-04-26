-- ============================================================
-- JuridIQ - Schema V2 (Producción Real)
-- Ejecutar en Supabase SQL Editor en el SIGUIENTE ORDEN:
-- 1. schema_v2.sql  (este archivo)
-- 2. seed_superadmin.sql
-- 3. seed_demo_data.sql
-- ============================================================

-- ============================================================
-- PARTE 1: Ampliar tabla profiles con SuperAdmin
-- ============================================================

-- Primero eliminar el constraint viejo de roles
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Agregar constraint nuevo con superadmin
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('superadmin', 'admin_despacho', 'abogado', 'practicante'));

-- ============================================================
-- PARTE 2: Tabla de Auditoría
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  despacho_id   UUID REFERENCES despachos(despacho_id) ON DELETE SET NULL,
  accion        TEXT NOT NULL,   -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED'
  tabla_afectada TEXT,
  registro_id   TEXT,
  ip_address    TEXT,
  user_agent    TEXT,
  datos_anteriores JSONB,
  datos_nuevos     JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_usuario   ON audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_despacho  ON audit_logs(despacho_id);
CREATE INDEX IF NOT EXISTS idx_audit_created   ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo SuperAdmin puede leer los logs
CREATE POLICY "audit_superadmin_only" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- El sistema puede insertar logs (via service_role)
CREATE POLICY "audit_insert_system" ON audit_logs
  FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- PARTE 3: Rate Limiting - Intentos de Login
-- ============================================================

CREATE TABLE IF NOT EXISTS login_attempts (
  attempt_id  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT NOT NULL,
  ip_address  TEXT,
  exitoso     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email  ON login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip     ON login_attempts(ip_address, created_at DESC);

-- No necesita RLS — se accede solo via service_role
ALTER TABLE login_attempts DISABLE ROW LEVEL SECURITY;

-- Función para limpiar intentos viejos automáticamente
CREATE OR REPLACE FUNCTION clean_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PARTE 4: Actualizar RLS para SuperAdmin
-- ============================================================

-- Helper function para verificar si el usuario es superadmin
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ---- Despachos ----
DROP POLICY IF EXISTS "despachos_select_own" ON despachos;

CREATE POLICY "despachos_select_superadmin" ON despachos
  FOR SELECT USING (is_superadmin());

CREATE POLICY "despachos_select_own_member" ON despachos
  FOR SELECT USING (despacho_id = get_user_despacho_id());

CREATE POLICY "despachos_insert_superadmin" ON despachos
  FOR INSERT WITH CHECK (is_superadmin());

CREATE POLICY "despachos_update_superadmin" ON despachos
  FOR UPDATE USING (is_superadmin());

-- ---- Profiles ----
-- SuperAdmin puede ver todos los perfiles
DROP POLICY IF EXISTS "profiles_select_own_despacho" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_select_superadmin" ON profiles
  FOR SELECT USING (is_superadmin());

CREATE POLICY "profiles_select_own_despacho" ON profiles
  FOR SELECT USING (despacho_id = get_user_despacho_id());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_update_superadmin" ON profiles
  FOR UPDATE USING (is_superadmin());

-- ---- Clientes ----
DROP POLICY IF EXISTS "clientes_select_despacho" ON clientes;
DROP POLICY IF EXISTS "clientes_insert_despacho" ON clientes;
DROP POLICY IF EXISTS "clientes_update_despacho" ON clientes;

CREATE POLICY "clientes_select" ON clientes
  FOR SELECT USING (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "clientes_insert" ON clientes
  FOR INSERT WITH CHECK (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "clientes_update" ON clientes
  FOR UPDATE USING (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "clientes_delete" ON clientes
  FOR DELETE USING (is_superadmin() OR despacho_id = get_user_despacho_id());

-- ---- Expedientes ----
DROP POLICY IF EXISTS "expedientes_select_despacho" ON expedientes;
DROP POLICY IF EXISTS "expedientes_insert_despacho" ON expedientes;
DROP POLICY IF EXISTS "expedientes_update_despacho" ON expedientes;

CREATE POLICY "expedientes_select" ON expedientes
  FOR SELECT USING (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "expedientes_insert" ON expedientes
  FOR INSERT WITH CHECK (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "expedientes_update" ON expedientes
  FOR UPDATE USING (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "expedientes_delete" ON expedientes
  FOR DELETE USING (is_superadmin() OR despacho_id = get_user_despacho_id());

-- ---- Expediente Documentos ----
DROP POLICY IF EXISTS "docs_select_via_expediente" ON expediente_documentos;
DROP POLICY IF EXISTS "docs_insert_via_expediente" ON expediente_documentos;

CREATE POLICY "docs_select" ON expediente_documentos
  FOR SELECT USING (
    is_superadmin() OR
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

CREATE POLICY "docs_insert" ON expediente_documentos
  FOR INSERT WITH CHECK (
    is_superadmin() OR
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

CREATE POLICY "docs_delete" ON expediente_documentos
  FOR DELETE USING (
    is_superadmin() OR
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

-- ---- Tareas ----
DROP POLICY IF EXISTS "tareas_select_via_expediente" ON expediente_tareas;
DROP POLICY IF EXISTS "tareas_insert_via_expediente" ON expediente_tareas;
DROP POLICY IF EXISTS "tareas_update_via_expediente" ON expediente_tareas;

CREATE POLICY "tareas_select" ON expediente_tareas
  FOR SELECT USING (
    is_superadmin() OR
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

CREATE POLICY "tareas_insert" ON expediente_tareas
  FOR INSERT WITH CHECK (
    is_superadmin() OR
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

CREATE POLICY "tareas_update" ON expediente_tareas
  FOR UPDATE USING (
    is_superadmin() OR
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

CREATE POLICY "tareas_delete" ON expediente_tareas
  FOR DELETE USING (
    is_superadmin() OR
    expediente_id IN (SELECT expediente_id FROM expedientes WHERE despacho_id = get_user_despacho_id())
  );

-- ---- Citas ----
DROP POLICY IF EXISTS "citas_select_despacho" ON citas;
DROP POLICY IF EXISTS "citas_insert_despacho" ON citas;
DROP POLICY IF EXISTS "citas_insert_public" ON citas;

CREATE POLICY "citas_select" ON citas
  FOR SELECT USING (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "citas_insert_auth" ON citas
  FOR INSERT WITH CHECK (is_superadmin() OR despacho_id = get_user_despacho_id());

-- Permite autoagendamiento público (anon)
CREATE POLICY "citas_insert_public_anon" ON citas
  FOR INSERT WITH CHECK (auth.uid() IS NULL);

CREATE POLICY "citas_update" ON citas
  FOR UPDATE USING (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "citas_delete" ON citas
  FOR DELETE USING (is_superadmin() OR despacho_id = get_user_despacho_id());

-- ---- Historial Citas ----
CREATE POLICY "historial_select" ON historial_citas
  FOR SELECT USING (
    is_superadmin() OR
    cita_id IN (SELECT cita_id FROM citas WHERE despacho_id = get_user_despacho_id())
  );

CREATE POLICY "historial_insert" ON historial_citas
  FOR INSERT WITH CHECK (
    is_superadmin() OR
    cita_id IN (SELECT cita_id FROM citas WHERE despacho_id = get_user_despacho_id())
  );

-- ---- Consultas IA ----
DROP POLICY IF EXISTS "consultas_select_despacho" ON consultas_ia;
DROP POLICY IF EXISTS "consultas_insert_despacho" ON consultas_ia;

CREATE POLICY "consultas_select" ON consultas_ia
  FOR SELECT USING (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "consultas_insert" ON consultas_ia
  FOR INSERT WITH CHECK (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "consultas_delete" ON consultas_ia
  FOR DELETE USING (is_superadmin() OR despacho_id = get_user_despacho_id());

-- ---- Base Conocimiento ----
DROP POLICY IF EXISTS "base_select_despacho" ON base_conocimiento;
DROP POLICY IF EXISTS "base_insert_despacho" ON base_conocimiento;

CREATE POLICY "base_select" ON base_conocimiento
  FOR SELECT USING (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "base_insert" ON base_conocimiento
  FOR INSERT WITH CHECK (is_superadmin() OR despacho_id = get_user_despacho_id());

CREATE POLICY "base_delete" ON base_conocimiento
  FOR DELETE USING (is_superadmin() OR despacho_id = get_user_despacho_id());

-- ---- Notificaciones ----
DROP POLICY IF EXISTS "notif_select_own" ON notificaciones;
DROP POLICY IF EXISTS "notif_update_own" ON notificaciones;

CREATE POLICY "notif_select" ON notificaciones
  FOR SELECT USING (is_superadmin() OR usuario_id = auth.uid());

CREATE POLICY "notif_update" ON notificaciones
  FOR UPDATE USING (is_superadmin() OR usuario_id = auth.uid());

CREATE POLICY "notif_insert" ON notificaciones
  FOR INSERT WITH CHECK (TRUE); -- Sistema puede insertar notifs

-- ============================================================
-- PARTE 5: Trigger de Auditoría Automática
-- ============================================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_despacho_id UUID;
BEGIN
  -- Obtener usuario actual de forma segura
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  -- Obtener despacho_id del registro
  IF TG_OP = 'DELETE' THEN
    BEGIN v_despacho_id := OLD.despacho_id; EXCEPTION WHEN OTHERS THEN v_despacho_id := NULL; END;
  ELSE
    BEGIN v_despacho_id := NEW.despacho_id; EXCEPTION WHEN OTHERS THEN v_despacho_id := NULL; END;
  END IF;

  INSERT INTO audit_logs (usuario_id, despacho_id, accion, tabla_afectada, registro_id, datos_anteriores, datos_nuevos)
  VALUES (
    v_user_id,
    v_despacho_id,
    TG_OP,
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD::text
      ELSE NEW::text
    END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger de auditoría a tablas críticas
CREATE OR REPLACE TRIGGER audit_clientes
  AFTER INSERT OR UPDATE OR DELETE ON clientes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE OR REPLACE TRIGGER audit_expedientes
  AFTER INSERT OR UPDATE OR DELETE ON expedientes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE OR REPLACE TRIGGER audit_citas
  AFTER INSERT OR UPDATE OR DELETE ON citas
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================
-- PARTE 6: Storage Bucket para documentos
-- ============================================================

-- Ejecutar en Supabase Dashboard > Storage si no existe aún:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'expedientes',
--   'expedientes',
--   false,
--   52428800,  -- 50MB max por archivo
--   ARRAY['application/pdf','image/jpeg','image/png','application/msword',
--         'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
-- ) ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage (ejecutar también en Supabase):
-- CREATE POLICY "storage_select_auth" ON storage.objects FOR SELECT
--   USING (bucket_id = 'expedientes' AND auth.uid() IS NOT NULL);
-- CREATE POLICY "storage_insert_auth" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'expedientes' AND auth.uid() IS NOT NULL);
-- CREATE POLICY "storage_delete_own" ON storage.objects FOR DELETE
--   USING (bucket_id = 'expedientes' AND auth.uid() = owner);
