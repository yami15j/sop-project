import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { resetPassword } from './actions'
import Image from 'next/image'
import { KeyRound, ShieldCheck } from 'lucide-react'
import ErrorBanner from '@/components/ErrorBanner'

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#010B2B] font-sans selection:bg-[#00A8E8]/20 selection:text-white px-4 py-4 sm:px-3.5 sm:py-6 md:p-8 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#00A8E8] rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[390px] rounded-3xl sm:rounded-[32px] border border-white/10 bg-white px-5 py-6 sm:px-8 sm:py-10 shadow-[0_0_50px_rgba(0,168,232,0.15)] relative z-10">
        
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
          <h1 className="font-extrabold tracking-tight text-[#010B2B] text-xl sm:text-2xl">
            Nueva Contraseña
          </h1>
          <p className="mt-2 text-slate-500 font-medium text-xs sm:text-sm text-balance">
            Crea una contraseña segura para tu cuenta de <strong className="text-slate-700 font-bold">SOP Reviewer</strong>.
          </p>
        </div>

        <form className="flex flex-col gap-4" noValidate>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[11px] sm:text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Nueva Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 sm:px-4 sm:py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#00A8E8] focus:ring-1 focus:ring-[#00A8E8]"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-[11px] sm:text-xs font-bold uppercase tracking-wide text-slate-500"
            >
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repite la contraseña"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 sm:px-4 sm:py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#00A8E8] focus:ring-1 focus:ring-[#00A8E8]"
            />
          </div>

          {params?.error && (
            <ErrorBanner error={params.error} />
          )}

          <button
            formAction={resetPassword}
            className="w-full mt-2 rounded-xl bg-[#00A8E8] hover:bg-[#0090C7] px-4 py-3 sm:py-3.5 font-bold text-white transition-all shadow-lg shadow-[#00A8E8]/20 hover:-translate-y-0.5 text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  )
}
