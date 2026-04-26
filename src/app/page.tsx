'use client';

import Link from 'next/link';
import {
  Scale,
  Calendar,
  FolderOpen,
  BrainCircuit,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  Zap,
  Bell,
  Lock,
  BarChart3,
  Clock,
  FileText,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ---- NAVBAR ---- */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                Jurid<span className="text-blue-600">IQ</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 ml-1">
                BETA
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#funciones" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Funciones
              </a>
              <a href="#planes" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Planes
              </a>
              <a href="#seguridad" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Seguridad
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Iniciar Sesión
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Solicitar Acceso
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-3xl opacity-60" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30 animate-float" />
          <div className="absolute top-40 left-10 w-56 h-56 bg-amber-100 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              Plataforma en acceso anticipado (Beta)
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Tu despacho jurídico,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                inteligente y organizado
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Plataforma SaaS para despachos jurídicos mexicanos. Gestiona expedientes, agenda citas, administra clientes y consulta leyes con inteligencia artificial — todo en un solo lugar seguro.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link href="/signup" className="btn btn-primary btn-lg w-full sm:w-auto shadow-lg shadow-blue-500/25">
                Solicitar Acceso Beta
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg w-full sm:w-auto">
                Ya tengo cuenta
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Multi-tenant seguro
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                IA especializada en derecho mexicano
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Datos cifrados en reposo
              </span>
            </div>
          </div>

          {/* Dashboard Preview — estático, sin datos reales */}
          <div className="mt-16 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-900/10">
              <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 text-center text-xs text-slate-400">app.juridiq.mx — Dashboard</div>
              </div>
              <div className="bg-gradient-to-b from-slate-50 to-white p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Clientes Activos', icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Expedientes Abiertos', icon: '📁', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Citas de Hoy', icon: '📅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Consultas IA', icon: '🧠', color: 'text-purple-600', bg: 'bg-purple-50' },
                  ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} rounded-lg p-4 border border-slate-100`}>
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-xs text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Agenda del Día
                    </div>
                    <div className="space-y-2">
                      {['10:00 — Consulta inicial (Presencial)', '14:30 — Seguimiento de expediente (Virtual)', '16:00 — Firma de contrato (Presencial)'].map((cita) => (
                        <div key={cita} className="flex items-center gap-2 text-sm text-slate-600 px-3 py-2 rounded-md bg-slate-50">
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          {cita}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-purple-500" />
                      Última Consulta IA
                    </div>
                    <div className="p-3 rounded-md bg-slate-50 text-sm text-slate-600">
                      <p className="font-medium text-slate-700 mb-1">¿Cuáles son los plazos de prescripción en materia fiscal?</p>
                      <p className="text-xs text-slate-400">Respuesta con fuentes del CFF, SCJN y tesis jurisprudenciales →</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400 mt-3">
              Vista previa del dashboard — los datos se cargan desde tu despacho
            </p>
          </div>
        </div>
      </section>

      {/* ---- FUNCIONES ---- */}
      <section id="funciones" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Todo lo que tu despacho necesita
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              JuridIQ centraliza la operación completa de tu despacho en una sola plataforma, con seguridad de nivel empresarial.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: FolderOpen,
                title: 'Expedientes Digitales',
                description: 'Gestiona todos tus casos con timeline de eventos, documentos adjuntos (PDF, Word, imágenes) y cronograma de tareas con prioridades.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Calendar,
                title: 'Agenda Inteligente',
                description: 'Calendario de citas por abogado, con soporte para citas presenciales, virtuales y telefónicas. Autoagendamiento público para clientes.',
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: BrainCircuit,
                title: 'Consultas con IA',
                description: 'Pregunta sobre leyes, jurisprudencia de la SCJN o solicita ayuda para redacción legal. La IA responde con fuentes y referencias verificables.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Users,
                title: 'Cartera de Clientes',
                description: 'Ficha completa por cliente: datos de contacto, identificación oficial, expedientes vinculados, historial de citas y notas del abogado.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: Bell,
                title: 'Notificaciones en Tiempo Real',
                description: 'Alertas web instantáneas para citas próximas, tareas vencidas y audiencias. Arquitectura Realtime sobre Supabase.',
                color: 'bg-red-50 text-red-600',
              },
              {
                icon: Shield,
                title: 'Seguridad Multi-tenant',
                description: 'Cada despacho ve exclusivamente sus datos. Row Level Security (RLS) a nivel de base de datos, cifrado en reposo y auditoría de accesos.',
                color: 'bg-slate-100 text-slate-600',
              },
              {
                icon: FileText,
                title: 'Base de Conocimiento',
                description: 'Sube leyes, reglamentos y plantillas internas. La IA puede consultarlos como contexto adicional en tus preguntas.',
                color: 'bg-indigo-50 text-indigo-600',
              },
              {
                icon: BarChart3,
                title: 'Dashboard Ejecutivo',
                description: 'Resumen diario de citas, audiencias próximas, tareas pendientes y últimas consultas IA. Todo en un vistazo.',
                color: 'bg-teal-50 text-teal-600',
              },
              {
                icon: Lock,
                title: 'Recuperación de Contraseña',
                description: 'Flujo seguro de recuperación vía email con tokens de un solo uso. Validación de contraseñas con estándares de seguridad.',
                color: 'bg-rose-50 text-rose-600',
              },
            ].map((feature) => (
              <div key={feature.title} className="card p-6 card-interactive">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- SEGURIDAD ---- */}
      <section id="seguridad" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                Arquitectura de Seguridad
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Construido con seguridad desde el diseño
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                La información de tus clientes y expedientes es confidencial. JuridIQ implementa múltiples capas de protección para garantizar que solo las personas autorizadas accedan a los datos correctos.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    title: 'Row Level Security (RLS)',
                    desc: 'Las políticas de seguridad se aplican directamente en la base de datos PostgreSQL, no solo en la aplicación.',
                  },
                  {
                    title: 'Aislamiento multi-tenant estricto',
                    desc: 'Cada despacho opera en un espacio completamente aislado. No es posible acceder a datos de otros despachos.',
                  },
                  {
                    title: 'Autenticación con Supabase Auth',
                    desc: 'JWT tokens con expiración, refresh automático y soporte para verificación de email.',
                  },
                  {
                    title: 'Headers HTTP de seguridad',
                    desc: 'X-Frame-Options, CSP, HSTS, X-Content-Type-Options y más configurados en cada respuesta.',
                  },
                  {
                    title: 'Auditoría de operaciones',
                    desc: 'Registro automático de todas las operaciones críticas (creación, modificación y eliminación de registros).',
                  },
                  {
                    title: 'Rate limiting en API',
                    desc: 'Protección contra abuso en endpoints de IA y autenticación con límites por usuario y por hora.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-slate-900">{item.title}: </span>
                      <span className="text-sm text-slate-600">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-900 p-8 text-sm font-mono">
              <div className="text-slate-500 mb-2">-- Ejemplo de política RLS en PostgreSQL</div>
              <div className="text-emerald-400">CREATE POLICY</div>
              <div className="text-white ml-2">&quot;clientes_select&quot;</div>
              <div className="text-blue-400 ml-2">ON</div>
              <div className="text-white ml-2">clientes</div>
              <div className="text-blue-400 ml-2">FOR SELECT</div>
              <div className="text-blue-400 ml-2">USING (</div>
              <div className="text-amber-400 ml-4">is_superadmin()</div>
              <div className="text-white ml-4">OR</div>
              <div className="text-amber-400 ml-4">despacho_id =</div>
              <div className="text-purple-400 ml-6">get_user_despacho_id()</div>
              <div className="text-blue-400 ml-2">);</div>
              <div className="mt-6 text-slate-500">-- Nadie puede ver clientes de otro despacho</div>
              <div className="mt-1 text-slate-500">-- ni siquiera con acceso directo a la DB</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- PLANES ---- */}
      <section id="planes" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Planes para cada despacho
            </h2>
            <p className="text-lg text-slate-600">
              Escoge el plan que mejor se adapte al tamaño y necesidades de tu equipo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Básico',
                price: '$999',
                period: '/mes',
                description: 'Para abogados independientes',
                features: ['1 usuario', 'Hasta 50 expedientes', '20 consultas IA/mes', 'Agenda básica', 'Soporte por email'],
                highlighted: false,
                cta: 'Solicitar acceso Beta',
              },
              {
                name: 'Profesional',
                price: '$2,499',
                period: '/mes',
                description: 'Para despachos de 2–5 abogados',
                features: ['Hasta 5 usuarios', 'Expedientes ilimitados', '150 consultas IA/mes', 'Agenda + autoagendamiento', 'Base de conocimiento', 'Notificaciones web', 'Soporte prioritario'],
                highlighted: true,
                cta: 'Solicitar acceso Beta',
              },
              {
                name: 'Enterprise',
                price: '$4,999',
                period: '/mes',
                description: 'Para firmas legales grandes',
                features: ['Usuarios ilimitados', 'Todo ilimitado', 'IA sin límite', 'Integraciones API', 'SLA garantizado', 'Onboarding dedicado', 'Soporte 24/7'],
                highlighted: false,
                cta: 'Contactar ventas',
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-xl shadow-blue-500/25 scale-105'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold">
                    MÁS POPULAR
                  </div>
                )}
                <h3 className={`text-lg font-semibold ${plan.highlighted ? 'text-blue-100' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 mb-2">
                  <span className={`text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-blue-200' : 'text-slate-500'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-200' : 'text-slate-500'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-blue-200' : 'text-emerald-500'}`} />
                      <span className={plan.highlighted ? 'text-blue-50' : 'text-slate-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`btn w-full ${
                    plan.highlighted
                      ? 'bg-white text-blue-700 hover:bg-blue-50'
                      : 'btn-secondary hover:bg-slate-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA FINAL ---- */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="rounded-2xl gradient-hero p-12 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Moderniza tu despacho hoy
            </h2>
            <p className="text-lg text-blue-200 mb-8 max-w-xl mx-auto">
              JuridIQ está en acceso anticipado. Regístrate ahora y forma parte de los primeros despachos en usar la plataforma.
            </p>
            <Link href="/signup" className="btn btn-lg bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
              Solicitar Acceso Beta
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                  <Scale className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">
                  Jurid<span className="text-blue-600">IQ</span>
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Plataforma inteligente para despachos jurídicos mexicanos. En Beta activa.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Producto</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#funciones" className="hover:text-slate-900 transition-colors">Funciones</a></li>
                <li><a href="#planes" className="hover:text-slate-900 transition-colors">Planes</a></li>
                <li><a href="#seguridad" className="hover:text-slate-900 transition-colors">Seguridad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Acceso</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/login" className="hover:text-slate-900 transition-colors">Iniciar Sesión</Link></li>
                <li><Link href="/signup" className="hover:text-slate-900 transition-colors">Registrar Despacho</Link></li>
                <li><Link href="/recuperar" className="hover:text-slate-900 transition-colors">Recuperar Contraseña</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Aviso de Privacidad</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Términos de Servicio</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} JuridIQ. Todos los derechos reservados. — Versión Beta
          </div>
        </div>
      </footer>
    </div>
  );
}
