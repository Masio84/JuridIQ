// ============================================================
// JuridIQ - Expedientes Page (Conectado a DB Real)
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, FolderOpen, ChevronRight, Scale } from 'lucide-react';
import { cn, getInitials, formatFecha, diasRestantes } from '@/lib/utils';
import { ESTADO_CASO_LABELS, TIPO_CASO_LABELS } from '@/lib/constants';
import { getExpedientes } from '@/lib/services/expedientes.service';
import type { Expediente } from '@/types/database';

export default function ExpedientesPage() {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalActivos, setTotalActivos] = useState(0);

  useEffect(() => {
    async function loadExpedientes() {
      setLoading(true);
      try {
        const { data } = await getExpedientes({
          search: search.length >= 3 ? search : undefined,
          estado: filterEstado !== 'todos' ? filterEstado : undefined,
          tipo_caso: filterTipo !== 'todos' ? filterTipo : undefined,
          pageSize: 50,
        });
        
        setExpedientes(data || []);
        
        // Count total active (only if no filters)
        if (!search && filterEstado === 'todos' && filterTipo === 'todos') {
          setTotalActivos((data || []).filter(e => e.estado_caso !== 'archivado').length);
        }
      } catch (error) {
        console.error('Error loading expedientes:', error);
      } finally {
        setLoading(false);
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      loadExpedientes();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, filterEstado, filterTipo]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expedientes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {expedientes.length} resultados {(!search && filterEstado === 'todos' && filterTipo === 'todos') && `· ${totalActivos} activos totales`}
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
              {estado === 'todos' ? 'Todos' : ESTADO_CASO_LABELS[estado as keyof typeof ESTADO_CASO_LABELS]?.label || estado}
            </button>
          ))}
        </div>
        
        {/* Filtros por tipo (opcional, oculto en mobile por espacio) */}
        <div className="hidden sm:flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <Scale className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Tipo:</span>
          </div>
          {['todos', 'penal', 'civil', 'laboral', 'mercantil', 'familiar', 'fiscal', 'administrativo', 'amparo'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilterTipo(tipo)}
              className={cn('btn btn-sm text-[11px] py-1', filterTipo === tipo ? 'btn-secondary bg-slate-200' : 'btn-ghost')}
            >
              {tipo === 'todos' ? 'Todos' : TIPO_CASO_LABELS[tipo as keyof typeof TIPO_CASO_LABELS]?.label || tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
             <div key={i} className="card p-5 h-[180px] animate-pulse flex flex-col justify-between">
             <div className="flex items-center gap-3">
               <div className="space-y-2 flex-1">
                 <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                 <div className="h-3 bg-slate-200 rounded w-1/4"></div>
               </div>
             </div>
             <div className="space-y-2 mt-4">
               <div className="h-3 bg-slate-200 rounded w-1/2"></div>
               <div className="h-3 bg-slate-200 rounded w-1/3"></div>
             </div>
           </div>
          ))}
        </div>
      ) : expedientes.length === 0 ? (
        <div className="empty-state card py-16">
          <FolderOpen className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No se encontraron expedientes</p>
          <p className="text-sm text-slate-400 mt-1">Intenta con otros filtros o crea un nuevo expediente</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 stagger-children">
          {expedientes.map((exp) => {
            const estadoInfo = ESTADO_CASO_LABELS[exp.estado_caso as keyof typeof ESTADO_CASO_LABELS];
            const tipoInfo = TIPO_CASO_LABELS[exp.tipo_caso as keyof typeof TIPO_CASO_LABELS];
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
                        {estadoInfo?.label || exp.estado_caso}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {exp.titulo}
                    </h3>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
                </div>

                <div className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[32px]">
                  {exp.descripcion_inicial || 'Sin descripción'}
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="avatar avatar-sm bg-slate-100 text-slate-600 text-[10px] flex-shrink-0">
                      {getInitials(exp.cliente?.nombre_completo || '')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-700 truncate max-w-[150px]">
                        {exp.cliente?.nombre_completo || 'Sin cliente'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {exp.numero_expediente || 'Sin núm. de expediente'}
                      </div>
                    </div>
                  </div>

                  {exp.fecha_proxima_audiencia && dias !== null && (
                    <div className="text-right">
                      <div className={cn(
                        'text-xs font-medium',
                        dias <= 3 ? 'text-red-600' : dias <= 7 ? 'text-amber-600' : 'text-slate-500'
                      )}>
                        {dias < 0 ? 'Audiencia pasada' : dias === 0 ? 'Audiencia hoy' : dias === 1 ? 'Audiencia mañana' : `En ${dias} días`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatFecha(exp.fecha_proxima_audiencia)}
                      </div>
                    </div>
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
