// ============================================================
// JuridIQ - Cliente Detail Page (Conectado a BD Real)
// ============================================================
'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Mail, Phone, MapPin, FileText, Calendar, Edit, FolderOpen, User, Hash, Loader2, Link as LinkIcon, Check
} from 'lucide-react';
import { cn, getInitials, formatFecha } from '@/lib/utils';
import { ESTADO_CLIENTE_LABELS, ESTADO_CASO_LABELS, TIPO_CASO_LABELS } from '@/lib/constants';
import { getClienteById } from '@/lib/services/clientes.service';
import { getCitas } from '@/lib/services/citas.service';
import type { Cliente, Expediente, Cita } from '@/types/database';

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [cliente, setCliente] = useState<Cliente & { expedientes?: Expediente[] } | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Portal link generation
  const [generatingPortal, setGeneratingPortal] = useState(false);
  const [portalCopied, setPortalCopied] = useState(false);

  const handleGeneratePortal = async () => {
    if (!cliente) return;
    setGeneratingPortal(true);
    try {
      const res = await fetch('/api/portal/acceso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.cliente_id,
          email_cliente: cliente.email,
        }),
      });
      const data = await res.json();
      
      if (res.ok && data.link) {
        // Formato para enviar por WhatsApp o Email
        const msg = `Hola ${cliente.nombre_completo.split(' ')[0]},\n\nPuedes acceder a tu Portal de Cliente seguro y revisar tus expedientes aquí:\n\n${data.link}\n\nO ingresa a https://juridiq.vercel.app/portal con tu email y este código: ${data.token}`;
        await navigator.clipboard.writeText(msg);
        setPortalCopied(true);
        setTimeout(() => setPortalCopied(false), 3000);
      } else {
        alert('Error: ' + (data.error || 'No se pudo generar el enlace'));
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setGeneratingPortal(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const clientData = await getClienteById(id);
        setCliente(clientData as Cliente & { expedientes?: Expediente[] });
        
        if (clientData) {
          // Cargar las citas del cliente
          const { data: citasData } = await getCitas();
          setCitas(citasData.filter(c => c.cliente_id === id) || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

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

  const expedientes = cliente.expedientes || [];
  const estadoInfo = ESTADO_CLIENTE_LABELS[cliente.estado as keyof typeof ESTADO_CLIENTE_LABELS];

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
                  {estadoInfo?.label || cliente.estado}
                </span>
                <span className="text-xs text-slate-400">
                  Registrado {formatFecha(cliente.fecha_registro)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGeneratePortal}
              disabled={generatingPortal}
              className={cn("btn btn-sm", portalCopied ? "btn-secondary text-emerald-600 bg-emerald-50 border-emerald-200" : "btn-secondary")}
              title="Generar enlace de acceso al portal y copiar"
            >
              {generatingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : portalCopied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
              {portalCopied ? '¡Enlace Copiado!' : 'Acceso Portal'}
            </button>
            <Link href={`/dashboard/clientes/${id}/editar`} className="btn btn-secondary btn-sm">
              <Edit className="w-4 h-4" />
              Editar
            </Link>
          </div>
        </div>

        {/* Contact info */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-500" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 uppercase font-medium">Email</div>
              <div className="text-sm text-slate-700 truncate">{cliente.email}</div>
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
            <div className="min-w-0">
              <div className="text-[11px] text-slate-400 uppercase font-medium">{cliente.tipo_identificacion || 'ID'}</div>
              <div className="text-sm text-slate-700 truncate">{cliente.numero_identificacion || 'N/A'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-medium">Domicilio</div>
              <div className="text-sm text-slate-700 truncate max-w-[200px]">{cliente.domicilio || 'No registrado'}</div>
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
                const estadoCaso = ESTADO_CASO_LABELS[exp.estado_caso as keyof typeof ESTADO_CASO_LABELS];
                const tipoCaso = TIPO_CASO_LABELS[exp.tipo_caso as keyof typeof TIPO_CASO_LABELS];
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
                          {tipoCaso?.icon} {tipoCaso?.label || exp.tipo_caso} · {exp.numero_expediente || 'Sin número'}
                        </div>
                      </div>
                      <span className={cn('badge text-[10px]', estadoCaso?.bg, estadoCaso?.color)}>
                        {estadoCaso?.label || exp.estado_caso}
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
