import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AnalyzeForm from '@/components/AnalyzeForm'
import FeedbackCard from '@/components/FeedbackCard'
import MentoriaForm from '@/components/MentoriaForm'
import DashboardSidebar from '@/components/DashboardSidebar'
import WelcomeBanner from '@/components/WelcomeBanner'
import VerificationBanner from '@/components/VerificationBanner'
import PasswordUpdatedBanner from '@/components/PasswordUpdatedBanner'
import CollapsibleStats from '@/components/CollapsibleStats'
import { LogOut, Sparkles, FileText, Trophy, Zap, Users, Download } from 'lucide-react'
import { solicitarMentoria, logout, switchAccount } from './actions'

export default async function DashboardPage(props: { searchParams: Promise<{ ensayo?: string; bienvenido?: string; nuevo?: string; vista?: string; verificado?: string; contrasena_actualizada?: string }> }) {
  const searchParams = await props.searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: ensayos, error: ensayosError } = await supabase
    .from('ensayos_enviados')
    .select('*, feedback_generado (*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (ensayosError) {
    console.error('[Dashboard] Error cargando ensayos:', ensayosError)
  }

  const { data: leads, error: leadError } = await supabase
    .from('leads_mentoria')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const lead = leads && leads.length > 0 ? leads[0] : null

  if (leadError) {
    console.error('[Dashboard] Error cargando lead:', leadError)
  }

  const ensayosUsados = ensayos?.length || 0
  const ensayosRestantes = Math.max(0, 2 - ensayosUsados)
  const selectedEnsayoId = searchParams?.ensayo
  const selectedEnsayo = selectedEnsayoId ? ensayos?.find(e => e.id === selectedEnsayoId) : null
  const vistaTexto = searchParams?.vista === 'texto'
  const mostrarBienvenida = searchParams?.bienvenido === '1'
  const mostrarVerificado = searchParams?.verificado === '1'
  const contrasenaActualizada = searchParams?.contrasena_actualizada === '1'
  const esCuentaNueva = searchParams?.nuevo === '1'
  const nombreUsuario = user?.user_metadata?.nombre || user?.user_metadata?.full_name?.split(' ')[0] || null
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Mi cuenta'
  const avatarInitial = (displayName).charAt(0).toUpperCase()

  // Calcular puntaje promedio si hay feedback
  const puntajes = ensayos?.flatMap(e => e.feedback_generado?.map((f: any) => f.puntaje).filter(Boolean) ?? []) ?? []
  const puntajePromedio = puntajes.length > 0 ? Math.round(puntajes.reduce((a: number, b: number) => a + b, 0) / puntajes.length) : null

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)' }}>

      {/* Notificación de contraseña actualizada */}
      {contrasenaActualizada && (
        <PasswordUpdatedBanner />
      )}

      {/* Notificación de correo verificado */}
      {mostrarVerificado && !contrasenaActualizada && (
        <VerificationBanner nombre={nombreUsuario} />
      )}

      {/* Banner de bienvenida */}
      {mostrarBienvenida && !mostrarVerificado && !contrasenaActualizada && (
        <WelcomeBanner
          nombre={nombreUsuario}
          inicial={(nombreUsuario || user?.email || 'U').charAt(0).toUpperCase()}
          esCuentaNueva={esCuentaNueva}
        />
      )}

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 32px rgba(0,0,0,0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[86px] flex justify-between items-center gap-4 pt-2.5">

          {/* Logo + Título */}
          <div className="flex items-center gap-3">
            <CollapsibleStats
              ensayosUsados={ensayosUsados}
              ensayosRestantes={ensayosRestantes}
              puntajePromedio={puntajePromedio}
              ensayos={ensayos ?? null}
              lead={lead}
            />

            <div className="w-11 h-11 flex items-center justify-center overflow-hidden rounded-full border border-white/20 shadow-sm bg-black flex-shrink-0">
              <img
                src="/logo.jpg"
                alt="Logo Comunidad del Intercambio"
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <div className="text-white font-extrabold text-base leading-none tracking-tight">SOP Reviewer</div>
              <div className="text-slate-400 text-xs font-medium leading-none mt-0.5">Dashboard</div>
            </div>
          </div>

          {/* Centro: créditos */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,168,232,0.12)', border: '1px solid rgba(0,168,232,0.25)' }}>
            <span className="text-slate-300 text-sm font-medium">Créditos:</span>
            <span className="text-[#00A8E8] text-sm font-extrabold">{ensayosRestantes} / 2</span>
          </div>

          {/* Derecha: avatar + logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 sm:px-3 sm:py-1.5 rounded-full sm:bg-white/5 sm:border sm:border-white/10">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Foto" className="w-8 h-8 rounded-full object-cover border-2 border-[#00A8E8]/40" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00A8E8, #0060a0)' }}>
                  {avatarInitial}
                </div>
              )}
              <div className="hidden sm:flex flex-col">
                <span className="text-white font-bold text-sm leading-none">{displayName}</span>
                <span className="text-slate-400 text-xs leading-none mt-0.5 truncate max-w-[130px]">{user?.email}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <form action={switchAccount}>
                <button className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 rounded-xl text-[11px] font-bold transition-all bg-white/5 hover:bg-blue-500/15 border border-white/10 text-slate-100" title="Inicia sesión con otra cuenta">
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cambiar cuenta</span>
                </button>
              </form>

              <form action={logout}>
                <button className="flex items-center justify-center gap-1.5 w-9 h-9 sm:w-auto sm:h-auto sm:px-3.5 sm:py-2 rounded-xl text-[11px] font-bold transition-all bg-white/5 hover:bg-red-500/15 border border-white/10 text-slate-100" title="Salir a la página principal">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>



      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* SIDEBAR */}
          <DashboardSidebar
            ensayos={ensayos ?? null}
            selectedEnsayoId={selectedEnsayoId}
            ensayosRestantes={ensayosRestantes}
          />

          {/* ÁREA PRINCIPAL */}
          <div className="lg:col-span-8 xl:col-span-9 h-fit">
            {(() => {
              const vistaTexto = searchParams?.vista === 'texto'
              const vistaMentoria = searchParams?.vista === 'mentoria'

              if (selectedEnsayo) {
                return (
                  /* ─ VISTA SEGÚN PARÁMETRO ─ */
                  <div className="rounded-3xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.04)' }}>
                    {/* Header */}
                    <div className="px-3.5 sm:px-8 py-5 sm:py-6 flex flex-col md:flex-row justify-between md:items-center gap-4" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div>
                        <h2 className="text-2xl font-extrabold text-white mb-2">
                          {vistaTexto ? '📄 Mi Ensayo' : 'Resultados del Análisis'}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="px-3 py-1.5 rounded-lg font-bold text-[#00A8E8]" style={{ background: 'rgba(0,168,232,0.15)', border: '1px solid rgba(0,168,232,0.25)' }}>
                            🎯 {selectedEnsayo.beca_objetivo || 'Beca General'}
                          </span>
                          <span className="px-3 py-1.5 rounded-lg font-bold text-slate-300" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                            📍 {selectedEnsayo.pais_destino || 'Destino no especificado'}
                          </span>
                          {/* Botones de navegación interna */}
                          <div className="flex gap-2">
                            {selectedEnsayo.pdf_url && (
                              <a
                                href={selectedEnsayo.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 hover:bg-white/15"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                                download
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Descargar PDF</span>
                                <span className="sm:hidden">PDF</span>
                              </a>
                            )}
                            {selectedEnsayo.feedback_generado?.[0] && (
                              <Link
                                href={vistaTexto ? `/dashboard?ensayo=${selectedEnsayo.id}` : `/dashboard?ensayo=${selectedEnsayo.id}&vista=texto`}
                                className="px-3 py-1.5 rounded-lg font-bold transition-all text-xs hover:bg-white/15"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                              >
                                {vistaTexto ? '📊 Ver análisis IA' : '📄 Ver ensayo'}
                              </Link>
                            )}
                            <Link
                              href="/dashboard?vista=mentoria"
                              className="px-3 py-1.5 rounded-lg font-bold transition-all text-xs"
                              style={{ background: 'rgba(0,168,232,0.2)', border: '1px solid rgba(0,168,232,0.4)', color: '#00A8E8' }}
                            >
                              ⭐ Mentoría Premium
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Enviado el</div>
                        <div className="text-sm font-semibold text-slate-200">
                          {new Date(selectedEnsayo.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-8 md:p-10">
                      {vistaTexto ? (
                        /* ── VISTA SOLO TEXTO DEL ENSAYO ── */
                        <div>
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Texto del ensayo</span>
                            </div>
                            <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: '#f1f5f9', color: '#64748b' }}>
                              {selectedEnsayo.contenido?.trim().split(/\s+/).length ?? 0} palabras
                            </span>
                          </div>
                          <div
                            className="rounded-2xl p-4 sm:p-6 text-slate-700 leading-relaxed sm:leading-[1.9] text-[13px] sm:text-[15px] text-justify whitespace-pre-wrap"
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', fontFamily: 'Georgia, serif', minHeight: '400px' }}
                          >
                            {selectedEnsayo.contenido || 'No hay texto disponible.'}
                          </div>
                        </div>
                      ) : selectedEnsayo.feedback_generado?.[0] ? (
                        <FeedbackCard
                          rawResponse={selectedEnsayo.feedback_generado[0].raw_response}
                          puntajeEstimado={selectedEnsayo.feedback_generado[0].puntaje}
                          ensayoOriginal={selectedEnsayo.contenido}
                          becaObjetivo={selectedEnsayo.beca_objetivo}
                          paisDestino={selectedEnsayo.pais_destino}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-24 rounded-2xl" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '1px dashed #cbd5e1' }}>
                          <p className="text-xl font-extrabold text-[#0f172a] mb-2">Analizando tu ensayo...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              if (vistaMentoria) {
                return (
                  /* ─ VISTA MENTORÍA ─ */
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <h2 className="text-xl sm:text-2xl font-extrabold text-[#010B2B]">Mentoría Premium</h2>
                          {lead && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-sm"
                              style={{
                                background: 'rgba(0, 168, 232, 0.08)',
                                border: '1px solid rgba(0, 168, 232, 0.2)',
                                color: '#00A8E8'
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00A8E8] shadow-[0_0_6px_#00A8E8] animate-pulse" />
                              Solicitud Activa
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">Lleva tu aplicación al siguiente nivel con expertos.</p>
                      </div>
                      {ensayosRestantes > 0 && (
                        <Link href="/dashboard" className="text-xs sm:text-sm font-bold text-[#00A8E8] hover:underline flex-shrink-0">
                          ← Volver a analizar
                        </Link>
                      )}
                    </div>
                    <div id="mentoria" className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(160deg,#0a0f2e 0%,#0d1f4a 50%,#0f1e3d 100%)', border: '1px solid rgba(249,115,22,0.2)', boxShadow: '0 20px 60px rgba(1,11,43,0.5)' }}>
                      <div className="relative p-5 sm:p-8">
                        <MentoriaForm
                          nombreDefault={user?.user_metadata?.full_name || user?.user_metadata?.name || ''}
                          emailDefault={user?.email || ''}
                          becaDefault={ensayos?.[0]?.beca_objetivo || ''}
                          paisDefault={ensayos?.[0]?.pais_destino || ''}
                          hasExistingRequest={!!lead}
                          ensayoDefault={ensayos?.[0]?.contenido || ''}
                          pdfUrlDefault={ensayos?.[0]?.pdf_url || ''}
                        />
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                /* ─ VISTA NUEVO ENSAYO ─ */
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-6">
                    <h2 className="text-2xl font-extrabold text-[#010B2B]">Nuevo Análisis</h2>
                    <p className="text-slate-500 mt-1">Pega tu carta de motivación y obtén feedback instantáneo.</p>
                  </div>
                  <AnalyzeForm ensayosRestantes={ensayosRestantes} hasLead={!!lead} />
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
