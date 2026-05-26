'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Sparkles, Globe, BookOpen, AlignLeft, Download, AlertTriangle, X } from 'lucide-react'

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

const getValidationWarning = (beca: string, pais: string): string | null => {
  if (!beca || !pais) return null
  const normPais = normalizeText(pais)
  const normBeca = normalizeText(beca)

  if (normBeca === 'chevening') {
    const validKeywords = ['reino unido', 'uk', 'inglaterra', 'escocia', 'gales', 'irlanda del norte', 'great britain', 'gran bretana']
    const matches = validKeywords.some(kw => normPais.includes(kw))
    if (!matches) {
      return 'Chevening está dirigida únicamente a estudios en el Reino Unido. ¿Estás seguro de tu país de destino?'
    }
  }

  if (normBeca === 'fundacion carolina') {
    const validKeywords = ['espana', 'spain']
    const matches = validKeywords.some(kw => normPais.includes(kw))
    if (!matches) {
      return 'Fundación Carolina está dirigida únicamente a estudios en España. ¿Estás seguro de tu país de destino?'
    }
  }

  if (normBeca === 'erasmus mundus') {
    const validKeywords = [
      'europa', 'europe', 'alemania', 'germany', 'francia', 'france', 'espana', 'spain', 
      'italia', 'italy', 'belgica', 'belgium', 'paises bajos', 'netherlands', 'holanda', 
      'portugal', 'suecia', 'sweden', 'austria', 'finlandia', 'finland', 'dinamarca', 'denmark', 
      'polonia', 'poland', 'irlanda', 'ireland', 'grecia', 'greece', 'suiza', 'switzerland',
      'noruega', 'norway', 'hungria', 'hungary', 'reino unido', 'uk'
    ]
    const matches = validKeywords.some(kw => normPais.includes(kw))
    if (!matches) {
      return 'Erasmus Mundus está dirigida a estudios en países europeos. ¿Estás seguro de tu país de destino?'
    }
  }

  if (normBeca === 'fulbright') {
    const validKeywords = ['estados unidos', 'eeuu', 'ee.uu', 'usa', 'united states', 'america', 'us']
    const matches = validKeywords.some(kw => normPais.includes(kw))
    if (!matches) {
      return 'Fulbright está dirigida únicamente a estudios en Estados Unidos. ¿Estás seguro de tu país de destino?'
    }
  }

  if (normBeca === 'eiffel') {
    const validKeywords = ['francia', 'france']
    const matches = validKeywords.some(kw => normPais.includes(kw))
    if (!matches) {
      return 'Eiffel está dirigida únicamente a estudios en Francia. ¿Estás seguro de tu país de destino?'
    }
  }

  if (normBeca === 'daad') {
    const validKeywords = ['alemania', 'germany', 'deutschland']
    const matches = validKeywords.some(kw => normPais.includes(kw))
    if (!matches) {
      return 'El DAAD está dirigido únicamente a estudios en Alemania. ¿Estás seguro de tu país de destino?'
    }
  }

  if (normBeca === 'mext') {
    const validKeywords = ['japon', 'japan']
    const matches = validKeywords.some(kw => normPais.includes(kw))
    if (!matches) {
      return 'MEXT está dirigida únicamente a estudios en Japón. ¿Estás seguro de tu país de destino?'
    }
  }

  if (normBeca === 'oea') {
    const validKeywords = [
      'oea', 'oas', 'estados unidos', 'eeuu', 'ee.uu', 'usa', 'united states', 'america', 'us',
      'canada', 'mexico', 'colombia', 'peru', 'chile', 'argentina', 'brasil', 'brazil',
      'ecuador', 'costa rica', 'panama', 'uruguay', 'paraguay', 'bolivia', 'venezuela',
      'guatemala', 'honduras', 'el salvador', 'nicaragua', 'republica dominicana', 'caribe'
    ]
    const matches = validKeywords.some(kw => normPais.includes(kw))
    if (!matches) {
      return 'Las becas OEA están dirigidas a estudios en países miembros de la OEA (principalmente en las Américas). ¿Estás seguro de tu país de destino?'
    }
  }

  return null
}

interface AnalyzeFormProps {
  ensayosRestantes?: number
  hasLead?: boolean
}

export default function AnalyzeForm({ ensayosRestantes = 2, hasLead = false }: AnalyzeFormProps) {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [ensayoText, setEnsayoText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [becaSelection, setBecaSelection] = useState('')
  const [otraBeca, setOtraBeca] = useState('')
  const [paisDestino, setPaisDestino] = useState('')
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const actualBeca = becaSelection === 'Otra' ? otraBeca : becaSelection

  const loadingMessages = [
    "Analizando estructura del ensayo...",
    "Evaluando gramática y vocabulario...",
    "Identificando fortalezas ocultas...",
    "Redactando áreas de mejora...",
    "Generando reporte de IA...",
  ]

  useEffect(() => {
    const text = ensayoText.trim()
    setWordCount(text === '' ? 0 : text.split(/\s+/).length)
  }, [ensayoText])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [isAnalyzing])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (ensayosRestantes === 0) {
      setError("No tienes créditos de análisis disponibles. Por favor, agenda una mentoría personalizada para revisar tu ensayo.")
      return
    }

    const form = e.currentTarget

    if (wordCount > 2500) {
      setError("Tu ensayo supera el límite de 2,500 palabras. Por favor, recórtalo un poco.")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setSuccess(false)
    setLoadingMessageIndex(0)

    const formData = new FormData(form)
    const pais = formData.get('pais') as string
    const becaBase = formData.get('beca') as string
    const beca = becaBase === 'Otra' ? otraBeca : becaBase
    const ensayo = formData.get('ensayo') as string

    try {
      const pdfUrl = (window as any).lastUploadedPdfUrl || null
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pais_destino: pais, 
          beca_objetivo: beca, 
          ensayo,
          pdf_url: pdfUrl 
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ocurrió un error al analizar el ensayo.')

      setSuccess(true)
      setEnsayoText('')
      setBecaSelection('')
      setOtraBeca('')
      setPaisDestino('')
      form.reset()
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const isOverLimit = wordCount > 2500
  const isEmpty = wordCount === 0
  const wordPercent = Math.min((wordCount / 2500) * 100, 100)

  const inputStyle = (field: string) => ({
    width: '100%',
    background: focusedField === field ? '#ffffff' : '#f8fafc',
    border: `1.5px solid ${focusedField === field ? '#00A8E8' : '#e2e8f0'}`,
    borderRadius: '14px',
    padding: '14px 16px',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(0,168,232,0.12)' : 'none',
  })

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.04)' }}>

      {/* Header del form */}
      <div className="px-5 sm:px-8 py-5 sm:py-6 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h3 className="text-base font-extrabold text-white leading-none">Datos de tu Aplicación</h3>
          <p className="text-xs text-slate-300 font-medium mt-1.5">Completa los campos para un análisis preciso</p>
        </div>
      </div>


      <div className="p-5 sm:p-8">

        {/* Success */}
        {success && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl mb-6 text-sm font-medium animate-in fade-in zoom-in duration-300" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
            <span className="text-lg leading-none">✅</span>
            <span>¡Análisis completado con éxito! Selecciona tu ensayo en el menú izquierdo para ver los resultados.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Grid de campos superiores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* País */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">
                <Globe className="w-3.5 h-3.5" />
                País de Destino
              </label>
              <input
                name="pais"
                type="text"
                required
                disabled={isAnalyzing}
                placeholder="Ej. Reino Unido, España, Alemania..."
                style={inputStyle('pais')}
                value={paisDestino}
                onChange={(e) => setPaisDestino(e.target.value)}
                onFocus={() => setFocusedField('pais')}
                onBlur={() => setFocusedField(null)}
              />
              {actualBeca && paisDestino && getValidationWarning(actualBeca, paisDestino) && (
                <p className="mt-2 text-[11px] font-bold text-amber-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  {getValidationWarning(actualBeca, paisDestino)}
                </p>
              )}
            </div>

            {/* Beca */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">
                <BookOpen className="w-3.5 h-3.5" />
                Beca a la que aplicas
              </label>
              <div className="relative">
                <select
                  name="beca"
                  required
                  disabled={isAnalyzing}
                  value={becaSelection}
                  onChange={(e) => {
                    const sel = e.target.value
                    setBecaSelection(sel)
                    // Lógica de llenado automático (autofill)
                    if (sel === 'Chevening') setPaisDestino('Reino Unido')
                    else if (sel === 'Fundación Carolina') setPaisDestino('España')
                    else if (sel === 'Erasmus Mundus') setPaisDestino('Europa')
                    else if (sel === 'Fulbright') setPaisDestino('Estados Unidos')
                    else if (sel === 'Eiffel') setPaisDestino('Francia')
                    else if (sel === 'DAAD') setPaisDestino('Alemania')
                    else if (sel === 'MEXT') setPaisDestino('Japón')
                    else if (sel === 'OEA') setPaisDestino('América')
                  }}
                  style={{ ...inputStyle('beca'), appearance: 'none', cursor: 'pointer' }}
                  onFocus={() => setFocusedField('beca')}
                  onBlur={() => setFocusedField(null)}
                >
                  <option value="" disabled>Selecciona una opción...</option>
                  <option value="Chevening">Chevening (Reino Unido)</option>
                  <option value="Fundación Carolina">Fundación Carolina (España)</option>
                  <option value="Erasmus Mundus">Erasmus Mundus (Europa)</option>
                  <option value="Fulbright">Fulbright (USA)</option>
                  <option value="Eiffel">Eiffel (Francia)</option>
                  <option value="DAAD">DAAD (Alemania)</option>
                  <option value="MEXT">MEXT (Japón)</option>
                  <option value="OEA">OEA (América)</option>
                  <option value="Otra">Otra beca...</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Campo extra si elige 'Otra' */}
          {becaSelection === 'Otra' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="flex items-center gap-1.5 text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">
                Nombre de la Beca
              </label>
              <input
                type="text"
                required
                disabled={isAnalyzing}
                placeholder="Escribe el nombre de tu beca u organización..."
                value={otraBeca}
                onChange={(e) => setOtraBeca(e.target.value)}
                style={inputStyle('otraBeca')}
                onFocus={() => setFocusedField('otraBeca')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          )}

            {/* Textarea del ensayo */}
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between mb-2.5">
                <label className="flex items-center gap-1.5 text-xs text-slate-500 uppercase font-bold tracking-wide">
                  <AlignLeft className="w-3.5 h-3.5" />
                  Tu Ensayo / Personal Statement
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {fileName && (
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-100 rounded-md animate-in fade-in zoom-in duration-300">
                      <div className="w-5 h-7 bg-white border border-blue-200 rounded flex items-center justify-center overflow-hidden shadow-sm">
                        {pdfPreview ? (
                          <iframe src={pdfPreview} className="w-[400%] h-[400%] scale-[0.25] origin-top-left pointer-events-none" />
                        ) : (
                          <BookOpen className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 max-w-[80px] truncate">{fileName}</span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFileName(null);
                          setPdfPreview(null);
                          setEnsayoText('');
                        }}
                        className="text-blue-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Botón Subir PDF */}
                  <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-[10px] font-bold transition-all border border-slate-200">
                    <Download className="w-3 h-3 rotate-180" />
                    Subir PDF
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        setIsAnalyzing(true)
                        setError(null)
                        
                        try {
                          // 1. Cargamos pdfjs para la extracción de texto
                          const pdfjs = await import('pdfjs-dist')
                          // Usamos unpkg que suele tener la estructura de carpetas correcta para esta versión
                          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
                          
                          const arrayBuffer = await file.arrayBuffer()
                          const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise
                          let fullText = ''
                          for (let i = 1; i <= pdfDoc.numPages; i++) {
                            const page = await pdfDoc.getPage(i)
                            const content = await page.getTextContent()
                            
                            let pageText = ''
                            let lastY = null
                            
                            for (const item of content.items as any[]) {
                              if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                                // Si hay un salto muy grande (> 18), asumimos que es un cambio de párrafo (\n\n)
                                if (Math.abs(item.transform[5] - lastY) > 18) {
                                  pageText += '\n\n'
                                } else {
                                  // Es un simple salto de línea visual del PDF, lo unimos con espacio para que fluya
                                  if (!pageText.endsWith(' ')) {
                                    pageText += ' '
                                  }
                                }
                              } else if (lastY !== null && item.str.trim() !== '') {
                                if (!pageText.endsWith(' ')) {
                                  pageText += ' '
                                }
                              }
                              pageText += item.str
                              lastY = item.transform[5]
                            }
                            
                            fullText += pageText + '\n\n'
                          }
                          const finalDetectedText = fullText.trim()
                          if (!finalDetectedText) {
                            throw new Error("No se detectó texto en el PDF. Revisa si es una imagen o está protegido.")
                          }
                          setEnsayoText(finalDetectedText)
                          setFileName(file.name)
                          
                          // Vista previa opcional
                          setPdfPreview(URL.createObjectURL(file))

                          // 2. Subimos el archivo a Supabase Storage
                          const { createClient } = await import('@/utils/supabase/client')
                          const supabase = createClient()
                          
                          const fileExt = file.name.split('.').pop()
                          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
                          const filePath = `originales/${fileName}`

                          const { error: uploadError } = await supabase.storage
                            .from('Ensayos')
                            .upload(filePath, file)

                          if (uploadError) throw uploadError

                          const { data } = supabase.storage
                            .from('Ensayos')
                            .getPublicUrl(filePath)
                          
                          const publicUrl = (data as any)?.publicUrl || (data as any);
                          
                          // Guardamos la URL en un campo oculto o estado
                          (window as any).lastUploadedPdfUrl = publicUrl;

                        } catch (err: any) {
                          console.error('Error procesando PDF:', err)
                          setError(`Error: ${err.message || 'Error desconocido al procesar el archivo'}`)
                        } finally {
                          setIsAnalyzing(false)
                        }
                      }}
                    />
                  </label>
                  {/* Badge contador */}
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{
                    background: isOverLimit ? '#fef2f2' : wordCount > 2000 ? '#fff7ed' : '#f1f5f9',
                    color: isOverLimit ? '#dc2626' : wordCount > 2000 ? '#ea580c' : '#64748b',
                    border: `1px solid ${isOverLimit ? '#fecaca' : wordCount > 2000 ? '#fed7aa' : '#e2e8f0'}`
                  }}>
                    {wordCount.toLocaleString()} / 2,500 palabras
                  </span>
                </div>
              </div>

              {/* Barra de progreso del texto */}
              <div className="h-1 rounded-full mb-2 overflow-hidden" style={{ background: '#f1f5f9' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${wordPercent}%`,
                    background: isOverLimit ? '#ef4444' : wordCount > 2000 ? '#f97316' : 'linear-gradient(to right, #00A8E8, #0070b8)'
                  }}
                />
              </div>

              {error && (
                <p className="mb-3 text-xs font-bold text-red-500 animate-in fade-in duration-200 leading-relaxed">
                  * {error === "No tienes créditos de análisis disponibles. Por favor, agenda una mentoría personalizada para revisar tu ensayo." ? (
                    <>
                      No tienes créditos de análisis disponibles. Por favor,{' '}
                      <Link href="/dashboard?vista=mentoria" className="underline hover:text-red-600 transition-colors">
                        agenda una mentoría personalizada
                      </Link>{' '}
                      para revisar tu ensayo.
                    </>
                  ) : (
                    error
                  )}
                </p>
              )}

              <textarea
                name="ensayo"
                required
                disabled={isAnalyzing}
                rows={16}
                value={ensayoText}
                onChange={(e) => {
                  setEnsayoText(e.target.value)
                  if (error) setError(null) // Limpiar el error al escribir
                }}
                placeholder="Escribe o pega tu Personal Statement o Carta de Motivación aquí, o sube un archivo PDF..."
                style={{
                  ...inputStyle('textarea'),
                  resize: 'vertical',
                  minHeight: '300px',
                  lineHeight: '1.7',
                  textAlign: 'justify'
                }}
                onFocus={() => setFocusedField('textarea')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

          {/* Botón Analizar */}
          <button
            type="submit"
            disabled={isAnalyzing || isOverLimit || isEmpty}
            className="w-full py-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2.5 transition-all"
            style={{
              background: isAnalyzing || isOverLimit || isEmpty
                ? '#e2e8f0'
                : 'linear-gradient(135deg, #00A8E8, #0070b8)',
              border: 'none',
              color: isAnalyzing || isOverLimit || isEmpty 
                ? '#94a3b8' 
                : 'white',
              boxShadow: isAnalyzing || isOverLimit || isEmpty 
                ? 'none' 
                : '0 8px 32px rgba(0,168,232,0.3)',
              cursor: isAnalyzing || isOverLimit || isEmpty ? 'not-allowed' : 'pointer',
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="animate-pulse">{loadingMessages[loadingMessageIndex]}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analizar con Inteligencia Artificial
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}
