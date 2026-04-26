// ============================================================
// JuridIQ - Clientes Page (Conectado a DB Real)
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Users,
  Mail,
  Phone,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { ESTADO_CLIENTE_LABELS } from '@/lib/constants';
import { getClientes } from '@/lib/services/clientes.service';
import type { Cliente } from '@/types/database';

export default function ClientesPage() {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalActivos, setTotalActivos] = useState(0);

  useEffect(() => {
    async function loadClientes() {
      setLoading(true);
      try {
        const { data } = await getClientes({
          search: search.length >= 3 ? search : undefined,
          estado: filterEstado !== 'todos' ? filterEstado : undefined,
          pageSize: 50,
        });
        setClientes(data || []);
        
        // Count total active (only if no filters)
        if (!search && filterEstado === 'todos') {
          setTotalActivos((data || []).filter(c => c.estado === 'activo').length);
        }
      } catch (error) {
        console.error('Error loading clientes:', error);
      } finally {
        setLoading(false);
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      loadClientes();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, filterEstado]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {clientes.length} resultados {(!search && filterEstado === 'todos') && `· ${totalActivos} activos totales`}
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
            placeholder="Buscar por nombre, email o RFC/CURP..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          {['todos', 'activo', 'inactivo', 'archivado'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFilterEstado(estado)}
              className={cn(
                'btn btn-sm',
                filterEstado === estado ? 'btn-primary' : 'btn-ghost'
              )}
            >
              {estado === 'todos' ? 'Todos' : ESTADO_CLIENTE_LABELS[estado as keyof typeof ESTADO_CLIENTE_LABELS]?.label || estado}
            </button>
          ))}
        </div>
      </div>

      {/* Client cards */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 h-[160px] animate-pulse flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : clientes.length === 0 ? (
        <div className="empty-state card py-16">
          <Users className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No se encontraron clientes</p>
          <p className="text-sm text-slate-400 mt-1">Intenta con otros filtros o crea un nuevo cliente</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {clientes.map((cliente) => {
            const estadoInfo = ESTADO_CLIENTE_LABELS[cliente.estado as keyof typeof ESTADO_CLIENTE_LABELS];
            return (
              <Link
                key={cliente.cliente_id}
                href={`/dashboard/clientes/${cliente.cliente_id}`}
                className="card p-5 card-interactive group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="avatar avatar-lg bg-brand-50 text-brand-700 flex-shrink-0">
                      {getInitials(cliente.nombre_completo)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {cliente.nombre_completo}
                      </h3>
                      <span className={cn('badge text-[10px] mt-1', estadoInfo?.bg, estadoInfo?.color)}>
                        {estadoInfo?.label || cliente.estado}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{cliente.telefono}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="avatar avatar-sm bg-slate-100 text-slate-600 text-[10px] flex-shrink-0">
                      {getInitials(cliente.abogado?.nombre_completo || '')}
                    </div>
                    <span className="text-xs text-slate-400 truncate">
                      {cliente.abogado?.nombre_completo.split(' ').slice(1, 3).join(' ') || 'Sin abogado asignado'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap pl-2">
                    {cliente.expedientes_count || 0} exp.
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
