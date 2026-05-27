import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { resetPassword } from './actions'
import Image from 'next/image'
import { KeyRound, Lock } from 'lucide-react'
import ErrorBanner from '@/components/ErrorBanner'
import PasswordInput from '@/components/PasswordInput'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  
  // Validar si el usuario está autenticado (es decir, el enlace de callback le otorgó sesión)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?error=' + encodeURIComponent('Debes utilizar el enlace enviado a tu correo electrónico para poder restablecer tu contraseña.'))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#030712] font-sans selection:bg-[#00A8E8]/20 selection:text-white px-4 py-8 relative overflow-hidden">
      
      {/* Patrón de Rejilla / Grid Moderno de Fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 z-0"></div>

      {/* Luces de Neón Mesh Gradients Layered */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute -bottom-48 -left-20 w-[550px] h-[550px] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Tarjeta Principal Flotante con Borde Fino */}
      <div className="w-full max-w-[420px] rounded-[40px] border border-white/20 hover:border-white/25 bg-slate-900/40 backdrop-blur-2xl px-7 py-9 sm:px-10 sm:py-12 shadow-[0_30px_70px_rgba(0,0,0,0.5),_0_0_50px_rgba(0,168,232,0.08)] relative z-10 animate-in fade-in zoom-in-95 duration-500 transition-all duration-300">
        
        <div className="mb-8 text-center flex flex-col items-center">
          {/* Logo con Anillo Glowing de Gradiente y Rotación */}
          <div className="relative mb-6 group">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#00A8E8] to-purple-600 opacity-20 blur-sm transition-all duration-500 group-hover:opacity-35"></div>
            <div className="w-20 h-20 flex items-center justify-center overflow-hidden rounded-full border-2 border-white/10 bg-slate-950 shadow-[0_10px_25px_rgba(0,0,0,0.3)] relative z-10 p-0.5 transition-transform duration-500 group-hover:rotate-6">
              <Image
                src="/logo.jpg"
                alt="Logo Comunidad del Intercambio"
                width={76}
                height={76}
                className="object-cover w-full h-full rounded-full"
              />
            </div>
          </div>
          <h1 className="font-black tracking-tight text-white text-2xl sm:text-[1.65rem] leading-none mb-3 bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text">
            Nueva Contraseña
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-sm text-balance leading-relaxed px-1">
            Crea una contraseña segura para tu cuenta de <strong className="text-sky-400 font-bold">SOP Reviewer</strong>.
          </p>
        </div>

        <form className="flex flex-col gap-6" noValidate>
          <div>
            <label
              htmlFor="password"
              className="mb-2.5 block text-[10px] font-black uppercase tracking-widest text-[#00A8E8]"
            >
              Nueva Contraseña
            </label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              required
              hasLeftIcon={true}
              className="py-4"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2.5 block text-[10px] font-black uppercase tracking-widest text-[#00A8E8]"
            >
              Confirmar Contraseña
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              required
              hasLeftIcon={true}
              className="py-4"
            />
          </div>

          {params?.error && (
            <div className="animate-in fade-in duration-300">
              <ErrorBanner error={params.error} />
            </div>
          )}

          <button
            formAction={resetPassword}
            className="w-full mt-2 rounded-2xl bg-gradient-to-r from-[#00A8E8] to-[#007cb0] hover:from-[#00B4FA] hover:to-[#008cc2] py-4.5 font-black text-white transition-all duration-300 shadow-lg shadow-[#00A8E8]/20 hover:shadow-xl hover:shadow-[#00A8E8]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-sm sm:text-base flex items-center justify-center gap-2.5 group/btn"
          >
            <span>Actualizar Contraseña</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
