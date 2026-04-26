// ============================================================
// JuridIQ - Expediente Detail Page (Conectado a DB Real)
// ============================================================
'use client';

import { use, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Calendar, Scale, MapPin, DollarSign,
  FileText, Upload, CheckCircle2, Circle, Clock, AlertTriangle,
  Plus, GripVertical, User, Loader2, X, Download
} from 'lucide-react';
import { cn, getInitials, formatFecha, formatMonto, diasRestantes, formatFechaRelativa } from '@/lib/utils';
import { ESTADO_CASO_LABELS, TIPO_CASO_LABELS, PRIORIDAD_LABELS, ESTADO_TAREA_LABELS } from '@/lib/constants';
import { getExpedienteById, updateTareaEstado, createTarea, uploadDocumento, getDocumentoUrl } from '@/lib/services/expedientes.service';
import { useAuth } from '@/lib/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';
import type { Expediente, ExpedienteTarea, ExpedienteDocumento, EstadoTarea } from '@/types/database';

export default function ExpedienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { profile } = useAuth();
  
  const [expediente, setExpediente] = useState<Expediente & { tareas?: ExpedienteTarea[], documentos?: ExpedienteDocumento[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'detalle' | 'tareas' | 'documentos' | 'timeline'>('detalle');

  // Modal States
  const [showTareaModal, setShowTareaModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [abogados, setAbogados] = useState<{ id: string; nombre_completo: string }[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getExpedienteById(id);
      setExpediente(data as any);
      
      if (profile?.despacho_id) {
        const { data: pData } = await supabase
          .from('profiles')
          .select('id, nombre_completo')
          .eq('despacho_id', profile.despacho_id);
        if (pData) setAbogados(pData);
      }
    } catch (error) {
      console.error('Error loading expediente:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, profile?.despacho_id, supabase]);

  const toggleTareaEstado = async (tarea: ExpedienteTarea) => {
    const nuevoEstado = tarea.estado === 'completada' ? 'en_progreso' : 'completada';
    const fecha = nuevoEstado === 'completada' ? new Date().toISOString() : undefined;
    
    // Optimistic update
    setExpediente(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tareas: prev.tareas?.map(t => t.tarea_id === tarea.tarea_id ? { ...t, estado: nuevoEstado, fecha_completada: fecha } : t)
      };
    });

    const { error } = await updateTareaEstado(tarea.tarea_id, nuevoEstado, fecha);
    if (error) {
      console.error('Error updating task:', error);
      loadData();
    }
  };

  const handleCreateTarea = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const maxOrden = expediente?.tareas?.reduce((max, t) => Math.max(max, t.orden), 0) || 0;

    const nuevaTarea: any = {
      expediente_id: id,
      titulo: formData.get('titulo') as string,
      descripcion: (formData.get('descripcion') as string) || undefined,
      responsable_id: (formData.get('responsable_id') as string) || undefined,
      fecha_limite: new Date(formData.get('fecha_limite') as string).toISOString(),
      estado: 'pendiente',
      prioridad: formData.get('prioridad') as string,
      orden: maxOrden + 1,
      fecha_completada: undefined
    };

    const { error } = await createTarea(nuevaTarea);
    if (!error) {
      setShowTareaModal(false);
      loadData();
    } else {
      console.error(error);
      alert('Error al crear la tarea: ' + error);
    }
    setSubmitting(false);
  };

  const handleUploadDoc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!docFile || !profile?.id) return;
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const tipoDocumento = formData.get('tipo_documento') as string;

    const { error } = await uploadDocumento(id, docFile, tipoDocumento, profile.id);
    if (!error) {
      setShowDocModal(false);
      setDocFile(null);
      loadData();
    } else {
      console.error(error);
      alert('Error al subir el documento: ' + error);
    }
    setSubmitting(false);
  };

  const handleDownloadDoc = async (ruta: string) => {
    const url = await getDocumentoUrl(ruta);
    if (url) {
      window.open(url, '_blank');
    } else {
      alert('No se pudo obtener el enlace del documento.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="empty-state card py-16 animate-fade-in">
        <Scale className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Expediente no encontrado</p>
        <Link href="/dashboard/expedientes" className="btn btn-primary btn-sm mt-4">Volver</Link>
      </div>
    );
  }

  const tareas = expediente.tareas || [];
  const documentos = expediente.documentos || [];
  const estadoInfo = ESTADO_CASO_LABELS[expediente.estado_caso as keyof typeof ESTADO_CASO_LABELS];
  const tipoInfo = TIPO_CASO_LABELS[expediente.tipo_caso as keyof typeof TIPO_CASO_LABELS];

  const timeline = [
    { date: expediente.fecha_creacion, label: 'Expediente creado', type: 'created' },
    ...(tareas.filter(t => t.fecha_completada).map(t => ({
      date: t.fecha_completada!, label: `Tarea completada: ${t.titulo}`, type: 'task'
    }))),
    ...(expediente.fecha_cierre ? [{ date: expediente.fecha_cierre, label: 'Caso cerrado', type: 'closed' }] : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/expedientes" className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Expedientes
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium truncate max-w-[300px]">{expediente.titulo}</span>
      </div>

      {/* Header Card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{tipoInfo?.icon}</span>
              <span className={cn('badge', estadoInfo?.bg, estadoInfo?.color)}>{estadoInfo?.label || expediente.estado_caso}</span>
              <span className="text-xs text-slate-400">· {tipoInfo?.label || expediente.tipo_caso}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{expediente.titulo}</h1>
            <p className="text-sm text-slate-500 mt-1">Creado {formatFecha(expediente.fecha_creacion)}</p>
          </div>
          <Link href={`/dashboard/expedientes/${id}/editar`} className="btn btn-secondary btn-sm">
            <Edit className="w-4 h-4" /> Editar
          </Link>
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          {expediente.numero_expediente && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-400 uppercase font-medium">Expediente</div>
                <div className="text-sm font-medium text-slate-700 truncate">{expediente.numero_expediente}</div>
              </div>
            </div>
          )}
          {expediente.juzgado && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-purple-500" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-slate-400 uppercase font-medium">Juzgado</div>
                <div className="text-sm text-slate-700 truncate">{expediente.juzgado}</div>
              </div>
            </div>
          )}
          {expediente.monto_demanda && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-medium">Monto</div>
                <div className="text-sm font-medium text-slate-700">{formatMonto(expediente.monto_demanda)}</div>
              </div>
            </div>
          )}
          {expediente.fecha_proxima_audiencia && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-medium">Próxima Audiencia</div>
                <div className={cn(
                  'text-sm font-medium',
                  diasRestantes(expediente.fecha_proxima_audiencia) <= 7 ? 'text-red-600' : 'text-slate-700'
                )}>
                  {formatFecha(expediente.fecha_proxima_audiencia)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Client & Lawyer info */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="avatar avatar-sm bg-brand-50 text-brand-700 text-[10px]">
              {getInitials(expediente.cliente?.nombre_completo || '')}
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Cliente</div>
              <div className="text-sm font-medium text-slate-700">{expediente.cliente?.nombre_completo || 'Sin asignar'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="avatar avatar-sm bg-blue-50 text-blue-700 text-[10px]">
              {getInitials(expediente.abogado?.nombre_completo || '')}
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Abogado Responsable</div>
              <div className="text-sm font-medium text-slate-700">{expediente.abogado?.nombre_completo || 'Sin asignar'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
        {[
          { key: 'detalle', label: 'Descripción' },
          { key: 'tareas', label: `Cronograma (${tareas.length})` },
          { key: 'documentos', label: `Documentos (${documentos.length})` },
          { key: 'timeline', label: 'Timeline' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={cn(
              'flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'detalle' && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Descripción del Caso</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {expediente.descripcion_inicial || 'Sin descripción inicial.'}
            </p>
          </div>
        )}

        {activeTab === 'tareas' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Cronograma de Tareas</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowTareaModal(true)}>
                <Plus className="w-4 h-4" /> Nueva Tarea
              </button>
            </div>

            {/* Progress bar */}
            {tareas.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>{tareas.filter(t => t.estado === 'completada').length} de {tareas.length} completadas</span>
                  <span>{Math.round((tareas.filter(t => t.estado === 'completada').length / tareas.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(tareas.filter(t => t.estado === 'completada').length / tareas.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Task list */}
            {tareas.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No hay tareas registradas.</div>
            ) : (
              <div className="space-y-2">
                {tareas
                  .sort((a, b) => a.orden - b.orden)
                  .map((tarea) => {
                    const prioridadInfo = PRIORIDAD_LABELS[tarea.prioridad as keyof typeof PRIORIDAD_LABELS];
                    const estadoTareaInfo = ESTADO_TAREA_LABELS[tarea.estado as keyof typeof ESTADO_TAREA_LABELS];
                    const dias = diasRestantes(tarea.fecha_limite);

                    const getStatusIcon = (estado: EstadoTarea) => {
                      switch (estado) {
                        case 'completada': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
                        case 'en_progreso': return <Clock className="w-5 h-5 text-blue-500" />;
                        case 'vencida': return <AlertTriangle className="w-5 h-5 text-red-500" />;
                        default: return <Circle className="w-5 h-5 text-slate-300" />;
                      }
                    };

                    return (
                      <div
                        key={tarea.tarea_id}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer group',
                          tarea.estado === 'completada'
                            ? 'bg-emerald-50/50 border-emerald-100'
                            : tarea.estado === 'vencida'
                            ? 'bg-red-50/50 border-red-100'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        )}
                        onClick={() => toggleTareaEstado(tarea)}
                      >
                        <GripVertical className="w-4 h-4 text-slate-300 mt-0.5 cursor-grab flex-shrink-0" onClick={e => e.stopPropagation()} />
                        <div className="mt-0.5 transition-transform group-hover:scale-110">
                          {getStatusIcon(tarea.estado as EstadoTarea)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            'text-sm font-medium transition-colors',
                            tarea.estado === 'completada' ? 'text-slate-500 line-through' : 'text-slate-900 group-hover:text-blue-600'
                          )}>
                            {tarea.titulo}
                          </div>
                          {tarea.descripcion && (
                            <p className="text-xs text-slate-500 mt-0.5">{tarea.descripcion}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded', prioridadInfo?.bg, prioridadInfo?.color)}>
                              {prioridadInfo?.label || tarea.prioridad}
                            </span>
                            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded', estadoTareaInfo?.bg, estadoTareaInfo?.color)}>
                              {estadoTareaInfo?.label || tarea.estado}
                            </span>
                            <span className={cn(
                              'text-xs',
                              tarea.estado === 'completada' ? 'text-slate-400' :
                              dias <= 1 ? 'text-red-600 font-medium' : dias <= 3 ? 'text-amber-600' : 'text-slate-400'
                            )}>
                              {tarea.estado === 'completada'
                                ? `Completada ${formatFechaRelativa(tarea.fecha_completada!)}`
                                : `Vence ${formatFecha(tarea.fecha_limite)}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className="avatar avatar-sm bg-slate-100 text-slate-600 text-[10px]" title={tarea.responsable?.nombre_completo}>
                            {getInitials(tarea.responsable?.nombre_completo || '')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documentos' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Documentos</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowDocModal(true)}>
                <Upload className="w-4 h-4" /> Subir Documento
              </button>
            </div>

            {documentos.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No hay documentos subidos.</div>
            ) : (
              <div className="space-y-2">
                {documentos.map((doc) => (
                  <div key={doc.doc_id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => handleDownloadDoc(doc.ruta_storage)}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate hover:text-blue-600">{doc.nombre_archivo}</div>
                        <div className="text-xs text-slate-400">{doc.tipo_documento} · {doc.tamano_bytes ? (doc.tamano_bytes / 1024 / 1024).toFixed(2) : '0.00'} MB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 hidden sm:block">{formatFecha(doc.fecha_subida)}</span>
                      <Download className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drag & drop area */}
            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => setShowDocModal(true)}>
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Haz clic aquí para subir archivos</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG, PNG (máx. 50MB)</p>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Línea de Tiempo</h3>
            <div className="relative">
              <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-6">
                {timeline.map((event, i) => (
                  <div key={i} className="relative flex gap-4 pl-10">
                    <div className={cn(
                      'absolute left-[8px] w-4 h-4 rounded-full border-2 border-white z-10',
                      event.type === 'created' ? 'bg-blue-500' :
                      event.type === 'closed' ? 'bg-slate-400' :
                      'bg-emerald-500'
                    )} />
                    <div>
                      <div className="text-sm font-medium text-slate-900">{event.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{formatFecha(event.date, "dd/MM/yyyy 'a las' HH:mm")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL NUEVA TAREA */}
      {showTareaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Nueva Tarea</h2>
              <button onClick={() => setShowTareaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTarea} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
                <input name="titulo" type="text" className="input" required placeholder="Ej. Redactar amparo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                <textarea name="descripcion" className="input text-sm" placeholder="Detalles de la tarea..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha límite *</label>
                  <input name="fecha_limite" type="datetime-local" className="input" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Prioridad</label>
                  <select name="prioridad" className="input" defaultValue="media">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Responsable</label>
                <select name="responsable_id" className="input">
                  <option value="">Sin asignar</option>
                  {abogados.map(a => <option key={a.id} value={a.id}>{a.nombre_completo}</option>)}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowTareaModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SUBIR DOCUMENTO */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Subir Documento</h2>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadDoc} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Archivo *</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="input p-2 text-sm" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Documento</label>
                <select name="tipo_documento" className="input" defaultValue="general">
                  <option value="demanda">Demanda</option>
                  <option value="prueba">Prueba / Evidencia</option>
                  <option value="acuerdo">Acuerdo de Juzgado</option>
                  <option value="escritura">Escritura / Notarial</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowDocModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" disabled={submitting || !docFile} className="btn btn-primary">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subir Archivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
