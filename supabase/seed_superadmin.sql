-- ============================================================
-- JuridIQ - Seed SuperAdmin + Despacho DEMO
-- EJECUTAR DESPUÉS de que masio.tds@gmail.com se registre
-- en la app via /signup (para que exista en auth.users)
-- ============================================================

-- UUID fijo para el despacho DEMO (válido para PostgreSQL)
-- Usamos este mismo UUID en seed_demo_data.sql
-- d0000000-0000-0000-0000-000000000001

-- PASO 1: Elevar a SuperAdmin
UPDATE profiles
SET role = 'superadmin'
WHERE email = 'masio.tds@gmail.com';

-- PASO 2: Crear el Despacho DEMO
INSERT INTO despachos (
  despacho_id,
  nombre_despacho,
  email_principal,
  telefono,
  direccion,
  ciudad,
  plan,
  activo
) VALUES (
  'd0000000-0000-0000-0000-000000000001',
  'JuridIQ — Despacho Demostración',
  'masio.tds@gmail.com',
  '+52 55 0000 0001',
  'Av. Paseo de la Reforma 505, Piso 12, Col. Cuauhtémoc',
  'Ciudad de México',
  'enterprise',
  true
) ON CONFLICT (despacho_id) DO NOTHING;

-- PASO 3: Vincular SuperAdmin al Despacho DEMO
UPDATE profiles
SET
  despacho_id = 'd0000000-0000-0000-0000-000000000001',
  nombre_completo = COALESCE(NULLIF(nombre_completo, ''), 'Jorge Cuellar'),
  especialidad = 'corporativo'
WHERE email = 'masio.tds@gmail.com';

-- Verificar que quedó bien:
SELECT id, email, nombre_completo, role, despacho_id, especialidad
FROM profiles
WHERE email = 'masio.tds@gmail.com';
