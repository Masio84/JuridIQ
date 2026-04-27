'use client';

import { useState, useEffect, useRef } from 'react';
import { BookOpen, Search, Upload, FileText, Tag, Calendar, Trash2, Download, Loader2, X, Plus, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DocLegal {
  id: string;
  titulo: string;
  tipo: string;
  fuente: string;
  tags: string[];
  fecha: string;
  archivo_url?: string;
  archivo_nombre?: string;
  despacho_id: string;
  subido_por: string;
}

const TIPOS = ['todos', 'ley', 'código', 'jurisprudencia', 'reglamento', 'precedente interno', 'contrato'];

function getTypeColor(tipo: string) {
  switch (tipo) {
    case 'ley': return 'bg-blue-100 text-blue-700';
    case 'código': return 'bg-emerald-100 text-emerald-700';
    case 'jurisprudencia': return 'bg-purple-100 text-purple-700';
    case 'reglamento': return 'bg-amber-100 text-amber-700';
    case 'precedente interno': return 'bg-slate-100 text-slate-700';
    case 'contrato': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
}

export default function BaseLegalPage() {
  const { profile } = useAuth();
  const [docs, setDocs] = useState<DocLegal[]>([]);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    titulo: '',
    tipo: 'ley',
    fuente: 'DOF',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!profile?.despacho_id) return;
    loadDocs();
  }, [profile]);

  const loadDocs = async () => {
    if (!profile?.despacho_id) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('base_legal')
      .select('*')
      .eq('despacho_id', profile.despacho_id)
      .order('created_at', { ascending: false });
    setDocs((data as any) || []);
    setIsLoading(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileSelect = (file: File) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (!allowed.includes(file.type)) {
      alert('Solo se permiten archivos PDF, DOCX, DOC o TXT.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('El archivo no puede superar 50 MB.');
      return;
    }
    setSelectedFile(file);
    if (!uploadForm.titulo) {
      setUploadForm(prev => ({ ...prev, titulo: file.name.replace(/\.[^/.]+$/, '') }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !profile?.despacho_id || !uploadForm.titulo) return;
    setUploading(true);

    try {
      // 1. Upload file to Supabase Storage
      const ext = selectedFile.name.split('.').pop();
      const path = `base-legal/${profile.despacho_id}/${Date.now()}.${ext}`;

      const { error: storageError } = await supabase.storage
        .from('documentos')
        .upload(path, selectedFile, { contentType: selectedFile.type, upsert: false });

      if (storageError) throw storageError;

      // 2. Get public URL
      const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path);

      // 3. Insert record
      const { error: dbError } = await supabase.from('base_legal').insert({
        despacho_id: profile.despacho_id,
        titulo: uploadForm.titulo,
        tipo: uploadForm.tipo,
        fuente: uploadForm.fuente,
        tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        fecha: new Date().toISOString().split('T')[0],
        archivo_url: urlData.publicUrl,
        archivo_nombre: selectedFile.name,
        subido_por: profile.id,
      });

      if (dbError) throw dbError;

      setShowUpload(false);
      setSelectedFile(null);
      setUploadForm({ titulo: '', tipo: 'ley', fuente: 'DOF', tags: '' });
      loadDocs();
    } catch (err: any) {
      alert('Error al subir: ' + (err.message || 'Error desconocido'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: DocLegal) => {
    if (!confirm(`¿Eliminar "${doc.titulo}"?`)) return;
    // Delete from storage if has URL
    if (doc.archivo_url) {
      const path = doc.archivo_url.split('/documentos/')[1];
      if (path) await supabase.storage.from('documentos').remove([path]);
    }
    await supabase.from('base_legal').delete().eq('id', doc.id);
    setDocs(prev => prev.filter(d => d.id !== doc.id));
  };

  const filtered = docs.filter(d => {
    const matchSearch = d.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (d.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchTipo = filterTipo === 'todos' || d.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Base de Conocimiento Legal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {docs.length} documentos · PDF, DOCX, TXT soportados
          </p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn btn-primary gap-2">
          <Upload className="w-4 h-4" /> Subir Documento
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título o tags..."
            className="input pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TIPOS.map(tipo => (
            <button
              key={tipo}
              onClick={() => setFilterTipo(tipo)}
              className={cn('btn btn-sm capitalize', filterTipo === tipo ? 'btn-primary' : 'btn-ghost')}
            >
              {tipo === 'todos' ? 'Todos' : tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Documents */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <div
          className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer"
          onClick={() => setShowUpload(true)}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
        >
          <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">
            {search || filterTipo !== 'todos' ? 'Sin resultados para esta búsqueda' : 'Arrastra documentos legales aquí o haz clic para subir'}
          </p>
          <p className="text-xs text-slate-400 mt-1">PDF, DOCX, DOC, TXT · Máx 50 MB</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <div key={doc.id} className="card p-5 group relative">
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
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{doc.fecha}</span>
                {doc.archivo_nombre && <span className="truncate text-slate-300">· {doc.archivo_nombre}</span>}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {(doc.tags || []).map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3">
                {doc.archivo_url && (
                  <a href={doc.archivo_url} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white shadow-sm text-blue-600 hover:bg-blue-50 border border-slate-200"
                    title="Abrir / Descargar">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button onClick={() => handleDelete(doc)}
                  className="p-1.5 rounded-lg bg-white shadow-sm text-red-500 hover:bg-red-50 border border-slate-200"
                  title="Eliminar">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <>
          <div className="fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm" onClick={() => setShowUpload(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-scale-in p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" /> Subir Documento Legal
                </h3>
                <button onClick={() => setShowUpload(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Drop zone */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center mb-4 transition-colors cursor-pointer",
                  dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                )}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <FileText className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{selectedFile.name}</div>
                      <div className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setSelectedFile(null); }} className="ml-2 p-1 text-slate-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Arrastra o <span className="text-blue-600 font-medium">selecciona un archivo</span></p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOCX, DOC, TXT · Máx 50 MB</p>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Título *</label>
                  <input className="input" placeholder="Ej: Código Civil Federal 2024" value={uploadForm.titulo} onChange={e => setUploadForm({ ...uploadForm, titulo: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
                    <select className="input" value={uploadForm.tipo} onChange={e => setUploadForm({ ...uploadForm, tipo: e.target.value })}>
                      {TIPOS.filter(t => t !== 'todos').map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Fuente</label>
                    <input className="input" placeholder="DOF, SCJN, Interno..." value={uploadForm.fuente} onChange={e => setUploadForm({ ...uploadForm, fuente: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (separados por coma)</label>
                  <input className="input" placeholder="fiscal, laboral, civil..." value={uploadForm.tags} onChange={e => setUploadForm({ ...uploadForm, tags: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowUpload(false)} className="btn btn-secondary flex-1">Cancelar</button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !uploadForm.titulo || uploading}
                  className="btn btn-primary flex-1 gap-2"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Subiendo...' : 'Subir Documento'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
