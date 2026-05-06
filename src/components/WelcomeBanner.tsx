'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, PartyPopper } from 'lucide-react'

interface WelcomeBannerProps {
  nombre: string | null
  inicial: string
  esCuentaNueva?: boolean
}

export default function WelcomeBanner({ nombre, inicial, esCuentaNueva = false }: WelcomeBannerProps) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => setVisible(false), 400)
  }

  if (!visible && closing) return null
  if (!visible) return null

  // ── Mensajes según si es cuenta nueva o regreso ──
  const etiqueta = esCuentaNueva ? '¡Cuenta creada!' : 'Sesión iniciada'
  const titulo = esCuentaNueva
    ? `¡Bienvenido/a a SOP Reviewer${nombre ? `, ${nombre}` : ''}! 🎓`
    : `¡Hola de nuevo${nombre ? `, ${nombre}` : ''}! 👋`
  const subtitulo = esCuentaNueva
    ? 'Tu cuenta está lista. Sube tu primer ensayo y recibe feedback de IA al instante.'
    : 'Ya puedes continuar desde donde lo dejaste. ¡Mucho ánimo!'

  const iconColor = esCuentaNueva ? '#a78bfa' : '#00A8E8'
  const glowColor1 = esCuentaNueva ? '#7c3aed' : '#00A8E8'
  const glowColor2 = esCuentaNueva ? '#ec4899' : '#6366f1'

  return (
    <div
      className={`relative overflow-hidden transition-all duration-500 ${
        closing ? 'opacity-0 -translate-y-4 max-h-0' : 'opacity-100 translate-y-0 max-h-96'
      }`}
    >
      <div className="relative border-b py-5 px-6" style={{ background: 'linear-gradient(135deg, #010B2B 0%, #0d1f4a 100%)', borderColor: 'rgba(255,255,255,0.08)' }}>

        {/* Glows decorativos */}
        <div className="absolute top-0 left-1/4 w-64 h-full blur-[80px] opacity-20 pointer-events-none" style={{ background: glowColor1 }} />
        <div className="absolute top-0 right-1/4 w-48 h-full blur-[80px] opacity-15 pointer-events-none" style={{ background: glowColor2 }} />

        {/* Partículas animadas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['top-2 left-[5%]', 'top-3 left-[20%]', 'top-1 right-[18%]', 'top-4 right-[6%]', 'bottom-2 left-[40%]'].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} text-sm animate-spin select-none`}
              style={{ animationDuration: `${5 + i * 2}s`, color: `${iconColor}60` }}
            >
              ✦
            </div>
          ))}
        </div>

        {/* Contenido */}
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">

            {/* Ícono / avatar */}
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: esCuentaNueva ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'linear-gradient(135deg, #00A8E8, #0060b0)' }}>
              {esCuentaNueva
                ? <PartyPopper className="w-5 h-5 text-white" />
                : <Sparkles className="w-5 h-5 text-white" />
              }
            </div>

            <div>
              {/* Etiqueta chip */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: iconColor }} />
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: iconColor }}>
                  {etiqueta}
                </span>
              </div>
              {/* Título principal */}
              <h2 className="text-white font-extrabold text-lg md:text-xl leading-tight">
                {titulo}
              </h2>
              {/* Subtítulo */}
              <p className="text-slate-400 text-sm font-medium mt-0.5 hidden md:block">
                {subtitulo}
              </p>
            </div>
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
