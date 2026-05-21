'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, X, AlertTriangle } from 'lucide-react'

interface ErrorBannerProps {
  error: string
}

export default function ErrorBanner({ error }: ErrorBannerProps) {
  const [visible, setVisible] = useState(true)
  const decodedError = decodeURIComponent(error)
  const isVerification = decodedError.toLowerCase().includes('verificar')
  const isAlreadyRegistered = decodedError.toLowerCase().includes('tiene una cuenta')

  useEffect(() => {
    // Limpiar el parámetro 'error' de la URL para que no se quede pegado al recargar/refrescar
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('error')) {
        url.searchParams.delete('error')
        window.history.replaceState(null, '', url.pathname + url.search)
      }
    }
  }, [])

  if (!visible) return null

  if (isVerification) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-4 py-3 flex items-center justify-between text-left shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-600">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-900 leading-none">¡Tu cuenta ya está activa! 🚀</h4>
            <p className="text-[11px] font-semibold text-emerald-700 mt-1 leading-none">
              Tu correo ya fue verificado. Inicia sesión abajo directamente.
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => setVisible(false)}
          className="text-emerald-400 hover:text-emerald-600 transition-colors p-1 flex-shrink-0"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (isAlreadyRegistered) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 px-4 py-3 flex items-center justify-between text-left shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-blue-600">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-blue-900 leading-none">Este correo ya tiene cuenta 💡</h4>
            <p className="text-[11px] font-semibold text-blue-700 mt-1 leading-none">
              Inicia sesión directamente abajo si ya te registraste antes.
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => setVisible(false)}
          className="text-blue-400 hover:text-blue-600 transition-colors p-1 flex-shrink-0"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Error estándar
  return (
    <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3.5 flex items-center justify-between text-left shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0 text-red-600">
          <AlertTriangle className="w-4.5 h-4.5" />
        </div>
        <p className="text-xs font-semibold text-red-700 leading-snug">
          {decodedError}
        </p>
      </div>
      <button 
        type="button"
        onClick={() => setVisible(false)}
        className="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0"
        aria-label="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
