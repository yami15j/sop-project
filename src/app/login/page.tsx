import { login, signup } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams;
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            La Comunidad del Intercambio
          </h1>
          <p className="mt-2 text-sm text-indigo-200">
            Ingresa para obtener feedback de tu ensayo con IA
          </p>
        </div>

        <form className="flex flex-col gap-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-indigo-100"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-indigo-100"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {params?.error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {params.error}
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            <button
              formAction={login}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 active:bg-indigo-700"
            >
              Iniciar Sesión
            </button>
            <button
              formAction={signup}
              className="w-full rounded-xl border border-indigo-500/50 bg-transparent px-4 py-3 font-semibold text-indigo-200 transition hover:bg-indigo-500/10 active:bg-indigo-500/20"
            >
              Crear Nueva Cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
