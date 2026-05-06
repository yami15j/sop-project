'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Sparkles, GraduationCap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#00A8E8]/20 selection:text-[#010B2B]">

      {/* Navegación Oscura */}
      <nav className="absolute w-full z-50 bg-transparent py-6 px-6 md:px-12 flex justify-between items-center">
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
          <Link href="/dashboard" className="bg-[#00A8E8] hover:bg-[#0090C7] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-[#00A8E8]/30">
            Evaluar Ensayo
          </Link>
        </div>
      </nav>

      {/* Hero Section - Dark Navy Blue */}
      <section className="relative z-10 pt-48 pb-40 px-6 overflow-hidden bg-[#010B2B] text-white">
        {/* Glows de fondo para el Hero oscuro */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#00A8E8] rounded-full blur-[120px]"></div>
          <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-600 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#00A8E8]/20 text-[#00A8E8] text-sm font-bold border border-[#00A8E8]/30 mb-8 shadow-sm">
              <Sparkles className="w-4 h-4" /> Inteligencia Artificial para Estudiantes
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight text-white">
              Recibe feedback instantáneo sobre tu <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] to-purple-400">
                ensayo para becas
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Democratizamos el acceso a la educación global. Usa nuestra Inteligencia Artificial para pulir tu carta de motivación, corregir errores y asegurar tu futuro.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00A8E8] hover:bg-[#0090C7] text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg shadow-[#00A8E8]/30 hover:-translate-y-1">
                Evaluar mi ensayo gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#como-funciona" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all border border-white/10 shadow-sm hover:-translate-y-1 backdrop-blur-md">
                ¿Cómo funciona?
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cómo Funciona - Minimal Cards */}
      <section id="como-funciona" className="py-32 px-6 relative z-10 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#010B2B] mb-6 tracking-tight">¿Cómo funciona nuestro evaluador?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">En solo 3 simples pasos tendrás un análisis detallado que potenciará tu perfil para la universidad de tus sueños.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#010B2B]">1. Sube tu Ensayo</h3>
              <p className="text-slate-600 leading-relaxed">Pega tu carta de motivación o Personal Statement y dinos a qué beca o país apuntas. El sistema soporta hasta 2,500 palabras.</p>
            </motion.div>

            {/* Paso 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#010B2B]">2. La IA lo Analiza</h3>
              <p className="text-slate-600 leading-relaxed">Nuestro modelo entrenado con cientos de ensayos exitosos revisará tu estructura, gramática, tono y nivel de persuasión.</p>
            </motion.div>

            {/* Paso 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <GraduationCap className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#010B2B]">3. Recibe Feedback</h3>
              <p className="text-slate-600 leading-relaxed">Obtén un reporte detallado al instante con tus fortalezas y las áreas exactas donde debes mejorar para ganar esa beca.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-28 px-6 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#00A8E8]/10 text-[#00A8E8] text-sm font-bold border border-[#00A8E8]/20 mb-6">
              ⭐ Historias reales de éxito
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#010B2B] mb-5 tracking-tight">Lo que dicen nuestros estudiantes</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">Estudiantes de toda Latinoamérica ya usaron nuestra herramienta para perfeccionar sus ensayos y obtener sus becas.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                nombre: "Valeria Torres",
                pais: "🇨🇴 Colombia",
                beca: "Beca Chevening 2024",
                foto: "VT",
                color: "from-purple-500 to-indigo-600",
                texto: "Subí mi Personal Statement y en segundos la IA me señaló que mi narrativa era demasiado genérica. Gracias a las sugerencias, reescribí mi apertura y quedé entre los 50 seleccionados en Colombia. ¡Fue un cambio total!",
              },
              {
                nombre: "Andrés Mejía",
                pais: "🇪🇨 Ecuador",
                beca: "Beca Fulbright 2024",
                foto: "AM",
                color: "from-[#00A8E8] to-blue-600",
                texto: "Lo que más me sorprendió fue la velocidad. En menos de 2 minutos tenía un análisis detallado con mis fortalezas y áreas de mejora. El PDF que generé lo usé como guía durante todo el proceso de aplicación.",
              },
              {
                nombre: "Luciana Ríos",
                pais: "🇵🇪 Perú",
                beca: "Erasmus Mundus 2025",
                foto: "LR",
                color: "from-emerald-500 to-teal-600",
                texto: "Usé el evaluador 3 veces con distintas versiones de mi carta de motivación. Al final mi tutor me dijo que era el mejor Statement que había leído de un postulante latinoamericano.",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] flex flex-col gap-6 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="flex gap-1 text-amber-400 text-lg">{'★★★★★'}</div>
                <p className="text-slate-600 leading-relaxed text-[15px] flex-1">"{t.texto}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-md`}>
                    {t.foto}
                  </div>
                  <div>
                    <div className="font-bold text-[#010B2B] text-sm">{t.nombre}</div>
                    <div className="text-xs text-slate-500">{t.pais} · {t.beca}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - High Contrast */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-[#010B2B] rounded-[40px] p-12 md:p-24 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle Glows inside CTA */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A8E8] rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white relative z-10">¿Listo para estudiar en el extranjero?</h2>
          <p className="text-slate-300 mb-10 text-lg md:text-xl max-w-2xl mx-auto relative z-10">Más allá de las calificaciones, trabajamos en fortalecer habilidades, historias y perfiles que conecten con lo que realmente buscan las becas internacionales.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#00A8E8] hover:bg-[#0090C7] text-white px-10 py-5 rounded-2xl text-lg font-bold transition-all shadow-[0_0_40px_rgba(0,168,232,0.4)] hover:-translate-y-1 relative z-10">
            Crear mi cuenta gratuita
            <ArrowRight className="w-6 h-6" />
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
