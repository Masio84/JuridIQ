'use client';

import { useState } from 'react';
import { BookOpen, Search, Upload, Plus, FileText, Tag, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockDocs = [
  { id: '1', titulo: 'Código Fiscal de la Federación', tipo: 'código', fuente: 'DOF', tags: ['fiscal', 'tributario'], fecha: '2024-01-01' },
  { id: '2', titulo: 'Ley Federal del Trabajo', tipo: 'ley', fuente: 'DOF', tags: ['laboral', 'empleo'], fecha: '2024-01-01' },
  { id: '3', titulo: 'Código Civil Federal', tipo: 'código', fuente: 'DOF', tags: ['civil', 'contratos'], fecha: '2024-01-01' },
  { id: '4', titulo: 'Código Penal Federal', tipo: 'código', fuente: 'DOF', tags: ['penal', 'delitos'], fecha: '2024-01-01' },
  { id: '5', titulo: 'Ley General de Sociedades Mercantiles', tipo: 'ley', fuente: 'DOF', tags: ['mercantil', 'sociedades'], fecha: '2024-01-01' },
  { id: '6', titulo: 'Tesis 2a./J. 12/2020 - Prescripción Fiscal', tipo: 'jurisprudencia', fuente: 'SCJN', tags: ['fiscal', 'prescripción'], fecha: '2020-03-15' },
  { id: '7', titulo: 'Precedente interno: Caso Defraudación ETN', tipo: 'precedente interno', fuente: 'García, López & Asoc.', tags: ['fiscal', 'defraudación'], fecha: '2024-08-10' },
];

export default function BaseConocimientoPage() {
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');

  const tipos = ['todos', 'ley', 'código', 'jurisprudencia', 'reglamento', 'precedente interno'];

  const filtered = mockDocs.filter((d) => {
    const matchSearch = d.titulo.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchTipo = filterTipo === 'todos' || d.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'ley': return 'bg-blue-100 text-blue-700';
      case 'código': return 'bg-emerald-100 text-emerald-700';
      case 'jurisprudencia': return 'bg-purple-100 text-purple-700';
      case 'reglamento': return 'bg-amber-100 text-amber-700';
      case 'precedente interno': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Base de Conocimiento Legal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mockDocs.length} documentos indexados · Búsqueda full-text habilitada
          </p>
        </div>
        <button className="btn btn-primary">
          <Upload className="w-4 h-4" /> Subir Documento
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, tags o contenido..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {tipos.map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFilterTipo(tipo)}
              className={cn('btn btn-sm', filterTipo === tipo ? 'btn-primary' : 'btn-ghost')}
            >
              {tipo === 'todos' ? 'Todos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Documents grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filtered.map((doc) => (
          <div key={doc.id} className="card p-5 card-interactive cursor-pointer">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{doc.titulo}</h3>
                <span className={cn('inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1', getTypeColor(doc.tipo))}>
                  {doc.tipo}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
              <span>{doc.fuente}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {doc.fecha}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer card">
        <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Arrastra documentos legales aquí</p>
        <p className="text-xs text-slate-400 mt-1">Soporta PDF, DOCX, TXT · Los documentos serán indexados automáticamente</p>
      </div>
    </div>
  );
}
