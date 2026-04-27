'use client';

import { useState, useEffect } from 'react';
import { Scale, Calendar, CheckCircle2, Loader2, MapPin, Phone, Video, Clock, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AbogadoPublico {
  id: string;
  nombre_completo: string;
  especialidad: string;
}

interface DespachoPublico {
  nombre_despacho: string;
  ciudad: string;
  telefono: string;
}

export default function AgendarPublicoPage() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [abogados, setAbogados] = useState<AbogadoPublico[]>([]);
  const [despacho, setDespacho] = useState<DespachoPublico | null>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    email_cliente: '',
    telefono_cliente: '',
    abogado_id: '',
    tipo_cita: 'presencial',
    fecha_hora: '',
    hora: '09:00',
    motivo: '',
  });

  useEffect(() => {
    const loadPublicData = async () => {
      try {
        // Cargar despachos y abogados disponibles públicamente (el primer despacho activo)
        const { data: despachos } = await supabase
          .from('despachos')
          .select('nombre_despacho, ciudad, telefono')
          .eq('activo', true)
          .limit(1)
          .single();

        if (despachos) {
          setDespacho(despachos);
        }

        const { data: perfiles } = await supabase
          .from('profiles')
          .select('id, nombre_completo, especialidad')
          .not('especialidad', 'is', null);

        if (perfiles) setAbogados(perfiles);
      } catch (err) {
        console.error('Error loading public data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadPublicData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Combine date and time into a full datetime
      const fechaHora = new Date(`${formData.fecha_hora}T${formData.hora}:00`);
      
      if (isNaN(fechaHora.getTime())) {
        setError('Por favor selecciona una fecha y hora válidas.');
        setLoading(false);
        return;
      }

      // Find the despacho_id from the abogado's profile or use the first one
      let despachoId: string | null = null;
      if (formData.abogado_id) {
        const { data: perfil } = await supabase
          .from('profiles')
          .select('despacho_id')
          .eq('id', formData.abogado_id)
          .single();
        despachoId = perfil?.despacho_id || null;
      } else {
        const { data: d } = await supabase
          .from('despachos')
          .select('despacho_id')
          .eq('activo', true)
          .limit(1)
          .single();
        despachoId = d?.despacho_id || null;
      }

      if (!despachoId) {
        setError('No hay despachos disponibles en este momento. Por favor contacta directamente.');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('citas')
        .insert({
          despacho_id: despachoId,
          abogado_id: formData.abogado_id || null,
          nombre_cliente: formData.nombre_cliente,
          email_cliente: formData.email_cliente,
          telefono_cliente: formData.telefono_cliente,
          tipo_cita: formData.tipo_cita as any,
          fecha_hora: fechaHora.toISOString(),
          motivo: formData.motivo,
          estado: 'pendiente',
          enviado_recordatorio: false,
        });

      if (insertError) {
        console.error('Error inserting cita:', insertError);
        setError('Hubo un error al enviar tu solicitud. Inténtalo de nuevo.');
        return;
      }

      setStep('success');
    } catch (err) {
      setError('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">¡Cita Solicitada!</h1>
          <p className="text-sm text-slate-500 mb-6">
            Tu solicitud ha sido enviada al despacho. Recibirás una confirmación en tu email cuando el abogado la acepte. Por favor revisa también tu carpeta de spam.
          </p>
          <button onClick={() => { setStep('form'); setFormData({ nombre_cliente: '', email_cliente: '', telefono_cliente: '', abogado_id: '', tipo_cita: 'presencial', fecha_hora: '', hora: '09:00', motivo: '' }); }} className="btn btn-primary">
            Agendar otra cita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="gradient-hero py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Jurid<span className="text-blue-300">IQ</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {loadingData ? 'Cargando...' : despacho?.nombre_despacho || 'Despacho Jurídico'}
          </h1>
          <p className="text-blue-200 text-sm">
            Agenda tu cita de consulta jurídica de forma rápida y segura
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 -mt-6">
        <div className="card p-6 sm:p-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-900">Solicitar Cita</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Tu nombre"
                  required
                  value={formData.nombre_cliente}
                  onChange={e => setFormData({...formData, nombre_cliente: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="tu@email.com"
                  required
                  value={formData.email_cliente}
                  onChange={e => setFormData({...formData, email_cliente: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono *</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+52 55 1234 5678"
                  required
                  value={formData.telefono_cliente}
                  onChange={e => setFormData({...formData, telefono_cliente: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado preferido</label>
                <select
                  className="input"
                  value={formData.abogado_id}
                  onChange={e => setFormData({...formData, abogado_id: e.target.value})}
                >
                  <option value="">Cualquier disponible</option>
                  {abogados.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre_completo}{a.especialidad ? ` — ${a.especialidad}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de consulta</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'presencial', label: 'Presencial', icon: MapPin, color: 'peer-checked:bg-emerald-50 peer-checked:border-emerald-300 peer-checked:text-emerald-700' },
                  { value: 'virtual', label: 'Virtual', icon: Video, color: 'peer-checked:bg-blue-50 peer-checked:border-blue-300 peer-checked:text-blue-700' },
                  { value: 'telefonica', label: 'Telefónica', icon: Phone, color: 'peer-checked:bg-purple-50 peer-checked:border-purple-300 peer-checked:text-purple-700' },
                ].map((tipo) => (
                  <label key={tipo.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="tipo_cita"
                      value={tipo.value}
                      className="peer hidden"
                      checked={formData.tipo_cita === tipo.value}
                      onChange={() => setFormData({...formData, tipo_cita: tipo.value})}
                    />
                    <div className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-lg border border-slate-200 text-slate-500 transition-all',
                      tipo.color,
                      formData.tipo_cita === tipo.value ? tipo.color.replace('peer-checked:', '') : ''
                    )}>
                      <tipo.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{tipo.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha preferida *</label>
                <input
                  type="date"
                  className="input"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.fecha_hora}
                  onChange={e => setFormData({...formData, fecha_hora: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hora preferida *</label>
                <select
                  className="input"
                  required
                  value={formData.hora}
                  onChange={e => setFormData({...formData, hora: e.target.value})}
                >
                  <option value="">Seleccionar hora</option>
                  {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
                    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'].map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Asunto de la consulta *</label>
              <textarea
                className="input min-h-[100px] resize-y"
                placeholder="Describe brevemente tu situación legal..."
                required
                value={formData.motivo}
                onChange={e => setFormData({...formData, motivo: e.target.value})}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading || loadingData}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando solicitud...</>
              ) : (
                <><Calendar className="w-5 h-5" /> Solicitar Cita</>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center">
              La cita será confirmada por el abogado. Recibirás un email de confirmación.
            </p>
          </form>
        </div>

        {/* Info */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6 mb-12">
          {[
            { icon: Clock, label: 'Respuesta rápida', desc: 'Confirmación en menos de 24h' },
            { icon: Scale, label: 'Profesionales expertos', desc: 'Abogados certificados' },
            { icon: CheckCircle2, label: 'Sin compromiso', desc: 'Primera consulta informativa' },
          ].map((item) => (
            <div key={item.label} className="text-center p-4">
              <item.icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">{item.label}</div>
              <div className="text-xs text-slate-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
