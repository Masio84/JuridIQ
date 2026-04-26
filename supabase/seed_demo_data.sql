-- ============================================================
-- JuridIQ - Seed Data DEMO (Solo para el despacho del SuperAdmin)
-- EJECUTAR DESPUÉS de seed_superadmin.sql
-- ============================================================

-- ============================================================
-- CLIENTES DEMO
-- ============================================================
INSERT INTO clientes (
  cliente_id, despacho_id, nombre_completo, email, telefono,
  tipo_identificacion, numero_identificacion, domicilio,
  notas_generales, abogado_asignado_id, estado
)
SELECT
  'c0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'Juan Pérez Hernández',
  'juan.perez@demo.juridiq.mx',
  '+52 55 1111 2222',
  'RFC', 'PEHJ850101AB1',
  'Calle Hidalgo 45, Col. Centro, CDMX',
  'Cliente de demostración. Caso de impugnación fiscal ante el TFJA.',
  p.id,
  'activo'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO clientes (
  cliente_id, despacho_id, nombre_completo, email, telefono,
  tipo_identificacion, numero_identificacion, domicilio,
  notas_generales, abogado_asignado_id, estado
)
SELECT
  'c0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000001',
  'María del Carmen García Ruiz',
  'maria.garcia@demo.juridiq.mx',
  '+52 55 3333 4444',
  'CURP', 'GARM900215MDFRZ01',
  'Av. Universidad 1500, Del Valle, CDMX',
  'Proceso de divorcio. Requiere guardia y custodia compartida de dos menores.',
  p.id,
  'activo'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO clientes (
  cliente_id, despacho_id, nombre_completo, email, telefono,
  tipo_identificacion, numero_identificacion, domicilio,
  notas_generales, abogado_asignado_id, estado
)
SELECT
  'c0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000001',
  'Empresas Tecnológicas del Norte S.A. de C.V.',
  'legal@etdnorte.demo.juridiq.mx',
  '+52 81 5555 6666',
  'RFC', 'ETN200301KL9',
  'Blvd. Constitución 2020, Monterrey, NL',
  'Cliente corporativo. Contrato de suministro en disputa por $3.2M MXN.',
  p.id,
  'activo'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO clientes (
  cliente_id, despacho_id, nombre_completo, email, telefono,
  tipo_identificacion, numero_identificacion, domicilio,
  notas_generales, abogado_asignado_id, estado
)
SELECT
  'c0000000-0000-0000-0000-000000000004',
  'd0000000-0000-0000-0000-000000000001',
  'Roberto Sánchez Morales',
  'roberto.sanchez@demo.juridiq.mx',
  '+52 55 7777 8888',
  'RFC', 'SAMR770512QR5',
  'Calle Madero 300, Col. Roma, CDMX',
  'Demanda laboral por despido injustificado. 8 años de antigüedad.',
  p.id,
  'activo'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO clientes (
  cliente_id, despacho_id, nombre_completo, email, telefono,
  tipo_identificacion, numero_identificacion, domicilio,
  notas_generales, abogado_asignado_id, estado
)
SELECT
  'c0000000-0000-0000-0000-000000000005',
  'd0000000-0000-0000-0000-000000000001',
  'Laura Martínez Vega',
  'laura.mv@demo.juridiq.mx',
  '+52 55 9999 0000',
  'CURP', 'MAVL880630MDFRG07',
  'Av. Insurgentes Sur 1800, CDMX',
  'Caso archivado. Defensa penal resuelta favorablemente.',
  p.id,
  'archivado'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- EXPEDIENTES DEMO
-- ============================================================

INSERT INTO expedientes (
  expediente_id, cliente_id, despacho_id, abogado_responsable_id,
  tipo_caso, titulo, descripcion_inicial, estado_caso,
  fecha_creacion, monto_demanda, juzgado, numero_expediente, fecha_proxima_audiencia
)
SELECT
  'e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', p.id,
  'fiscal',
  'Impugnación Crédito Fiscal - Pérez Hernández',
  'El cliente fue notificado de un crédito fiscal por parte del SAT por supuestas irregularidades en declaraciones del ejercicio 2022. Se requiere impugnar el crédito ante el TFJA.',
  'en_proceso',
  '2024-06-15T10:00:00Z',
  1500000,
  'Tribunal Federal de Justicia Administrativa — Sala Regional CDMX',
  'TFA/2024/1234',
  (NOW() + INTERVAL '14 days')::TIMESTAMPTZ
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO expedientes (
  expediente_id, cliente_id, despacho_id, abogado_responsable_id,
  tipo_caso, titulo, descripcion_inicial, estado_caso,
  fecha_creacion, juzgado, numero_expediente, fecha_proxima_audiencia
)
SELECT
  'e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', p.id,
  'familiar',
  'Divorcio Incausado — García Ruiz vs García Ruiz',
  'Procedimiento de divorcio incausado. La cliente solicita guardia y custodia de dos menores, así como pensión alimenticia. Se busca acuerdo mediante mediación.',
  'en_proceso',
  '2024-07-25T14:00:00Z',
  'Juzgado 15° de lo Familiar — CDMX',
  'JF15/2024/5678',
  (NOW() + INTERVAL '2 days')::TIMESTAMPTZ
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO expedientes (
  expediente_id, cliente_id, despacho_id, abogado_responsable_id,
  tipo_caso, titulo, descripcion_inicial, estado_caso,
  fecha_creacion, monto_demanda, juzgado, numero_expediente, fecha_proxima_audiencia
)
SELECT
  'e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', p.id,
  'mercantil',
  'Incumplimiento de Contrato — ETN vs Proveedora Nacional',
  'ETN demanda a Proveedora Nacional S.A. por incumplimiento de contrato de suministro tecnológico. El demandado incumplió plazos de entrega causando pérdidas operativas.',
  'apertura',
  '2024-10-01T09:00:00Z',
  3200000,
  'Juzgado 3° de lo Mercantil — Monterrey, NL',
  'JM3/2024/9012',
  (NOW() + INTERVAL '9 days')::TIMESTAMPTZ
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO expedientes (
  expediente_id, cliente_id, despacho_id, abogado_responsable_id,
  tipo_caso, titulo, descripcion_inicial, estado_caso,
  fecha_creacion, monto_demanda, juzgado, numero_expediente, fecha_proxima_audiencia
)
SELECT
  'e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', p.id,
  'laboral',
  'Despido Injustificado — Sánchez Morales',
  'Demanda por despido injustificado. El cliente laboró 8 años en la empresa. Se reclaman: salarios caídos, prima de antigüedad, vacaciones, aguinaldo proporcional y 3 meses de indemnización.',
  'en_proceso',
  '2024-09-05T16:30:00Z',
  450000,
  'Junta Local de Conciliación y Arbitraje — CDMX',
  'JLCA/2024/3456',
  (NOW() + INTERVAL '21 days')::TIMESTAMPTZ
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO expedientes (
  expediente_id, cliente_id, despacho_id, abogado_responsable_id,
  tipo_caso, titulo, descripcion_inicial, estado_caso,
  fecha_creacion, fecha_cierre, juzgado, numero_expediente
)
SELECT
  'e0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', p.id,
  'penal',
  'Defensa Penal — Martínez Vega (Archivado)',
  'La cliente fue acusada de fraude genérico. Se logró demostrar su inocencia durante la etapa de investigación. El ministerio público determinó no ejercer acción penal.',
  'archivado',
  '2024-03-20T10:00:00Z',
  '2024-08-15T10:00:00Z',
  'Juzgado de Control — CDMX',
  'JC/2024/7890'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- TAREAS DEMO (para expedientes activos)
-- ============================================================

INSERT INTO expediente_tareas (
  tarea_id, expediente_id, titulo, descripcion,
  fecha_limite, responsable_id, estado, prioridad, orden
)
SELECT
  '20000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001',
  'Presentar recurso de revocación ante SAT',
  'Elaborar y presentar recurso de revocación contra el crédito fiscal. Incluir todos los documentos contables del ejercicio 2022.',
  (NOW() + INTERVAL '5 days')::TIMESTAMPTZ,
  p.id, 'en_progreso', 'urgente', 1
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO expediente_tareas (
  tarea_id, expediente_id, titulo, descripcion,
  fecha_limite, fecha_completada, responsable_id, estado, prioridad, orden
)
SELECT
  '20000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001',
  'Recopilar estados de cuenta bancarios 2022',
  'Solicitar al cliente todos los estados de cuenta del periodo fiscal en cuestión.',
  (NOW() - INTERVAL '8 days')::TIMESTAMPTZ,
  (NOW() - INTERVAL '10 days')::TIMESTAMPTZ,
  p.id, 'completada', 'alta', 2
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO expediente_tareas (
  tarea_id, expediente_id, titulo,
  fecha_limite, responsable_id, estado, prioridad, orden
)
SELECT
  '20000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002',
  'Preparar alegatos para audiencia de custodia',
  (NOW() + INTERVAL '1 day')::TIMESTAMPTZ,
  p.id, 'pendiente', 'alta', 1
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO expediente_tareas (
  tarea_id, expediente_id, titulo, descripcion,
  fecha_limite, responsable_id, estado, prioridad, orden
)
SELECT
  '20000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000003',
  'Redactar demanda mercantil',
  'Elaborar escrito inicial de demanda incluyendo todas las pruebas documentales del contrato incumplido.',
  (NOW() + INTERVAL '7 days')::TIMESTAMPTZ,
  p.id, 'en_progreso', 'alta', 1
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO expediente_tareas (
  tarea_id, expediente_id, titulo, descripcion,
  fecha_limite, responsable_id, estado, prioridad, orden
)
SELECT
  '20000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000004',
  'Calcular liquidación laboral',
  'Realizar cálculo detallado de prestaciones adeudadas conforme a la LFT.',
  (NOW() + INTERVAL '3 days')::TIMESTAMPTZ,
  p.id, 'pendiente', 'media', 1
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- CITAS DEMO
-- ============================================================

INSERT INTO citas (
  cita_id, despacho_id, abogado_id, cliente_id,
  fecha_hora, duracion_minutos, titulo_asunto,
  descripcion_cliente, confirmada, tipo_cita
)
SELECT
  'a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', p.id, 'c0000000-0000-0000-0000-000000000001',
  (CURRENT_DATE + TIME '10:00:00')::TIMESTAMPTZ,
  60,
  'Revisión de recurso fiscal y documentación pendiente',
  'Revisar avance del recurso de revocación y la documentación faltante.',
  true, 'presencial'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO citas (
  cita_id, despacho_id, abogado_id, cliente_id,
  fecha_hora, duracion_minutos, titulo_asunto,
  descripcion_cliente, confirmada, tipo_cita, enlace_zoom
)
SELECT
  'a0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', p.id, 'c0000000-0000-0000-0000-000000000002',
  (CURRENT_DATE + TIME '14:30:00')::TIMESTAMPTZ,
  45,
  'Actualización estado del divorcio y preparación de audiencia',
  'Informar a la cliente sobre la próxima audiencia y preparar los documentos necesarios.',
  true, 'virtual', 'https://zoom.us/j/demo1234567'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO citas (
  cita_id, despacho_id, abogado_id, cliente_id,
  fecha_hora, duracion_minutos, titulo_asunto,
  descripcion_cliente, confirmada, tipo_cita
)
SELECT
  'a0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', p.id, 'c0000000-0000-0000-0000-000000000003',
  (CURRENT_DATE + TIME '11:00:00' + INTERVAL '1 day')::TIMESTAMPTZ,
  90,
  'Firma de demanda mercantil — ETN vs Proveedora Nacional',
  'Revisión final y firma del escrito de demanda. El cliente debe traer poder notarial.',
  false, 'presencial'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO citas (
  cita_id, despacho_id, abogado_id, cliente_id,
  fecha_hora, duracion_minutos, titulo_asunto,
  descripcion_cliente, confirmada, tipo_cita
)
SELECT
  'a0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', p.id, 'c0000000-0000-0000-0000-000000000004',
  (CURRENT_DATE + TIME '16:00:00' + INTERVAL '2 days')::TIMESTAMPTZ,
  60,
  'Preparación para audiencia laboral',
  'Preparar al cliente para la audiencia en la Junta de Conciliación. Repaso de hechos y declaraciones.',
  true, 'telefonica'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

-- Cita de prospecto externo (sin cliente registrado)
INSERT INTO citas (
  cita_id, despacho_id, abogado_id,
  fecha_hora, duracion_minutos, titulo_asunto,
  confirmada, tipo_cita,
  nombre_publico, email_publico, telefono_publico
)
SELECT
  'a0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', p.id,
  (CURRENT_DATE + TIME '09:00:00' + INTERVAL '3 days')::TIMESTAMPTZ,
  30,
  'Consulta inicial — Nuevo prospecto',
  false, 'presencial',
  'Fernando Castillo Rivera',
  'fernando.castillo@email.com',
  '+52 55 2345 6789'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- CONSULTAS IA DEMO
-- ============================================================

INSERT INTO consultas_ia (
  consulta_id, despacho_id, abogado_id,
  pregunta_original, respuesta_claude,
  tokens_utilizados, tipo_consulta, fecha_consulta, compartida_con_cliente, expediente_id
)
SELECT
  '30000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', p.id,
  '¿Cuál es el plazo de prescripción para delitos fiscales en México?',
  '## Prescripción de Delitos Fiscales en México

De acuerdo con el **Código Fiscal de la Federación (CFF)**, los plazos de prescripción varían:

### Plazo General
- **5 años** para la mayoría de delitos fiscales (Art. 100 CFF)

### Plazo Especial por Monto
- **8 años** cuando el monto defraudado excede de $7,804,230 MXN (actualizado anualmente)
- **Sin prescripción** para delitos de defraudación fiscal calificada cuando se usen documentos falsos

### Base Legal Aplicable
- Artículo 100 del Código Fiscal de la Federación
- Artículo 108 del CFF (defraudación fiscal y sus modalidades)
- Tesis Aislada 2a./J. 12/2020 — SCJN

> **Nota Importante**: El plazo comienza a contar desde la comisión del delito o desde que la autoridad tributaria tuvo conocimiento fehaciente del mismo.',
  1250,
  'ley',
  NOW() - INTERVAL '11 days',
  false,
  'e0000000-0000-0000-0000-000000000001'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO consultas_ia (
  consulta_id, despacho_id, abogado_id,
  pregunta_original, respuesta_claude,
  tokens_utilizados, tipo_consulta, fecha_consulta, compartida_con_cliente, expediente_id
)
SELECT
  '30000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', p.id,
  '¿Qué criterios utiliza el juez para determinar la guardia y custodia de menores?',
  '## Criterios para Guardia y Custodia de Menores

Los tribunales mexicanos aplican el **interés superior del menor** como principio rector absoluto (Art. 4° Constitucional y Convención sobre los Derechos del Niño):

### Criterios Principales Evaluados
1. **Vínculo afectivo** demostrable con cada progenitor
2. **Estabilidad emocional y psicológica** del menor
3. **Capacidad económica** real de ambos padres para proveer alimentos y educación
4. **Entorno social y escolar** del menor (no cambiar de escuela sin causa grave)
5. **Opinión del menor** — obligatoria si tiene 12 años o más (Art. 417 Bis CC)
6. **Historial de violencia** familiar o doméstica
7. **Disponibilidad de tiempo** de cada progenitor

### Marco Legal de Referencia
- Art. 4° Constitucional — Interés superior de la infancia
- Arts. 416, 417 y 417 Bis del Código Civil Federal
- Convención sobre los Derechos del Niño (ONU)
- Tesis: 1a./J. 23/2014 (10a.) — SCJN',
  980,
  'jurisprudencia',
  NOW() - INTERVAL '12 days',
  true,
  'e0000000-0000-0000-0000-000000000002'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- NOTIFICACIONES DEMO
-- ============================================================

INSERT INTO notificaciones (
  notificacion_id, despacho_id, usuario_id,
  tipo, titulo, mensaje, leida, canal, enviada, fecha_envio
)
SELECT
  '20000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', p.id,
  'cita_recordatorio',
  'Cita en 1 hora — Juan Pérez Hernández',
  'Tienes una cita con Juan Pérez Hernández a las 10:00 AM. Tema: Revisión de recurso fiscal.',
  false, 'web', true, NOW() - INTERVAL '50 minutes'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO notificaciones (
  notificacion_id, despacho_id, usuario_id,
  tipo, titulo, mensaje, leida, canal, enviada, fecha_envio
)
SELECT
  '20000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', p.id,
  'expediente_audiencia',
  'Audiencia en 2 días — Divorcio García Ruiz',
  'El expediente "Divorcio Incausado García Ruiz vs García Ruiz" tiene audiencia mañana. Verifica que los alegatos estén listos.',
  false, 'web', true, NOW() - INTERVAL '2 hours'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO notificaciones (
  notificacion_id, despacho_id, usuario_id,
  tipo, titulo, mensaje, leida, canal, enviada, fecha_envio
)
SELECT
  '20000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', p.id,
  'tarea_vencida',
  'Tarea próxima a vencer — Recurso SAT',
  'La tarea "Presentar recurso de revocación ante SAT" vence en 5 días. Estado actual: En progreso.',
  true, 'web', true, NOW() - INTERVAL '1 day'
FROM profiles p WHERE p.email = 'masio.tds@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT 'Clientes DEMO:' as info, COUNT(*) FROM clientes WHERE despacho_id = 'd0000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Expedientes DEMO:', COUNT(*) FROM expedientes WHERE despacho_id = 'd0000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Citas DEMO:', COUNT(*) FROM citas WHERE despacho_id = 'd0000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Tareas DEMO:', COUNT(*) FROM expediente_tareas
  WHERE expediente_id::text LIKE 'e0000000-%'
UNION ALL
SELECT 'Consultas IA DEMO:', COUNT(*) FROM consultas_ia WHERE despacho_id = 'd0000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 'Notificaciones DEMO:', COUNT(*) FROM notificaciones WHERE despacho_id = 'd0000000-0000-0000-0000-000000000001';
