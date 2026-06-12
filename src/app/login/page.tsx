import { login } from './actions'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Mail, Lock } from 'lucide-react'
import ErrorBanner from '@/components/ErrorBanner'
import PasswordInput from '@/components/PasswordInput'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, msg?: string }>
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#030712] font-sans selection:bg-[#00A8E8]/20 selection:text-white px-4 py-6 relative overflow-hidden">

      {/* Patrón de Rejilla / Grid Moderno de Fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 z-0"></div>

      {/* Luces de Neón Mesh Gradients Layered */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute -bottom-48 -left-20 w-[550px] h-[550px] bg-purple-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Tarjeta Principal Flotante con Borde Fino */}
      <div className="w-full max-w-[380px] rounded-3xl border border-white/15 hover:border-white/20 bg-slate-900/40 backdrop-blur-2xl px-6 py-6 sm:px-8 sm:py-8 shadow-[0_20px_50px_rgba(0,0,0,0.4),_0_0_40px_rgba(0,168,232,0.06)] relative z-10 animate-in fade-in zoom-in-95 duration-500 transition-all duration-300">

        {/* Botón de regreso con botón circular premium */}
        <div className="mb-4 flex justify-start">
          <Link href="/" className="group inline-flex items-center gap-2 text-slate-400 hover:text-[#00A8E8] font-bold text-xs tracking-wider transition-all duration-300">
            <div className="w-6.5 h-6.5 rounded-full bg-white/5 flex items-center justify-center border border-white/15 group-hover:border-[#00A8E8]/20 group-hover:bg-[#00A8E8]/10 transition-all duration-300">
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform duration-300 text-slate-400 group-hover:text-[#00A8E8]" />
            </div>
            <span>Volver al Inicio</span>
          </Link>
        </div>

        <div className="mb-4 text-center flex flex-col items-center">
          {/* Logo con Anillo Glowing de Gradiente y Rotación */}
          <div className="relative mb-3 group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#00A8E8] to-purple-600 opacity-15 blur-sm transition-all duration-500 group-hover:opacity-25"></div>
            <div className="w-14 h-14 flex items-center justify-center overflow-hidden rounded-full border border-white/15 bg-slate-950 shadow-[0_8px_20px_rgba(0,0,0,0.3)] relative z-10 p-0.5 transition-transform duration-500 group-hover:rotate-6">
              <Image
                src="/logo.jpg"
                alt="Logo Comunidad del Intercambio"
                width={52}
                height={52}
                className="object-cover w-full h-full rounded-full"
              />
            </div>
          </div>
          {params?.msg === 'evaluar' && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1.5 py-0.5 px-3 rounded-full bg-[#00A8E8]/10 text-[#00A8E8] text-[8px] font-black uppercase tracking-widest border border-[#00A8E8]/20 shadow-sm animate-bounce">
                <Sparkles className="w-2.5 h-2.5" /> Modo Evaluación
              </span>
            </div>
          )}
          <h1 className="font-display font-extrabold tracking-tight text-white text-xl sm:text-2xl leading-none mb-2 bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text">
            {params?.msg === 'evaluar' ? 'Inicia sesión 🚀' : '¡Bienvenido de vuelta!'}
          </h1>
          <p className="text-slate-400 font-medium text-xs text-balance leading-relaxed px-1">
            {params?.msg === 'evaluar' ? 'Ingresa a tu cuenta para desbloquear tu revisión técnica.' : 'Ingresa a tu cuenta para continuar con tus ensayos.'}
          </p>
        </div>

        <form className="flex flex-col gap-3" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-[#00A8E8]"
            >
              Correo Electrónico
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00A8E8] transition-colors duration-300 z-10 pointer-events-none">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                required
                className="w-full rounded-xl border border-white/15 bg-slate-950/30 hover:bg-slate-950/50 hover:border-white/25 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:bg-slate-950/80 focus:border-[#00A8E8] focus:ring-4 focus:ring-[#00A8E8]/5"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-[9px] font-bold uppercase tracking-widest text-[#00A8E8]"
              >
                Contraseña
              </label>
              <Link
                href="/forgot-password"
                className="text-[9px] font-bold text-[#00A8E8] hover:text-[#00bfff] transition-colors"
              >
                ¿La olvidaste?
              </Link>
            </div>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              required
              hasLeftIcon={true}
              className="py-2.5 text-sm"
            />
          </div>

          {params?.error && (
            <div className="animate-in fade-in duration-300">
              <ErrorBanner error={params.error} />
            </div>
          )}

          <div className="mt-1.5 flex flex-col gap-3">
            <button
              formAction={login}
              className="w-full rounded-xl bg-gradient-to-r from-[#00A8E8] to-[#007cb0] hover:from-[#00B4FA] hover:to-[#008cc2] py-3.5 font-bold text-white transition-all duration-300 shadow-lg shadow-[#00A8E8]/10 hover:shadow-xl hover:shadow-[#00A8E8]/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-sm flex items-center justify-center gap-2 group/btn"
            >
              <span>Iniciar Sesión</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="h-px bg-white/15 flex-1"></div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">¿No tienes cuenta?</span>
              <div className="h-px bg-white/15 flex-1"></div>
            </div>

            <Link
              href={params?.msg === 'evaluar' ? '/signup?msg=evaluar' : '/signup'}
              className="w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 py-2.5 font-bold text-slate-200 transition-all duration-300 hover:shadow-sm text-center text-sm flex items-center justify-center hover:border-white/25"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
