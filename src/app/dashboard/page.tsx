import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import TestButton from './TestButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener el historial del usuario
  const { data: ensayos } = await supabase
    .from('ensayos_enviados')
    .select(`
      *,
      feedback_generado (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const ensayosUsados = ensayos?.length || 0
  const ensayosRestantes = Math.max(0, 2 - ensayosUsados)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-bold">Tu Dashboard</h1>
          <div className="bg-white/10 px-4 py-2 rounded-full backdrop-blur-md text-sm border border-white/20">
            Ensayos Gratis Restantes: <span className="font-bold text-indigo-400">{ensayosRestantes} de 2</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Formulario */}
          <div className="lg:col-span-1 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-xl h-fit">
            <h2 className="text-xl font-semibold mb-4">Analizar Nuevo Ensayo</h2>
            
            {ensayosRestantes > 0 ? (
              <form action="/dashboard/analyze" method="GET" className="flex flex-col gap-4">
                <p className="text-sm text-indigo-200 mb-4">Tienes {ensayosRestantes} créditos. Ingresa los datos de tu beca y pega tu ensayo para que nuestra IA te evalúe.</p>
                <TestButton />
              </form>
            ) : (
              <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <p className="text-sm text-orange-300 mb-3">Has alcanzado tu límite de ensayos gratuitos.</p>
                <button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 py-3 rounded-xl font-bold text-white shadow-lg">
                  Quiero una Mentoría Premium
                </button>
              </div>
            )}
          </div>

          {/* Columna Derecha: Historial */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Tu Historial de Evaluaciones</h2>
            
            {ensayos?.length === 0 ? (
              <div className="bg-white/5 p-12 rounded-2xl border border-white/10 text-center text-indigo-200">
                Aún no has enviado ningún ensayo. ¡Sube tu primero para obtener feedback!
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {ensayos?.map((ensayo) => {
                  const feedback = ensayo.feedback_generado?.[0]
                  return (
                    <div key={ensayo.id} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{ensayo.beca_objetivo || 'Beca General'}</h3>
                          <p className="text-sm text-indigo-300">Destino: {ensayo.pais_destino || 'No especificado'}</p>
                        </div>
                        <div className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-sm font-bold border border-indigo-500/30">
                          {new Date(ensayo.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {feedback ? (
                        <div className="mt-4 p-4 bg-black/30 rounded-xl border border-white/5">
                          <p className="text-sm text-green-400 font-bold mb-2">Puntaje estimado: {feedback.puntaje}/10</p>
                          <p className="text-sm text-gray-300 line-clamp-3">
                            {feedback.raw_response}
                          </p>
                          <button className="mt-3 text-indigo-400 text-sm font-semibold hover:underline">Ver Feedback Completo →</button>
                        </div>
                      ) : (
                        <p className="text-sm text-yellow-500 mt-4">Analizando... (Procesando feedback)</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
