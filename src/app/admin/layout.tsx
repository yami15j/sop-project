import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Verificar sesión activa en Supabase Auth
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Consultar el rol del usuario en la tabla profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol, nombre, email, telefono')
    .eq('user_id', user.id)
    .single()

  const esAdmin = profile?.rol === 'admin' || profile?.rol === 'mentor'
  const email   = profile?.email || user.email || ''
  const nombre  = profile?.nombre || 'Administrador'
  const telefono = profile?.telefono || null

  // 3. Si no tiene rol de admin/mentor → mostrar pantalla de acceso restringido
  if (!esAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00A8E8] rounded-full blur-[160px] opacity-10" />
        </div>

        <div className="relative z-10 w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl text-center shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6 mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-extrabold text-white mb-3">Acceso Restringido</h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
            Tu cuenta (<span className="text-[#00A8E8] font-bold">{email}</span>) no tiene permisos de administrador.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="py-3.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a mi Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 4. Cargar notificaciones recientes (últimos registros + ensayos + leads)
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: recentEssays } = await supabase
    .from('ensayos_enviados')
    .select('id, nombre_usuario, email_usuario, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: recentLeads } = await supabase
    .from('leads_mentoria')
    .select('id, nombre, email, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: recentProfiles } = await supabase
    .from('profiles')
    .select('id, nombre, email, created_at, rol')
    .neq('rol', 'admin')
    .neq('rol', 'mentor')
    .order('created_at', { ascending: false })
    .limit(8)

  // Combinar y ordenar por fecha
  const notificaciones = [
    ...(recentEssays || []).map(e => ({
      id: `essay-${e.id}`,
      type: 'essay' as const,
      nombre: e.nombre_usuario || e.email_usuario || 'Usuario',
      descripcion: 'Envió un nuevo ensayo para evaluación',
      fecha: e.created_at,
      isNew: e.created_at >= since24h
    })),
    ...(recentLeads || []).map(l => ({
      id: `lead-${l.id}`,
      type: 'lead' as const,
      nombre: l.nombre || l.email || 'Lead',
      descripcion: 'Registró una solicitud de mentoría',
      fecha: l.created_at,
      isNew: l.created_at >= since24h
    })),
    ...(recentProfiles || []).map(p => ({
      id: `register-${p.id}`,
      type: 'register' as const,
      nombre: p.nombre || p.email || 'Estudiante',
      descripcion: 'Se registró como nuevo estudiante',
      fecha: p.created_at || new Date(0).toISOString(),
      isNew: p.created_at ? p.created_at >= since24h : false
    }))
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 15)

  // 5. Admin válido → renderizar panel
  return (
    <AdminLayoutClient
      email={email}
      nombre={nombre}
      telefono={telefono}
      notificaciones={notificaciones}
    >
      {children}
    </AdminLayoutClient>
  )
}
