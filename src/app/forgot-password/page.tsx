import { requestPasswordReset } from './actions'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Mail, Check, CheckCircle2 } from 'lucide-react'
import ErrorBanner from '@/components/ErrorBanner'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; email?: string }>
}) {
  const params = await searchParams

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

      {/* Tarjeta Principal Flotante con Borde Degradado Fino y Sombra Doble */}
      <div className="w-full max-w-[420px] rounded-[40px] border border-white/20 hover:border-white/25 bg-slate-900/40 backdrop-blur-2xl px-7 py-9 sm:px-10 sm:py-12 shadow-[0_30px_70px_rgba(0,0,0,0.5),_0_0_50px_rgba(0,168,232,0.08)] relative z-10 animate-in fade-in zoom-in-95 duration-500 transition-all duration-300">
        
        {params?.success === '1' ? (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            {/* Logo con Anillo Glowing de Gradiente, Rotación y Badge de Éxito Integrado */}
            <div className="relative mb-8 group">
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
              
              {/* Badge de Visto (Checkmark) de Éxito en la esquina inferior derecha */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#090e21] shadow-lg shadow-emerald-500/30 z-20 animate-in zoom-in-50 duration-300">
                <Check className="w-4 h-4 text-white stroke-[3px]" />
              </div>
            </div>

            <h1 className="font-black tracking-tight text-white text-2xl sm:text-[1.65rem] leading-none mb-3 bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text">
              ¡Correo Enviado!
            </h1>
            
            <p className="text-slate-400 font-medium text-xs sm:text-sm leading-relaxed mb-5 px-1 text-balance">
              Hemos enviado un enlace de recuperación a:
            </p>

            {/* Pill/Badge con el email y animación de pulso */}
            <div className="w-full mb-6 py-3.5 px-4 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-center gap-2.5 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500"></span>
              <strong className="text-white font-extrabold text-xs sm:text-sm break-all">
                {params.email}
              </strong>
            </div>

            <p className="text-slate-400 font-medium text-xs leading-relaxed mb-8 px-1">
              Por favor, revisa tu bandeja de entrada <strong className="text-slate-200 font-bold">Gmail</strong> (incluyendo la carpeta de spam o correo no deseado).
            </p>

            <Link
              href="/login"
              className="w-full rounded-2xl bg-gradient-to-r from-[#00A8E8] to-[#007cb0] hover:from-[#00B4FA] hover:to-[#008cc2] py-4.5 font-black text-white transition-all duration-300 shadow-lg shadow-[#00A8E8]/20 hover:shadow-xl hover:shadow-[#00A8E8]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-sm sm:text-base flex items-center justify-center gap-2.5 group/btn"
            >
              <span>Regresar al Inicio de Sesión</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {/* Botón de regreso con botón circular premium */}
            <div className="mb-8 flex justify-start">
              <Link href="/login" className="group inline-flex items-center gap-2.5 text-slate-400 hover:text-[#00A8E8] font-bold text-xs tracking-wider transition-all duration-300">
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center border border-white/20 group-hover:border-[#00A8E8]/25 group-hover:bg-[#00A8E8]/10 transition-all duration-300">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300 text-slate-400 group-hover:text-[#00A8E8]" />
                </div>
                <span>Volver a Iniciar Sesión</span>
              </Link>
            </div>

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
                Recuperar Contraseña
              </h1>
              <p className="text-slate-400 font-medium text-xs sm:text-sm text-balance leading-relaxed px-1">
                Ingresa tu correo electrónico y te enviaremos un enlace mágico para restablecer tu contraseña.
              </p>
            </div>
          </>
        )}

        {params?.success !== '1' && (
          <form className="flex flex-col gap-6" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-2.5 block text-[10px] font-black uppercase tracking-widest text-[#00A8E8]"
              >
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00A8E8] transition-colors duration-300 z-10 pointer-events-none">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  className="w-full rounded-2xl border border-white/20 bg-slate-950/30 hover:bg-slate-950/50 hover:border-white/30 pl-11 pr-4 py-4 text-sm sm:text-base text-white placeholder-slate-500 outline-none transition-all duration-300 focus:bg-slate-950/80 focus:border-[#00A8E8] focus:ring-4 focus:ring-[#00A8E8]/10"
                />
              </div>
            </div>

            {params?.error && (
              <div className="animate-in fade-in duration-300">
                <ErrorBanner error={params.error} />
              </div>
            )}

            <button
              formAction={requestPasswordReset}
              className="w-full mt-2 rounded-2xl bg-gradient-to-r from-[#00A8E8] to-[#007cb0] hover:from-[#00B4FA] hover:to-[#008cc2] py-4.5 font-black text-white transition-all duration-300 shadow-lg shadow-[#00A8E8]/20 hover:shadow-xl hover:shadow-[#00A8E8]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-sm sm:text-base flex items-center justify-center gap-2.5 group/btn"
            >
              <span>Enviar Enlace de Recuperación</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
