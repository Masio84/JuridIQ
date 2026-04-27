'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getNotificaciones, marcarLeida, marcarTodasLeidas, eliminarNotificacion, subscribeToNotificaciones } from '@/lib/services/notificaciones.service';
import type { Notificacion } from '@/types/database';
import { Bell, Check, Trash2, Calendar, FileText, AlertCircle, Info, Loader2, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function NotificacionesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'no_leidas'>('todas');

  useEffect(() => {
    // Esperar a que la autenticación termine antes de actuar
    if (authLoading) return;

    if (!user) {
      // Auth cargó pero no hay usuario — dejar de cargar
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      const { data } = await getNotificaciones(user.id);
      setNotificaciones(data || []);
      setIsLoading(false);
    };

    loadData();

    const unsubscribe = subscribeToNotificaciones(user.id, (newNotif) => {
      setNotificaciones((prev) => [newNotif, ...prev]);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleNotificacionClick = async (notificacion: Notificacion) => {
    if (!notificacion.leida) {
      await marcarLeida(notificacion.notificacion_id);
      setNotificaciones(prev => 
        prev.map(n => n.notificacion_id === notificacion.notificacion_id ? { ...n, leida: true } : n)
      );
    }
    
    if (notificacion.ruta_destino) {
      router.push(notificacion.ruta_destino);
    }
  };

  const handleMarcarTodas = async () => {
    if (!user) return;
    await marcarTodasLeidas(user.id);
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const handleEliminar = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Evitar que dispare el onClick de la fila
    await eliminarNotificacion(id);
    setNotificaciones(prev => prev.filter(n => n.notificacion_id !== id));
  };

  const getIcon = (tipo: string, prioridad?: string) => {
    if (prioridad === 'alta') return <AlertCircle className="w-5 h-5 text-red-500" />;
    
    switch (tipo) {
      case 'cita_recordatorio': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'expediente_audiencia': return <FileText className="w-5 h-5 text-purple-500" />;
      case 'tarea_vencida': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const getPriorityBadge = (prioridad?: string) => {
    if (!prioridad || prioridad === 'media') return null;
    if (prioridad === 'alta') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">Urgente</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">Baja</span>;
  };

  const filteredNotificaciones = notificaciones.filter(n => filter === 'todas' || !n.leida);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Centro de Notificaciones
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona tus alertas, recordatorios y actualizaciones del sistema
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setFilter('todas')}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", filter === 'todas' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Todas
            </button>
            <button 
              onClick={() => setFilter('no_leidas')}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", filter === 'no_leidas' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              No leídas
            </button>
          </div>
          
          <button 
            onClick={handleMarcarTodas}
            className="btn btn-secondary py-2 px-3 text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : filteredNotificaciones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Todo al día</h3>
          <p className="text-slate-500">No tienes notificaciones pendientes.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
          {filteredNotificaciones.map((notif) => (
            <div 
              key={notif.notificacion_id}
              onClick={() => handleNotificacionClick(notif)}
              className={cn(
                "p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 cursor-pointer group",
                !notif.leida ? "bg-blue-50/30" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                !notif.leida ? "bg-white shadow-sm" : "bg-slate-100"
              )}>
                {getIcon(notif.tipo, notif.prioridad)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn("text-sm truncate", !notif.leida ? "font-semibold text-slate-900" : "font-medium text-slate-700")}>
                      {notif.titulo}
                    </h4>
                    {getPriorityBadge(notif.prioridad)}
                    {!notif.leida && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(notif.fecha_creacion), { addSuffix: true, locale: es })}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {notif.mensaje}
                </p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleEliminar(e, notif.notificacion_id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
