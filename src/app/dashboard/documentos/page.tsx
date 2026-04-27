'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { createBrowserClient } from '@supabase/ssr';
import { FileText, Plus, Copy, Download, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Plantilla { id: string; nombre: string; categoria: string; contenido: string; }

const PODER_NOTARIAL = 
'PODER NOTARIAL GENERAL\n\n' +
'En la Ciudad de [CIUDAD], a [FECHA] de [AÑO].\n\n' +
'ANTE MÍ, [NOMBRE_NOTARIO], Notario Público [NUMERO_NOTARIA], comparece:\n\n' +
'[NOMBRE_PODERDANTE], de [EDAD] años de edad, con domicilio en [DOMICILIO_PODERDANTE], con identificación [TIPO_ID] número [NUMERO_ID],\n\n' +
'A QUIEN CONFIERO PODER GENERAL para que en mi nombre y representación pueda:\n\n' +
'1. Celebrar toda clase de actos y contratos\n' +
'2. Comparecer ante toda clase de autoridades administrativas y judiciales\n' +
'3. Desistir, transigir, comprometer en árbitros y hacer cesión de bienes\n\n' +
'APODERADO: [NOMBRE_APODERADO]\n\n' +
'FIRMAS:\n' +
'_______________________          _______________________\n' +
'    El Poderdante                      El Notario';

const DEMANDA_CIVIL =
'DEMANDA CIVIL\n\n' +
'[CIUDAD], a [FECHA]\n\n' +
'C. JUEZ [JUZGADO]:\n\n' +
'[NOMBRE_ABOGADO], en mi carácter de [CARACTER_LEGAL] del C. [NOMBRE_CLIENTE], con domicilio en [DOMICILIO_CLIENTE], ante Usted con el debido respeto comparezco y expongo:\n\n' +
'HECHOS:\n\n' +
'PRIMERO.- [HECHO_1]\n\n' +
'SEGUNDO.- [HECHO_2]\n\n' +
'DERECHO:\n\n' +
'Los hechos narrados se encuentran regulados en los artículos [ARTICULOS_APLICABLES]\n\n' +
'PRETENSIONES:\n\n' +
'Por lo expuesto y fundado, a Usted, C. Juez, respetuosamente solicito:\n\n' +
'ÚNICO.- Que se admita la presente demanda en la vía y forma propuesta.\n\n' +
'PROTESTO LO NECESARIO.\n\n' +
'_______________________\n' +
'[NOMBRE_ABOGADO]\n' +
'Cédula Profesional: [CEDULA_PROFESIONAL]';

const CONTRATO_SERVICIOS =
'CONTRATO DE PRESTACIÓN DE SERVICIOS PROFESIONALES\n\n' +
'En [CIUDAD], a [FECHA]\n\n' +
'ENTRE:\n' +
'[NOMBRE_CLIENTE] (en adelante "EL CLIENTE")\n\n' +
'Y\n\n' +
'[NOMBRE_ABOGADO], Abogado con Cédula Profesional [CEDULA_PROFESIONAL] (en adelante "EL PROFESIONAL")\n\n' +
'CLAUSULAS:\n\n' +
'PRIMERA (Objeto).- El Profesional se compromete a prestar servicios de asesoría y representación legal en: [DESCRIPCION_ASUNTO]\n\n' +
'SEGUNDA (Honorarios).- El Cliente pagará al Profesional la cantidad de $[HONORARIOS] MXN, de la siguiente forma: [FORMA_PAGO]\n\n' +
'TERCERA (Vigencia).- Este contrato tiene vigencia a partir de la fecha de firma y hasta la conclusión del asunto o convenio entre las partes.\n\n' +
'CUARTA (Confidencialidad).- El Profesional guardará estricta confidencialidad sobre toda información proporcionada por el Cliente.\n\n' +
'FIRMAS:\n\n' +
'_______________________          _______________________\n' +
'     EL CLIENTE                    EL PROFESIONAL';

const NDA =
'ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACIÓN\n\n' +
'En [CIUDAD], [FECHA]\n\n' +
'PARTES:\n' +
'A) [NOMBRE_PARTE_A] (LA PARTE DIVULGADORA)\n' +
'B) [NOMBRE_PARTE_B] (LA PARTE RECEPTORA)\n\n' +
'OBJETO:\n' +
'Las partes desean intercambiar información confidencial para el propósito de: [PROPOSITO]\n\n' +
'OBLIGACIONES:\n' +
'1. La Parte Receptora mantendrá en estricta confidencialidad toda Información Confidencial recibida.\n' +
'2. No divulgará la información a terceros sin consentimiento escrito previo.\n' +
'3. Usará la información únicamente para el propósito establecido.\n\n' +
'VIGENCIA: [DURACION_ANOS] años a partir de la fecha de firma.\n\n' +
'FIRMAS:\n' +
'_______________________          _______________________\n' +
'    Parte Divulgadora                 Parte Receptora';

const PLANTILLAS_BASE: Plantilla[] = [
  { id: 'poder-notarial', nombre: 'Poder Notarial General', categoria: 'Poderes', contenido: PODER_NOTARIAL },
  { id: 'demanda', nombre: 'Demanda Civil Genérica', categoria: 'Demandas', contenido: DEMANDA_CIVIL },
  { id: 'contrato-prestacion', nombre: 'Contrato de Prestación de Servicios', categoria: 'Contratos', contenido: CONTRATO_SERVICIOS },
  { id: 'acuerdo-confidencialidad', nombre: 'Acuerdo de Confidencialidad (NDA)', categoria: 'Contratos', contenido: NDA },
];

export default function DocumentosPage() {
  const { profile } = useAuth();
  const [selectedPlantilla, setSelectedPlantilla] = useState<Plantilla | null>(null);
  const [contenidoEditable, setContenidoEditable] = useState('');
  const [nombre, setNombre] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [expedientes, setExpedientes] = useState<{ expediente_id: string; titulo: string; cliente?: { nombre_completo: string } }[]>([]);
  const [selectedExpediente, setSelectedExpediente] = useState('');
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!profile?.despacho_id) return;
    supabase
      .from('expedientes')
      .select('expediente_id, titulo, cliente:clientes(nombre_completo)')
      .eq('despacho_id', profile.despacho_id)
      .then(({ data }) => { if (data) setExpedientes(data as any); });
  }, [profile]);

  const loadPlantilla = (p: Plantilla) => {
    setSelectedPlantilla(p);
    setNombre(p.nombre);
    let content = p.contenido;
    if (selectedExpediente) {
      const exp = expedientes.find(e => e.expediente_id === selectedExpediente);
      if (exp) {
        content = content.replaceAll('[NOMBRE_CLIENTE]', (exp.cliente as any)?.nombre_completo || '');
        content = content.replaceAll('[FECHA]', new Date().toLocaleDateString('es-MX'));
        content = content.replaceAll('[AÑO]', new Date().getFullYear().toString());
      }
    }
    setContenidoEditable(content);
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta dictado por voz. Usa Google Chrome para esta función.');
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-MX';
    let finalTranscript = '';
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
      }
      if (finalTranscript) {
        const cursorPos = textareaRef.current?.selectionStart || contenidoEditable.length;
        setContenidoEditable(prev => prev.slice(0, cursorPos) + finalTranscript + prev.slice(cursorPos));
        finalTranscript = '';
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const copyToClipboard = () => navigator.clipboard.writeText(contenidoEditable);

  const downloadTxt = () => {
    const blob = new Blob([contenidoEditable], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (nombre || 'documento') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Editor de Documentos
        </h1>
        <p className="text-sm text-slate-500 mt-1">Genera documentos legales con plantillas y dictado por voz</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          <select className="input text-sm" value={selectedExpediente} onChange={e => setSelectedExpediente(e.target.value)}>
            <option value="">Expediente (opcional)</option>
            {expedientes.map(e => <option key={e.expediente_id} value={e.expediente_id}>{e.titulo}</option>)}
          </select>
          <div className="card p-0 flex-1 overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plantillas</div>
            <div className="overflow-y-auto flex-1">
              {['Demandas', 'Contratos', 'Poderes'].map(cat => (
                <div key={cat}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">{cat}</div>
                  {PLANTILLAS_BASE.filter(p => p.categoria === cat).map(p => (
                    <button key={p.id} onClick={() => loadPlantilla(p)} className={cn("w-full text-left px-3 py-2.5 text-sm transition-colors border-b border-slate-50 hover:bg-slate-50", selectedPlantilla?.id === p.id ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700")}>
                      {p.nombre}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100">
              <button onClick={() => { setSelectedPlantilla(null); setNombre('Nuevo Documento'); setContenidoEditable(''); }} className="btn btn-secondary w-full text-sm gap-1">
                <Plus className="w-4 h-4" /> Documento en blanco
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="card flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 flex-wrap">
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del documento..." className="flex-1 text-sm font-medium text-slate-900 bg-transparent outline-none min-w-[150px]" />
            <div className="flex items-center gap-1.5 ml-auto">
              <button onClick={startVoiceDictation} className={cn("p-2 rounded-lg text-sm flex items-center gap-1.5 transition-colors", isListening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-slate-100 text-slate-600")} title={isListening ? "Detener dictado" : "Dictar por voz"}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="hidden sm:inline text-xs">{isListening ? 'Escuchando...' : 'Dictado'}</span>
              </button>
              <button onClick={copyToClipboard} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Copiar"><Copy className="w-4 h-4" /></button>
              <button onClick={downloadTxt} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Descargar .txt"><Download className="w-4 h-4" /></button>
            </div>
          </div>

          {contenidoEditable === '' && !selectedPlantilla ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <FileText className="w-16 h-16 text-slate-200" />
              <div className="text-center">
                <p className="text-slate-500 font-medium">Selecciona una plantilla o crea un documento en blanco</p>
                <p className="text-sm text-slate-400 mt-1">Puedes usar dictado por voz para escribir más rápido</p>
              </div>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={contenidoEditable}
              onChange={e => setContenidoEditable(e.target.value)}
              className="flex-1 p-4 font-mono text-sm text-slate-900 resize-none outline-none border-none bg-white"
              placeholder="El contenido del documento aparecerá aquí..."
              spellCheck={true}
              lang="es"
            />
          )}

          {selectedPlantilla && (
            <div className="px-4 py-2 border-t border-slate-100 bg-amber-50">
              <p className="text-xs text-amber-700">💡 Los campos entre corchetes [MAYUSCULAS] son variables a reemplazar con los datos del caso.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
