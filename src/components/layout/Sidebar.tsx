'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Scale,
  LayoutDashboard,
  Users,
  FolderOpen,
  CalendarDays,
  Calendar,
  BrainCircuit,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
  BarChart3,
  FileText,
  Bell,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/expedientes', label: 'Expedientes', icon: FolderOpen },
  { href: '/dashboard/citas', label: 'Citas', icon: CalendarDays },
  { href: '/dashboard/calendario', label: 'Calendario', icon: Calendar },
  { href: '/dashboard/documentos', label: 'Documentos', icon: FileText },
  { href: '/dashboard/horas', label: 'Horas Facturables', icon: Clock },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/consultas-ia', label: 'Consultar IA', icon: BrainCircuit },
  { href: '/dashboard/base-conocimiento', label: 'Base Legal', icon: BookOpen },
  { href: '/dashboard/notificaciones', label: 'Notificaciones', icon: Bell },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export default function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, isSuperAdmin, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'sidebar h-full min-h-screen flex flex-col z-40',
        collapsed && 'collapsed'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white animate-fade-in">
              Jurid<span className="text-blue-400">IQ</span>
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="hidden lg:flex w-7 h-7 rounded-md items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 mb-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Menú Principal
          </div>
        )}
        
        {isSuperAdmin && (
          <div className="mb-4">
            <Link
              href="/dashboard/solicitudes"
              onClick={onClose}
              className={cn(
                'sidebar-nav-item border border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:text-white',
                isActive('/dashboard/solicitudes') && 'active !bg-red-500/30',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? 'Panel Superadmin' : undefined}
            >
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Panel Superadmin</span>}
            </Link>
          </div>
        )}

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'sidebar-nav-item',
              isActive(item.href) && 'active',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-white/10 p-3 space-y-1 flex-shrink-0">
        <Link
          href="/dashboard/configuracion"
          onClick={onClose}
          className={cn(
            'sidebar-nav-item',
            pathname.startsWith('/dashboard/configuracion') && 'active',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Configuración' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Configuración</span>}
        </Link>

        <button
          className={cn(
            'sidebar-nav-item w-full',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Cerrar Sesión' : undefined}
          onClick={async () => {
            await signOut();
            window.location.href = '/login';
          }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>

        {/* User info */}
        {!collapsed && profile && (
          <div className="mt-3 px-3 py-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="avatar avatar-sm bg-blue-600/30 text-blue-300">
                {getInitials(profile.nombre_completo)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">
                  {profile.nombre_completo.split(' ').slice(0, 3).join(' ')}
                </div>
                <div className="text-xs text-slate-400 truncate capitalize">
                  {profile.role.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
