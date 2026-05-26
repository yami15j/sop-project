'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Mail, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    console.log('[ConfirmPage] Iniciando monitoreo de verificación...')

    // 1. Escuchar cambios de autenticación locales (por ejemplo, si se inicia sesión en la pestaña)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ConfirmPage] Cambio de estado de autenticación:', event, session?.user?.email)
      if (event === 'SIGNED_IN' && session) {
        console.log('[ConfirmPage] ¡Usuario autenticado detectado! Limpiando temporales y redirigiendo...')
        // Limpiamos las credenciales temporales de sesión
        sessionStorage.removeItem('signup_email')
        sessionStorage.removeItem('signup_password')
        router.push('/dashboard?bienvenido=1&nuevo=1&verificado=1')
      }
    })

    // 2. Polling en segundo plano: si hay credenciales en sessionStorage, intentamos iniciar sesión en segundo plano.
    // Esto se activará automáticamente el segundo en que el usuario confirme su correo en su celular o pestaña.
    const email = sessionStorage.getItem('signup_email')
    const password = sessionStorage.getItem('signup_password')
    console.log('[ConfirmPage] Credenciales recuperadas de sessionStorage:', { 
      email: email ? email : 'NO ENCONTRADO', 
      password: password ? '*** (protegido)' : 'NO ENCONTRADO' 
    })

    let intervalId: NodeJS.Timeout | null = null

    if (email && password) {
      console.log('[ConfirmPage] Iniciando polling cada 5 segundos en segundo plano...')
      intervalId = setInterval(async () => {
        try {
          console.log('[ConfirmPage] Ejecutando polling: intentando iniciar sesión con Supabase...')
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            console.log('[ConfirmPage] Intento de login fallido (esto es normal si el correo aún no ha sido confirmado):', error.message)
          }

          if (data?.session && !error) {
            console.log('[ConfirmPage] ¡Inicio de sesión exitoso! Limpiando intervalo y redirigiendo...')
            // Inicio de sesión exitoso. Limpiamos el intervalo y redirigimos
            clearInterval(intervalId!)
            sessionStorage.removeItem('signup_email')
            sessionStorage.removeItem('signup_password')
            router.push('/dashboard?bienvenido=1&nuevo=1&verificado=1')
          }
        } catch (err) {
          console.error('[ConfirmPage] Error inesperado durante el polling:', err)
        }
      }, 5000)
    } else {
      console.warn('[ConfirmPage] ADVERTENCIA: No se encontraron email/password en sessionStorage. El polling en segundo plano no puede iniciarse.')
    }

    return () => {
      console.log('[ConfirmPage] Limpiando suscripciones e intervalos de confirmación.')
      subscription.unsubscribe()
      if (intervalId) clearInterval(intervalId)
    }
  }, [supabase, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#010B2B] font-sans p-6 relative overflow-hidden">
      
      {/* Fondo Premium */}
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

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-3xl p-6 sm:p-10 shadow-2xl relative z-10 text-center text-white"
      >
        <div className="flex flex-col items-center">
          
          {/* Logo Circular de la Comunidad (Pieza Central Única) */}
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
          
          <h1 className="text-3xl font-black tracking-tight mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            ¡Revisa tu Gmail!
          </h1>
          
          <p className="text-blue-100/60 text-base font-medium mb-8 max-w-[280px] mx-auto leading-relaxed">
            Hemos enviado un enlace mágico para activar tu cuenta.
          </p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 text-left w-full mb-8"
          >
            <div className="bg-green-500/20 p-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xs font-semibold text-blue-100/80">Activaremos tu cuenta en tiempo real al confirmar.</p>
          </motion.div>

          <div className="flex flex-col gap-3.5 w-full">

            <motion.a
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,1)", color: "#010B2B" }}
              whileTap={{ scale: 0.98 }}
              href="https://mail.google.com"
              target="_blank"
              className="rounded-full bg-white/95 px-8 py-3 font-bold text-[#010B2B] transition-all flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-white/20 mx-auto cursor-pointer w-full max-w-[280px]"
            >
              Abrir mi correo <ExternalLink className="w-4 h-4" />
            </motion.a>
            
            <Link
              href="/login"
              className="text-white/30 hover:text-white transition-colors text-[11px] font-bold mt-2 uppercase tracking-wider block text-center"
            >
              ¿Ya verificaste? Inicia sesión aquí
            </Link>
            
            <p className="text-[10px] text-blue-200/40 mt-3 max-w-[280px] mx-auto leading-relaxed text-center">
              Si confirmaste tu cuenta desde otro dispositivo o pestaña, puedes hacer clic arriba para iniciar sesión directamente.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-8 flex items-center gap-3 text-blue-200/30 font-bold tracking-[0.2em] text-[10px] uppercase"
      >
        <Loader2 className="w-3 h-3 animate-spin text-[#00A8E8]" />
        Esperando confirmación...
      </motion.div>
    </div>
  )
}
