import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSolicitudes } from '@/lib/services/solicitudes.service';
import SolicitudesClient from './SolicitudesClient';

export default async function SolicitudesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Verificar que sea superadmin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'superadmin') {
    redirect('/dashboard');
  }

  // Cargar solicitudes
  const { data: solicitudes } = await getSolicitudes();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel Superadmin - Solicitudes de Registro</h1>
          <p className="text-slate-500 mt-1">
            Gestiona los leads que han solicitado acceso a JuridIQ.
          </p>
        </div>
      </div>

      <SolicitudesClient initialSolicitudes={solicitudes || []} />
    </div>
  );
}
