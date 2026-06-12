'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, Download, Lightbulb, Loader2, Plus } from 'lucide-react'

interface FeedbackCardProps {
  rawResponse: string
  puntajeEstimado: number
  ensayoOriginal?: string
  becaObjetivo?: string
  paisDestino?: string
  isAdminMode?: boolean
}

export default function FeedbackCard({ rawResponse, puntajeEstimado, ensayoOriginal, becaObjetivo, paisDestino, isAdminMode = false }: FeedbackCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [showSpanish, setShowSpanish] = useState(false)

  // Detect if the response has bilingual sections
  const isBilingual = rawResponse.includes('||')

  const getContentForLang = (text: string, getSpanish: boolean) => {
    if (!text) return ''
    if (!text.includes('||')) return text
    const parts = text.split('||')
    return getSpanish ? (parts[1] || parts[0]).trim() : parts[0].trim()
  }

  const getParsedItem = (line: string, getSpanish: boolean) => {
    const cleanedLine = line.replace(/^\d+\.\s*/, '')
    let text = cleanedLine
    if (cleanedLine.includes('||')) {
      const parts = cleanedLine.split('||')
      text = getSpanish ? (parts[1] || parts[0]).trim() : parts[0].trim()
    }

    // Reemplazar jerga técnica académica (jargon) por términos elegantes en español
    text = text
      .replace(/Hook de apertura/gi, 'Introducción Impactante')
      .replace(/\bHook\b/gi, 'Introducción Impactante')
      .replace(/Fit con el programa/gi, 'Conexión académica')
      .replace(/Fit con programa/gi, 'Conexión académica')
      .replace(/Fit académico/gi, 'Conexión académica')
      .replace(/\bFit\b/gi, 'Conexión académica')
      .replace(/Conexión con la Universidad/gi, 'Conexión académica')
      .replace(/Conexión con la universidad/gi, 'Conexión académica')
      .replace(/Momentos A-ha/gi, 'Transformación Personal')
      .replace(/Momentos Aha/gi, 'Transformación Personal')
      .replace(/Momento Aha/gi, 'Transformación Personal')
      .replace(/Plan de retorno/gi, 'Impacto a Futuro')
      .replace(/Diferenciación/gi, 'Perfil Único')
      .replace(/Extensión/gi, 'Estructura y Narrativa')
      .replace(/Mostrar no decir/gi, 'Evidencia de Logros')
      .replace(/Estructura y cierre/gi, 'Estructura y Narrativa')

    return text
  }

  // Parsing de las secciones incluyendo el nuevo ensayo anotado
  const annotatedSection = rawResponse.split('📝')[1] || ''
  const mainContent = rawResponse.split('📝')[0] || rawResponse

  const fortalezasStr = mainContent.split('✅')[1]?.split('🔧')[0] || ''
  const mejorasStr = mainContent.split('🔧')[1]?.split('💡')[0] || ''
  const recomendacionStr = mainContent.split('💡')[1] || ''

  const rawFortalezas = fortalezasStr.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.'))
  const rawMejoras = mejorasStr.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.'))

  const fortalezas = rawFortalezas.map(f => getParsedItem(f, showSpanish))

  let parsedMejoras = rawMejoras.map(m => getParsedItem(m, showSpanish))
  if (puntajeEstimado === 10) {
    parsedMejoras = []
  } else if (puntajeEstimado === 9) {
    parsedMejoras = parsedMejoras.slice(0, 1)
  } else if (puntajeEstimado === 7 || puntajeEstimado === 8) {
    parsedMejoras = parsedMejoras.slice(0, 2)
  } else {
    parsedMejoras = parsedMejoras.slice(0, 3)
  }
  const mejoras = parsedMejoras

  const nivelTexto = puntajeEstimado >= 8 ? '¡Excelente perfil!' : puntajeEstimado >= 6 ? 'Buen perfil, mejorable' : 'Necesita trabajo'

  // Función para renderizar el ensayo anotado con estilos
  const renderAnnotatedEssay = (text: string) => {
    if (!text) return <p className="text-slate-400 italic">No se generaron anotaciones para este ensayo.</p>

    const cleanText = text.replace('ENSAYO ANOTADO:', '').trim()

    // Normalizar análisis antiguos (> "texto" \n > 💬 SUGERENCIA: texto) al formato <texto>...<sugerencia>...
    const normalizedText = cleanText.replace(
      />\s*["“”']?([\s\S]*?)["“”']?\s*\n\s*>\s*(?:💬\s*)?SUGERENCIA:\s*([\s\S]*?)(?=(?:\n\n)|(?:>\s*["“”'])|$)/gi,
      (_, p1, p2) => `<texto>${p1.trim()}</texto><sugerencia>${p2.trim()}</sugerencia>`
    )

    // Dividir el texto por CUALQUIER cantidad de saltos de línea y limpiar vacíos
    const paragraphs = normalizedText.split(/\n+/).filter(p => p.trim().length > 0)

    return (
      <div className={`w-full ${isAdminMode ? 'space-y-3' : 'space-y-6'}`}>
        {paragraphs.map((paragraph, pIndex) => {
          // Separar cada párrafo buscando la etiqueta XML o el formato antiguo [SUGERENCIA:...]
          const parts = paragraph.split(/(<texto>[\s\S]*?<\/texto>\s*<sugerencia>[\s\S]*?<\/sugerencia>|(?:\{[\s\S]*?\})?\s*\[SUGERENCIA:[\s\S]*?\])/gi)

          return (
            <div key={pIndex} className={`leading-relaxed text-slate-700 text-justify ${isAdminMode ? 'text-xs leading-normal' : 'sm:leading-[1.9] text-[13px] sm:text-[15px]'}`}>
              {parts.map((part, index) => {
                const xmlMatch = part.match(/<texto>([\s\S]*?)<\/texto>\s*<sugerencia>([\s\S]*?)<\/sugerencia>/i)
                const matchWithBraces = part.match(/\{([\s\S]*?)\}\s*\[SUGERENCIA:([\s\S]*?)\]/i)
                const matchWithoutBraces = part.match(/\[SUGERENCIA:([\s\S]*?)\]/i)

                if (xmlMatch || matchWithBraces || matchWithoutBraces) {
                  const originalText = xmlMatch ? xmlMatch[1] : (matchWithBraces ? matchWithBraces[1] : null)
                  const suggestion = xmlMatch ? xmlMatch[2] : (matchWithBraces ? matchWithBraces[2] : (matchWithoutBraces?.[1] || ''))

                  return (
                    <span key={index} className="inline">
                      {originalText && (
                        <span className="inline bg-indigo-50 text-indigo-950 border-b-2 border-indigo-200 px-1 py-0.5 rounded font-bold shadow-[0_1px_2px_rgba(99,102,241,0.05)] transition-all hover:bg-indigo-100/80">
                          {originalText}
                        </span>
                      )}

                      {/* Bloque de sugerencia Ultra-Compacto y Delicado */}
                      <span className="block my-2 relative group isolate animate-in fade-in zoom-in-95 duration-300">
                        <span className="block relative overflow-hidden rounded-2xl bg-slate-50/50 border border-slate-100 shadow-sm transition-all hover:shadow hover:border-indigo-100/60">

                          {/* Borde izquierdo muy fino */}
                          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-300/80"></span>

                          <span className={`flex items-start gap-2.5 ${isAdminMode ? 'p-2' : 'p-2.5 sm:p-3'}`}>
                            <span className="flex-shrink-0 mt-0.5">
                              <span className="w-5 h-5 rounded-md bg-indigo-50/80 flex items-center justify-center">
                                <Lightbulb className="w-3 h-3 text-indigo-500" />
                              </span>
                            </span>

                            <span className="flex-1">
                              <span className="flex items-center gap-1.5 mb-0.5">
                                <strong className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                                  Sugerencia
                                </strong>
                              </span>

                              <span className={`block leading-relaxed text-slate-600 ${isAdminMode ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-[12px]'}`}>
                                {getContentForLang(suggestion.replace(/\]$/, ''), showSpanish)}
                              </span>
                            </span>
                          </span>
                        </span>
                      </span>
                    </span>
                  )
                }
                return <span key={index}>{part}</span>
              })}
            </div>
          )
        })}
      </div>
    )
  }

  async function handleDownloadPDF() {
    setIsDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('pdf-premium-template')
      if (!element) throw new Error('No se encontró el template')

      // Desactivamos el tipado estricto de TS para estas opciones ya que son correctas para la librería html2pdf
      const opt: any = {
        margin: [20, 0, 20, 0],
        filename: `ensayo-${becaObjetivo?.toLowerCase().replace(/\s+/g, '-') || 'original'}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          windowWidth: 794
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      await html2pdf().set(opt).from(element).save()

    } catch (err) {
      console.error('Error al generar PDF:', err)
      alert('Hubo un problema al generar el PDF. Revisa tu conexión.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="mt-2 text-slate-800">

      {/* ── INTERFAZ DEL DASHBOARD ── */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 gap-3 ${isAdminMode ? 'mb-4 pb-3' : 'mb-5 pb-4.5'}`}>
        <div className="w-full md:w-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <h4 className={`font-bold text-[#010B2B] ${isAdminMode ? 'text-sm' : 'text-lg'}`}>Resultados del Análisis IA</h4>

            {/* SWITCH DESLIZANTE DE TRADUCCIÓN PREMIUM */}
            {isBilingual && (
              <div className={`relative inline-flex items-center p-0.5 bg-[#F1F5F9] border border-slate-200/50 rounded-xl select-none shadow-inner shrink-0 self-start sm:self-auto transition-all duration-300 ${isAdminMode ? 'w-[150px] h-[28px]' : 'w-[170px] h-[32px]'}`}>
                {/* Deslizador de fondo */}
                <div
                  className="absolute top-0.5 bottom-0.5 bg-white border border-slate-200/25 rounded-lg shadow-sm transition-all duration-300 ease-out"
                  style={{
                    width: isAdminMode ? '70px' : '85px',
                    left: showSpanish ? (isAdminMode ? '76px' : '91px') : '4px'
                  }}
                />

                {/* Botón Original */}
                <button
                  type="button"
                  onClick={() => setShowSpanish(false)}
                  className={`relative z-10 text-center font-extrabold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-1 focus:outline-none ${isAdminMode ? 'w-[70px] text-[8px]' : 'w-[85px] text-[9px]'} ${!showSpanish ? 'text-[#010B2B]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  🌐 Original
                </button>

                {/* Botón Español */}
                <button
                  type="button"
                  onClick={() => setShowSpanish(true)}
                  className={`relative z-10 text-center font-extrabold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-1 focus:outline-none ${isAdminMode ? 'w-[70px] text-[8px]' : 'w-[85px] text-[9px]'} ${showSpanish ? 'text-[#010B2B]' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  🇪🇸 Español
                </button>
              </div>
            )}
          </div>
          {!isAdminMode && (
            <p className="text-sm text-slate-500 mt-1">
              {isBilingual && showSpanish
                ? 'Evaluado según los criterios de tu beca (Traducción en Español).'
                : 'Evaluado según los criterios de tu beca objetivo.'}
            </p>
          )}
        </div>
        {/* Diseño Minimalista Premium (Solo Tipografía) */}
        <div className="flex flex-col items-end justify-center shrink-0">
          <div className="flex items-baseline gap-0.5">
            <span className={`font-black tracking-tight leading-none ${isAdminMode ? 'text-lg' : 'text-2xl'} ${puntajeEstimado >= 8 ? "text-emerald-500" :
              puntajeEstimado >= 6 ? "text-[#00A8E8]" :
                "text-orange-500"
              }`}>
              {puntajeEstimado}
            </span>
            <span className={`font-bold text-slate-400 ${isAdminMode ? 'text-xs' : 'text-sm'}`}>/10</span>
          </div>
          <div className={`mt-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${puntajeEstimado >= 8 ? "bg-emerald-50 text-emerald-600" :
            puntajeEstimado >= 6 ? "bg-blue-50 text-blue-600" :
              "bg-orange-50 text-orange-600"
            }`}>
            {nivelTexto}
          </div>
        </div>
      </div>

      <div className={`grid gap-3.5 ${isAdminMode ? 'grid-cols-1 mb-4' : 'md:grid-cols-2 mb-5'}`}>
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          <div className={`bg-emerald-50/50 border-b border-slate-100 flex items-center gap-2 ${isAdminMode ? 'py-1 px-3' : 'py-1.5 px-3.5'}`}>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <h5 className={`font-bold text-emerald-900 uppercase tracking-widest ${isAdminMode ? 'text-[9px]' : 'text-[10px]'}`}>Tus Fortalezas</h5>
          </div>
          <div className={isAdminMode ? 'p-2.5' : 'p-3 sm:p-3.5'}>
            <ul className="space-y-2">
              {fortalezas.map((f, i) => (
                <li key={i} className={`flex items-start gap-2.5 text-slate-700 ${isAdminMode ? 'text-[11px]' : 'text-[12px] sm:text-[13px]'}`}>
                  <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold mt-0.5">{i + 1}</span>
                  <span className="leading-snug">{f.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          <div className={`${puntajeEstimado === 10 ? 'bg-indigo-50/50' : 'bg-orange-50/50'} border-b border-slate-100 flex items-center gap-2 ${isAdminMode ? 'py-1 px-3' : 'py-1.5 px-3.5'}`}>
            {puntajeEstimado === 10 ? (
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
            )}
            <h5 className={`font-bold uppercase tracking-widest ${puntajeEstimado === 10 ? 'text-indigo-950' : 'text-orange-900'} ${isAdminMode ? 'text-[9px]' : 'text-[10px]'}`}>Áreas de Mejora</h5>
          </div>
          <div className={isAdminMode ? 'p-2.5' : 'p-3 sm:p-3.5'}>
            {puntajeEstimado === 10 ? (
              <div className={`flex items-start gap-2.5 text-slate-700 ${isAdminMode ? 'text-[11px]' : 'text-[12px] sm:text-[13px]'}`}>
                <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold mt-0.5">✓</span>
                <span className="leading-snug font-medium italic">
                  {isBilingual
                    ? (showSpanish ? "¡Excelente! Tu ensayo es excepcional, no requiere áreas de mejora." : "Excellent! Your essay is exceptional, no areas of improvement needed.")
                    : "¡Excelente! Tu ensayo es excepcional, no requiere áreas de mejora."}
                </span>
              </div>
            ) : (
              <ul className="space-y-2">
                {mejoras.map((m, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-slate-700 ${isAdminMode ? 'text-[11px]' : 'text-[12px] sm:text-[13px]'}`}>
                    <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-[9px] font-bold mt-0.5">{i + 1}</span>
                    <span className="leading-snug">{m.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {annotatedSection && (
        <div className={`group border-t border-slate-100 ${isAdminMode ? 'mt-5 pt-4' : 'mt-8 pt-6'}`}>
          <div className={`flex items-center gap-2.5 ${isAdminMode ? 'mb-3' : 'mb-4'}`}>
            <div className={`rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm border border-orange-100 ${isAdminMode ? 'w-7 h-7' : 'w-9 h-9'}`}>
              <Lightbulb className={isAdminMode ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'} />
            </div>
            <div>
              <h3 className={`font-bold text-[#010B2B] ${isAdminMode ? 'text-sm' : 'text-base'}`}>Ensayo con Sugerencias</h3>
              {!isAdminMode && (
                <p className="text-[11px] text-slate-400 font-medium">Pasa el cursor sobre el texto resaltado para ver los consejos de mejora.</p>
              )}
            </div>
          </div>

          <div className={`bg-[#F8FAFC] border border-slate-100/50 shadow-inner ${isAdminMode ? 'rounded-xl p-3' : 'rounded-xl px-3 py-4 sm:p-6 md:p-8'}`}>
            {renderAnnotatedEssay(annotatedSection)}
          </div>
        </div>
      )}

      {recomendacionStr && recomendacionStr.trim().length > 0 && (
        <div className={`bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100 rounded-xl shadow-sm relative overflow-hidden ${isAdminMode ? 'mt-5 mb-4 p-3.5' : 'mt-6 mb-5 p-4 sm:p-5 md:p-6'}`}>
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-l-xl"></div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 relative z-10 text-center md:text-left">
            <div className={`flex-shrink-0 bg-white rounded-full flex items-center justify-center text-indigo-650 shadow-md border border-indigo-50 ${isAdminMode ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <Lightbulb className={isAdminMode ? 'w-4 h-4' : 'w-5 h-5'} />
            </div>
            <div className="flex-1">
              <h4 className={`text-[#010B2B] font-bold mb-1.5 ${isAdminMode ? 'text-xs' : 'text-base'}`}>Recomendación del Asistente</h4>
              <p className={`leading-relaxed transition-all duration-300 text-slate-650 ${isAdminMode ? 'text-[11px]' : 'text-[13px] sm:text-[15px]'}`}>
                {getContentForLang(recomendacionStr.replace(/RECOMENDACIÓN FINAL:/i, '').trim(), showSpanish)}
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAdminMode && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
          <Link href="/dashboard?vista=mentoria" className="w-full sm:w-auto bg-[#010B2B] hover:bg-[#02134a] text-white font-semibold py-2.5 px-5 rounded-lg text-xs sm:text-[13px] transition-colors text-center shadow-lg">
            ⭐ Trabajar mi ensayo con un Mentor
          </Link>
          <button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-[#00A8E8] hover:bg-[#00A8E8] text-[#00A8E8] hover:text-white font-bold py-2.5 px-5 rounded-lg text-xs sm:text-[13px] transition-all disabled:opacity-60">
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? 'Generando PDF...' : 'Descargar Ensayo'}
          </button>
        </div>
      )}

      {/* ── TEMPLATE DEL ENSAYO ORIGINAL PARA PDF (Oculto) ── */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -100, pointerEvents: 'none' }}>
        <div id="pdf-premium-template" style={{ width: '794px', minHeight: '1123px', backgroundColor: '#FFFFFF', color: '#000000', fontFamily: '"Times New Roman", Times, serif', padding: '80px 90px' }}>

          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Ensayo de Aplicación
            </h1>
            {becaObjetivo && (
              <p style={{ fontSize: '14px', margin: '0', color: '#333' }}>
                Programa: {becaObjetivo} {paisDestino ? `| ${paisDestino}` : ''}
              </p>
            )}
          </div>

          <div style={{ fontSize: '12pt', lineHeight: '2.0', textAlign: 'justify' }}>
            {ensayoOriginal ? ensayoOriginal.split('\n').map((paragraph, idx) => paragraph.trim() && (
              <p key={idx} style={{ marginBottom: '15px' }}>{paragraph}</p>
            )) : <p style={{ textAlign: 'center', color: '#666' }}>No se encontró el texto original del ensayo.</p>}
          </div>

        </div>
      </div>

    </div>
  )
}
