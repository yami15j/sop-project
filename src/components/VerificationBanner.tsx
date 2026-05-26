'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VerificationBannerProps {
  nombre: string | null
}

export default function VerificationBanner({ nombre }: VerificationBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Aparece suavemente después de un momento
    const timer = setTimeout(() => setVisible(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setVisible(false)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('verificado')
      window.history.replaceState({}, '', url.pathname + url.search)
    }
  }

  const primerNombre = nombre ? nombre.trim().split(' ')[0] : ''

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150 }}
          className="fixed top-24 right-4 sm:right-6 z-50 pointer-events-auto"
        >
          <div 
            className="relative overflow-hidden rounded-xl p-3 sm:p-3.5 border shadow-xl backdrop-blur-md"
            style={{ 
              width: '320px',
              background: 'linear-gradient(135deg, rgba(1, 11, 43, 0.9) 0%, rgba(13, 31, 74, 0.9) 100%)',
              borderColor: 'rgba(16, 185, 129, 0.35)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(16, 185, 129, 0.1)'
            }}
          >
            {/* Glow decorativo de fondo */}
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[30px] opacity-25 pointer-events-none" style={{ background: '#10b981' }} />

            <div className="flex items-center gap-3 relative z-10">
              
              {/* Checkmark pequeño y elegante con pulso */}
              <div className="flex-shrink-0">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center relative"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.25) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.45)'
                  }}
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
              </div>

              {/* Textos compactos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Cuenta Activa
                  </span>
                </div>
                <h3 className="text-white font-bold text-xs mt-0.5 tracking-tight truncate">
                  ¡Correo verificado con éxito!
                </h3>
                <p className="text-slate-300 text-[10px] font-medium leading-tight mt-0.5">
                  Ya puedes subir y analizar tus ensayos.
                </p>
              </div>

              {/* Botón cerrar minimalista */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleClose}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Cerrar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Barra de progreso de auto-cierre delgada */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 6, ease: 'linear' }}
              onAnimationComplete={handleClose}
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
