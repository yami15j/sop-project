'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck, Laptop } from 'lucide-react'

export default function VerifiedStaticPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#070b19] font-sans p-6 text-slate-300 select-none relative overflow-hidden">
      
      {/* Redes de fondo muy sutiles estilo tecnológico limpio */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] rounded-[32px] border border-white/5 bg-[#0d1326] p-8 sm:p-10 shadow-2xl relative z-10 text-center"
      >
        <div className="flex flex-col items-center">
          
          {/* Símbolo de Verificación Oficial Protegido */}
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>

          {/* Título de Google / Proveedor de Servicio */}
          <h1 className="text-xl font-bold tracking-tight text-white mb-2">
            Correo Electrónico Confirmado
          </h1>
          
          <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed max-w-[280px]">
            Tu cuenta ha sido activada de forma segura por el proveedor de autenticación.
          </p>

          {/* Caja informativa de retorno a la computadora */}
          <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-left mb-6">
            <div className="flex gap-3 items-start">
              <Laptop className="w-5 h-5 text-[#00A8E8] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-black uppercase text-[#00A8E8] tracking-wider mb-1">
                  ¿Qué hacer ahora?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                  Regresa a la pestaña de tu computadora. Tu sesión ya se ha iniciado de forma automática y tu Dashboard está listo para usar.
                </p>
              </div>
            </div>
          </div>

          {/* Nota de Cierre de Ventana */}
          <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 justify-center uppercase tracking-widest mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Ya puedes cerrar esta pestaña</span>
          </div>
          
        </div>
      </motion.div>

      {/* Marca de agua de la Comunidad en la base */}
      <div className="mt-8 flex items-center gap-2 text-slate-600 text-xs font-bold tracking-wider select-none pointer-events-none opacity-50">
        <div className="w-4 h-4 flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black">
          <img
            src="/logo.jpg"
            alt="Logo"
            className="object-cover w-full h-full"
          />
        </div>
        <span>La Comunidad del Intercambio</span>
      </div>

    </div>
  )
}
