'use client'

import { useState } from 'react'
import { CheckCircle, AlertTriangle, Download, Lightbulb, Loader2 } from 'lucide-react'

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

      element.style.display = 'block'

      const opt = {
        margin: [15, 0, 15, 0] as [number, number, number, number],
        filename: `reporte-${becaObjetivo?.toLowerCase().replace(/\s+/g, '-') || 'ensayo'}-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }

      await html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get('pdf')
        .then((pdf: any) => {
          // TRUCO MAGISTRAL: Dibujamos un rectángulo azul en el margen blanco 
          // de la página 1 para que parezca que el banner toca el borde.
          pdf.setPage(1)
          pdf.setFillColor(1, 11, 43) // Color RGB de #010B2B
          pdf.rect(0, 0, 210, 16, 'F') // 210mm de ancho (A4), 16mm de alto (cubre el margen)
        })
        .save()
        
      element.style.display = 'none'

    } catch (err) {
      console.error('Error generando PDF:', err)
      alert('Hubo un error al generar el PDF. Por favor intenta de nuevo.')
    } finally {
      setIsDownloading(false)
    }
  }

return (
  <div className="mt-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 text-slate-800">

    {/* Header con la Calificación */}
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

    {/* Grid de Fortalezas y Debilidades */}
    <div className="grid md:grid-cols-2 gap-5 mb-8">
      {/* Fortalezas */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-emerald-50/50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <h5 className="font-bold text-sm text-emerald-900 uppercase tracking-wide">Tus Fortalezas</h5>
        </div>
        <div className="p-5">
          <ul className="space-y-4">
            {fortalezas.length > 0 ? (
              fortalezas.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold mt-0.5">{i + 1}</span>
                  <span className="leading-relaxed">{f.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">No se pudieron extraer las fortalezas automáticamente.</p>
            )}
          </ul>
        </div>
      </div>

      {/* Áreas de Mejora */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-orange-50/50 border-b border-slate-100 px-5 py-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <h5 className="font-bold text-sm text-orange-900 uppercase tracking-wide">Áreas de Mejora</h5>
        </div>
        <div className="p-5">
          <ul className="space-y-4">
            {mejoras.length > 0 ? (
              mejoras.map((m, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold mt-0.5">{i + 1}</span>
                  <span className="leading-relaxed">{m.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">No se pudieron extraer las áreas de mejora automáticamente.</p>
            )}
          </ul>
        </div>
      </div>
    </div>

    {/* Ensayo Original */}
    {ensayoOriginal && (
      <details className="mb-8 group">
        <summary className="flex items-center justify-between font-bold text-lg text-[#010B2B] cursor-pointer list-none border-b border-slate-100 pb-2 mb-4">
          <span>Tu Ensayo Original</span>
          <span className="text-slate-400 text-xs transition-transform group-open:rotate-180">▼</span>
        </summary>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto shadow-inner">
          {ensayoOriginal}
        </div>
      </details>
    )}

    {/* Recomendación Final */}
    {recomendacionStr && (
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-2 text-blue-700">
          <Lightbulb className="w-5 h-5" />
          <h5 className="font-bold text-md">Recomendación Final de la IA</h5>
        </div>
        <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">
          {recomendacionStr.trim()}
        </p>
      </div>
    )}

    {/* Botones de acción */}
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
      <a
        href="mailto:ventas@equipocomercial.com?subject=Quiero una mentoría personalizada"
        className="w-full sm:w-auto bg-[#010B2B] hover:bg-[#02134a] text-white font-semibold py-3 px-6 rounded-xl text-sm transition-colors text-center shadow-lg"
      >
        ⭐ Trabajar mi ensayo con un Mentor
      </a>
      <button
        onClick={handleDownloadPDF}
        disabled={isDownloading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-[#00A8E8] hover:bg-[#00A8E8] text-[#00A8E8] hover:text-white font-bold py-3 px-6 rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Descargar PDF
          </>
        )}
      </button>
    </div>

    {/* Raw Response */}
    <details className="mt-8">
      <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">Ver respuesta original de la IA</summary>
      <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 whitespace-pre-wrap">
        {rawResponse}
      </div>
    </details>

    {/* ───────────────────────────────────────────────────────── */}
    {/* TEMPLATE OCULTO PARA EL PDF ULTRA PREMIUM */}
    {/* ───────────────────────────────────────────────────────── */}
    <div id="pdf-premium-template" style={{ display: 'none', width: '794px', backgroundColor: '#FAFAFA', color: '#0F172A', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      
      {/* Banner Superior Oscuro */}
      <div style={{ backgroundColor: '#010B2B', padding: '50px 50px 70px 50px', color: 'white', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#00A8E8', fontWeight: 'bold', marginBottom: '10px' }}>Evaluación con IA</div>
            <h1 style={{ fontSize: '38px', fontWeight: '900', margin: '0 0 8px 0', lineHeight: '1.1', letterSpacing: '-0.5px' }}>Reporte de Perfil</h1>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, fontWeight: '500' }}>La Comunidad del Intercambio</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 'bold' }}>{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style={{ fontSize: '10px', color: '#475569', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>CONFIDENCIAL</div>
          </div>
        </div>
      </div>

      {/* Tarjeta de Calificación Flotante */}
      <div style={{ position: 'relative', marginTop: '-40px', padding: '0 50px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px 35px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 12px 40px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Beca Objetivo</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#010B2B' }}>{becaObjetivo || 'No especificada'}</div>
            </div>
            <div style={{ width: '1px', backgroundColor: '#E2E8F0' }}></div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>País de Destino</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#010B2B' }}>{paisDestino || 'No especificado'}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Diagnóstico</div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: puntajeEstimado >= 8 ? '#059669' : puntajeEstimado >= 6 ? '#00A8E8' : '#EA580C' }}>{nivelTexto}</div>
            </div>
            <div style={{ width: '65px', height: '65px', borderRadius: '50%', background: `linear-gradient(135deg, ${puntajeEstimado >= 8 ? '#10B981, #047857' : puntajeEstimado >= 6 ? '#00A8E8, #0284C7' : '#F97316, #C2410C'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: `0 8px 20px ${puntajeEstimado >= 8 ? 'rgba(16,185,129,0.3)' : puntajeEstimado >= 6 ? 'rgba(0,168,232,0.3)' : 'rgba(249,115,22,0.3)'}` }}>
              <span style={{ fontSize: '30px', fontWeight: '900', lineHeight: 1 }}>{puntajeEstimado}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{ padding: '45px 50px' }}>
        
        {/* Layout de 2 columnas para fortalezas y debilidades */}
        <div style={{ display: 'flex', gap: '30px', marginBottom: '45px' }}>
          
          {/* Columna Izquierda: Fortalezas */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#059669', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span style={{ display: 'inline-flex', width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' }}>✓</span>
              Fortalezas Clave
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {fortalezas.length > 0 ? fortalezas.map((f, i) => (
                <div key={i} style={{ backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #10B981', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  <strong style={{ color: '#065F46', marginRight: '6px' }}>{i + 1}.</strong> {f.replace(/^\d+\.\s*/, '')}
                </div>
              )) : <div style={{ fontSize: '13px', color: '#64748B', backgroundColor: 'white', padding: '16px', borderRadius: '12px' }}>{fortalezasStr}</div>}
            </div>
          </div>

          {/* Columna Derecha: Mejoras */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#EA580C', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span style={{ display: 'inline-flex', width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#FFEDD5', alignItems: 'center', justifyContent: 'center' }}>!</span>
              Áreas Críticas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mejoras.length > 0 ? mejoras.map((m, i) => (
                <div key={i} style={{ backgroundColor: 'white', padding: '16px 20px', borderRadius: '12px', borderLeft: '4px solid #F97316', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', fontSize: '13px', lineHeight: '1.6', color: '#334155' }}>
                  <strong style={{ color: '#9A3412', marginRight: '6px' }}>{i + 1}.</strong> {m.replace(/^\d+\.\s*/, '')}
                </div>
              )) : <div style={{ fontSize: '13px', color: '#64748B', backgroundColor: 'white', padding: '16px', borderRadius: '12px' }}>{mejorasStr}</div>}
            </div>
          </div>
        </div>

        {/* Recomendación Final */}
        {recomendacionStr && (
          <div style={{ backgroundColor: '#010B2B', padding: '35px 40px', borderRadius: '20px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 15px 35px rgba(1,11,43,0.15)' }}>
            <div style={{ position: 'absolute', top: '-30px', right: '-10px', fontSize: '180px', color: 'rgba(255,255,255,0.03)', fontWeight: '900', lineHeight: 1, fontFamily: 'serif' }}>&quot;</div>
            <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#00A8E8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '30px', height: '2px', backgroundColor: '#00A8E8' }}></span> Veredicto del Mentor IA
            </h3>
            <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#E2E8F0', position: 'relative', zIndex: 10, whiteSpace: 'pre-wrap' }}>{recomendacionStr.trim()}</div>
          </div>
        )}

        {/* Ensayo Original (Página nueva) */}
        {ensayoOriginal && (
          <div style={{ marginTop: '50px', paddingTop: '40px', pageBreakBefore: 'always', borderTop: '2px solid #E2E8F0' }}>
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#010B2B', margin: '0 0 5px 0', letterSpacing: '-0.5px' }}>Anexo: Ensayo Original</h3>
              <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Texto íntegro proporcionado para el análisis</p>
            </div>
            <div style={{ fontSize: '12px', lineHeight: '2.2', color: '#334155', textAlign: 'justify', padding: '0 40px', paddingBottom: '40px' }}>
              {ensayoOriginal.split('\n').map((paragraph, idx) => {
                if (!paragraph.trim()) return null;
                return (
                  <p key={idx} style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
                    {paragraph}
                  </p>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>

  </div>
)
}
