'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SolicitudRegistro } from '@/types/database';
import { CheckCircle, XCircle, Clock, Building2, Mail, Phone, ExternalLink, Loader2 } from 'lucide-react';
import { updateSolicitudEstado } from '@/lib/services/solicitudes.service';
import { cn, formatFecha } from '@/lib/utils';

export default function SolicitudesClient({ initialSolicitudes }: { initialSolicitudes: SolicitudRegistro[] }) {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleUpdateEstado = async (id: string, nuevoEstado: 'aprobada' | 'rechazada') => {
    setProcessingId(id);
    try {
      // 1. Actualizar estado en DB
      const { error } = await updateSolicitudEstado(id, nuevoEstado);
      if (error) {
        alert('Error al actualizar estado');
        return;
      }

      // 2. Si es aprobada, aquí idealmente llamarías a un endpoint en /api/admin/create-user
      // para crear el tenant, el usuario, y enviarle el acceso por correo usando el role de service_role.
      // Por ahora actualizamos UI:
      
      setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: nuevoEstado } : s));
      
      if (nuevoEstado === 'aprobada') {
        alert('Solicitud aprobada. (Pendiente la lógica de creación automática de usuario via Admin API)');
      }
    } finally {
      setProcessingId(null);
      router.refresh();
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pendiente</span>;
      case 'aprobada':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> Aprobada</span>;
      case 'rechazada':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"><XCircle className="w-3.5 h-3.5" /> Rechazada</span>;
      default:
        return null;
    }
  };

  if (solicitudes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-1">No hay solicitudes</h3>
        <p className="text-slate-500">Todavía nadie ha solicitado registro en la plataforma.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <th className="px-6 py-4 font-medium">Despacho / Solicitante</th>
              <th className="px-6 py-4 font-medium">Contacto</th>
              <th className="px-6 py-4 font-medium">Plan Solicitado</th>
              <th className="px-6 py-4 font-medium">Fecha</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {solicitudes.map((sol) => (
              <tr key={sol.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {sol.nombre_despacho}
                  </div>
                  <div className="text-slate-500 mt-1 text-xs">
                    Representante: {sol.nombre_completo}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${sol.email}`} className="hover:text-blue-600 transition-colors">{sol.email}</a>
                    </div>
                    {sol.telefono && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${sol.telefono}`} className="hover:text-blue-600 transition-colors">{sol.telefono}</a>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 capitalize text-slate-700">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium">
                    {sol.plan_interes}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {formatFecha(sol.fecha_solicitud)}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(sol.estado)}
                </td>
                <td className="px-6 py-4 text-right">
                  {sol.estado === 'pendiente' && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdateEstado(sol.id, 'aprobada')}
                        disabled={processingId === sol.id}
                        className={cn("btn btn-secondary text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 px-3 py-1.5 text-xs", processingId === sol.id && "opacity-50 cursor-not-allowed")}
                      >
                        {processingId === sol.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Aprobar y Dar Alta
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Estás seguro de rechazar esta solicitud?')) {
                            handleUpdateEstado(sol.id, 'rechazada');
                          }
                        }}
                        disabled={processingId === sol.id}
                        className="btn btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200 px-3 py-1.5 text-xs"
                      >
                        Rechazar
                      </button>
                    </div>
                  )}
                  {sol.estado === 'aprobada' && (
                    <span className="text-xs text-slate-400 italic">Cuenta activada</span>
                  )}
                  {sol.estado === 'rechazada' && (
                    <span className="text-xs text-slate-400 italic">Solicitud declinada</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
