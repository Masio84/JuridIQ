-- ==========================================
-- Actualización del Módulo de Notificaciones
-- ==========================================

-- Agregar campos de ruta y prioridad a la tabla de notificaciones
ALTER TABLE public.notificaciones
ADD COLUMN IF NOT EXISTS ruta_destino TEXT,
ADD COLUMN IF NOT EXISTS prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('alta', 'media', 'baja'));

-- Para asegurar que los datos existentes funcionen bien, setearemos un valor por defecto seguro
UPDATE public.notificaciones SET prioridad = 'media' WHERE prioridad IS NULL;
