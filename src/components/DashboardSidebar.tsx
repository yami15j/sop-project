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
}

export default function DashboardSidebar({ ensayos, selectedEnsayoId, ensayosRestantes }: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const creditPercent = (ensayosRestantes / 2) * 100
  const creditColor = ensayosRestantes > 0 ? '#00A8E8' : '#f97316'

  const sidebarContent = (
    <div className="flex flex-col gap-3">

      {/* Nuevo Ensayo Button */}
      <Link
        href="/dashboard"
        onClick={() => setMobileOpen(false)}
        className="group flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold"
        style={
          !selectedEnsayoId
            ? { background: 'linear-gradient(135deg, #010B2B, #0d1f4a)', color: 'white', boxShadow: '0 4px 20px rgba(1,11,43,0.25)', border: '1px solid rgba(0,168,232,0.2)' }
            : { background: 'white', color: '#334155', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }
        }
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={!selectedEnsayoId ? { background: 'rgba(0,168,232,0.2)' } : { background: '#f1f5f9' }}>
          <PlusCircle className="w-5 h-5" style={{ color: !selectedEnsayoId ? '#00A8E8' : '#94a3b8' }} />
        </div>
        <span className="text-base">Nuevo Ensayo</span>
        {!selectedEnsayoId && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
      </Link>

      {/* Créditos card */}
      <div className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: creditColor }} />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Créditos</span>
          </div>
          <span className="text-sm font-extrabold" style={{ color: creditColor }}>{ensayosRestantes} / 2</span>
        </div>
        {/* Barra de progreso */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${creditPercent}%`, background: ensayosRestantes > 0 ? 'linear-gradient(to right, #00A8E8, #0070b8)' : 'linear-gradient(to right, #f97316, #f59e0b)' }}
          />
        </div>
        <p className="text-xs text-slate-400 font-medium mt-2">
          {ensayosRestantes > 0 ? `${ensayosRestantes} análisis disponible${ensayosRestantes > 1 ? 's' : ''}` : 'Sin créditos. Solicita mentoría ↓'}
        </p>
      </div>

      {/* Historial */}
      <div className="mt-1">
        <div className="flex items-center gap-2 px-1 mb-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Historial</h3>
        </div>

        {!ensayos || ensayos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 rounded-2xl text-center"
            style={{ background: 'white', border: '1px dashed #cbd5e1' }}>
            <FileText className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 font-medium">Aún no tienes ensayos.</p>
            <p className="text-xs text-slate-400 mt-1">Tu primer análisis aparecerá aquí.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ensayos.map((ensayo) => {
              const puntaje = ensayo.feedback_generado?.[0]?.puntaje
              const isSelected = selectedEnsayoId === ensayo.id
              return (
                <Link
                  key={ensayo.id}
                  href={`/dashboard?ensayo=${ensayo.id}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
                  style={
                    isSelected
                      ? { background: 'linear-gradient(135deg, #00A8E8, #0070b8)', color: 'white', boxShadow: '0 4px 16px rgba(0,168,232,0.3)', border: '1px solid transparent' }
                      : { background: 'white', color: '#475569', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
                  }
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isSelected ? 'rgba(255,255,255,0.2)' : '#f1f5f9' }}>
                    <FileText className="w-4 h-4" style={{ color: isSelected ? 'white' : '#94a3b8' }} />
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="truncate text-sm font-bold">
                      {ensayo.beca_objetivo || 'Ensayo General'}
                    </span>
                    <span className="text-xs font-medium mt-0.5" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                      {ensayo.pais_destino ? `📍 ${ensayo.pais_destino}` : new Date(ensayo.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {typeof puntaje === 'number' ? (
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg flex-shrink-0 transition-all"
                      style={{ 
                        background: isSelected 
                          ? 'rgba(255,255,255,0.25)' 
                          : puntaje >= 8 ? '#f0fdf4' : puntaje >= 5 ? '#fff7ed' : '#fef2f2', 
                        color: isSelected 
                          ? 'white' 
                          : puntaje >= 8 ? '#16a34a' : puntaje >= 5 ? '#ea580c' : '#dc2626',
                        border: isSelected ? 'none' : `1px solid ${puntaje >= 8 ? '#dcfce7' : puntaje >= 5 ? '#ffedd5' : '#fee2e2'}`
                      }}>
                      {puntaje}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-40" />
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
        <span className="font-extrabold text-[#010B2B] text-sm sm:text-base">
          {selectedEnsayoId ? 'Ver Evaluación' : 'Nuevo Ensayo'}
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-[#00A8E8] font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all bg-[#00A8E8]/8 border border-[#00A8E8]/20 hover:bg-[#00A8E8]/12"
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
              <h2 className="font-extrabold text-[#010B2B] text-xl">Mis Ensayos</h2>
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
