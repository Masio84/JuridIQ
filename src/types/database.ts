// ============================================
// JuridIQ - Database Types
// ============================================

export type PlanType = 'basico' | 'profesional' | 'enterprise';
export type RolUsuario = 'superadmin' | 'admin_despacho' | 'abogado' | 'practicante';
export type EstadoCliente = 'activo' | 'inactivo' | 'archivado';
export type EstadoCaso = 'apertura' | 'en_proceso' | 'sentenciado' | 'archivado';
export type TipoCaso = 'penal' | 'civil' | 'laboral' | 'mercantil' | 'familiar' | 'fiscal' | 'administrativo' | 'amparo' | 'otro';
export type TipoCita = 'presencial' | 'virtual' | 'telefonica';
export type TipoDocumento = 'demanda' | 'sentencia' | 'contrato' | 'escritura' | 'acta' | 'recurso' | 'prueba' | 'otro';
export type TipoConsulta = 'ley' | 'jurisprudencia' | 'redaccion' | 'estrategia' | 'general';
export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'vencida';
export type PrioridadTarea = 'baja' | 'media' | 'alta' | 'urgente';
export type CanalNotificacion = 'web' | 'whatsapp' | 'email';
export type TipoNotificacion = 'cita_recordatorio' | 'tarea_vencida' | 'expediente_audiencia' | 'general';
export type Especialidad = 'penal' | 'civil' | 'mercantil' | 'laboral' | 'familiar' | 'fiscal' | 'administrativo' | 'corporativo';

export interface Despacho {
  despacho_id: string;
  nombre_despacho: string;
  email_principal: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  plan: PlanType;
  fecha_creacion: string;
  activo: boolean;
  logo_url?: string;
}

export interface Profile {
  id: string;
  email: string;
  nombre_completo: string;
  role: RolUsuario;
  especialidad?: Especialidad | null;
  despacho_id?: string | null;
  avatar_url?: string | null;
  telefono?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Cliente {
  cliente_id: string;
  despacho_id: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  tipo_identificacion?: string;
  numero_identificacion?: string;
  domicilio?: string;
  notas_generales?: string;
  abogado_asignado_id?: string;
  fecha_registro: string;
  estado: EstadoCliente;
  // Joined fields
  abogado?: Profile;
  expedientes_count?: number;
}

export interface Expediente {
  expediente_id: string;
  cliente_id: string;
  despacho_id: string;
  abogado_responsable_id: string;
  tipo_caso: TipoCaso;
  titulo: string;
  descripcion_inicial: string;
  estado_caso: EstadoCaso;
  fecha_creacion: string;
  fecha_cierre?: string;
  monto_demanda?: number;
  juzgado?: string;
  numero_expediente?: string;
  fecha_proxima_audiencia?: string;
  json_metadatos?: Record<string, unknown>;
  // Joined fields
  cliente?: Cliente;
  abogado?: Profile;
  documentos?: ExpedienteDocumento[];
  tareas?: ExpedienteTarea[];
}

export interface ExpedienteDocumento {
  doc_id: string;
  expediente_id: string;
  nombre_archivo: string;
  tipo_documento: TipoDocumento;
  fecha_subida: string;
  ruta_storage: string;
  subido_por_id: string;
  tamano_bytes?: number;
  subido_por?: Profile;
}

export interface ExpedienteTarea {
  tarea_id: string;
  expediente_id: string;
  titulo: string;
  descripcion?: string;
  fecha_limite: string;
  fecha_completada?: string;
  responsable_id: string;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  orden: number;
  // Joined
  responsable?: Profile;
}

export interface Cita {
  cita_id: string;
  despacho_id: string;
  abogado_id: string;
  cliente_id?: string;
  fecha_hora: string;
  duracion_minutos: number;
  titulo_asunto: string;
  descripcion_cliente?: string;
  confirmada: boolean;
  enviado_recordatorio: boolean;
  tipo_cita: TipoCita;
  enlace_zoom?: string;
  nombre_publico?: string;
  email_publico?: string;
  telefono_publico?: string;
  // Joined
  cliente?: Cliente;
  abogado?: Profile;
}

export interface HistorialCita {
  registro_id: string;
  cita_id: string;
  notas_post_cita: string;
  accionables_siguientes?: string;
  fecha_creacion: string;
}

export interface ConsultaIA {
  consulta_id: string;
  despacho_id: string;
  abogado_id: string;
  pregunta_original: string;
  respuesta_claude: string;
  tokens_utilizados: number;
  tipo_consulta: TipoConsulta;
  documentos_referenciados?: string[];
  fecha_consulta: string;
  compartida_con_cliente: boolean;
  expediente_id?: string;
  // Joined
  abogado?: Profile;
}

export interface BaseConocimiento {
  doc_id: string;
  despacho_id: string;
  titulo: string;
  tipo: string;
  contenido_texto: string;
  fecha_publicacion: string;
  fuente?: string;
  tags: string[];
  subido_por_id: string;
}

export interface Notificacion {
  notificacion_id: string;
  despacho_id: string;
  usuario_id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  canal: CanalNotificacion;
  enviada: boolean;
  fecha_envio?: string;
  fecha_creacion: string;
  ruta_destino?: string;
  prioridad?: 'alta' | 'media' | 'baja';
}

export interface SolicitudRegistro {
  id: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  nombre_despacho: string;
  plan_interes: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_solicitud: string;
  notas_admin?: string;
}
