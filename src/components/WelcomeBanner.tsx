'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface WelcomeBannerProps {
  nombre: string | null
  inicial: string
  esCuentaNueva?: boolean
}

export default function WelcomeBanner({ nombre, inicial, esCuentaNueva = false }: WelcomeBannerProps) {
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState(true)

  const handleClose = () => {
    setActive(false)
    setTimeout(() => {
      setVisible(false)
    }, 300)
  }

  useEffect(() => {
    // Activar animación de entrada después de montar
    const showTimer = setTimeout(() => setActive(true), 50)
    
    // Auto-desvanecer después de 5.5 segundos (mismo tiempo que dura la barra de progreso)
    const dismissTimer = setTimeout(() => {
      handleClose()
    }, 5500)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(dismissTimer)
    }
  }, [])

  if (!visible) return null

  // Mensaje de una sola línea súper directa
  const mensaje = esCuentaNueva
    ? '¡Bienvenido/a a SOP Reviewer!'
    : '¡Hola de nuevo!'

  return (
    <div
      className={`fixed top-24 right-4 sm:right-6 z-50 max-w-sm transition-all duration-300 ease-out ${
        active 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <div 
        className="relative overflow-hidden rounded-full py-2.5 px-4 pr-10 flex items-center justify-between backdrop-blur-sm shadow-[0_8px_25px_rgba(0,0,0,0.06)] border"
        style={{ 
          background: 'rgba(255, 255, 255, 0.96)',
          borderColor: 'rgba(226, 232, 240, 0.9)',
        }}
      >
        <span className="text-slate-800 font-extrabold text-xs sm:text-sm leading-none select-none">
          {mensaje}
        </span>

        {/* Botón de cerrar circular y ultra sutil */}
        <button
          onClick={handleClose}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Barra de progreso de auto-dismiss delgada */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-100 overflow-hidden">
          <div 
            className="h-full animate-shrink-width"
            style={{
              background: 'linear-gradient(to right, #00A8E8, #0070b8)',
              animation: 'shrinkWidth 5.5s linear forwards'
            }}
          />
        </div>
      </div>

      {/* Estilo global simplificado para la barra de progreso */}
      <style jsx global>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-shrink-width {
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  )
}


