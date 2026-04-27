'use client';

import { useState, useEffect } from 'react';
import { Scale, Calendar, CheckCircle2, Loader2, MapPin, Phone, Video, Clock, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AbogadoInfo {
  id: string;
  nombre_completo: string;
  especialidad: string | null;
  slug_agenda: string | null;
  mensaje_agenda: string | null;
  despacho_id: string;
}

interface DespachoInfo {
  nombre_despacho: string;
  ciudad: string;
  telefono: string;
}

export default function AgendarSlugPage({ params }: { params: { slug: string } }) {
  const [step, setStep] = useState<'loading' | 'form' | 'success' | 'not_found'>('loading');
  const [submitting, setSubmitting] = useState(false);
  const [abogado, setAbogado] = useState<AbogadoInfo | null>(null);
  const [despacho, setDespacho] = useState<DespachoInfo | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nombre_cliente: '',
    email_cliente: '',
    telefono_cliente: '',
    tipo_cita: 'presencial',
    fecha_hora: '',
    hora: '09:00',
    motivo: '',
  });

  useEffect(() => {
    const loadData = async () => {
      // Buscar el perfil por slug_agenda
      const { data: perfil } = await supabase
        .from('profiles')
        .select('id, nombre_completo, especialidad, slug_agenda, mensaje_agenda, despacho_id')
        .eq('slug_agenda', params.slug)
        .single();

      if (!perfil) {
        setStep('not_found');
        return;
      }

      setAbogado(perfil as AbogadoInfo);

      // Cargar datos del despacho
      if (perfil.despacho_id) {
        const { data: d } = await supabase
          .from('despachos')
          .select('nombre_despacho, ciudad, telefono')
          .eq('despacho_id', perfil.despacho_id)
          .single();
        if (d) setDespacho(d);
      }

      setStep('form');
    };

    loadData();
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const fechaHora = new Date(`${formData.fecha_hora}T${formData.hora}:00`);
      if (isNaN(fechaHora.getTime())) {
        setError('Por favor selecciona una fecha y hora válidas.');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (fechaHora < today) {
        setError('La fecha debe ser hoy o en el futuro.');
        return;
      }

      const { error: insertError } = await supabase.from('citas').insert({
        despacho_id: abogado!.despacho_id,
        abogado_id: abogado!.id,
        nombre_cliente: formData.nombre_cliente,
        email_cliente: formData.email_cliente,
        telefono_cliente: formData.telefono_cliente,
        tipo_cita: formData.tipo_cita as any,
        fecha_hora: fechaHora.toISOString(),
        motivo: formData.motivo,
        estado: 'pendiente',
        enviado_recordatorio: false,
      });

      if (insertError) throw insertError;
      setStep('success');
    } catch {
      setError('Hubo un error al enviar tu solicitud. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // ─── Loading ──────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ─── Not found ────────────────────────────────────────────
  if (step === 'not_found') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card p-10 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Enlace no encontrado</h1>
          <p className="text-sm text-slate-500">
            Este enlace de agenda no existe o ha sido desactivado. Contacta directamente al abogado para agendar tu cita.
          </p>
        </div>
      </div>
    );
  }

  // ─── Success ──────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">¡Cita Solicitada!</h1>
          <p className="text-sm text-slate-500 mb-2">
            Tu solicitud con <strong>{abogado?.nombre_completo}</strong> ha sido enviada.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Recibirás una confirmación en tu email cuando sea aceptada. Revisa también tu carpeta de spam.
          </p>
          <button
            onClick={() => { setStep('form'); setFormData({ nombre_cliente: '', email_cliente: '', telefono_cliente: '', tipo_cita: 'presencial', fecha_hora: '', hora: '09:00', motivo: '' }); }}
            className="btn btn-primary"
          >
            Agendar otra cita
          </button>
        </div>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────
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

          {/* Avatar del abogado */}
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-white border-2 border-white/30">
            {abogado?.nombre_completo.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {abogado?.nombre_completo}
          </h1>
          {abogado?.especialidad && (
            <p className="text-blue-200 text-sm font-medium mb-2">{abogado.especialidad}</p>
          )}
          {despacho && (
            <p className="text-blue-300 text-sm">{despacho.nombre_despacho} · {despacho.ciudad}</p>
          )}
          {abogado?.mensaje_agenda && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-lg mx-auto border border-white/20">
              <p className="text-white/90 text-sm italic">"{abogado.mensaje_agenda}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Solicitar Cita
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Datos del cliente */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nombre completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" required className="input pl-9"
                    placeholder="Tu nombre"
                    value={formData.nombre_cliente}
                    onChange={e => setFormData({ ...formData, nombre_cliente: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                <input type="email" required className="input"
                  placeholder="tu@email.com"
                  value={formData.email_cliente}
                  onChange={e => setFormData({ ...formData, email_cliente: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" className="input pl-9"
                    placeholder="+52 000 000 0000"
                    value={formData.telefono_cliente}
                    onChange={e => setFormData({ ...formData, telefono_cliente: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de cita *</label>
                <select required className="input" value={formData.tipo_cita}
                  onChange={e => setFormData({ ...formData, tipo_cita: e.target.value })}>
                  <option value="presencial">🏢 Presencial</option>
                  <option value="virtual">💻 Videollamada</option>
                  <option value="telefonica">📞 Telefónica</option>
                </select>
              </div>
            </div>

            {/* Fecha y hora */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha preferida *
                </label>
                <input type="date" required className="input" min={minDate}
                  value={formData.fecha_hora}
                  onChange={e => setFormData({ ...formData, fecha_hora: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Hora preferida *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="time" required className="input pl-9" min="08:00" max="19:00"
                    value={formData.hora}
                    onChange={e => setFormData({ ...formData, hora: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Motivo de la consulta *
              </label>
              <textarea required className="input min-h-[90px] resize-none"
                placeholder="Describe brevemente tu situación legal..."
                value={formData.motivo}
                onChange={e => setFormData({ ...formData, motivo: e.target.value })}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn btn-primary w-full gap-2 py-3 text-base">
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
              {submitting ? 'Enviando solicitud...' : 'Solicitar Cita'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Powered by <strong>JuridIQ</strong> · Tu información es confidencial y segura
        </p>
      </div>
    </div>
  );
}
