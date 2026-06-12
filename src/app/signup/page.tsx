'use client'

import { use, useState, useEffect } from 'react'
import { signup } from './actions'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Sparkles, User, Mail, Lock, Phone } from 'lucide-react'
import ErrorBanner from '@/components/ErrorBanner'
import PasswordInput from '@/components/PasswordInput'

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, msg?: string }>
}) {
  const params = use(searchParams);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset loading state when an error is received from the server action redirect
  useEffect(() => {
    setIsSubmitting(false);
  }, [params?.error]);

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
            {params?.msg === 'evaluar' ? 'A un paso de tu análisis 🚀' : '¡Únete a la Comunidad!'}
          </h1>
          <p className="text-slate-400 font-medium text-xs text-balance leading-relaxed px-1">
            {params?.msg === 'evaluar' ? 'Crea tu cuenta gratuita para desbloquear el feedback.' : 'Crea tu cuenta gratuita para empezar a evaluar tus ensayos.'}
          </p>
        </div>

        <form 
          action={signup}
          onSubmit={(e) => {
            if (isSubmitting) {
              e.preventDefault();
              return;
            }
            setIsSubmitting(true);

            const emailInput = document.getElementById('email') as HTMLInputElement
            const passwordInput = document.getElementById('password') as HTMLInputElement
            if (emailInput?.value && passwordInput?.value) {
              sessionStorage.setItem('signup_email', emailInput.value)
              sessionStorage.setItem('signup_password', passwordInput.value)
            }
          }}
          className="flex flex-col gap-3" 
          noValidate
        >
          {/* Nombre y Apellido en grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="nombre"
                className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-[#00A8E8]"
              >
                Nombres
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00A8E8] transition-colors duration-300 z-10 pointer-events-none">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Ej. Juan Carlos"
                  required
                  className="w-full rounded-xl border border-white/15 bg-slate-950/30 hover:bg-slate-950/50 hover:border-white/25 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:bg-slate-950/80 focus:border-[#00A8E8] focus:ring-4 focus:ring-[#00A8E8]/5"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="apellido"
                className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-[#00A8E8]"
              >
                Apellidos
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00A8E8] transition-colors duration-300 z-10 pointer-events-none">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  placeholder="Ej. Pérez Gómez"
                  required
                  className="w-full rounded-xl border border-white/15 bg-slate-950/30 hover:bg-slate-950/50 hover:border-white/25 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:bg-slate-950/80 focus:border-[#00A8E8] focus:ring-4 focus:ring-[#00A8E8]/5"
                />
              </div>
            </div>
          </div>

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
                onChange={(e) => {
                  sessionStorage.setItem('signup_email', e.target.value)
                }}
                className="w-full rounded-xl border border-white/15 bg-slate-950/30 hover:bg-slate-950/50 hover:border-white/25 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:bg-slate-950/80 focus:border-[#00A8E8] focus:ring-4 focus:ring-[#00A8E8]/5"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-[#00A8E8]"
            >
              Teléfono / WhatsApp
            </label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00A8E8] transition-colors duration-300 z-10 pointer-events-none">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                placeholder="Ej. +593987654321"
                required
                className="w-full rounded-xl border border-white/15 bg-slate-950/30 hover:bg-slate-950/50 hover:border-white/25 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:bg-slate-950/80 focus:border-[#00A8E8] focus:ring-4 focus:ring-[#00A8E8]/5"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-[#00A8E8]"
            >
              Contraseña
            </label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              required
              onChange={(e) => {
                sessionStorage.setItem('signup_password', e.target.value)
              }}
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
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-[#00A8E8] to-[#007cb0] hover:from-[#00B4FA] hover:to-[#008cc2] py-3.5 font-bold text-white transition-all duration-300 shadow-lg shadow-[#00A8E8]/10 hover:shadow-xl hover:shadow-[#00A8E8]/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] text-sm flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creando cuenta...</span>
                </>
              ) : (
                <>
                  <span>Crear mi cuenta gratis</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="h-px bg-white/15 flex-1"></div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">¿Ya tienes una cuenta?</span>
              <div className="h-px bg-white/15 flex-1"></div>
            </div>

            <Link
              href={params?.msg === 'evaluar' ? '/login?msg=evaluar' : '/login'}
              className="w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 py-2.5 font-bold text-slate-200 transition-all duration-300 hover:shadow-sm text-center text-sm flex items-center justify-center hover:border-white/25"
            >
              Inicia Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
