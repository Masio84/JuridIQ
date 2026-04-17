'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Edit,
  FolderOpen,
  User,
  Hash,
} from 'lucide-react';
import { cn, getInitials, formatFecha } from '@/lib/utils';
import { ESTADO_CLIENTE_LABELS, ESTADO_CASO_LABELS, TIPO_CASO_LABELS } from '@/lib/constants';
import { mockClientes, mockExpedientes, mockCitas } from '@/lib/mock-data';

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const cliente = mockClientes.find((c) => c.cliente_id === id);

  if (!cliente) {
    return (
      <div className="empty-state card py-16 animate-fade-in">
        <User className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Cliente no encontrado</p>
        <Link href="/dashboard/clientes" className="btn btn-primary btn-sm mt-4">
          Volver a Clientes
        </Link>
      </div>
    );
  }

  const expedientes = mockExpedientes.filter((e) => e.cliente_id === id);
  const citas = mockCitas.filter((c) => c.cliente_id === id);
  const estadoInfo = ESTADO_CLIENTE_LABELS[cliente.estado];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/clientes" className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Clientes
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium">{cliente.nombre_completo}</span>
      </div>

      {/* Header Card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="avatar avatar-lg bg-brand-50 text-brand-700 text-lg">
              {getInitials(cliente.nombre_completo)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{cliente.nombre_completo}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('badge', estadoInfo?.bg, estadoInfo?.color)}>
                  {estadoInfo?.label}
                </span>
                <span className="text-xs text-slate-400">
                  Registrado {formatFecha(cliente.fecha_registro)}
                </span>
              </div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm">
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </div>

        {/* Contact info */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Email</div>
              <div className="text-sm text-slate-700">{cliente.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Phone className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Teléfono</div>
              <div className="text-sm text-slate-700">{cliente.telefono}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Hash className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">{cliente.tipo_identificacion}</div>
              <div className="text-sm text-slate-700">{cliente.numero_identificacion}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Domicilio</div>
              <div className="text-sm text-slate-700 truncate max-w-[200px]">{cliente.domicilio}</div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {cliente.notas_generales && (
          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-xs font-medium text-slate-400 uppercase mb-1">Notas</div>
            <p className="text-sm text-slate-600">{cliente.notas_generales}</p>
          </div>
        )}
      </div>

      {/* Tabs content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expedientes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-500" />
              Expedientes ({expedientes.length})
            </h2>
            <Link href={`/dashboard/expedientes/nuevo?cliente=${id}`} className="btn btn-sm btn-ghost text-blue-600">
              + Nuevo
            </Link>
          </div>

          {expedientes.length === 0 ? (
            <div className="empty-state py-8">
              <FolderOpen className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">Sin expedientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expedientes.map((exp) => {
                const estadoCaso = ESTADO_CASO_LABELS[exp.estado_caso];
                const tipoCaso = TIPO_CASO_LABELS[exp.tipo_caso];
                return (
                  <Link
                    key={exp.expediente_id}
                    href={`/dashboard/expedientes/${exp.expediente_id}`}
                    className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{exp.titulo}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {tipoCaso?.icon} {tipoCaso?.label} · {exp.numero_expediente}
                        </div>
                      </div>
                      <span className={cn('badge text-[10px]', estadoCaso?.bg, estadoCaso?.color)}>
                        {estadoCaso?.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Citas */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Citas ({citas.length})
            </h2>
            <Link href="/dashboard/citas/nueva" className="btn btn-sm btn-ghost text-blue-600">
              + Nueva
            </Link>
          </div>

          {citas.length === 0 ? (
            <div className="empty-state py-8">
              <Calendar className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">Sin citas registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {citas.map((cita) => (
                <div key={cita.cita_id} className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{cita.titulo_asunto}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {formatFecha(cita.fecha_hora, "dd/MM/yyyy 'a las' HH:mm")}
                      </div>
                    </div>
                    <span className={cn(
                      'text-[10px] font-medium px-2 py-0.5 rounded-full',
                      cita.confirmada ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {cita.confirmada ? 'Confirmada' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
