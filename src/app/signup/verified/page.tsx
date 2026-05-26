'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function VerifiedPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirección al dashboard a los 3 segundos
    const timeout = setTimeout(() => {
      router.push('/dashboard?bienvenido=1&nuevo=1&verificado=1')
    }, 3000)

    return () => {
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#010B2B] font-sans p-6 relative overflow-hidden text-white">
      
      {/* Fondo Premium con Mesh Gradients */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[5%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] -left-[5%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[100px]" 
        />
      </div>

      {/* Tarjeta de Éxito de Verificación */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-center"
      >
        <div className="flex flex-col items-center">
          
          {/* Logo Circular de la Comunidad */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-20 h-20 flex items-center justify-center overflow-hidden rounded-full border border-white/10 shadow-2xl bg-black mb-8"
          >
            <img
              src="/logo.jpg"
              alt="Logo Comunidad del Intercambio"
              className="object-cover w-full h-full"
            />
          </motion.div>

          {/* Icono de Verificado con Animación de Rebote y Resplandor */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            className="relative mb-6"
          >
            <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/35 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <CheckCircle2 className="w-9 h-9 text-green-400" />
            </div>
          </motion.div>
          
          {/* Títulos */}
          <h1 className="text-3xl font-black tracking-tight mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
            ¡Cuenta Activada! 🎉
          </h1>
          
          <p className="text-blue-100/60 text-sm font-semibold mb-8 max-w-[280px] mx-auto leading-relaxed">
            Tu correo electrónico ha sido verificado con éxito en SOP Reviewer.
          </p>

          {/* Mensaje de Redirección Sutil */}
          <div className="flex items-center justify-center gap-2.5 mt-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-slate-300 font-extrabold text-xs tracking-wider uppercase">
            <Loader2 className="w-4 h-4 animate-spin text-green-400" />
            <span>Entrando al dashboard...</span>
          </div>
          
        </div>
      </motion.div>
    </div>
  )
}
