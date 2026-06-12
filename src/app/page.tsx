'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  FileText,
  Sparkles,
  GraduationCap,
  RotateCcw,
  ChevronRight,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react'

// Brand Color Palette:
// Primary: #00A8E8 (Light Blue)
// Secondary: #0070b8 (Deep Blue)
// Accent: #00bfff (Sky Blue)

// Mock Data for Interactive Simulator
const BEFORE_TEXT = [
  { text: "Mi principal objetivo es ", isHighlight: false },
  { text: "estudiar en el extranjero", isHighlight: true, id: 0 },
  { text: " para ", isHighlight: false },
  { text: "hacer cosas de investigación", isHighlight: true, id: 1 },
  { text: " en biomedicina. Creo que esto me permitirá ", isHighlight: false },
  { text: "conseguir un buen trabajo", isHighlight: true, id: 2 },
  { text: " cuando regrese a mi país y ", isHighlight: false },
  { text: "ayudar a la gente", isHighlight: true, id: 3 },
  { text: ".", isHighlight: false }
]

const AFTER_TEXT = [
  { text: "Mi principal objetivo es ", isHighlight: false },
  { text: "cursar la Maestría en Biomedicina en la Universidad de Heidelberg", isHighlight: true, id: 0 },
  { text: " para ", isHighlight: false },
  { text: "conducir investigaciones clínicas avanzadas", isHighlight: true, id: 1 },
  { text: " en biomedicina. Creo que esto me permitirá ", isHighlight: false },
  { text: "liderar el desarrollo de políticas de salud pública", isHighlight: true, id: 2 },
  { text: " cuando regrese a mi país y ", isHighlight: false },
  { text: "reducir la brecha de acceso a tratamientos oncológicos", isHighlight: true, id: 3 },
  { text: ".", isHighlight: false }
]

const BEFORE_FEEDBACK = [
  {
    id: 0,
    category: "Claridad y Planificación",
    feedback: "Especifique el país y la universidad de destino para demostrar una postulación sólida y bien fundamentada.",
    severity: "warning",
    badge: "Falta Detalle"
  },
  {
    id: 1,
    category: "Estilo y Vocabulario",
    feedback: "Vocabulario informal. Se sugiere cambiar por 'desarrollar investigaciones biomédicas avanzadas' o 'conducir proyectos de investigación clínica'.",
    severity: "danger",
    badge: "Redacción Débil"
  },
  {
    id: 2,
    category: "Objetivo y Retorno",
    feedback: "Enfoque individual. En las becas competitivas, el objetivo debe alinearse con el impacto nacional o desarrollo social, no solo con el crecimiento profesional personal.",
    severity: "danger",
    badge: "Foco Individual"
  },
  {
    id: 3,
    category: "Impacto Propuesto",
    feedback: "Poco específico. Describa cómo planea beneficiar a su comunidad, ej: 'implementar programas de salud pública basados en datos epidemiológicos'.",
    severity: "warning",
    badge: "Impacto Vago"
  }
]

const AFTER_FEEDBACK = [
  {
    id: 0,
    category: "Claridad y Planificación",
    feedback: "¡Excelente! Especificar el programa y la universidad demuestra una postulación madura y bien planificada.",
    severity: "success",
    badge: "Detallado"
  },
  {
    id: 1,
    category: "Estilo y Vocabulario",
    feedback: "Tono académico ideal. Transmite rigurosidad y excelente nivel técnico de redacción.",
    severity: "success",
    badge: "Académico"
  },
  {
    id: 2,
    category: "Objetivo y Retorno",
    feedback: "Enfoque alineado. Muestra liderazgo y una visión orientada a impactar positivamente al desarrollo de su país.",
    severity: "success",
    badge: "Impacto Alto"
  },
  {
    id: 3,
    category: "Impacto Propuesto",
    feedback: "Extraordinario. El impacto es cuantificable, pertinente y de gran interés para los comités evaluadores.",
    severity: "success",
    badge: "Medible"
  }
]

// FAQ Items
const FAQ_ITEMS = [
  {
    q: "¿Cómo se evalúa mi ensayo de beca?",
    a: "El sistema analiza tu texto bajo las rúbricas oficiales de las becas internacionales más competitivas (Chevening, Fulbright, Fundación Carolina, Erasmus+, etc.). Evalúa 4 factores clave: rigor académico, impacto social/plan de retorno, coherencia profesional y claridad de redacción."
  },
  {
    q: "¿Es seguro subir mi carta de motivación?",
    a: "Completamente seguro. Tus ensayos son tratados de manera privada y confidencial con encriptación de extremo a extremo. Tu información nunca se comparte ni se utiliza para fines externos."
  },
  {
    q: "¿Soporta ensayos escritos en inglés y español?",
    a: "Sí, el evaluador es completamente bilingüe. Puede analizar, revisar el estilo y sugerir mejoras académicas fluidas tanto en inglés como en español de manera automática."
  },
  {
    q: "¿Qué tipos de documentos puedo cargar?",
    a: "Puedes subir archivos en formato PDF o copiar y pegar el texto de tu ensayo directamente en nuestro editor. El sistema procesa de forma óptima documentos de hasta 2,500 palabras."
  }
]

export default function LandingPage() {
  const [isOptimized, setIsOptimized] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [activeHighlight, setActiveHighlight] = useState<number | null>(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleOptimize = () => {
    setIsScanning(true)
    setActiveHighlight(null)
    setTimeout(() => {
      setIsScanning(false)
      setIsOptimized(true)
      setActiveHighlight(0)
    }, 1800)
  }

  const handleReset = () => {
    setIsOptimized(false)
    setActiveHighlight(0)
  }

  const currentText = isOptimized ? AFTER_TEXT : BEFORE_TEXT
  const currentFeedback = isOptimized ? AFTER_FEEDBACK : BEFORE_FEEDBACK
  const activeFeedbackItem = currentFeedback.find(item => item.id === activeHighlight)

  return (
    <div className="min-h-screen bg-[#010618] text-slate-100 font-sans selection:bg-[#00A8E8]/20 selection:text-[#00A8E8] overflow-hidden relative">

      {/* 🔮 UNIFIED BLUE GLOW BACKGROUNDS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Radial Glow Top Right (Brand Blue #00A8E8) */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -right-[10%] w-[75%] h-[75%] bg-[radial-gradient(circle_at_center,rgba(0,168,232,0.2)_0%,rgba(0,112,184,0.05)_50%,transparent_100%)] rounded-full blur-[130px]"
        />
        {/* Radial Glow Center Left (Brand Blue #0070b8) */}
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.12, 0.2, 0.12]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] -left-[15%] w-[55%] h-[55%] bg-[radial-gradient(circle_at_center,rgba(0,112,184,0.15)_0%,transparent_70%)] rounded-full blur-[110px]"
        />
        
        {/* Dot Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(rgba(0, 168, 232, 0.05) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* 🚀 NAVBAR */}
      <div className="w-full fixed top-0 left-0 z-50 px-4 pt-4 sm:pt-6">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto rounded-full border border-white/[0.06] bg-[#010925]/60 backdrop-blur-xl px-5 py-3 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.03)]"
        >
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black flex-shrink-0 relative">
              <div className="absolute inset-0 bg-[#00A8E8]/10" />
              <Image
                src="/logo.jpg"
                alt="Logo Comunidad del Intercambio"
                width={36}
                height={36}
                className="object-cover w-full h-full relative z-10"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white leading-none">
                SOP Reviewer
              </span>
              <span className="text-[9px] text-[#00A8E8] font-bold tracking-wider uppercase mt-1">
                Comunidad del Intercambio
              </span>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/login?msg=evaluar"
              className="bg-gradient-to-r from-[#00A8E8] to-[#0070b8] hover:from-[#00bfff] hover:to-[#00A8E8] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all shadow-[0_4px_15px_rgba(0,168,232,0.2)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Evaluar Ensayo
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* 🌌 HERO SECTION */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center pt-32 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Hero Content */}
          <div className="lg:col-span-6 text-left space-y-6 sm:space-y-8">
            {/* Simple Text Badge (Toned down AI) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#00A8E8]/10 text-[#00A8E8] text-xs font-bold border border-[#00A8E8]/20 shadow-[0_0_15px_rgba(0,168,232,0.05)]"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Evaluador de Ensayos Académicos</span>
            </motion.div>

            {/* Main Headline (Unified Blue Color) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.25] sm:leading-[1.15] tracking-tight text-white"
            >
              Recibe feedback <br className="hidden sm:block" />
              instantáneo sobre tu <br />
              <span className="text-[#00A8E8] drop-shadow-sm">
                ensayo para becas
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed"
            >
              Nuestra herramienta analiza tu carta de motivación (SOP), ayuda a corregir errores estructurales de estilo y asegura tu postulación académica internacional.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link
                href="/login?msg=evaluar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00A8E8] to-[#0070b8] hover:from-[#00bfff] hover:to-[#00A8E8] text-white px-7 py-3.5 rounded-xl text-sm font-extrabold transition-all shadow-[0_10px_25px_rgba(0,168,232,0.2)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Evaluar mi ensayo gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#como-funciona"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#010925]/40 hover:bg-[#010925]/80 text-slate-300 hover:text-white px-7 py-3.5 rounded-xl text-sm font-bold transition-all border border-white/[0.06] hover:border-white/10"
              >
                ¿Cómo funciona?
              </Link>
            </motion.div>
          </div>

          {/* Hero Interactive Simulator (No AI buzzwords, pure Blue accents) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full relative"
          >
            {/* Unified blue glow frame */}
            <div className="absolute -inset-1.5 bg-[#00A8E8] rounded-[24px] blur-xl opacity-15 pointer-events-none" />
            
            <div className="w-full bg-[#020b22] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[480px]">
              
              {/* Simulator Header */}
              <div className="px-5 py-3.5 bg-slate-950/60 border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-700" />
                    <span className="w-3 h-3 rounded-full bg-slate-700" />
                    <span className="w-3 h-3 rounded-full bg-[#00A8E8]" />
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider ml-2">Simulador de Revisión</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 bg-slate-900/60 border border-white/5 px-2.5 py-0.5 rounded-full font-bold">
                    Ensayo.docx
                  </span>
                </div>
              </div>

              {/* Simulator Work Area */}
              <div className="flex-1 grid sm:grid-cols-12 overflow-hidden">
                {/* Editor Side */}
                <div className="sm:col-span-7 p-5 overflow-y-auto border-r border-white/5 flex flex-col justify-between">
                  <div className="relative leading-relaxed text-xs sm:text-[13px] text-slate-300 select-none">
                    
                    {/* Scanning Overlay Laser Line (Unified Blue) */}
                    <AnimatePresence>
                      {isScanning && (
                        <motion.div
                          initial={{ top: "0%" }}
                          animate={{ top: "100%" }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
                          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-[#00A8E8] to-[#0070b8] shadow-[0_0_10px_#00A8E8] z-10 pointer-events-none"
                        />
                      )}
                    </AnimatePresence>

                    {/* Editor Text Blocks */}
                    <div className="relative space-y-2">
                      <p>
                        {currentText.map((block, idx) => {
                          if (block.isHighlight) {
                            const isSelected = activeHighlight === block.id
                            let bgClass = "bg-amber-500/10 text-amber-300 border-b border-amber-500/40"
                            if (isOptimized) {
                              bgClass = "bg-emerald-500/10 text-emerald-300 border-b border-emerald-500/40"
                            } else if (block.id === 1 || block.id === 2) {
                              bgClass = "bg-rose-500/10 text-rose-300 border-b border-rose-500/40"
                            }

                            return (
                              <button
                                key={idx}
                                onClick={() => !isScanning && setActiveHighlight(block.id ?? null)}
                                className={`transition-all duration-200 rounded px-1 py-0.5 mx-0.5 font-medium cursor-pointer ${
                                  isSelected ? "scale-[1.02] ring-1 ring-[#00A8E8]/40 shadow-md" : "hover:opacity-85"
                                } ${bgClass}`}
                              >
                                {block.text}
                              </button>
                            )
                          }
                          return <span key={idx}>{block.text}</span>
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Simulator Control Action Button */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 font-bold">
                      {isOptimized ? "Estado: Revisado" : "Clic en el texto para analizar"}
                    </div>
                    {isOptimized ? (
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-bold bg-slate-900 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reiniciar
                      </button>
                    ) : (
                      <button
                        onClick={handleOptimize}
                        disabled={isScanning}
                        className="inline-flex items-center gap-1.5 text-xs text-white font-extrabold bg-gradient-to-r from-[#00A8E8] to-[#0070b8] hover:from-[#00bfff] hover:to-[#00A8E8] px-3.5 py-2 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                        {isScanning ? "Analizando..." : "Optimizar Ensayo"}
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Review Details Side */}
                <div className="sm:col-span-5 bg-slate-950/20 p-5 overflow-y-auto flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4 block">
                    Reporte del Revisor
                  </span>

                  <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      {isScanning ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center text-center space-y-3 py-10"
                        >
                          <div className="w-8 h-8 border-3 border-[#00A8E8]/20 border-t-[#00A8E8] rounded-full animate-spin" />
                          <p className="text-xs text-slate-400 font-bold">Escaneando criterios...</p>
                        </motion.div>
                      ) : activeFeedbackItem ? (
                        <motion.div
                          key={activeHighlight + (isOptimized ? "-opt" : "-orig")}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold">
                              {activeFeedbackItem.category}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                              activeFeedbackItem.severity === 'success' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : activeFeedbackItem.severity === 'danger'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {activeFeedbackItem.badge}
                            </span>
                          </div>

                          <div className="bg-slate-900/60 border border-white/5 p-4 rounded-xl">
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                              {activeFeedbackItem.feedback}
                            </p>
                          </div>

                          {activeFeedbackItem.severity !== 'success' && (
                            <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-semibold">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>Crítico para evaluación oficial</span>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <div className="text-center text-slate-500 text-xs py-10">
                          Selecciona una frase resaltada para ver el diagnóstico detallado.
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* ⚙️ CÓMO FUNCIONA EN 3 PASOS */}
      <section id="como-funciona" className="py-24 sm:py-32 px-4 sm:px-6 relative z-20">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16 sm:mb-20 space-y-4">
            <span className="text-[#00A8E8] text-xs font-black tracking-widest uppercase bg-[#00A8E8]/10 px-3.5 py-1.5 rounded-full border border-[#00A8E8]/20">
              Proceso de Optimización
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              ¿Cómo funciona el revisor?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              En solo 3 pasos tendrás un diagnóstico profundo que potenciará drásticamente tu perfil y aumentará tus posibilidades de aceptación.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="bg-[#020b22]/50 border border-white/[0.05] p-8 rounded-2xl shadow-xl relative group overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#00A8E8]/30 hover:bg-[#03102c]/60 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,168,232,0.08)]"
            >
              {/* Top border glow line on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00A8E8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00A8E8] rounded-full blur-[70px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
              <div className="pt-4">
                <div className="text-3xl font-black text-[#00A8E8] mb-4 tracking-tight select-none">01</div>
                <h3 className="text-lg font-bold mb-3 text-white">Carga tu Documento</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Pega tu texto directamente en nuestro editor o sube un archivo **PDF**. El sistema extraerá e interpretará el contenido en segundos.
                </p>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-[#020b22]/50 border border-white/[0.05] p-8 rounded-2xl shadow-xl relative group overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#00A8E8]/30 hover:bg-[#03102c]/60 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,168,232,0.08)]"
            >
              {/* Top border glow line on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00A8E8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00A8E8] rounded-full blur-[70px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
              <div className="pt-4">
                <div className="text-3xl font-black text-[#00A8E8] mb-4 tracking-tight select-none">02</div>
                <h3 className="text-lg font-bold mb-3 text-white">Análisis de Contenido</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  El sistema examina tu narrativa y evalúa la estructura de tus argumentos basándose en los criterios clave de los comités evaluadores.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-[#020b22]/50 border border-white/[0.05] p-8 rounded-2xl shadow-xl relative group overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#00A8E8]/30 hover:bg-[#03102c]/60 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,168,232,0.08)]"
            >
              {/* Top border glow line on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00A8E8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00bfff] rounded-full blur-[70px] opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />
              <div className="pt-4">
                <div className="text-3xl font-black text-[#00A8E8] mb-4 tracking-tight select-none">03</div>
                <h3 className="text-lg font-bold mb-3 text-white">Sugerencias y Rúbricas</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Visualiza el resultado interactivo con observaciones sobre tus debilidades sintácticas, rúbricas de puntaje y guías directas de redacción.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 🚀 BENTO GRID DE CARACTERÍSTICAS */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 relative z-20 bg-slate-950/20">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16 sm:mb-20 space-y-4">
            <span className="text-[#00A8E8] text-xs font-black tracking-widest uppercase bg-[#00A8E8]/10 px-3.5 py-1.5 rounded-full border border-[#00A8E8]/20">
              Funcionalidades Clave
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Diseñado para la excelencia académica
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              No es solo un corrector ortográfico. Evaluamos la coherencia de tu historia y tu plan de retorno frente a estándares internacionales.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-12 gap-6">
            
            {/* Bento Box 1: Criterio de Beca (Large) */}
            <div className="md:col-span-8 bg-[#020b22]/50 border border-white/[0.05] p-8 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:border-[#00A8E8]/30 hover:bg-[#03102c]/60 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,168,232,0.08)]">
              {/* Top border glow line on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00A8E8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00A8E8] rounded-full blur-[100px] opacity-[0.02] group-hover:opacity-[0.04] transition-opacity" />
              
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A8E8] shadow-[0_0_8px_#00A8E8]" />
                    Análisis Específico de Rúbricas
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
                    Evaluamos según el programa al que postulas. Adecuamos el texto para cumplir los criterios específicos de programas de prestigio como **Chevening**, **Fulbright**, **Erasmus+** y **Fundación Carolina**.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                  {["Chevening", "Fulbright", "Erasmus+", "Fundación Carolina"].map((beca, idx) => (
                    <span key={idx} className="bg-slate-900/60 border border-white/5 text-[10px] sm:text-xs text-slate-300 px-3.5 py-2 rounded-lg font-bold text-center hover:border-[#00A8E8]/20 hover:text-white transition-colors duration-300 select-none">
                      {beca}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bento Box 2: Tono y Estilo (Small) */}
            <div className="md:col-span-4 bg-[#020b22]/50 border border-white/[0.05] p-8 rounded-2xl relative overflow-hidden group flex flex-col justify-between transition-all duration-300 hover:border-[#00A8E8]/30 hover:bg-[#03102c]/60 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,168,232,0.08)]">
              {/* Top border glow line on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00A8E8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00A8E8] rounded-full blur-[80px] opacity-[0.02] group-hover:opacity-[0.04] transition-opacity" />
              
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A8E8] shadow-[0_0_8px_#00A8E8]" />
                  Vocabulario y Estilo
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Detectamos expresiones redundantes, uso excesivo de voz pasiva y vocabulario informal para elevar el nivel de tu redacción académica.
                </p>
              </div>
            </div>

            {/* Bento Box 3: Diagnóstico Integral (Small) */}
            <div className="md:col-span-4 bg-[#020b22]/50 border border-white/[0.05] p-8 rounded-2xl relative overflow-hidden group flex flex-col justify-between transition-all duration-300 hover:border-[#00A8E8]/30 hover:bg-[#03102c]/60 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,168,232,0.08)]">
              {/* Top border glow line on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00A8E8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#00A8E8] rounded-full blur-[80px] opacity-[0.02] group-hover:opacity-[0.04] transition-opacity" />
              
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A8E8] shadow-[0_0_8px_#00A8E8]" />
                  Retorno e Impacto
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Verificamos que tu plan de retorno sea claro y exprese cómo piensas aplicar los conocimientos adquiridos a favor de tu comunidad.
                </p>
              </div>
            </div>

            {/* Bento Box 4: Reportes PDF (Large) */}
            <div className="md:col-span-8 bg-[#020b22]/50 border border-white/[0.05] p-8 rounded-2xl relative overflow-hidden group transition-all duration-300 hover:border-[#00A8E8]/30 hover:bg-[#03102c]/60 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,168,232,0.08)]">
              {/* Top border glow line on hover */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00A8E8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00A8E8] rounded-full blur-[100px] opacity-[0.02] group-hover:opacity-[0.04] transition-opacity" />
              
              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center h-full">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A8E8] shadow-[0_0_8px_#00A8E8]" />
                    Reporte de Revisión Descargable
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
                    Genera un reporte completo en PDF listo para imprimir o compartir, con el desglose de observaciones de redacción y las recomendaciones clave estructuradas.
                  </p>
                </div>
                <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex items-center gap-3 w-full md:w-auto shadow-lg hover:border-[#00A8E8]/20 transition-all duration-300 cursor-pointer select-none">
                  <div className="w-9 h-9 bg-[#00A8E8]/10 text-[#00A8E8] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-white leading-none">Analisis_De_Ensayo.pdf</p>
                    <p className="text-[10px] text-slate-500 mt-1">Descarga Completa</p>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 ml-2 animate-bounce" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 💬 PREGUNTAS FRECUENTES (FAQ) */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 relative z-20">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16 sm:mb-20 space-y-4">
            <span className="text-[#00A8E8] text-xs font-black tracking-widest uppercase bg-[#00A8E8]/10 px-3.5 py-1.5 rounded-full border border-[#00A8E8]/20">
              Resuelve tus dudas
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              ¿Tienes alguna duda sobre el funcionamiento del evaluador? Aquí respondemos las más comunes.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-[#020b22]/50 border border-white/[0.05] rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-slate-900/10 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-white pr-4">
                      {item.q}
                    </span>
                    <HelpCircle className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00A8E8]' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-5 pt-1 text-slate-400 text-xs sm:text-sm leading-relaxed border-t border-white/[0.03]">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* 🔮 FINAL CTA */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 relative z-20">
        <div className="max-w-5xl mx-auto rounded-3xl border border-white/[0.05] bg-gradient-to-br from-[#020c24] to-[#010512] p-8 sm:p-16 md:p-20 text-center shadow-2xl relative overflow-hidden group">
          {/* Inner Glow Effects (Unified Blue Only) */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00A8E8] rounded-full blur-[100px] opacity-[0.08] pointer-events-none group-hover:opacity-[0.12] transition-opacity duration-700" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#0070b8] rounded-full blur-[100px] opacity-[0.08] pointer-events-none group-hover:opacity-[0.12] transition-opacity duration-700" />

          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00A8E8]/20 to-transparent" />

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold mb-6 tracking-tight text-white relative z-10 leading-tight">
            ¿Listo para estudiar en la universidad de tus sueños?
          </h2>

          <p className="text-slate-400 mb-10 text-sm sm:text-base max-w-2xl mx-auto relative z-10 leading-relaxed">
            Más allá de tus calificaciones, lo crucial es tu narrativa. Perfeccionar tu carta de motivación es el paso definitivo para captar la atención de los comités evaluadores.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#00A8E8] to-[#0070b8] hover:from-[#00bfff] hover:to-[#00A8E8] text-white px-8 py-4 rounded-xl text-sm font-black transition-all shadow-[0_10px_30px_rgba(0,168,232,0.25)] hover:-translate-y-0.5 active:translate-y-0 relative z-10"
          >
            Crear mi cuenta gratuita
            <ArrowRight className="w-4 h-4" />
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
