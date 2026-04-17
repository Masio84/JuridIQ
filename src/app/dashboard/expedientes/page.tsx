'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, FolderOpen, ChevronRight, Scale } from 'lucide-react';
import { cn, getInitials, formatFecha, diasRestantes } from '@/lib/utils';
import { ESTADO_CASO_LABELS, TIPO_CASO_LABELS } from '@/lib/constants';
import { mockExpedientes } from '@/lib/mock-data';

export default function ExpedientesPage() {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');

  const filtered = mockExpedientes.filter((e) => {
    const matchSearch =
      e.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (e.numero_expediente || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.cliente?.nombre_completo || '').toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === 'todos' || e.estado_caso === filterEstado;
    const matchTipo = filterTipo === 'todos' || e.tipo_caso === filterTipo;
    return matchSearch && matchEstado && matchTipo;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expedientes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mockExpedientes.length} expedientes · {mockExpedientes.filter(e => e.estado_caso !== 'archivado').length} activos
          </p>
        </div>
        <Link href="/dashboard/expedientes/nuevo" className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo Expediente
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, número de expediente o cliente..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Estado:</span>
          </div>
          {['todos', 'apertura', 'en_proceso', 'sentenciado', 'archivado'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFilterEstado(estado)}
              className={cn('btn btn-sm', filterEstado === estado ? 'btn-primary' : 'btn-ghost')}
            >
              {estado === 'todos' ? 'Todos' : ESTADO_CASO_LABELS[estado]?.label || estado}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="empty-state card py-16">
          <FolderOpen className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No se encontraron expedientes</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 stagger-children">
          {filtered.map((exp) => {
            const estadoInfo = ESTADO_CASO_LABELS[exp.estado_caso];
            const tipoInfo = TIPO_CASO_LABELS[exp.tipo_caso];
            const dias = exp.fecha_proxima_audiencia ? diasRestantes(exp.fecha_proxima_audiencia) : null;

            return (
              <Link
                key={exp.expediente_id}
                href={`/dashboard/expedientes/${exp.expediente_id}`}
                className="card p-5 card-interactive group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{tipoInfo?.icon}</span>
                      <span className={cn('badge text-[10px]', estadoInfo?.bg, estadoInfo?.color)}>
                        {estadoInfo?.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {exp.titulo}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {exp.descripcion_inicial}
                </p>

                <div className="space-y-2 text-xs text-slate-500">
                  {exp.numero_expediente && (
                    <div className="flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exp.numero_expediente}</span>
                    </div>
                  )}
                  {exp.juzgado && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">📍</span>
                      <span className="truncate">{exp.juzgado}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="avatar avatar-sm bg-slate-100 text-slate-600 text-[10px]">
                      {getInitials(exp.cliente?.nombre_completo || '')}
                    </div>
                    <span className="text-xs text-slate-400 truncate max-w-[120px]">
                      {exp.cliente?.nombre_completo}
                    </span>
                  </div>
                  {dias !== null && (
                    <span className={cn(
                      'text-xs font-medium',
                      dias <= 3 ? 'text-red-600' : dias <= 7 ? 'text-amber-600' : 'text-slate-500'
                    )}>
                      {dias <= 0 ? '⚠️ Hoy' : dias === 1 ? 'Mañana' : `${dias} días`}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
