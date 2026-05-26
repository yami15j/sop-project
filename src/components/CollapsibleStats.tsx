'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Trophy, Zap, X, BarChart3, Lightbulb, Menu } from 'lucide-react'

interface Ensayo {
  id: string
  beca_objetivo: string | null
  pais_destino: string | null
  created_at: string
  feedback_generado?: { puntaje?: number }[]
}

interface CollapsibleStatsProps {
  ensayosUsados: number
  ensayosRestantes: number
  puntajePromedio: number | null
  ensayos: Ensayo[] | null
  lead: any
}

export default function CollapsibleStats({
  ensayosUsados,
  ensayosRestantes,
  puntajePromedio,
  ensayos,
  lead
}: CollapsibleStatsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Header Hamburger Toggle Button - Pure Circle */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all bg-white/5 hover:bg-[#00A8E8]/15 border border-white/10 text-slate-100 hover:text-[#00A8E8] hover:border-[#00A8E8]/30 cursor-pointer group flex-shrink-0"
        title="Ver Estadísticas del Perfil"
      >
        <div className="relative flex items-center justify-center">
          <Menu className="w-4.5 h-4.5 text-slate-300 group-hover:text-[#00A8E8] transition-colors duration-300" />
          {ensayosRestantes > 0 && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A8E8] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A8E8]"></span>
            </span>
          )}
        </div>
      </button>

      {/* Backdrop Overlay */}
      <div 
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sliding Sidebar Drawer */}
      <div 
        className={`fixed left-0 top-0 bottom-0 h-full w-[360px] max-w-full bg-white z-50 shadow-[10px_0_40px_rgba(0,0,0,0.12)] border-r border-slate-100 flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-white bg-gradient-to-br from-[#00A8E8] to-[#0070b8] shadow-sm">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">Estadísticas del Perfil</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-1.5 leading-none">Métricas y créditos en tiempo real</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8.5 h-8.5 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5.5 flex flex-col gap-4.5 bg-slate-50/10">
          
          {/* CARD 1: ENSAYOS */}
          {ensayosUsados > 0 && ensayos?.[0] ? (
            <Link
              href={`/dashboard?ensayo=${ensayos[0].id}&vista=texto`}
              onClick={() => setIsOpen(false)}
              className="group relative overflow-hidden rounded-2xl p-4.5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_2px_10px_rgba(99,102,241,0.03)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.08)] bg-white cursor-pointer"
              style={{ border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(59,130,246,0.04))' }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: 'linear-gradient(to right, #6366f1, #3b82f6)' }}
              />
              <div
                className="w-9.5 h-9.5 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  boxShadow: '0 4px 10px rgba(99,102,241,0.25)'
                }}
              >
                <FileText className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="text-2.5xl font-black leading-none tracking-tight" style={{ color: '#1e1b4b' }}>
                  {ensayosUsados}
                </div>
                <div className="text-[11px] font-extrabold leading-tight mt-1 uppercase tracking-wider text-slate-400">
                  Ensayos enviados
                </div>
                <div className="text-[10px] font-black mt-1 text-[#6366f1] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  Ver último ensayo →
                </div>
              </div>
            </Link>
          ) : (
            <div
              className="relative overflow-hidden rounded-2xl p-4.5 flex items-center gap-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              style={{ border: '1px solid rgba(226, 232, 240, 0.8)' }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: 'linear-gradient(to right, #6366f1, #3b82f6)' }}
              />
              <div
                className="w-9.5 h-9.5 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                style={{
                  background: 'linear-gradient(135deg, #cbd5e1, #94a3b8)',
                  boxShadow: '0 4px 10px rgba(148, 163, 184, 0.15)'
                }}
              >
                <FileText className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-2.5xl font-black leading-none tracking-tight text-slate-400">
                  0
                </div>
                <div className="text-[11px] font-extrabold leading-tight mt-1 uppercase tracking-wider text-slate-400">
                  Ensayos enviados
                </div>
              </div>
            </div>
          )}

          {/* CARD 2: CRÉDITOS */}
          {ensayosRestantes === 0 ? (
            <Link
              href="/dashboard#mentoria"
              onClick={() => setIsOpen(false)}
              className="group relative overflow-hidden rounded-2xl p-4.5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_2px_10px_rgba(249,115,22,0.03)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.08)] bg-white cursor-pointer"
              style={{ border: '1px solid rgba(249,115,22,0.2)' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.03), rgba(245,158,11,0.04))' }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: 'linear-gradient(to right, #f97316, #f59e0b)' }}
              />
              <div
                className="w-9.5 h-9.5 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10"
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  boxShadow: '0 4px 10px rgba(249,115,22,0.25)'
                }}
              >
                <Zap className="w-4.5 h-4.5 text-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="text-2.5xl font-black leading-none tracking-tight text-orange-600">
                  0
                </div>
                <div className="text-[11px] font-extrabold leading-tight mt-1 uppercase tracking-wider text-slate-400">
                  Créditos disponibles
                </div>
                <div className="text-[10px] font-black mt-1 text-[#f97316] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  {lead ? 'Ver solicitud mentoría →' : '¡Solicitar Mentoría! →'}
                </div>
              </div>
            </Link>
          ) : (
            <div
              className="relative overflow-hidden rounded-2xl p-4.5 flex items-center gap-4 bg-white shadow-[0_2px_10px_rgba(0,168,232,0.03)]"
              style={{ border: '1px solid rgba(0, 168, 232, 0.15)' }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: 'linear-gradient(to right, #00A8E8, #0070b8)' }}
              />
              <div
                className="w-9.5 h-9.5 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #00A8E8, #0078c8)',
                  boxShadow: '0 4px 10px rgba(0, 168, 232, 0.25)'
                }}
              >
                <Zap className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-2.5xl font-black leading-none tracking-tight" style={{ color: '#005b82' }}>
                  {ensayosRestantes} / 2
                </div>
                <div className="text-[11px] font-extrabold leading-tight mt-1 uppercase tracking-wider text-slate-400">
                  Créditos disponibles
                </div>
              </div>
            </div>
          )}

          {/* CARD 3: PUNTAJE PROMEDIO */}
          {puntajePromedio !== null && ensayos?.[0] ? (
            <Link
              href={`/dashboard?ensayo=${ensayos[0].id}`}
              onClick={() => setIsOpen(false)}
              className="group relative overflow-hidden rounded-2xl p-4.5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 shadow-[0_2px_10px_rgba(16,185,129,0.03)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.08)] bg-white cursor-pointer"
              style={{ border: '1px solid rgba(16,185,129,0.18)' }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.03), rgba(5,150,105,0.04))' }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}
              />
              <div
                className="w-9.5 h-9.5 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 relative z-10"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 10px rgba(16,185,129,0.25)'
                }}
              >
                <Trophy className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="text-2.5xl font-black leading-none tracking-tight text-emerald-650">
                  {puntajePromedio}
                </div>
                <div className="text-[11px] font-extrabold leading-tight mt-1 uppercase tracking-wider text-slate-400">
                  Puntaje Promedio
                </div>
                <div className="text-[10px] font-black mt-1 text-[#10b981] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  Ver reporte completo →
                </div>
              </div>
            </Link>
          ) : (
            <div
              className="relative overflow-hidden rounded-2xl p-4.5 flex items-center gap-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              style={{ border: '1px solid rgba(226, 232, 240, 0.8)' }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}
              />
              <div
                className="w-9.5 h-9.5 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                style={{
                  background: 'linear-gradient(135deg, #cbd5e1, #94a3b8)',
                  boxShadow: '0 4px 10px rgba(148, 163, 184, 0.15)'
                }}
              >
                <Trophy className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-2.5xl font-black leading-none tracking-tight text-slate-400">
                  —
                </div>
                <div className="text-[11px] font-extrabold leading-tight mt-1 uppercase tracking-wider text-slate-400">
                  Puntaje Promedio
                </div>
              </div>
            </div>
          )}

          {/* SaaS Style Pro Tips widget */}
          <div 
            className="rounded-2xl p-4.5 mt-2.5 flex items-start gap-3 border shadow-[0_2px_8px_rgba(0,0,0,0.01)] bg-white"
            style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}
          >
            <div className="w-7.5 h-7.5 rounded-lg bg-yellow-50 border border-yellow-100 flex items-center justify-center flex-shrink-0 text-yellow-600">
              <Lightbulb className="w-4 h-4 fill-yellow-500/10" />
            </div>
            <div>
              <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider leading-none">Tip del Evaluador</h4>
              <p className="text-[11px] font-semibold text-slate-500 mt-2 leading-relaxed">
                Los ensayos con puntajes mayores a 8 suelen incluir ejemplos concretos de liderazgo e impacto social. ¡Escribe con detalle!
              </p>
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center flex-shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SOP Reviewer © 2026</p>
        </div>
      </div>
    </>
  )
}
