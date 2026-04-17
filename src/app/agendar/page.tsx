'use client';

import { useState } from 'react';
import { Scale, Calendar, CheckCircle2, Loader2, MapPin, Phone, Video, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockProfiles, mockDespacho } from '@/lib/mock-data';

export default function AgendarPublicoPage() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
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
            Tu solicitud de cita ha sido enviada. Recibirás un email de confirmación cuando el abogado acepte la cita.
          </p>
          <button onClick={() => setStep('form')} className="btn btn-primary">
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
            {mockDespacho.nombre_despacho}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo *</label>
                <input type="text" className="input" placeholder="Tu nombre" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
                <input type="email" className="input" placeholder="tu@email.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono *</label>
                <input type="tel" className="input" placeholder="+52 55 1234 5678" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Abogado preferido</label>
                <select className="input">
                  <option value="">Cualquier disponible</option>
                  {mockProfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre_completo} - {p.especialidad}</option>
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
                    <input type="radio" name="tipo_cita" value={tipo.value} className="peer hidden" defaultChecked={tipo.value === 'presencial'} />
                    <div className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-lg border border-slate-200 text-slate-500 transition-all',
                      tipo.color
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
                <input type="date" className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hora preferida *</label>
                <select className="input" required>
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
              <textarea className="input min-h-[100px] resize-y" placeholder="Describe brevemente tu situación legal..." required />
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
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
