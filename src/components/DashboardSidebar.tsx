'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlusCircle, FileText, ChevronRight, Menu, X, Zap, Clock } from 'lucide-react'

interface Ensayo {
  id: string
  beca_objetivo: string | null
  pais_destino: string | null
  created_at: string
  feedback_generado?: { puntaje?: number }[]
}

interface DashboardSidebarProps {
  ensayos: Ensayo[] | null
  selectedEnsayoId?: string
  ensayosRestantes: number
  creditosExtra?: number
}

export default function DashboardSidebar({ ensayos, selectedEnsayoId, ensayosRestantes, creditosExtra = 0 }: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const totalCreditos = 2 + creditosExtra
  const creditPercent = totalCreditos > 0 ? Math.min(100, (ensayosRestantes / totalCreditos) * 100) : 0
  const creditColor = ensayosRestantes > 0 ? '#0f172a' : '#f97316'

  const sidebarContent = (
    <div className="flex flex-col gap-2.5">

      {/* Nuevo Ensayo Button */}
      <Link
        href="/dashboard"
        onClick={(e) => {
          setMobileOpen(false)
          // Forzar una navegación limpia/recarga para limpiar todo el estado del formulario (PDFs, textos, errores y referencias en memoria)
          e.preventDefault()
          window.location.href = '/dashboard'
        }}
        className="group flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all font-bold"
        style={
          !selectedEnsayoId
            ? { background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
            : { background: 'white', color: '#334155', border: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: '0 1px 6px rgba(0,0,0,0.01)' }
        }
      >
        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
          style={!selectedEnsayoId ? { background: 'rgba(255,255,255,0.08)' } : { background: '#f1f5f9' }}>
          <PlusCircle className="w-4 h-4" style={{ color: !selectedEnsayoId ? '#ffffff' : '#94a3b8' }} />
        </div>
        <span className="text-xs">Nuevo Ensayo</span>
        {!selectedEnsayoId && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white opacity-80" />}
      </Link>

      {/* Créditos card */}
      <div className="rounded-lg p-2.5" style={{ background: 'white', border: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: '0 1px 6px rgba(0,0,0,0.01)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">Créditos</span>
          </div>
          <span className="text-[11px] font-extrabold" style={{ color: '#0f172a' }}>{ensayosRestantes} / {totalCreditos}</span>
        </div>
        {/* Barra de progreso */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${creditPercent}%`, background: ensayosRestantes > 0 ? 'linear-gradient(to right, #1e293b, #0f172a)' : 'linear-gradient(to right, #f97316, #f59e0b)' }}
          />
        </div>
        <p className="text-[10px] text-slate-400 font-medium mt-1.5">
          {ensayosRestantes > 0 ? `${ensayosRestantes} análisis disponible${ensayosRestantes > 1 ? 's' : ''}` : 'Sin créditos. Solicita mentoría ↓'}
          {creditosExtra > 0 && <span className="ml-1 text-emerald-500 font-bold">(+{creditosExtra})</span>}
        </p>
      </div>

      {/* Historial */}
      <div className="mt-0.5">
        <div className="flex items-center gap-1.5 px-1 mb-1.5">
          <Clock className="w-3 h-3 text-slate-400" />
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Historial</h3>
        </div>

        {!ensayos || ensayos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 rounded-xl text-center"
            style={{ background: 'white', border: '1px dashed rgba(0, 0, 0, 0.12)' }}>
            <FileText className="w-6 h-6 text-slate-300 mb-1.5" />
            <p className="text-xs text-slate-400 font-medium">Aún no tienes ensayos.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {ensayos.map((ensayo) => {
              const puntaje = ensayo.feedback_generado?.[0]?.puntaje
              const isSelected = selectedEnsayoId === ensayo.id
              return (
                <Link
                  key={ensayo.id}
                  href={`/dashboard?ensayo=${ensayo.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all"
                  style={
                    isSelected
                      ? {
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        color: 'white',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }
                      : { background: 'white', color: '#475569', border: '1px solid rgba(0, 0, 0, 0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }
                  }
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: isSelected ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
                    <FileText className="w-3 h-3" style={{ color: isSelected ? '#ffffff' : '#94a3b8' }} />
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="truncate text-[11.5px] font-bold leading-tight">
                      {ensayo.beca_objetivo || 'Ensayo General'}
                    </span>
                    <span className="text-[9.5px] font-medium mt-0.5" style={{ color: isSelected ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
                      {ensayo.pais_destino ? `📍 ${ensayo.pais_destino}` : new Date(ensayo.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {typeof puntaje === 'number' ? (
                    <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded flex-shrink-0 transition-all"
                      style={{
                        background: isSelected
                          ? 'rgba(255,255,255,0.08)'
                          : puntaje >= 8 ? '#f0fdf4' : puntaje >= 5 ? '#fff7ed' : '#fef2f2',
                        color: isSelected
                          ? '#ffffff'
                          : puntaje >= 8 ? '#16a34a' : puntaje >= 5 ? '#ea580c' : '#dc2626',
                        border: isSelected ? '1px solid rgba(255,255,255,0.12)' : `1px solid ${puntaje >= 8 ? '#dcfce7' : puntaje >= 5 ? '#ffedd5' : '#fee2e2'}`
                      }}>
                      {puntaje}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* ── HAMBURGUESA MÓVIL ── */}
      <div className="lg:hidden flex items-center justify-between mb-6 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <span className="font-extrabold text-[#0f172a] text-sm sm:text-base">
          {selectedEnsayoId ? 'Ver Evaluación' : 'Nuevo Ensayo'}
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-slate-700 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all bg-slate-100 border border-slate-200 hover:bg-slate-200"
        >
          <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Mis Ensayos
        </button>
      </div>

      {/* ── DRAWER MÓVIL ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full p-6 overflow-y-auto flex flex-col gap-4 animate-in slide-in-from-right duration-300"
            style={{ background: '#f8fafc', boxShadow: '-4px 0 40px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-extrabold text-[#0f172a] text-xl">Mis Ensayos</h2>
              <button onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                style={{ background: '#e2e8f0' }}>
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* ── SIDEBAR ESCRITORIO ── */}
      <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-3">
        {sidebarContent}
      </div>
    </>
  )
}
