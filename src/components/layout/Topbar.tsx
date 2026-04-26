'use client';

import { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Plus,
  X,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { mockCurrentUser, mockNotificaciones } from '@/lib/mock-data';

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = mockNotificaciones.filter((n) => !n.leida).length;

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

        {/* Quick actions */}
        <button className="hidden sm:flex btn btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          Nuevo
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
                    <button className="text-xs text-blue-600 hover:text-blue-700">
                      Marcar todas como leídas
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {mockNotificaciones.map((notif) => (
                    <div
                      key={notif.notificacion_id}
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
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Ver todas
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
              {getInitials(mockCurrentUser.nombre_completo)}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {mockCurrentUser.nombre_completo.split(' ').slice(1, 3).join(' ')}
            </span>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 animate-slide-down overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-medium text-slate-900">
                    {mockCurrentUser.nombre_completo}
                  </div>
                  <div className="text-xs text-slate-500">{mockCurrentUser.email}</div>
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
                    onClick={() => { window.location.href = '/login'; }}
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
