'use client'

import { use } from 'react'
import { signup } from './actions'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import ErrorBanner from '@/components/ErrorBanner'
import PasswordInput from '@/components/PasswordInput'

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string, msg?: string }>
}) {
  const params = use(searchParams);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#010B2B] font-sans selection:bg-[#00A8E8]/20 selection:text-white px-4 py-4 sm:px-3.5 sm:py-6 md:p-8 relative overflow-hidden">

      {/* Background Glows para que no sea un fondo plano */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#00A8E8] rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[415px] rounded-3xl sm:rounded-[32px] border border-white/10 bg-white px-5 py-6 sm:px-8 sm:py-10 shadow-[0_0_50px_rgba(0,168,232,0.15)] relative z-10">

        {/* Botón de regreso dentro de la tarjeta */}
        <div className="mb-6 flex justify-start">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 font-bold text-xs transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Inicio
          </Link>
        </div>

        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 flex items-center justify-center overflow-hidden rounded-full border border-slate-200 shadow-sm bg-black mb-4">
            <Image
              src="/logo.jpg"
              alt="Logo Comunidad del Intercambio"
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          {params?.msg === 'evaluar' && (
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-[#00A8E8]/10 text-[#00A8E8] text-[9px] font-black uppercase tracking-widest border border-[#00A8E8]/20 shadow-sm">
                <Sparkles className="w-3 h-3" /> Modo Evaluación
              </span>
            </div>
          )}
          <h1 className={`font-extrabold tracking-tight text-[#010B2B] text-balance ${params?.msg === 'evaluar' ? 'text-base sm:text-[1.1rem] leading-snug' : 'text-xl sm:text-2xl'}`}>
            {params?.msg === 'evaluar' ? 'A un paso de tu análisis 🚀' : '¡Únete a la Comunidad!'}
          </h1>
          <p className={`mt-2 text-slate-500 font-medium text-balance text-xs sm:text-sm ${params?.msg === 'evaluar' ? 'text-[13px] max-w-[280px]' : ''}`}>
            {params?.msg === 'evaluar' ? 'Crea tu cuenta gratuita para desbloquear el feedback de la IA.' : 'Crea tu cuenta gratuita para empezar a evaluar tus ensayos.'}
          </p>
        </div>

        <form 
          action={signup}
          onSubmit={(e) => {
            const emailInput = document.getElementById('email') as HTMLInputElement
            const passwordInput = document.getElementById('password') as HTMLInputElement
            if (emailInput?.value && passwordInput?.value) {
              sessionStorage.setItem('signup_email', emailInput.value)
              sessionStorage.setItem('signup_password', passwordInput.value)
            }
          }}
          className="flex flex-col gap-3.5 sm:gap-4" 
          noValidate
        >
          {/* Nombre y Apellido en grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label
                htmlFor="nombre"
                className="mb-1 sm:mb-1.5 block text-[11px] sm:text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Juan"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 sm:px-4 sm:py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#00A8E8] focus:ring-1 focus:ring-[#00A8E8]"
              />
            </div>
            <div>
              <label
                htmlFor="apellido"
                className="mb-1 sm:mb-1.5 block text-[11px] sm:text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                placeholder="Pérez"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 sm:px-4 sm:py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#00A8E8] focus:ring-1 focus:ring-[#00A8E8]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 sm:mb-1.5 block text-[11px] sm:text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              required
              onChange={(e) => {
                sessionStorage.setItem('signup_email', e.target.value)
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 sm:px-4 sm:py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#00A8E8] focus:ring-1 focus:ring-[#00A8E8]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 sm:mb-1.5 block text-[11px] sm:text-xs font-bold uppercase tracking-wide text-slate-500"
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
            />
          </div>

          {params?.error && (
            <ErrorBanner error={params.error} />
          )}

          <div className="mt-2.5 sm:mt-4 flex flex-col gap-3.5 sm:gap-4">
            <button
              type="submit"
              onClick={() => {
                const emailInput = document.getElementById('email') as HTMLInputElement
                const passwordInput = document.getElementById('password') as HTMLInputElement
                if (emailInput?.value && passwordInput?.value) {
                  sessionStorage.setItem('signup_email', emailInput.value)
                  sessionStorage.setItem('signup_password', passwordInput.value)
                }
              }}
              className="w-full rounded-xl bg-[#00A8E8] hover:bg-[#0090C7] px-4 py-3 sm:py-3.5 font-bold text-white transition-all shadow-lg shadow-[#00A8E8]/20 hover:-translate-y-0.5 text-sm sm:text-lg"
            >
              Crear mi cuenta gratis
            </button>

            <div className="flex items-center gap-3 my-1 sm:my-2">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">¿Ya tienes una cuenta?</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <Link
              href={params?.msg === 'evaluar' ? '/login?msg=evaluar' : '/login'}
              className="w-full rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 sm:py-3.5 font-bold text-slate-700 transition-all hover:-translate-y-0.5 text-center flex items-center justify-center text-sm sm:text-base"
            >
              Inicia Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
