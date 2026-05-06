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
}

export default function FeedbackCard({ rawResponse, puntajeEstimado, ensayoOriginal, becaObjetivo, paisDestino }: FeedbackCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const fortalezasStr = rawResponse.split('✅')[1]?.split('🔧')[0] || ''
  const mejorasStr = rawResponse.split('🔧')[1]?.split('💡')[0] || ''
  const recomendacionStr = rawResponse.split('💡')[1] || ''

  const fortalezas = fortalezasStr.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.'))
  const mejoras = mejorasStr.split('\n').filter(line => line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.'))

  const nivelTexto = puntajeEstimado >= 8 ? '¡Excelente perfil!' : puntajeEstimado >= 6 ? 'Buen perfil, mejorable' : 'Necesita trabajo'

  async function handleDownloadPDF() {
    setIsDownloading(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('pdf-premium-template')
      if (!element) throw new Error('No se encontró el template')

      const opt = {
        margin: 0,
        filename: `reporte-${becaObjetivo?.toLowerCase().replace(/\s+/g, '-') || 'analisis'}.pdf`,
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
    <div className="mt-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 text-slate-800">
      
      {/* ── INTERFAZ DEL DASHBOARD ── */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-100 gap-4">
        <div>
          <h4 className="text-xl font-bold text-[#010B2B]">Resultados del Análisis IA</h4>
          <p className="text-sm text-slate-500">Evaluado según los criterios de tu beca objetivo.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-full py-2 px-2 pr-6 shadow-sm">
          <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#00A8E8] to-blue-600 rounded-full text-white shadow-md shadow-[#00A8E8]/30">
            <span className="font-extrabold text-xl leading-none">{puntajeEstimado}</span>
            <span className="text-[10px] font-medium opacity-80 mt-1 ml-0.5">/10</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Calificación AI</span>
            <span className="text-sm font-extrabold text-[#010B2B]">{nivelTexto}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-emerald-50/50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h5 className="font-bold text-sm text-emerald-900 uppercase tracking-wide">Tus Fortalezas</h5>
          </div>
          <div className="p-5">
            <ul className="space-y-4">
              {fortalezas.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold mt-0.5">{i + 1}</span>
                  <span className="leading-relaxed">{f.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-orange-50/50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <h5 className="font-bold text-sm text-orange-900 uppercase tracking-wide">Áreas de Mejora</h5>
          </div>
          <div className="p-5">
            <ul className="space-y-4">
              {mejoras.map((m, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold mt-0.5">{i + 1}</span>
                  <span className="leading-relaxed">{m.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {ensayoOriginal && (
        <details className="mt-8 mb-6 group border-t border-slate-100 pt-8">
          <summary className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100/80 transition-all list-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm">
                <CheckCircle className="w-5 h-5 text-[#00A8E8]" />
              </div>
              <div>
                <span className="font-bold text-[#010B2B] block">Anexo: Ensayo Original</span>
                <span className="text-[11px] text-slate-400 font-medium">Haz clic para ver el texto analizado</span>
              </div>
            </div>
            <Plus className="w-5 h-5 text-slate-400 transition-transform duration-300 group-open:rotate-45" />
          </summary>
          <div className="mt-6 bg-[#F8FAFC] rounded-[32px] p-12 text-center border border-slate-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="text-2xl font-black text-[#010B2B] mb-2">Anexo: Ensayo Original</h3>
            <p className="text-sm text-slate-400 mb-10 font-medium">Texto íntegro proporcionado para el análisis</p>
            <div className="max-w-2xl mx-auto text-slate-700 leading-[2] text-[15px] whitespace-pre-wrap font-sans text-justify">
              {ensayoOriginal}
            </div>
          </div>
        </details>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
        <Link href="/dashboard?vista=mentoria" className="w-full sm:w-auto bg-[#010B2B] hover:bg-[#02134a] text-white font-semibold py-3 px-6 rounded-xl text-sm transition-colors text-center shadow-lg">
          ⭐ Trabajar mi ensayo con un Mentor
        </Link>
        <button onClick={handleDownloadPDF} disabled={isDownloading} className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-[#00A8E8] hover:bg-[#00A8E8] text-[#00A8E8] hover:text-white font-bold py-3 px-6 rounded-xl text-sm transition-all disabled:opacity-60">
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isDownloading ? 'Generando PDF...' : 'Descargar PDF'}
        </button>
      </div>

      {/* ── TEMPLATE PREMIUM (Siempre renderizado pero fuera de vista) ── */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -100, pointerEvents: 'none' }}>
        <div id="pdf-premium-template" style={{ width: '794px', backgroundColor: '#FFFFFF', color: '#1E293B', fontFamily: '"Inter", sans-serif', paddingBottom: '40px' }}>
          
          <div style={{ backgroundColor: '#010B2B', padding: '60px 60px 80px 60px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(0,168,232,0.1)' }}></div>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: '#00A8E8', marginBottom: '8px' }}>Reporte de Inteligencia Artificial</div>
                <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '0 0 5px 0', lineHeight: '1' }}>Análisis de Perfil</h1>
                <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>SOP Reviewer Premium</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#CBD5E1', fontWeight: 'bold' }}>{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 60px', marginTop: '-35px', position: 'relative', zIndex: 10 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '25px 35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', border: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', gap: '40px' }}>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Beca Objetivo</div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#010B2B' }}>{becaObjetivo || 'Análisis General'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Destino</div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#010B2B' }}>{paisDestino || 'Internacional'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Diagnóstico</div>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: puntajeEstimado >= 8 ? '#10B981' : '#00A8E8' }}>{nivelTexto.toUpperCase()}</div>
                </div>
                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: puntajeEstimado >= 8 ? '#10B981' : '#00A8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '900' }}>
                  {puntajeEstimado}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '40px 60px' }}>
            <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', marginBottom: '15px', borderLeft: '4px solid #10B981', paddingLeft: '10px' }}>Fortalezas Clave</h3>
                {fortalezas.map((f, i) => (
                  <div key={i} style={{ backgroundColor: '#F8FAFC', padding: '12px 15px', borderRadius: '12px', marginBottom: '10px', fontSize: '12px', color: '#334155', border: '1px solid #F1F5F9' }}>
                    {f.replace(/^\d+\.\s*/, '')}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', marginBottom: '15px', borderLeft: '4px solid #F97316', paddingLeft: '10px' }}>Áreas de Mejora</h3>
                {mejoras.map((m, i) => (
                  <div key={i} style={{ backgroundColor: '#F8FAFC', padding: '12px 15px', borderRadius: '12px', marginBottom: '10px', fontSize: '12px', color: '#334155', border: '1px solid #F1F5F9' }}>
                    {m.replace(/^\d+\.\s*/, '')}
                  </div>
                ))}
              </div>
            </div>

            {recomendacionStr && (
              <div style={{ backgroundColor: '#010B2B', padding: '30px', borderRadius: '20px', color: 'white' }}>
                <h3 style={{ fontSize: '11px', fontWeight: '900', color: '#00A8E8', textTransform: 'uppercase', marginBottom: '10px' }}>Veredicto del Mentor</h3>
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#E2E8F0', whiteSpace: 'pre-wrap' }}>{recomendacionStr.trim()}</div>
              </div>
            )}

            {ensayoOriginal && (
              <div style={{ marginTop: '50px', paddingTop: '40px', borderTop: '2px solid #F1F5F9', pageBreakBefore: 'always' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#010B2B', margin: '0 0 10px 0', fontFamily: 'Inter, sans-serif' }}>Anexo: Ensayo Original</h3>
                  <p style={{ fontSize: '14px', color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>Texto íntegro proporcionado para el análisis</p>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '2.2', color: '#1E293B', textAlign: 'justify', padding: '0 20px', fontFamily: 'Georgia, serif' }}>
                  {ensayoOriginal.split('\n').map((paragraph, idx) => paragraph.trim() && (
                    <p key={idx} style={{ marginBottom: '25px' }}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
