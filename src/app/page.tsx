'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Sparkles, GraduationCap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00A8E8]/20 selection:text-[#010B2B]">

      {/* Navegación Oscura */}
      <nav className="absolute w-full z-50 bg-transparent py-4 px-4 sm:py-6 sm:px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-full border border-white/20 shadow-sm bg-black">
            <Image
              src="/logo.jpg"
              alt="Logo Comunidad del Intercambio"
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="font-extrabold text-lg tracking-tight hidden sm:block text-white">
            Comunidad del Intercambio
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors hidden sm:block">
            Iniciar Sesión
          </Link>
          <Link href="/login?msg=evaluar" className="bg-[#00A8E8] hover:bg-[#0090C7] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg shadow-[#00A8E8]/30">
            Evaluar Ensayo
          </Link>
        </div>
      </nav>

      {/* Hero Section - Dark Navy Blue */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center pt-24 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden bg-[#010B2B] text-white">
        {/* Glows de fondo para el Hero oscuro */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#00A8E8] rounded-full blur-[120px]"></div>
          <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-600 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 py-1 px-3 sm:py-1.5 sm:px-4 rounded-full bg-[#00A8E8]/20 text-[#00A8E8] text-xs sm:text-sm font-bold border border-[#00A8E8]/30 mb-6 sm:mb-8 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> Inteligencia Artificial para Estudiantes
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-6 sm:mb-8 leading-tight tracking-tight text-white">
              Recibe feedback instantáneo sobre tu <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] to-purple-400">
                ensayo para becas
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-slate-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Democratizamos el acceso a la educación global. Usa nuestra Inteligencia Artificial para pulir tu carta de motivación, corregir errores y asegurar tu futuro.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login?msg=evaluar" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00A8E8] hover:bg-[#0090C7] text-white px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-bold transition-all shadow-lg shadow-[#00A8E8]/30 hover:-translate-y-1">
                Evaluar mi ensayo gratis
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link href="#como-funciona" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-bold transition-all border border-white/10 shadow-sm hover:-translate-y-1 backdrop-blur-md">
                ¿Cómo funciona?
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cómo Funciona - Minimal Cards */}
      <section id="como-funciona" className="py-20 sm:py-28 md:py-36 px-4 sm:px-6 relative z-20 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          
          {/* Encabezado del "Cómo Funciona" de vuelta a su sección original */}
          <div className="text-center mb-16 sm:mb-20 md:mb-24">
            <h2 className="text-3xl sm:text-4.5xl md:text-5xl font-extrabold text-[#010B2B] mb-4 sm:mb-6 tracking-tight">
              ¿Cómo funciona nuestro evaluador?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
              En solo 3 simples pasos tendrás un análisis detallado que potenciará tu perfil para la universidad de tus sueños.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white p-6 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-blue-100/50 hover:border-blue-200 hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)] text-center hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#010B2B]">1. Sube tu Ensayo</h3>
              <p className="text-slate-600 text-xs sm:text-base leading-relaxed">Pega tu carta de motivación o Personal Statement y dinos a qué beca o país apuntas. El sistema soporta hasta 2,500 palabras.</p>
            </motion.div>

            {/* Paso 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-white p-6 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-purple-100/50 hover:border-purple-200 hover:shadow-[0_8px_30px_rgba(168,85,247,0.06)] text-center hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#010B2B]">2. La IA lo Analiza</h3>
              <p className="text-slate-600 text-xs sm:text-base leading-relaxed">Nuestro modelo entrenado con cientos de ensayos exitosos revisará tu estructura, gramática, tono y nivel de persuasión.</p>
            </motion.div>

            {/* Paso 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="bg-white p-6 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-green-100/50 hover:border-green-200 hover:shadow-[0_8px_30px_rgba(34,197,94,0.06)] text-center hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#010B2B]">3. Recibe Feedback</h3>
              <p className="text-slate-600 text-xs sm:text-base leading-relaxed">Obtén un reporte detallado al instante con tus fortalezas y las áreas exactas donde debes mejorar para ganar esa beca.</p>
            </motion.div>
          </div>
        </div>
      </section>


      {/* CTA Final - High Contrast */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto bg-[#010B2B] rounded-3xl sm:rounded-[40px] p-8 sm:p-16 md:p-24 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle Glows inside CTA */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A8E8] rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

          <h2 className="text-2xl sm:text-3.5xl md:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tight text-white relative z-10">¿Listo para estudiar en el extranjero?</h2>
          <p className="text-slate-300 mb-6 sm:mb-10 text-xs sm:text-base md:text-xl max-w-2xl mx-auto relative z-10">Más allá de las calificaciones, trabajamos en fortalecer habilidades, historias y perfiles que conecten con lo que realmente buscan las becas internacionales.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-[#00A8E8] hover:bg-[#0090C7] text-white px-6 py-3.5 sm:px-10 sm:py-5 rounded-xl sm:rounded-2xl text-sm sm:text-lg font-bold transition-all shadow-[0_0_40px_rgba(0,168,232,0.4)] hover:-translate-y-1 relative z-10">
            Crear mi cuenta gratuita
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="py-12 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} La Comunidad del Intercambio. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
