// ============================================================
// JuridIQ - Signup Page (Registro Real con Supabase)
// ============================================================
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scale, Mail, Lock, User, Building2, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe tener al menos una letra mayúscula.';
  if (!/[0-9]/.test(password)) return 'La contraseña debe tener al menos un número.';
  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    nombreDespacho: '',
    aceptaTerminos: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones de cliente
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const pwError = validatePassword(formData.password);
    if (pwError) { setError(pwError); return; }

    if (!formData.aceptaTerminos) {
      setError('Debes aceptar los Términos de Servicio para continuar.');
      return;
    }

    setLoading(true);

    try {
      // 1. Crear el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        options: {
          data: {
            nombre_completo: formData.nombre.trim(),
            nombre_despacho: formData.nombreDespacho.trim(),
            role: 'admin_despacho',
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Ya existe una cuenta con ese correo. ¿Quieres iniciar sesión?');
        } else {
          setError('Error al crear la cuenta. Intenta de nuevo.');
        }
        return;
      }

      if (authData.user) {
        // 2. Crear el despacho y vincularlo (via API route para usar service_role)
        if (formData.nombreDespacho.trim()) {
          await fetch('/api/auth/setup-despacho', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: authData.user.id,
              nombreDespacho: formData.nombreDespacho.trim(),
              emailPrincipal: formData.email.trim().toLowerCase(),
            }),
          });
        }

        // 3. Si el email necesita verificación
        if (!authData.session) {
          setSuccess(true);
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito — email de verificación enviado
  if (success) {
    return (
      <div className="animate-fade-in">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">¡Cuenta creada!</h1>
          <p className="text-slate-600 mb-4">
            Enviamos un correo de verificación a <strong>{formData.email}</strong>.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar tu cuenta.
          </p>
          <Link href="/login" className="btn btn-primary w-full">
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
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
          <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="text-sm text-slate-500 mt-1">Registra tu despacho y comienza a usar JuridIQ</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 animate-slide-down flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => updateField('nombre', e.target.value)}
                className="input !pl-10"
                placeholder="Lic. Juan Pérez"
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="signup-email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="input !pl-10"
                placeholder="tu@despacho.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="despacho" className="block text-sm font-medium text-slate-700 mb-1.5">
              Nombre del despacho
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="despacho"
                type="text"
                value={formData.nombreDespacho}
                onChange={(e) => updateField('nombreDespacho', e.target.value)}
                className="input !pl-10"
                placeholder="García & Asociados"
                required
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="input !pl-10"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirmar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="input !pl-10"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 space-y-1 px-1">
            <p className={formData.password.length >= 8 ? 'text-emerald-600' : ''}>
              {formData.password.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
            </p>
            <p className={/[A-Z]/.test(formData.password) ? 'text-emerald-600' : ''}>
              {/[A-Z]/.test(formData.password) ? '✓' : '○'} Una letra mayúscula
            </p>
            <p className={/[0-9]/.test(formData.password) ? 'text-emerald-600' : ''}>
              {/[0-9]/.test(formData.password) ? '✓' : '○'} Un número
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPassword ? 'Ocultar' : 'Mostrar'} contraseñas
            </button>
          </div>

          <label className="flex items-start gap-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.aceptaTerminos}
              onChange={(e) => updateField('aceptaTerminos', e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-500">
              Acepto los{' '}
              <a href="#" className="text-blue-600 hover:underline">Términos de Servicio</a>{' '}
              y la{' '}
              <a href="#" className="text-blue-600 hover:underline">Política de Privacidad</a>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
