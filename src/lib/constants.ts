// ============================================
// JuridIQ - App Constants
// ============================================

export const APP_NAME = 'JuridIQ';
export const APP_DESCRIPTION = 'Plataforma inteligente para despachos jurídicos';

export const ESTADO_CASO_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  apertura: { label: 'Apertura', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  en_proceso: { label: 'En Proceso', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  sentenciado: { label: 'Sentenciado', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  archivado: { label: 'Archivado', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
};

export const TIPO_CASO_LABELS: Record<string, { label: string; icon: string }> = {
  penal: { label: 'Penal', icon: '⚖️' },
  civil: { label: 'Civil', icon: '📋' },
  laboral: { label: 'Laboral', icon: '👷' },
  mercantil: { label: 'Mercantil', icon: '🏢' },
  familiar: { label: 'Familiar', icon: '👨‍👩‍👧' },
  fiscal: { label: 'Fiscal', icon: '💰' },
  administrativo: { label: 'Administrativo', icon: '🏛️' },
  amparo: { label: 'Amparo', icon: '🛡️' },
  otro: { label: 'Otro', icon: '📄' },
};

export const PRIORIDAD_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  baja: { label: 'Baja', color: 'text-slate-600', bg: 'bg-slate-100' },
  media: { label: 'Media', color: 'text-blue-600', bg: 'bg-blue-100' },
  alta: { label: 'Alta', color: 'text-amber-600', bg: 'bg-amber-100' },
  urgente: { label: 'Urgente', color: 'text-red-600', bg: 'bg-red-100' },
};

export const ESTADO_TAREA_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-slate-600', bg: 'bg-slate-100' },
  en_progreso: { label: 'En Progreso', color: 'text-blue-600', bg: 'bg-blue-100' },
  completada: { label: 'Completada', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  vencida: { label: 'Vencida', color: 'text-red-600', bg: 'bg-red-100' },
};

export const ESTADO_CLIENTE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  activo: { label: 'Activo', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  inactivo: { label: 'Inactivo', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
  archivado: { label: 'Archivado', color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200' },
};

export const TIPO_CITA_LABELS: Record<string, { label: string; color: string }> = {
  presencial: { label: 'Presencial', color: 'text-emerald-600' },
  virtual: { label: 'Virtual', color: 'text-blue-600' },
  telefonica: { label: 'Telefónica', color: 'text-purple-600' },
};

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/dashboard/clientes', label: 'Clientes', icon: 'Users' },
  { href: '/dashboard/expedientes', label: 'Expedientes', icon: 'FolderOpen' },
  { href: '/dashboard/citas', label: 'Citas', icon: 'CalendarDays' },
  { href: '/dashboard/consultas-ia', label: 'Consultar IA', icon: 'BrainCircuit' },
  { href: '/dashboard/base-conocimiento', label: 'Base Legal', icon: 'BookOpen' },
] as const;

// Use mock mode when Supabase is not configured
export const USE_MOCK_DATA = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';
