import { signup } from './actions'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#010B2B] font-sans selection:bg-[#00A8E8]/20 selection:text-white p-6 relative overflow-hidden">

      {/* Background Glows para que no sea un fondo plano */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#00A8E8] rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      {/* Botón de regreso */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white font-bold text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al Inicio
        </Link>
      </div>

      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white p-10 shadow-[0_0_50px_rgba(0,168,232,0.15)] relative z-10">
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
          <h1 className="text-2xl font-extrabold tracking-tight text-[#010B2B]">
            ¡Únete a la Comunidad!
          </h1>
          <p className="mt-2 text-slate-500 font-medium">
            Crea tu cuenta gratuita para empezar a evaluar tus ensayos.
          </p>
        </div>

        <form className="flex flex-col gap-5" noValidate>
          {/* Nombre y Apellido en grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nombre"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Juan"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#00A8E8] focus:ring-1 focus:ring-[#00A8E8]"
              />
            </div>
            <div>
              <label
                htmlFor="apellido"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                placeholder="Pérez"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#00A8E8] focus:ring-1 focus:ring-[#00A8E8]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#00A8E8] focus:ring-1 focus:ring-[#00A8E8]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#00A8E8] focus:ring-1 focus:ring-[#00A8E8]"
            />
          </div>

          {params?.error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-start gap-2">
              <span>⚠️</span> {params.error}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-4">
            <button
              formAction={signup}
              className="w-full rounded-xl bg-[#00A8E8] hover:bg-[#0090C7] px-4 py-4 font-bold text-white transition-all shadow-lg shadow-[#00A8E8]/20 hover:-translate-y-0.5 text-lg"
            >
              Crear mi cuenta gratis
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">¿Ya tienes una cuenta?</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <Link
              href="/login"
              className="w-full rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3.5 font-bold text-slate-700 transition-all hover:-translate-y-0.5 text-center flex items-center justify-center"
            >
              Inicia Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
