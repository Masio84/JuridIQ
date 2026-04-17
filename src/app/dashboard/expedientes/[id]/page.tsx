'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Calendar, Scale, MapPin, DollarSign,
  FileText, Upload, CheckCircle2, Circle, Clock, AlertTriangle,
  Plus, GripVertical, User,
} from 'lucide-react';
import { cn, getInitials, formatFecha, formatMonto, diasRestantes, formatFechaRelativa } from '@/lib/utils';
import { ESTADO_CASO_LABELS, TIPO_CASO_LABELS, PRIORIDAD_LABELS, ESTADO_TAREA_LABELS } from '@/lib/constants';
import { mockExpedientes, mockTareas } from '@/lib/mock-data';
import type { EstadoTarea } from '@/types/database';

export default function ExpedienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const expediente = mockExpedientes.find((e) => e.expediente_id === id);
  const [activeTab, setActiveTab] = useState<'detalle' | 'tareas' | 'documentos' | 'timeline'>('detalle');

  if (!expediente) {
    return (
      <div className="empty-state card py-16 animate-fade-in">
        <Scale className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Expediente no encontrado</p>
        <Link href="/dashboard/expedientes" className="btn btn-primary btn-sm mt-4">Volver</Link>
      </div>
    );
  }

  const tareas = mockTareas.filter((t) => t.expediente_id === id);
  const estadoInfo = ESTADO_CASO_LABELS[expediente.estado_caso];
  const tipoInfo = TIPO_CASO_LABELS[expediente.tipo_caso];

  // Timeline events
  const timeline = [
    { date: expediente.fecha_creacion, label: 'Expediente creado', type: 'created' },
    ...(tareas.filter(t => t.fecha_completada).map(t => ({
      date: t.fecha_completada!, label: `Tarea completada: ${t.titulo}`, type: 'task'
    }))),
    ...(expediente.fecha_cierre ? [{ date: expediente.fecha_cierre, label: 'Caso cerrado', type: 'closed' }] : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const mockDocumentos = [
    { nombre: 'Demanda_inicial.pdf', tipo: 'demanda', fecha: '2024-06-16', tamano: '2.4 MB' },
    { nombre: 'Poder_notarial.pdf', tipo: 'escritura', fecha: '2024-06-15', tamano: '1.1 MB' },
    { nombre: 'Evidencia_bancaria.pdf', tipo: 'prueba', fecha: '2024-07-20', tamano: '5.8 MB' },
  ];

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
              <span className={cn('badge', estadoInfo?.bg, estadoInfo?.color)}>{estadoInfo?.label}</span>
              <span className="text-xs text-slate-400">· {tipoInfo?.label}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{expediente.titulo}</h1>
            <p className="text-sm text-slate-500 mt-1">Creado {formatFecha(expediente.fecha_creacion)}</p>
          </div>
          <button className="btn btn-secondary btn-sm">
            <Edit className="w-4 h-4" /> Editar
          </button>
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          {expediente.numero_expediente && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-medium">Expediente</div>
                <div className="text-sm font-medium text-slate-700">{expediente.numero_expediente}</div>
              </div>
            </div>
          )}
          {expediente.juzgado && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-medium">Juzgado</div>
                <div className="text-sm text-slate-700 truncate max-w-[180px]">{expediente.juzgado}</div>
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
              <div className="text-sm font-medium text-slate-700">{expediente.cliente?.nombre_completo}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="avatar avatar-sm bg-blue-50 text-blue-700 text-[10px]">
              {getInitials(expediente.abogado?.nombre_completo || '')}
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Abogado</div>
              <div className="text-sm font-medium text-slate-700">{expediente.abogado?.nombre_completo}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
        {[
          { key: 'detalle', label: 'Descripción' },
          { key: 'tareas', label: `Cronograma (${tareas.length})` },
          { key: 'documentos', label: `Documentos (${mockDocumentos.length})` },
          { key: 'timeline', label: 'Timeline' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
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
              {expediente.descripcion_inicial}
            </p>
          </div>
        )}

        {activeTab === 'tareas' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Cronograma de Tareas</h3>
              <button className="btn btn-primary btn-sm">
                <Plus className="w-4 h-4" /> Nueva Tarea
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>{tareas.filter(t => t.estado === 'completada').length} de {tareas.length} completadas</span>
                <span>{tareas.length > 0 ? Math.round((tareas.filter(t => t.estado === 'completada').length / tareas.length) * 100) : 0}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${tareas.length > 0 ? (tareas.filter(t => t.estado === 'completada').length / tareas.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-2">
              {tareas
                .sort((a, b) => a.orden - b.orden)
                .map((tarea) => {
                  const prioridadInfo = PRIORIDAD_LABELS[tarea.prioridad];
                  const estadoTareaInfo = ESTADO_TAREA_LABELS[tarea.estado];
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
                        'flex items-start gap-3 p-4 rounded-lg border transition-colors',
                        tarea.estado === 'completada'
                          ? 'bg-emerald-50/50 border-emerald-100'
                          : tarea.estado === 'vencida'
                          ? 'bg-red-50/50 border-red-100'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <GripVertical className="w-4 h-4 text-slate-300 mt-0.5 cursor-grab flex-shrink-0" />
                      {getStatusIcon(tarea.estado)}
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          'text-sm font-medium',
                          tarea.estado === 'completada' ? 'text-slate-500 line-through' : 'text-slate-900'
                        )}>
                          {tarea.titulo}
                        </div>
                        {tarea.descripcion && (
                          <p className="text-xs text-slate-500 mt-0.5">{tarea.descripcion}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded', prioridadInfo?.bg, prioridadInfo?.color)}>
                            {prioridadInfo?.label}
                          </span>
                          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded', estadoTareaInfo?.bg, estadoTareaInfo?.color)}>
                            {estadoTareaInfo?.label}
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
                        <div className="avatar avatar-sm bg-slate-100 text-slate-600 text-[10px]">
                          {getInitials(tarea.responsable?.nombre_completo || '')}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'documentos' && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Documentos</h3>
              <button className="btn btn-primary btn-sm">
                <Upload className="w-4 h-4" /> Subir Documento
              </button>
            </div>

            <div className="space-y-2">
              {mockDocumentos.map((doc) => (
                <div key={doc.nombre} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{doc.nombre}</div>
                    <div className="text-xs text-slate-400">{doc.tipo} · {doc.tamano}</div>
                  </div>
                  <span className="text-xs text-slate-400">{doc.fecha}</span>
                </div>
              ))}
            </div>

            {/* Drag & drop area */}
            <div className="mt-4 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Arrastra archivos aquí o haz clic para subir</p>
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
    </div>
  );
}
