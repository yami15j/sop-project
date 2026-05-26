'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  FileText, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Globe, 
  BookOpen, 
  Cpu, 
  ShieldCheck,
  ChevronRight,
  Zap
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#010618] text-slate-100 font-sans selection:bg-[#00A8E8]/20 selection:text-[#00A8E8] overflow-hidden relative">
      
      {/* 🔮 MESH GRADIENTS & DYNAMIC GLOW BACKGROUNDS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial Glow Top Right */}
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1], 
            opacity: [0.15, 0.25, 0.15] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(0,168,232,0.3)_0%,transparent_70%)] rounded-full blur-[120px]" 
        />
        {/* Radial Glow Center Left */}
        <motion.div 
          animate={{ 
            scale: [1.1, 0.95, 1.1], 
            opacity: [0.15, 0.20, 0.15] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -left-[20%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25)_0%,transparent_60%)] rounded-full blur-[100px]" 
        />
        {/* Grid Overlay Line Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} 
        />
      </div>

      {/* 🚀 FLOATING CAPSULE NAVBAR */}
      <div className="w-full fixed top-0 left-0 z-50 px-4 pt-4 sm:pt-6">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto rounded-full border border-white/5 bg-[#010925]/60 backdrop-blur-xl px-4 py-3 sm:px-6 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-full border border-white/10 shadow-lg bg-black flex-shrink-0">
              <Image
                src="/logo.jpg"
                alt="Logo Comunidad del Intercambio"
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-white leading-none">
                SOP Reviewer
              </span>
              <span className="text-[10px] text-[#00A8E8] font-bold tracking-widest uppercase mt-0.5">
                Comunidad del Intercambio
              </span>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-xs sm:text-sm font-extrabold text-slate-300 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/login?msg=evaluar" 
              className="bg-gradient-to-r from-[#00A8E8] to-[#0070b8] hover:from-[#00bfff] hover:to-[#00A8E8] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all shadow-[0_4px_20px_rgba(0,168,232,0.3)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Evaluar Ensayo
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* 🌌 HERO SECTION */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center pt-32 pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="w-full max-w-5xl mx-auto text-center relative z-10">
          
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#00A8E8]/10 text-[#00A8E8] text-xs font-extrabold border border-[#00A8E8]/20 mb-8 shadow-[0_0_20px_rgba(0,168,232,0.08),inset_0_1px_0_rgba(255,255,255,0.05)] relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#00A8E8]" /> 
            <span>Inteligencia Artificial para Estudiantes</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-black mb-8 leading-[1.08] tracking-tight text-white"
          >
            Recibe feedback instantáneo <br className="hidden md:block" />
            sobre tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] via-[#4f46e5] to-purple-400">ensayo para becas</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base md:text-xl text-slate-400 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Democratizamos el acceso a la educación global. Usa nuestra Inteligencia Artificial para pulir tu carta de motivación, corregir errores y asegurar tu futuro académico en el extranjero.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link 
              href="/login?msg=evaluar" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00A8E8] to-[#0070b8] hover:from-[#00bfff] hover:to-[#00A8E8] text-white px-8 py-4 rounded-2xl text-sm sm:text-base font-extrabold transition-all shadow-[0_10px_30px_rgba(0,168,232,0.3)] hover:-translate-y-1 active:translate-y-0"
            >
              Evaluar mi ensayo gratis
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </Link>
            <Link 
              href="#como-funciona" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] text-white px-8 py-4 rounded-2xl text-sm sm:text-base font-extrabold transition-all border border-white/10 shadow-sm hover:-translate-y-1 active:translate-y-0 backdrop-blur-md"
            >
              ¿Cómo funciona?
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ⚙️ CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-24 sm:py-32 px-4 sm:px-6 relative z-20 bg-slate-950/20">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16 sm:mb-20">
            <span className="text-[#00A8E8] text-xs font-black tracking-[0.2em] uppercase bg-[#00A8E8]/10 px-3.5 py-1.5 rounded-full border border-[#00A8E8]/20">
              Proceso del Evaluador
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-6 mb-4 tracking-tight">
              ¿Cómo funciona SOP Reviewer?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              En solo 3 pasos tendrás un diagnóstico profundo que potenciará drásticamente tu perfil y aumentará tus posibilidades de aceptación.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="bg-[#020b22]/50 border border-white/5 p-8 rounded-[32px] shadow-2xl relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="w-14 h-14 bg-[#00A8E8]/10 text-[#00A8E8] border border-[#00A8E8]/20 rounded-2xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold mb-3 text-white">1. Sube tu Ensayo</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Pega tu texto o sube un archivo **PDF**. Nuestro sistema extraerá los datos en tiempo real de forma segura. Soporta hasta 2,500 palabras.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-[#020b22]/50 border border-white/5 p-8 rounded-[32px] shadow-2xl relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold mb-3 text-white">2. Análisis de Inteligencia</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                El modelo examina el contenido cruzando datos geográficos de tu beca, evaluando rigor académico, impacto futuro y coherencia temática.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-[#020b22]/50 border border-white/5 p-8 rounded-[32px] shadow-2xl relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold mb-3 text-white">3. Feedback Anotado</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Visualiza el resultado interactivo con alertas flotantes, sugerencias directas de corrección y una rúbrica detallada por criterios de postulación.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 🔮 FINAL CTA */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 relative z-20">
        <div className="max-w-5xl mx-auto rounded-[40px] border border-white/5 bg-gradient-to-br from-[#020c2d] to-[#010619] p-8 sm:p-16 md:p-24 text-center shadow-2xl relative overflow-hidden group">
          {/* Inner Glow Effects */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#00A8E8] rounded-full blur-[120px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-700" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600 rounded-full blur-[120px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-700" />
          
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00A8E8]/30 to-transparent" />

          <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight text-white relative z-10 leading-tight">
            ¿Listo para estudiar en la universidad de tus sueños?
          </h2>
          
          <p className="text-slate-400 mb-10 text-sm sm:text-lg max-w-2xl mx-auto relative z-10 leading-relaxed">
            Más allá de tus calificaciones, trabajamos en perfeccionar tu historia. Pulir tu carta de motivación es el paso crucial para captar la atención del comité de selección.
          </p>

          <Link 
            href="/signup" 
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#00A8E8] to-[#0070b8] hover:from-[#00bfff] hover:to-[#00A8E8] text-white px-8 py-4 sm:px-12 sm:py-5 rounded-2xl text-sm sm:text-lg font-black transition-all shadow-[0_10px_40px_rgba(0,168,232,0.4)] hover:-translate-y-1 active:translate-y-0 relative z-10"
          >
            Crear mi cuenta gratuita
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </section>

      {/* 📜 FOOTER */}
      <footer className="py-12 border-t border-white/5 relative z-20 bg-slate-950/40 text-center">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-slate-500 font-bold">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black flex-shrink-0">
              <Image
                src="/logo.jpg"
                alt="Logo"
                width={24}
                height={24}
                className="object-cover w-full h-full"
              />
            </div>
            <span>La Comunidad del Intercambio</span>
          </div>
          <p>© {new Date().getFullYear()} SOP Reviewer. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  )
}
