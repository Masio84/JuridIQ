'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Search, Plus, X, Loader2 } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { getNotificaciones, marcarLeida, subscribeToNotificaciones } from '@/lib/services/notificaciones.service';
import type { Notificacion } from '@/types/database';

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      const { data } = await getNotificaciones(user.id);
      if (data) setNotificaciones(data.slice(0, 5)); // Mostrar solo las 5 más recientes en el panel
    };
    fetchNotifs();

    const unsubscribe = subscribeToNotificaciones(user.id, (newNotif) => {
      setNotificaciones((prev) => [newNotif, ...prev].slice(0, 5));
    }, 'topbar');

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  const handleNotificationClick = async (notif: Notificacion) => {
    if (!notif.leida) {
      await marcarLeida(notif.notificacion_id);
      setNotificaciones(prev => 
        prev.map(n => n.notificacion_id === notif.notificacion_id ? { ...n, leida: true } : n)
      );
    }
    setShowNotifications(false);
    
    if (notif.ruta_destino) {
      router.push(notif.ruta_destino);
    } else {
      router.push('/dashboard/notificaciones');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden btn-ghost p-2 rounded-lg text-slate-600"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        {title && (
          <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          {showSearch ? (
            <div className="flex items-center gap-2 animate-scale-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar clientes, expedientes..."
                  className="input !pl-9 pr-4 w-64 text-sm"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />
              </div>
              <button
                onClick={() => setShowSearch(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              title="Buscar (Ctrl+K)"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Compartir enlace de agenda */}
        <button
          onClick={() => router.push('/dashboard/citas?compartir=1')}
          className="hidden sm:flex btn btn-primary btn-sm gap-1.5"
          title="Configurar y compartir enlace de agenda pública"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          Compartir Enlace
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50 animate-slide-down overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Notificaciones</h3>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notificaciones.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">No hay notificaciones</div>
                  ) : (
                    notificaciones.map((notif) => (
                      <div
                        key={notif.notificacion_id}
                        onClick={() => handleNotificationClick(notif)}
                        className={cn(
                          'px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors',
                          !notif.leida && 'bg-blue-50/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {!notif.leida && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-900">{notif.titulo}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{notif.mensaje}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      router.push('/dashboard/notificaciones');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Abrir Centro de Notificaciones
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="avatar avatar-sm bg-brand-800 text-white text-xs">
              {profile ? getInitials(profile.nombre_completo) : <Loader2 className="w-3 h-3 animate-spin" />}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {profile ? profile.nombre_completo.split(' ').slice(0, 2).join(' ') : 'Cargando...'}
            </span>
          </button>

          {showUserMenu && profile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 animate-slide-down overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {profile.nombre_completo}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{profile.email}</div>
                </div>
                <div className="py-1">
                  <a href="/dashboard/configuracion" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    Mi Perfil
                  </a>
                  <a href="/dashboard/configuracion" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    Configuración
                  </a>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={async () => {
                      await signOut();
                      router.push('/login');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
