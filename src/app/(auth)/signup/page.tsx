// ============================================================
// JuridIQ - Request Access Page (Lead Generation)
// ============================================================
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Scale, Mail, User, Building2, Phone, Briefcase, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    nombreDespacho: '',
    planInteres: 'profesional',
    aceptaTerminos: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.aceptaTerminos) {
      setError('Debes aceptar los Términos de Servicio para continuar.');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('solicitudes_registro')
        .insert([{
          nombre_completo: formData.nombre.trim(),
          email: formData.email.trim().toLowerCase(),
          telefono: formData.telefono.trim(),
          nombre_despacho: formData.nombreDespacho.trim(),
          plan_interes: formData.planInteres,
          estado: 'pendiente'
        }]);

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          setError('Ya hemos recibido una solicitud con este correo. Nos pondremos en contacto pronto.');
        } else {
          setError('Error al enviar la solicitud. Intenta de nuevo más tarde.');
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animate-scale-up text-center bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Solicitud Enviada!</h2>
        <p className="text-slate-600 mb-8">
          Hemos recibido tus datos correctamente. Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo muy pronto para configurar tu entorno y activar tu plan en JuridIQ.
        </p>
        <Link href="/login" className="btn btn-primary w-full inline-flex justify-center">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
        <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center">
          <Scale className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900">
          Jurid<span className="text-blue-600">IQ</span>
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Solicitar Acceso a JuridIQ</h1>
          <p className="text-sm text-slate-500 mt-1">Completa el formulario y nos pondremos en contacto para activar tu despacho.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 animate-slide-down flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => updateField('nombre', e.target.value)}
                  className="input !pl-10"
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-1.5">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => updateField('telefono', e.target.value)}
                  className="input !pl-10"
                  placeholder="Ej. +52 55 1234 5678"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Correo Electrónico Laboral
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="input !pl-10"
                placeholder="tu@despacho.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="nombreDespacho" className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre del Despacho
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="nombreDespacho"
                type="text"
                value={formData.nombreDespacho}
                onChange={(e) => updateField('nombreDespacho', e.target.value)}
                className="input !pl-10"
                placeholder="Ej. Bufete Jurídico Pérez & Asociados"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="planInteres" className="block text-sm font-medium text-slate-700 mb-1.5">
              Plan de Interés
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                id="planInteres"
                value={formData.planInteres}
                onChange={(e) => updateField('planInteres', e.target.value)}
                className="input !pl-10 appearance-none bg-white"
                required
              >
                <option value="básico">Plan Básico ($999 MXN / mes)</option>
                <option value="profesional">Plan Profesional ($2,499 MXN / mes) - Más popular</option>
                <option value="institucional">Plan Institucional ($4,999 MXN / mes)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={formData.aceptaTerminos}
                  onChange={(e) => updateField('aceptaTerminos', e.target.checked)}
                />
                <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                Acepto los <a href="#" className="text-blue-600 hover:underline">Términos de Servicio</a> y la{' '}
                <a href="#" className="text-blue-600 hover:underline">Política de Privacidad</a> de JuridIQ.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.email || !formData.nombre || !formData.nombreDespacho}
            className="btn btn-primary w-full mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando Solicitud...
              </>
            ) : (
              'Solicitar Acceso'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes una cuenta activada?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
