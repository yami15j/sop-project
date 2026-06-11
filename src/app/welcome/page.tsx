import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Sparkles, FileText, Star } from 'lucide-react'

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ nombre?: string }>
}) {
  // Intentar obtener el usuario de la sesión activa
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const params = await searchParams

  // Si hay sesión activa, usar los datos de Supabase; si no (registro pendiente de confirmación), usar la URL
  const nombre =
    user?.user_metadata?.nombre ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    (params?.nombre ? decodeURIComponent(params.nombre) : null) ||
    'Estudiante'

  const inicial = nombre.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#010B2B] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* ── Glows de fondo ───────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -right-60 w-[700px] h-[700px] bg-[#00A8E8] rounded-full blur-[140px] opacity-20 animate-pulse" />
        <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[140px] opacity-20 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00A8E8] rounded-full blur-[180px] opacity-10" />
      </div>

      {/* ── Estrellas decorativas ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {[
          'top-[12%] left-[8%]',
          'top-[22%] right-[10%]',
          'top-[65%] left-[5%]',
          'bottom-[18%] right-[8%]',
          'top-[45%] left-[92%]',
        ].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} text-[#00A8E8]/30 text-2xl animate-spin`}
            style={{ animationDuration: `${8 + i * 3}s` }}
          >
            ✦
          </div>
        ))}
      </div>

      {/* ── Contenido principal ───────────────────── */}
      <div className="relative z-10 w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Avatar con inicial */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Foto de perfil"
                className="w-28 h-28 rounded-full object-cover border-4 border-white/10 shadow-2xl shadow-[#00A8E8]/40"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#00A8E8] to-blue-700 flex items-center justify-center text-white font-extrabold text-5xl shadow-2xl shadow-[#00A8E8]/40 border-4 border-white/10">
                {inicial}
              </div>
            )}
            {/* Badge check verde */}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-4 border-[#010B2B]">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Texto de bienvenida */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#00A8E8]/10 border border-[#00A8E8]/20 text-[#00A8E8] text-sm font-bold px-4 py-1.5 rounded-full mb-5">
            <Sparkles className="w-4 h-4" />
            {user ? '¡Sesión iniciada!' : '¡Cuenta creada!'}
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            {user ? '¡Hola de nuevo,' : 'Bienvenido/a,'}<br />
            <span className="text-[#00A8E8]">{nombre} 👋</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
            {user
              ? 'Tu sesión está activa. Continúa desde donde lo dejaste y sigue trabajando en tu ensayo.'
              : 'Ya formas parte de La Comunidad del Intercambio. Estás un paso más cerca de tu beca soñada.'
            }
          </p>
        </div>

        {/* Tarjeta de beneficios */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-6 mb-8">
          <h2 className="text-white font-bold text-base mb-5 flex items-center gap-2">
            <Star className="w-4 h-4 text-[#00A8E8]" />
            Lo que puedes hacer
          </h2>
          <div className="flex flex-col gap-4">
            {[
              {
                icon: FileText,
                title: '2 evaluaciones gratuitas',
                desc: 'Sube tu Personal Statement y recibe feedback de IA al instante.',
                color: 'text-[#00A8E8]',
                bg: 'bg-[#00A8E8]/10',
              },
              {
                icon: Star,
                title: 'Análisis profesional',
                desc: 'Descubre tus fortalezas y áreas de mejora específicas para tu beca.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
              },
              {
                icon: CheckCircle,
                title: 'Descarga tu reporte en PDF',
                desc: 'Guarda y comparte el análisis completo de tu ensayo.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{item.title}</div>
                  <div className="text-slate-400 text-xs mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center gap-3 bg-[#00A8E8] hover:bg-[#0090C7] text-white py-5 rounded-2xl font-extrabold text-lg transition-all shadow-2xl shadow-[#00A8E8]/30 hover:-translate-y-1"
        >
          <Sparkles className="w-5 h-5" />
          {user ? 'Ir al Dashboard' : 'Empezar a evaluar mi ensayo'}
          <ArrowRight className="w-5 h-5" />
        </Link>

        <p className="text-center text-slate-600 text-xs mt-5">
          La Comunidad del Intercambio · Evaluación de ensayos con IA
        </p>
      </div>
    </div>
  )
}
