import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AnalyzeForm from '@/components/AnalyzeForm'
import FeedbackCard from '@/components/FeedbackCard'
import MentoriaForm from '@/components/MentoriaForm'
import DashboardSidebar from '@/components/DashboardSidebar'
import WelcomeBanner from '@/components/WelcomeBanner'
import { LogOut, Sparkles, FileText, Trophy, Zap, Users, Download } from 'lucide-react'
import { solicitarMentoria, logout, switchAccount } from './actions'

export default async function DashboardPage(props: { searchParams: Promise<{ ensayo?: string; bienvenido?: string; nuevo?: string; vista?: string }> | { ensayo?: string; bienvenido?: string; nuevo?: string; vista?: string } }) {
  const searchParams = await Promise.resolve(props.searchParams)

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

  const { data: lead, error: leadError } = await supabase
    .from('leads_mentoria')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (leadError) {
    console.error('[Dashboard] Error cargando lead:', leadError)
  }

  const ensayosUsados = ensayos?.length || 0
  const ensayosRestantes = Math.max(0, 2 - ensayosUsados)
  const selectedEnsayoId = searchParams?.ensayo
  const selectedEnsayo = selectedEnsayoId ? ensayos?.find(e => e.id === selectedEnsayoId) : null
  const vistaTexto = searchParams?.vista === 'texto'
  const mostrarBienvenida = searchParams?.bienvenido === '1'
  const esCuentaNueva = searchParams?.nuevo === '1'
  const nombreUsuario = user?.user_metadata?.nombre || user?.user_metadata?.full_name?.split(' ')[0] || null
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Mi cuenta'
  const avatarInitial = (displayName).charAt(0).toUpperCase()

  // Calcular puntaje promedio si hay feedback
  const puntajes = ensayos?.flatMap(e => e.feedback_generado?.map((f: any) => f.puntaje).filter(Boolean) ?? []) ?? []
  const puntajePromedio = puntajes.length > 0 ? Math.round(puntajes.reduce((a: number, b: number) => a + b, 0) / puntajes.length) : null

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e8f4fd 100%)' }}>

      {/* Banner de bienvenida */}
      {mostrarBienvenida && (
        <WelcomeBanner
          nombre={nombreUsuario}
          inicial={(nombreUsuario || user?.email || 'U').charAt(0).toUpperCase()}
          esCuentaNueva={esCuentaNueva}
        />
      )}

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40" style={{ background: 'linear-gradient(135deg, #010B2B 0%, #0d1f4a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 32px rgba(1,11,43,0.4)' }}>
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex justify-between items-center gap-4">

          {/* Logo + Título */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00A8E8, #0070b8)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-extrabold text-base leading-none tracking-tight">SOP Reviewer</div>
              <div className="text-slate-400 text-xs font-medium leading-none mt-0.5">Dashboard</div>
            </div>
          </div>

          {/* Centro: créditos */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,168,232,0.12)', border: '1px solid rgba(0,168,232,0.25)' }}>
            <Zap className="w-4 h-4 text-[#00A8E8]" />
            <span className="text-slate-300 text-sm font-medium">Créditos:</span>
            <span className="text-[#00A8E8] text-sm font-extrabold">{ensayosRestantes} / 2</span>
          </div>

          {/* Derecha: avatar + logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all bg-white/5 hover:bg-blue-500/15 border border-white/10 text-slate-100" title="Inicia sesión con otra cuenta">
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cambiar cuenta</span>
                </button>
              </form>

              <form action={logout}>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all bg-white/5 hover:bg-red-500/15 border border-white/10 text-slate-100" title="Salir a la página principal">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* ── STAT CARDS (fila superior) ── */}
      <div className="max-w-7xl mx-auto px-4 pt-5 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">

          {/* Card 1: Ensayos enviados */}
          {ensayosUsados > 0 && ensayos?.[0] ? (
            <Link href={`/dashboard?ensayo=${ensayos[0].id}&vista=texto`}
              className="group relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(145deg,#ffffff,#f5f7ff)', border: '1px solid rgba(99,102,241,0.15)', boxShadow: '0 2px 16px rgba(99,102,241,0.08)', cursor: 'pointer' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: 'linear-gradient(145deg,rgba(99,102,241,0.04),rgba(59,130,246,0.05))' }} />
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(to right,#6366f1,#3b82f6)' }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="text-2xl font-black leading-none tracking-tight" style={{ color: '#1e1b4b' }}>{ensayosUsados}</div>
                <div className="text-[11px] font-semibold leading-tight mt-0.5 uppercase tracking-wide" style={{ color: '#6b7280' }}>Ensayos</div>
                <div className="text-[10px] font-bold mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ color: '#6366f1' }}>Ver ensayo →</div>
              </div>
            </Link>
          ) : (
            <div className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(145deg,#ffffff,#f5f7ff)', border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 2px 12px rgba(99,102,241,0.05)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(to right,#6366f1,#3b82f6)' }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black leading-none tracking-tight" style={{ color: '#1e1b4b' }}>{ensayosUsados}</div>
                <div className="text-[11px] font-semibold leading-tight mt-0.5 uppercase tracking-wide" style={{ color: '#6b7280' }}>Ensayos</div>
              </div>
            </div>
          )}

          {/* Card 2: Créditos restantes */}
          {ensayosRestantes === 0 ? (
            <Link href="/dashboard#mentoria"
              className="group relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(145deg,#fff8f0,#fff3e8)', border: '1px solid rgba(249,115,22,0.2)', boxShadow: '0 2px 16px rgba(249,115,22,0.08)', cursor: 'pointer' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: 'linear-gradient(145deg,rgba(249,115,22,0.04),rgba(245,158,11,0.06))' }} />
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 12px rgba(249,115,22,0.4)' }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="text-2xl font-black leading-none tracking-tight" style={{ color: '#c2410c' }}>0</div>
                <div className="text-[11px] font-semibold leading-tight mt-0.5 uppercase tracking-wide" style={{ color: '#92400e' }}>Créditos</div>
                <div className="text-[10px] font-bold mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ color: '#f97316' }}>{lead ? 'Ver solicitud →' : 'Solicitar →'}</div>
              </div>
            </Link>
          ) : (
            <div className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(145deg,#f0f9ff,#e8f4fd)', border: '1px solid rgba(0,168,232,0.2)', boxShadow: '0 2px 16px rgba(0,168,232,0.07)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(to right,#00A8E8,#0070b8)' }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#00A8E8,#0078c8)', boxShadow: '0 4px 12px rgba(0,168,232,0.4)' }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black leading-none tracking-tight" style={{ color: '#0369a1' }}>{ensayosRestantes}</div>
                <div className="text-[11px] font-semibold leading-tight mt-0.5 uppercase tracking-wide" style={{ color: '#0284c7' }}>Créditos</div>
              </div>
            </div>
          )}

          {/* Card 3: Puntaje promedio */}
          {puntajePromedio !== null && ensayos?.[0] ? (
            <Link href={`/dashboard?ensayo=${ensayos[0].id}`}
              className="group relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(145deg,#f0fdf7,#ecfdf5)', border: '1px solid rgba(16,185,129,0.18)', boxShadow: '0 2px 16px rgba(16,185,129,0.08)', cursor: 'pointer' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background: 'linear-gradient(145deg,rgba(16,185,129,0.05),rgba(5,150,105,0.07))' }} />
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(to right,#10b981,#059669)' }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}>
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="text-2xl font-black leading-none tracking-tight" style={{ color: '#065f46' }}>{puntajePromedio}</div>
                <div className="text-[11px] font-semibold leading-tight mt-0.5 uppercase tracking-wide" style={{ color: '#047857' }}>Puntaje</div>
                <div className="text-[10px] font-bold mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ color: '#10b981' }}>Ver feedback →</div>
              </div>
            </Link>
          ) : (
            <div className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(145deg,#f0fdf7,#ecfdf5)', border: '1px solid rgba(16,185,129,0.15)', boxShadow: '0 2px 12px rgba(16,185,129,0.06)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(to right,#10b981,#059669)' }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.35)' }}>
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-2xl font-black leading-none tracking-tight" style={{ color: '#065f46' }}>{puntajePromedio !== null ? `${puntajePromedio}` : '—'}</div>
                <div className="text-[11px] font-semibold leading-tight mt-0.5 uppercase tracking-wide" style={{ color: '#047857' }}>Puntaje</div>
              </div>
            </div>
          )}

          {/* Card 4: IA Activa */}
          <div className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(145deg,#010B2B,#0d1f4a)', border: '1px solid rgba(0,168,232,0.25)', boxShadow: '0 2px 16px rgba(0,168,232,0.1)' }}>
            <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full opacity-15" style={{ background: 'radial-gradient(circle,#00A8E8,transparent)' }} />
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(to right,#00A8E8,#7c3aed)' }} />
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
              style={{ background: 'rgba(0,168,232,0.15)', border: '1px solid rgba(0,168,232,0.3)', boxShadow: '0 4px 12px rgba(0,168,232,0.2)' }}>
              <Sparkles className="w-4 h-4 text-[#00A8E8]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
                <span className="text-white font-extrabold text-sm tracking-tight">IA Activa</span>
              </div>
              <div className="text-[11px] font-semibold leading-tight mt-0.5 uppercase tracking-wide" style={{ color: 'rgba(148,163,184,0.85)' }}>Claude 4.6 Sonnet</div>
            </div>
          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
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
                  <div className="rounded-3xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(1,11,43,0.09)', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
                    {/* Header */}
                    <div className="px-8 py-6 flex flex-col md:flex-row justify-between md:items-center gap-4" style={{ background: 'linear-gradient(135deg, #010B2B 0%, #0d1f4a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
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

                    <div className="p-8 md:p-10">
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
                            className="rounded-2xl p-6 text-slate-700 leading-[1.9] text-[15px] whitespace-pre-wrap"
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
                          <p className="text-xl font-extrabold text-[#010B2B] mb-2">Analizando tu ensayo...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }

              if (vistaMentoria || (ensayosRestantes === 0 && !lead)) {
                return (
                  /* ─ VISTA MENTORÍA ─ */
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-extrabold text-[#010B2B]">Mentoría Premium</h2>
                        <p className="text-slate-500 mt-1">Lleva tu aplicación al siguiente nivel con expertos.</p>
                      </div>
                      {ensayosRestantes > 0 && (
                        <Link href="/dashboard" className="text-sm font-bold text-[#00A8E8] hover:underline">
                          ← Volver a analizar
                        </Link>
                      )}
                    </div>
                    <div id="mentoria" className="rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(160deg,#0a0f2e 0%,#0d1f4a 50%,#0f1e3d 100%)', border: '1px solid rgba(249,115,22,0.2)', boxShadow: '0 20px 60px rgba(1,11,43,0.5)' }}>
                      <div className="relative p-7">
                        <MentoriaForm
                          nombreDefault={user?.user_metadata?.full_name || user?.user_metadata?.name || ''}
                          emailDefault={user?.email || ''}
                          becaDefault={ensayos?.[0]?.beca_objetivo || ''}
                          paisDefault={ensayos?.[0]?.pais_destino || ''}
                        />
                      </div>
                    </div>
                  </div>
                )
              }

              if (lead && ensayosRestantes === 0) {
                return (
                  /* ─ VISTA SOLICITUD RECIBIDA ─ */
                  <div className="rounded-3xl overflow-hidden text-center" style={{ background: 'linear-gradient(145deg,#010B2B,#0d1f4a)', border: '1px solid rgba(74,222,128,0.25)', boxShadow: '0 12px 48px rgba(1,11,43,0.4)' }}>
                    <div className="p-10">
                      <h2 className="text-2xl font-extrabold text-white mb-3">¡Solicitud Recibida!</h2>
                      <p className="text-slate-400">Nuestro equipo te contactará muy pronto para agendar tu mentoría.</p>
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
                  <AnalyzeForm />
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
