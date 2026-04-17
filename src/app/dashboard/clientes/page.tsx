'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Users,
  Mail,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { ESTADO_CLIENTE_LABELS } from '@/lib/constants';
import { mockClientes } from '@/lib/mock-data';

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const filtered = mockClientes.filter((c) => {
    const matchSearch =
      c.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.numero_identificacion.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === 'todos' || c.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mockClientes.length} clientes registrados · {mockClientes.filter(c => c.estado === 'activo').length} activos
          </p>
        </div>
        <Link href="/dashboard/clientes/nuevo" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o RFC..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {['todos', 'activo', 'inactivo', 'archivado'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFilterEstado(estado)}
              className={cn(
                'btn btn-sm',
                filterEstado === estado ? 'btn-primary' : 'btn-ghost'
              )}
            >
              {estado === 'todos' ? 'Todos' : ESTADO_CLIENTE_LABELS[estado]?.label || estado}
            </button>
          ))}
        </div>
      </div>

      {/* Client cards */}
      {filtered.length === 0 ? (
        <div className="empty-state card py-16">
          <Users className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No se encontraron clientes</p>
          <p className="text-sm text-slate-400 mt-1">Intenta con otros filtros o crea un nuevo cliente</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filtered.map((cliente) => {
            const estadoInfo = ESTADO_CLIENTE_LABELS[cliente.estado];
            return (
              <Link
                key={cliente.cliente_id}
                href={`/dashboard/clientes/${cliente.cliente_id}`}
                className="card p-5 card-interactive group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="avatar avatar-lg bg-brand-50 text-brand-700">
                      {getInitials(cliente.nombre_completo)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {cliente.nombre_completo}
                      </h3>
                      <span className={cn('badge text-[10px] mt-1', estadoInfo?.bg, estadoInfo?.color)}>
                        {estadoInfo?.label}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{cliente.telefono}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="avatar avatar-sm bg-slate-100 text-slate-600 text-[10px]">
                      {getInitials(cliente.abogado?.nombre_completo || '')}
                    </div>
                    <span className="text-xs text-slate-400">
                      {cliente.abogado?.nombre_completo.split(' ').slice(1, 3).join(' ')}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {cliente.expedientes_count || 0} expedientes
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
