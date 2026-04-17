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
  BarChart3,
  Bell,
  Star,
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
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Funciones
              </a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Planes
              </a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Testimonios
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Iniciar Sesión
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Comenzar Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-3xl opacity-60" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-30 animate-float" />
          <div className="absolute top-40 left-10 w-56 h-56 bg-amber-100 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              Potenciado con Inteligencia Artificial
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Tu despacho jurídico,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                inteligente y organizado
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Centraliza expedientes, agenda citas, gestiona clientes y consulta leyes con IA.
              Todo lo que tu despacho necesita en una sola plataforma.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link href="/signup" className="btn btn-primary btn-lg w-full sm:w-auto shadow-lg shadow-blue-500/25">
                Prueba Gratis 14 Días
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="btn btn-secondary btn-lg w-full sm:w-auto">
                Ver Funciones
              </a>
            </div>

            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Sin tarjeta de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Setup en 5 minutos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Soporte incluido
              </span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-900/10">
              <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 text-center text-xs text-slate-400">app.juridiq.com</div>
              </div>
              <div className="bg-gradient-to-b from-slate-50 to-white p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Clientes Activos', value: '24', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Expedientes Abiertos', value: '18', color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Citas Hoy', value: '5', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Consultas IA', value: '142', color: 'text-purple-600', bg: 'bg-purple-50' },
                  ].map((stat) => (
                    <div key={stat.label} className={`${stat.bg} rounded-lg p-4 border border-slate-100`}>
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-white border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-700 mb-3">Citas de Hoy</div>
                    <div className="space-y-2">
                      {['10:00 - Juan Pérez (Fiscal)', '14:30 - María García (Civil)', '16:00 - ETN S.A. (Mercantil)'].map((cita) => (
                        <div key={cita} className="flex items-center gap-2 text-sm text-slate-600 px-3 py-2 rounded-md bg-slate-50">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          {cita}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-700 mb-3">Tareas Urgentes</div>
                    <div className="space-y-2">
                      {[
                        { task: 'Recurso de revocación SAT', date: 'Vence 25 Abr' },
                        { task: 'Alegatos custodia', date: 'Vence 27 Abr' },
                        { task: 'Demanda mercantil', date: 'Vence 1 May' },
                      ].map((t) => (
                        <div key={t.task} className="flex items-center justify-between text-sm px-3 py-2 rounded-md bg-slate-50">
                          <span className="text-slate-600">{t.task}</span>
                          <span className="text-xs text-red-500 font-medium">{t.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Todo lo que tu despacho necesita
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Desde la gestión de expedientes hasta consultas legales con IA,
              JuridIQ tiene cada herramienta para ser más productivo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {[
              {
                icon: FolderOpen,
                title: 'Expedientes Digitales',
                description: 'Gestiona todos tus casos con timeline de eventos, documentos adjuntos y cronograma de tareas en un solo lugar.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                icon: Calendar,
                title: 'Agenda Inteligente',
                description: 'Calendario con citas por abogado, autoagendamiento público para clientes y recordatorios automáticos por WhatsApp.',
                color: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: BrainCircuit,
                title: 'Consultas con IA',
                description: 'Pregunta sobre leyes, jurisprudencia o redacción legal. Claude AI te responde con fuentes y referencias.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Users,
                title: 'Cartera de Clientes',
                description: 'Ficha completa por cliente: contacto, expedientes vinculados, historial de citas y documentos.',
                color: 'bg-amber-50 text-amber-600',
              },
              {
                icon: Bell,
                title: 'Notificaciones Móviles',
                description: 'Recordatorios de citas, tareas vencidas y audiencias próximas vía WhatsApp y notificaciones push.',
                color: 'bg-red-50 text-red-600',
              },
              {
                icon: Shield,
                title: 'Seguridad Multi-tenant',
                description: 'Cada abogado ve solo su cartera. RLS a nivel base de datos. Datos encriptados y backups automáticos.',
                color: 'bg-slate-100 text-slate-600',
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

      {/* ---- STATS ---- */}
      <section className="py-16 gradient-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Despachos Activos' },
              { value: '12,000+', label: 'Expedientes Gestionados' },
              { value: '98%', label: 'Satisfacción' },
              { value: '45,000+', label: 'Consultas IA Realizadas' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- PRICING ---- */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Planes diseñados para despachos
            </h2>
            <p className="text-lg text-slate-600">
              Elige el plan que mejor se adapte al tamaño de tu equipo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Básico',
                price: '$999',
                period: '/mes',
                description: 'Para abogados independientes',
                features: ['1 usuario', '50 expedientes', '20 consultas IA/mes', 'Agenda básica', 'Soporte por email'],
                highlighted: false,
              },
              {
                name: 'Profesional',
                price: '$2,499',
                period: '/mes',
                description: 'Para despachos de 2-4 abogados',
                features: ['4 usuarios', 'Expedientes ilimitados', '100 consultas IA/mes', 'Agenda + autoagendamiento', 'WhatsApp recordatorios', 'Base de conocimiento', 'Soporte prioritario'],
                highlighted: true,
              },
              {
                name: 'Enterprise',
                price: '$4,999',
                period: '/mes',
                description: 'Para firmas legales grandes',
                features: ['Usuarios ilimitados', 'Todo ilimitado', 'IA sin límite', 'API dedicada', 'Facturación electrónica', 'SLA 99.9%', 'Soporte dedicado'],
                highlighted: false,
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
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
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
                  Comenzar Ahora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- TESTIMONIALS ---- */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Lic. Roberto Hernández',
                role: 'Socio Director - Hernández & Asociados',
                quote: 'JuridIQ transformó cómo manejamos nuestros expedientes. La IA nos ahorra horas de investigación cada semana.',
              },
              {
                name: 'Lic. Patricia Morales',
                role: 'Abogada Penalista',
                quote: 'El autoagendamiento ha sido increíble. Mis clientes agendan solos y yo solo confirmo. ¡Adiós llamadas innecesarias!',
              },
              {
                name: 'Lic. Fernando Soto',
                role: 'Socio - Soto, Mendez & Padilla',
                quote: 'La seguridad multi-tenant nos da tranquilidad. Cada abogado tiene su cartera aislada y los datos están protegidos.',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="card p-6">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-xs text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="rounded-2xl gradient-hero p-12 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Moderniza tu despacho hoy
            </h2>
            <p className="text-lg text-blue-200 mb-8 max-w-xl mx-auto">
              Únete a cientos de despachos que ya usan JuridIQ para ser más eficientes.
            </p>
            <Link href="/signup" className="btn btn-lg bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
              Comenzar Prueba Gratuita
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
                Plataforma inteligente para despachos jurídicos modernos.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Producto</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Funciones</a></li>
                <li><a href="#pricing" className="hover:text-slate-900 transition-colors">Planes</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Seguridad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Soporte</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} JuridIQ. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
