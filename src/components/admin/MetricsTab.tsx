'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Search,
  FileText,
  X,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Sliders,
  Award,
  Users,
  RefreshCw,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react'
import { EnsayoReal } from './types'
import FeedbackCard from '../FeedbackCard'

interface MetricsTabProps {
  ensayos: EnsayoReal[]
  initialSearch?: string
}

export default function MetricsTab({
  ensayos: initialEnsayos,
  initialSearch = ''
}: MetricsTabProps) {
  const supabase = createClient()

  // ── ESTADO EN TIEMPO REAL ──
  const [liveEnsayos, setLiveEnsayos] = useState<EnsayoReal[]>(initialEnsayos)
  const [isLive, setIsLive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [selectedEssayForPreview, setSelectedEssayForPreview] = useState<EnsayoReal | null>(null)
  const [viewMode, setViewMode] = useState<'processed' | 'raw'>('processed')
  
  // ── ESTADOS DE MODAL DE BECAS ──
  const [showAllScholarshipsModal, setShowAllScholarshipsModal] = useState(false)
  const [selectedScholarshipForList, setSelectedScholarshipForList] = useState<string | null>(null)

  // ── ESTADOS DE MODAL DE ENSAYOS POR MES ──
  const [selectedMonthForEssaysModal, setSelectedMonthForEssaysModal] = useState<string | null>(null)
  const [essaysForSelectedMonth, setEssaysForSelectedMonth] = useState<EnsayoReal[]>([])

  // ── ESTADOS DE FILTROS ──
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search') || ''
  
  const [searchTerm, setSearchTerm] = useState(urlSearch || initialSearch)
  
  useEffect(() => {
    setSearchTerm(urlSearch)
  }, [urlSearch])
  
  const [periodo, setPeriodo] = useState<'30' | '90' | 'ano' | 'todos'>('todos')
  const [selectedPais, setSelectedPais] = useState<string>('todos')
  const [selectedBeca, setSelectedBeca] = useState<string>('todos')
  const [selectedNota, setSelectedNota] = useState<'todas' | 'competitivo' | 'aceptable' | 'mejorar'>('todas')

  // ── ESTADOS DE PAGINACIÓN ──
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // ── FUNCIÓN DE RECARGA COMPLETA DESDE SUPABASE ──
  const reloadEnsayos = useCallback(async () => {
    const { data, error } = await supabase
      .from('ensayos_enviados')
      .select('*, feedback_generado (*)')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setLiveEnsayos(data as EnsayoReal[])
      setLastUpdate(new Date())
    }
  }, [supabase])

  // ── SUPABASE REALTIME SUBSCRIPTION ──
  useEffect(() => {
    // Carga inicial fresca desde el cliente
    reloadEnsayos()

    const channel = supabase
      .channel('metricas-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ensayos_enviados' }, () => {
        reloadEnsayos()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ensayos_enviados' }, () => {
        reloadEnsayos()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ensayos_enviados' }, () => {
        reloadEnsayos()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedback_generado' }, () => {
        reloadEnsayos()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'feedback_generado' }, () => {
        reloadEnsayos()
      })
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [reloadEnsayos, supabase])

  // Obtener la bandera del país en formato imagen (para solucionar el límite de emojis en Windows)
  const renderCountryFlag = (pais: string) => {
    const p = (pais || '').toLowerCase().trim()
    let iso = ''
    if (p.includes('españa') || p.includes('espana') || p === 'es') iso = 'es'
    else if (p.includes('estados unidos') || p.includes('usa') || p.includes('ee.uu') || p.includes('eeuu') || p === 'us') iso = 'us'
    else if (p.includes('alemania') || p.includes('germany') || p === 'de') iso = 'de'
    else if (p.includes('reino unido') || p.includes('uk') || p.includes('inglaterra') || p === 'gb') iso = 'gb'
    else if (p.includes('ecuador') || p === 'ec') iso = 'ec'
    else if (p.includes('colombia') || p === 'co') iso = 'co'
    else if (p.includes('perú') || p.includes('peru') || p === 'pe') iso = 'pe'
    else if (p.includes('méxico') || p.includes('mexico') || p === 'mx') iso = 'mx'
    else if (p.includes('francia') || p === 'fr') iso = 'fr'
    else if (p.includes('italia') || p === 'it') iso = 'it'
    else if (p.includes('japón') || p.includes('japon') || p === 'jp') iso = 'jp'

    if (iso) {
      return (
        <img 
          src={`https://flagcdn.com/w80/${iso}.png`} 
          alt={pais} 
          className="w-6.5 h-6.5 object-cover rounded-full shadow-sm shrink-0 border border-slate-100" 
        />
      )
    }
    return <span className="text-xs text-slate-400">🌐</span>
  }

  // Fondos aleatorios para iniciales del avatar
  const getInitialsBg = (name: string) => {
    const colors = [
      'bg-slate-900',
      'bg-[#0c1329]',
      'bg-blue-900',
      'bg-indigo-950',
      'bg-slate-800'
    ]
    const charCode = (name || 'E').charCodeAt(0) || 0
    return colors[charCode % colors.length]
  }

  // 1. Obtener filtros dinámicos basados en los datos reales de la BD
  const paisesDisponibles = useMemo(() => {
    const standardPaises = [
      'Reino Unido',
      'España',
      'Europa',
      'Estados Unidos',
      'Francia',
      'Alemania',
      'Japón',
      'América'
    ]
    const list = new Set([
      ...standardPaises.map(p => p.trim()),
      ...liveEnsayos.map(e => e.pais_destino?.trim()).filter((val): val is string => !!val)
    ])
    return Array.from(list).sort((a, b) => a.localeCompare(b))
  }, [liveEnsayos])

  const becasDisponibles = useMemo(() => {
    const standardBecas = [
      { beca: 'Chevening', pais: 'Reino Unido' },
      { beca: 'Fundación Carolina', pais: 'España' },
      { beca: 'Erasmus Mundus', pais: 'Europa' },
      { beca: 'Fulbright', pais: 'Estados Unidos' },
      { beca: 'Eiffel', pais: 'Francia' },
      { beca: 'DAAD', pais: 'Alemania' },
      { beca: 'MEXT', pais: 'Japón' },
      { beca: 'OEA', pais: 'América' }
    ]
    const map = new Map<string, string>()
    standardBecas.forEach(item => {
      map.set(item.beca.trim(), item.pais.trim())
    })
    liveEnsayos.forEach(e => {
      if (e.beca_objetivo) {
        const key = e.beca_objetivo.trim()
        if (!map.has(key)) {
          map.set(key, (e.pais_destino || '').trim())
        }
      }
    })
    return Array.from(map.entries()).map(([beca, pais]) => ({
      beca,
      pais
    })).sort((a, b) => a.beca.localeCompare(b.beca))
  }, [liveEnsayos])

  // 2. Procesar filtros
  const filteredEnsayos = useMemo(() => {
    return liveEnsayos.filter(e => {
      // Filtro de búsqueda
      const searchMatch = !searchTerm ? true : (
        (e.nombre_usuario || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.email_usuario || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.beca_objetivo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.pais_destino || '').toLowerCase().includes(searchTerm.toLowerCase())
      )

      // Filtro de país
      const paisMatch = selectedPais === 'todos' ? true : (e.pais_destino || '').trim() === selectedPais

      // Filtro de beca
      const becaMatch = selectedBeca === 'todos' ? true : (e.beca_objetivo || '').trim() === selectedBeca

      // Filtro de nota/calificación
      const score = e.feedback_generado?.[0]?.puntaje || 7
      let notaMatch = true
      if (selectedNota === 'competitivo') notaMatch = score >= 8
      else if (selectedNota === 'aceptable') notaMatch = score >= 5 && score <= 7
      else if (selectedNota === 'mejorar') notaMatch = score < 5

      // Filtro de período
      let dateMatch = true
      if (periodo !== 'todos' && e.created_at) {
        const dateObj = new Date(e.created_at)
        const diffDays = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
        if (periodo === '30') dateMatch = diffDays <= 30
        else if (periodo === '90') dateMatch = diffDays <= 90
        else if (periodo === 'ano') dateMatch = dateObj.getFullYear() === new Date().getFullYear()
      }

      return searchMatch && paisMatch && becaMatch && notaMatch && dateMatch
    })
  }, [liveEnsayos, searchTerm, selectedPais, selectedBeca, selectedNota, periodo])

  // 3. Cálculos de indicadores dinámicos superiores (con los datos reales de la BD)
  const stats = useMemo(() => {
    const totalCount = filteredEnsayos.length
    const rawScores = filteredEnsayos.map(e => e.feedback_generado?.[0]?.puntaje).filter((s): s is number => s !== undefined && s !== null)
    
    // Promedio IA
    const avgScore = rawScores.length > 0 
      ? Number((rawScores.reduce((a, b) => a + b, 0) / rawScores.length).toFixed(1)) 
      : 0
      
    // Becas Analizadas
    const becasCount = new Set(filteredEnsayos.map(e => e.beca_objetivo).filter(Boolean)).size
    const finalBecasCount = becasCount

    // Estudiantes únicos
    const studCount = new Set(filteredEnsayos.map(e => e.email_usuario).filter(Boolean)).size
    const finalStudCount = studCount

    return {
      total: totalCount,
      promedio: avgScore,
      becas: finalBecasCount,
      estudiantes: finalStudCount
    }
  }, [filteredEnsayos])

  // 4. Distribución real para gráfico de dona
  const donutStats = useMemo(() => {
    let comp = 0
    let acep = 0
    let mejor = 0
    
    filteredEnsayos.forEach(e => {
      const score = e.feedback_generado?.[0]?.puntaje || 7
      if (score >= 8) comp++
      else if (score >= 5) acep++
      else mejor++
    })

    const total = filteredEnsayos.length
    
    // Si no hay datos, retornar ceros
    if (total === 0) {
      return {
        compCount: 0,
        acepCount: 0,
        mejorCount: 0,
        compPct: 0,
        acepPct: 0,
        mejorPct: 0
      }
    }

    return {
      compCount: comp,
      acepCount: acep,
      mejorCount: mejor,
      compPct: Math.round((comp / total) * 100),
      acepPct: Math.round((acep / total) * 100),
      mejorPct: Math.round((mejor / total) * 100)
    }
  }, [filteredEnsayos])

  // 5. Historial mensual real (SVG chart)
  const monthlyData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const counts = Array(12).fill(0)
    liveEnsayos.forEach((e: EnsayoReal) => {
      if (e.created_at) {
        const d = new Date(e.created_at)
        counts[d.getMonth()]++
      }
    })

    const currentMonth = new Date().getMonth()
    const last5 = []

    for (let i = 4; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12
      last5.push({
        label: months[mIdx],
        count: counts[mIdx]
      })
    }
    return last5
  }, [liveEnsayos])

  // Máximo para escala del gráfico SVG
  const maxMonthlyCount = useMemo(() => {
    const vals = monthlyData.map(d => d.count)
    return Math.max(...vals, 5)
  }, [monthlyData])

  // 6. Becas populares
  const popularScholarships = useMemo(() => {
    const map = new Map<string, { count: number; pais: string }>()
    liveEnsayos.forEach((e: EnsayoReal) => {
      if (e.beca_objetivo) {
        const key = e.beca_objetivo
        const data = map.get(key) || { count: 0, pais: e.pais_destino || 'Global' }
        data.count++
        map.set(key, data)
      }
    })

    const sorted = Array.from(map.entries()).map(([beca, data]) => ({
      beca,
      count: data.count,
      pais: data.pais
    })).sort((a, b) => b.count - a.count).slice(0, 4)

    return sorted
  }, [liveEnsayos])

  // Becas agrupadas con todos sus ensayos para el modal
  const allScholarships = useMemo(() => {
    const map = new Map<string, { count: number; pais: string; essays: EnsayoReal[] }>()
    liveEnsayos.forEach((e: EnsayoReal) => {
      if (e.beca_objetivo) {
        const key = e.beca_objetivo
        const data = map.get(key) || { count: 0, pais: e.pais_destino || 'Global', essays: [] }
        data.count++
        data.essays.push(e)
        map.set(key, data)
      }
    })

    return Array.from(map.entries()).map(([beca, data]) => ({
      beca,
      count: data.count,
      pais: data.pais,
      essays: data.essays
    })).sort((a, b) => b.count - a.count)
  }, [liveEnsayos])

  // 7. Paginación de registros
  const paginatedEnsayos = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredEnsayos.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredEnsayos, currentPage, rowsPerPage])

  const totalPages = Math.ceil(filteredEnsayos.length / rowsPerPage) || 1

  // Exportar reporte Excel (HTML con formato y estilos)
  const handleExportCSV = () => {
    const headers = ['Estudiante', 'Email', 'Beca', 'País Destino', 'Fecha Envío', 'Calificación IA']
    const rows = filteredEnsayos.map(e => [
      e.nombre_usuario || 'Estudiante',
      e.email_usuario || '',
      e.beca_objetivo || 'General',
      e.pais_destino || 'Global',
      new Date(e.created_at).toLocaleString('es-ES'),
      e.feedback_generado?.[0]?.puntaje || '7'
    ])
    
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Evaluaciones</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; }
          .title { font-size: 14pt; font-weight: bold; color: #0077b6; padding: 10px 0; }
          .subtitle { font-size: 9pt; color: #64748b; padding-bottom: 10px; }
          table { border-collapse: collapse; }
          th { background-color: #00a8e8; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; font-size: 10pt; }
          td { border: 1px solid #e2e8f0; padding: 6px 10px; color: #334155; font-size: 9.5pt; }
          .even { background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="6" class="title">Reporte de Evaluaciones de Ensayos</td>
          </tr>
          <tr>
            <td colspan="6" class="subtitle">Fecha de generación: ${new Date().toLocaleString('es-ES')}</td>
          </tr>
          <tr>
            <td colspan="6" style="height: 5px;"></td>
          </tr>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, idx) => `
              <tr class="${idx % 2 === 0 ? '' : 'even'}">
                ${row.map(val => `<td>${val}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `
      
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "reporte_evaluaciones.xls")
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Cargar ensayos del mes seleccionado para mostrar en el modal al hacer clic en el gráfico
  const handleMonthClick = (label: string, count: number) => {
    if (count === 0) return
    const monthsShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const monthIndex = monthsShort.indexOf(label)
    if (monthIndex === -1) return

    const filtered = liveEnsayos.filter((e: EnsayoReal) => {
      if (!e.created_at) return false
      const date = new Date(e.created_at)
      return date.getMonth() === monthIndex
    })

    setEssaysForSelectedMonth(filtered)
    setSelectedMonthForEssaysModal(label)
  }

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm('')
    const params = new URLSearchParams(window.location.search)
    params.delete('search')
    router.replace(`${window.location.pathname}?${params.toString()}`)
    
    setPeriodo('todos')
    setSelectedPais('todos')
    setSelectedBeca('todos')
    setSelectedNota('todas')
    setCurrentPage(1)
  }

  const renderProcessedFeedback = (rawResponseText: string) => {
    if (!rawResponseText || !selectedEssayForPreview) return <p className="text-slate-400 italic">No hay evaluación de la IA guardada para este ensayo.</p>

    const mainContent = rawResponseText.split('📝')[0] || rawResponseText

    return (
      <div className="space-y-6 text-left">
        {/* Desglose por criterio */}
        {mainContent.includes('📋 DESGLOSE POR CRITERIO:') && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Desglose por Criterio
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] sm:text-[11px] text-slate-600 font-semibold">
              {mainContent.split('📋 DESGLOSE POR CRITERIO:')[1]?.split('✅')[0]?.trim().split('\n').map((line, idx) => {
                const parts = line.split(':')
                if (parts.length >= 2) {
                  return (
                    <div key={idx} className="flex justify-between border-b border-slate-200/50 pb-1">
                      <span className="truncate pr-2">{parts[0].replace(/^\d+\.\s*/, '')}</span>
                      <span className="font-extrabold text-[#00A8E8] shrink-0">{parts[1].trim()}</span>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>
        )}

        {/* FeedbackCard */}
        <FeedbackCard
          rawResponse={rawResponseText}
          puntajeEstimado={selectedEssayForPreview.feedback_generado?.[0]?.puntaje || 7}
          ensayoOriginal={selectedEssayForPreview.contenido}
          becaObjetivo={selectedEssayForPreview.beca_objetivo || undefined}
          paisDestino={selectedEssayForPreview.pais_destino || undefined}
          isAdminMode={true}
        />
      </div>
    )
  }

  return (
    <div className="pt-6 flex flex-col gap-4 animate-in fade-in duration-300 w-full text-left">




      {/* ── GRAPHICS ROW: DONUT CHART + SVG LINE CHART + POPULAR SCHOLARSHIPS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Panel 1 (4/12): Distribución de Calidad */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between text-left">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Distribución de Calidad</span>
              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 text-[10px] flex items-center justify-center cursor-pointer font-bold" title="Rango de notas: Competitivos (8-10), Aceptables (5-7), A mejorar (1-4)">?</span>
            </h3>
            
            <div className="flex items-center gap-6 mt-6">
              {/* CSS Donut Chart */}
              <div 
                className="relative w-28 h-28 rounded-full flex items-center justify-center shrink-0 shadow-inner" 
                style={{ 
                  background: filteredEnsayos.length === 0 
                    ? '#cbd5e1' 
                    : `conic-gradient(#10B981 0% ${donutStats.compPct}%, #F59E0B ${donutStats.compPct}% ${donutStats.compPct + donutStats.acepPct}%, #EF4444 ${donutStats.compPct + donutStats.acepPct}% 100%)` 
                }}
              >
                <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center shadow-md">
                  <span className="text-lg font-black text-slate-900 leading-none">{filteredEnsayos.length}</span>
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-0.5">Ensayos</span>
                </div>
              </div>

              {/* Leyenda */}
              <div className="flex flex-col gap-2.5 text-xs w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-500">Competitivos (8-10)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 block">{donutStats.compPct}%</span>
                    <span className="text-[9px] text-slate-400 font-medium block">{donutStats.compCount} {donutStats.compCount === 1 ? 'ensayo' : 'ensayos'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-semibold text-slate-500">Aceptables (5-7)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 block">{donutStats.acepPct}%</span>
                    <span className="text-[9px] text-slate-400 font-medium block">{donutStats.acepCount} {donutStats.acepCount === 1 ? 'ensayo' : 'ensayos'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    <span className="font-semibold text-slate-500">A mejorar (1-4)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800 block">{donutStats.mejorPct}%</span>
                    <span className="text-[9px] text-slate-400 font-medium block">{donutStats.mejorCount} {donutStats.mejorCount === 1 ? 'ensayo' : 'ensayos'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold border-t border-slate-50 pt-3 mt-4">
            Actualizado al {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Panel 2 (5/12): Evaluaciones por mes (SVG) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between text-left">
          <div>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900">Evaluaciones por mes</h3>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Envíos</span>
              </div>
            </div>

            {/* SVG Line Chart */}
            <div className="mt-5 relative w-full">
              <svg className="w-full h-32 overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00A8E8" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00A8E8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

                {/* Area Fill */}
                <path 
                  d={`
                    M 30 120 
                    L 30 ${120 - (monthlyData[0].count / maxMonthlyCount) * 80} 
                    L 115 ${120 - (monthlyData[1].count / maxMonthlyCount) * 80} 
                    L 200 ${120 - (monthlyData[2].count / maxMonthlyCount) * 80} 
                    L 285 ${120 - (monthlyData[3].count / maxMonthlyCount) * 80} 
                    L 370 ${120 - (monthlyData[4].count / maxMonthlyCount) * 80} 
                    L 370 120 Z
                  `} 
                  fill="url(#area-grad)" 
                />

                {/* Line Path */}
                <path 
                  d={`
                    M 30 ${120 - (monthlyData[0].count / maxMonthlyCount) * 80} 
                    L 115 ${120 - (monthlyData[1].count / maxMonthlyCount) * 80} 
                    L 200 ${120 - (monthlyData[2].count / maxMonthlyCount) * 80} 
                    L 285 ${120 - (monthlyData[3].count / maxMonthlyCount) * 80} 
                    L 370 ${120 - (monthlyData[4].count / maxMonthlyCount) * 80}
                  `} 
                  fill="none" 
                  stroke="#00A8E8" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {monthlyData.map((d, idx) => {
                  const x = 30 + idx * 85
                  const y = 120 - (d.count / maxMonthlyCount) * 80
                  const hasEssays = d.count > 0
                  return (
                    <g 
                      key={idx} 
                      onClick={() => handleMonthClick(d.label, d.count)}
                      className={`group ${hasEssays ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      {hasEssays && <title>{`Ver ensayos de ${d.label}`}</title>}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="5" 
                        fill="#00A8E8" 
                        stroke="#ffffff" 
                        strokeWidth="2.5" 
                        className="transition-all duration-300 group-hover:scale-[1.3] outline-none"
                        style={{ transformOrigin: `${x}px ${y}px` }}
                      />
                      {/* Tooltip on every node showing counts */}
                      <g className={hasEssays ? 'group-hover:opacity-90' : ''}>
                        <rect x={x - 11} y={y - 23} width="22" height="15" rx="4" fill="#00A8E8" className="transition-all duration-300" />
                        <text x={x} y={y - 12} fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">{d.count}</text>
                      </g>
                    </g>
                  )
                })}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between px-3 mt-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {monthlyData.map((d, idx) => (
                  <span key={idx} className="w-16 text-center">{d.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3 (3/12): Becas más populares */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between text-left">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Becas más populares</h3>
              <button 
                onClick={() => {
                  setShowAllScholarshipsModal(true)
                  if (allScholarships.length > 0 && !selectedScholarshipForList) {
                    setSelectedScholarshipForList(allScholarships[0].beca)
                  }
                }} 
                className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-wider cursor-pointer"
              >
                Ver todas
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {popularScholarships.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">No hay datos disponibles</div>
              ) : (
                popularScholarships.map((dest, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setSelectedScholarshipForList(dest.beca)
                      setShowAllScholarshipsModal(true)
                    }}
                    className="flex justify-between items-center text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50/80 p-1.5 rounded-xl transition-all"
                    title={`Ver desglose de ${dest.beca}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {renderCountryFlag(dest.pais)}
                      <div className="min-w-0">
                        <span className="font-extrabold text-slate-800 block truncate leading-tight">{dest.beca}</span>
                        <span className="text-[9px] text-slate-400 font-bold block mt-0.5 leading-none">{dest.pais}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-blue-600 bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-lg text-[9px]">
                        {dest.count} {dest.count === 1 ? 'ensayo' : 'ensayos'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ADVANCED FILTERS ROW ── */}
      <div className="sticky top-[60px] z-20 bg-[#f4f6fa] flex flex-col lg:flex-row items-center justify-between gap-3.5 py-1.5 px-6 w-full">
        {/* Izquierda: Buscador + Selectores */}
        <div className="flex flex-col lg:flex-row items-center gap-3.5 flex-1 w-full lg:w-auto">
          {/* Buscador */}
          <div className="relative w-full lg:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-4 py-1 border border-slate-100 bg-[#f0f3f8]/50 focus:bg-white focus:border-slate-200 text-xs font-semibold rounded-xl outline-none transition-all placeholder-[#94a3b8]"
            />
          </div>

          {/* Selector País */}
          <div className="relative w-full lg:w-36">
            <select
              value={selectedPais}
              onChange={(e) => {
                const val = e.target.value
                setSelectedPais(val)
                setCurrentPage(1)
                if (val === 'todos') {
                  setSelectedBeca('todos')
                } else {
                  const found = becasDisponibles.find(item => item.pais === val)
                  if (found) {
                    setSelectedBeca(found.beca)
                  }
                }
              }}
              className="w-full pl-3 pr-4 py-1 text-[10px] font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option value="todos">País: Todos</option>
              {paisesDisponibles.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Selector Beca */}
          <div className="relative w-full lg:w-44">
            <select
              value={selectedBeca}
              onChange={(e) => {
                const val = e.target.value
                setSelectedBeca(val)
                setCurrentPage(1)
                if (val === 'todos') {
                  setSelectedPais('todos')
                } else {
                  const found = becasDisponibles.find(item => item.beca === val)
                  if (found && found.pais) {
                    setSelectedPais(found.pais)
                  }
                }
              }}
              className="w-full pl-3 pr-4 py-1 text-[10px] font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option value="todos">Beca: Todas</option>
              {becasDisponibles.map(item => (
                <option key={item.beca} value={item.beca}>
                  {item.beca}{item.pais ? ` (${item.pais})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Selector Calificación IA */}
          <div className="relative w-full lg:w-40">
            <select
              value={selectedNota}
              onChange={(e) => {
                setSelectedNota(e.target.value as any)
                setCurrentPage(1)
              }}
              className="w-full pl-3 pr-4 py-1 text-[10px] font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option value="todas">Calificación IA: Todas</option>
              <option value="competitivo">Competitivo (8-10)</option>
              <option value="aceptable">Aceptable (5-7)</option>
              <option value="mejorar">A mejorar (1-4)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Selector Periodo */}
          <div className="relative w-full lg:w-36">
            <select
              value={periodo}
              onChange={(e) => {
                setPeriodo(e.target.value as any)
                setCurrentPage(1)
              }}
              className="w-full pl-3 pr-4 py-1 text-[10px] font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all outline-none appearance-none cursor-pointer text-slate-700"
            >
              <option value="todos">Período: Todos</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="ano">Este año</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Derecha: Botón Exportar + Limpiar Filtros */}
        <div className="flex items-center gap-3.5 shrink-0 self-end lg:self-auto">
          {/* Botón Exportar */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-bold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar</span>
          </button>

          {/* Limpiar Filtros */}
          <button
            onClick={handleClearFilters}
            className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer shrink-0 py-1 px-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Limpiar filtros</span>
          </button>
        </div>
      </div>

      {/* ── TABLE AND LIST SECTION ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] overflow-hidden">
        
        {/* Table element */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Estudiante</th>
                <th className="py-4 px-6">Beca / País Destino</th>
                <th className="py-4 px-6">Fecha de Envío</th>
                <th className="py-4 px-6 text-center">Calificación IA</th>
                <th className="py-4 px-6 text-center">Estado</th>
                <th className="py-4 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {paginatedEnsayos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold bg-white">
                    No se encontraron ensayos evaluados que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                paginatedEnsayos.map(ensayo => {
                  const score = ensayo.feedback_generado?.[0]?.puntaje || 7
                  const date = ensayo.created_at ? new Date(ensayo.created_at) : new Date()

                  // Formatear fecha y hora
                  const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`

                  // Determinar etiqueta de calificación
                  let scoreLabel = 'Aceptable'
                  let badgeColors = 'bg-amber-50 border-amber-100 text-amber-700'
                  if (score >= 8) {
                    scoreLabel = 'Excelente'
                    badgeColors = 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  } else if (score < 5) {
                    scoreLabel = 'A mejorar'
                    badgeColors = 'bg-red-50 border-red-100 text-red-700'
                  }

                  return (
                    <tr key={ensayo.id} className="hover:bg-slate-50/20 transition-all">
                      {/* Estudiante */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8.5 h-8.5 rounded-full ${getInitialsBg(ensayo.nombre_usuario || '')} text-white font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0`}>
                            {(ensayo.nombre_usuario || 'E').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 truncate">{ensayo.nombre_usuario || 'Estudiante'}</div>
                            <div className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{ensayo.email_usuario}</div>
                          </div>
                        </div>
                      </td>

                      {/* Beca y Destino */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-2 min-w-0">
                          {renderCountryFlag(ensayo.pais_destino || '')}
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-800 truncate">{ensayo.beca_objetivo || 'General'}</div>
                            <div className="text-[9px] text-slate-400 font-bold block mt-0.5 leading-none">{ensayo.pais_destino || 'Global'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Fecha Envío */}
                      <td className="py-4.5 px-6 text-slate-500 font-semibold">
                        {formattedDate}
                      </td>

                      {/* Calificación IA */}
                      <td className="py-4.5 px-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg border leading-tight ${badgeColors}`}>
                            {score}/10
                          </span>
                          <span className={`text-[9px] font-bold mt-1 leading-none ${
                            score >= 8 ? 'text-emerald-600' : score >= 5 ? 'text-amber-600' : 'text-red-650'
                          }`}>
                            {scoreLabel}
                          </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="py-4.5 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold leading-none shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Completado</span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-4.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => setSelectedEssayForPreview(ensayo)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[10px] transition-all shadow-sm cursor-pointer"
                          >
                            Ver análisis
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-655 transition-colors cursor-pointer">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination element */}
        {filteredEnsayos.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4.5 border-t border-slate-100 bg-slate-50/50">
            <span className="text-[11px] font-bold text-slate-400 text-left">
              Mostrando {Math.min((currentPage - 1) * rowsPerPage + 1, filteredEnsayos.length)} a {Math.min(currentPage * rowsPerPage, filteredEnsayos.length)} de {filteredEnsayos.length} resultados
            </span>

            {/* Controles de paginación */}
            <div className="flex items-center gap-3">
              {/* Controles numéricos */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1
                  const isCurrent = currentPage === pageNum
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 border border-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Selector de filas por página */}
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl pl-2.5 pr-7 py-1.5 outline-none cursor-pointer hover:bg-slate-50 transition-all appearance-none shadow-sm"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL DE PREVISUALIZACION DE ENSAYO Y ANÁLISIS DE LA IA ── */}
      {selectedEssayForPreview && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-6xl h-[90vh] rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl relative flex flex-col">

            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-950">Visualización de Ensayo y Análisis Técnico</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 font-medium mr-2">
                      Estudiante: <strong className="text-slate-800">{selectedEssayForPreview.nombre_usuario}</strong> ({selectedEssayForPreview.email_usuario})
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold text-[#00A8E8] bg-[#00A8E8]/10 border border-[#00A8E8]/20">
                      {selectedEssayForPreview.beca_objetivo || 'Beca General'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 border border-slate-250">
                      {selectedEssayForPreview.pais_destino || 'Destino no especificado'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold text-slate-500 bg-slate-50 border border-slate-150">
                      {new Date(selectedEssayForPreview.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEssayForPreview(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenedor Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 text-left">

              {/* Lado Izquierdo: Texto Original */}
              <div className="flex flex-col h-full min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Texto del Ensayo Original</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500">
                      {selectedEssayForPreview.contenido?.trim().split(/\s+/).length ?? 0} palabras
                    </span>
                  </div>
                  {selectedEssayForPreview.pdf_url && (
                    <a href={selectedEssayForPreview.pdf_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#00A8E8] hover:underline">Ver PDF Original</a>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 rounded-xl border border-slate-200 bg-slate-50/50 font-serif text-xs leading-relaxed text-slate-700 whitespace-pre-wrap select-text">
                  {selectedEssayForPreview.contenido}
                </div>
              </div>

              {/* Lado Derecho: Análisis de la IA */}
              <div className="flex flex-col h-full min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Análisis Técnico de la IA</span>
                    {selectedEssayForPreview.feedback_generado?.[0]?.raw_response && (
                      <div className="inline-flex bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-[9px] font-bold select-none shadow-inner">
                        <button
                          type="button"
                          onClick={() => setViewMode('processed')}
                          className={`px-2 py-0.5 rounded transition-colors ${viewMode === 'processed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-450 hover:text-slate-700'}`}
                        >
                          Procesado
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('raw')}
                          className={`px-2 py-0.5 rounded transition-colors ${viewMode === 'raw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-450 hover:text-slate-700'}`}
                        >
                          Texto Plano
                        </button>
                      </div>
                    )}
                  </div>
                  {(() => {
                    const score = selectedEssayForPreview.feedback_generado?.[0]?.puntaje || 7
                    const badgeColors = score >= 8
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : score >= 6
                        ? 'bg-blue-50 border-blue-100 text-blue-700'
                        : 'bg-orange-50 border-orange-100 text-orange-700'
                    return (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded border leading-none ${badgeColors}`}>
                        Puntaje: {score}/10
                      </span>
                    )
                  })()}
                </div>
                <div className={`flex-1 overflow-y-auto p-4 rounded-xl border border-slate-200 bg-slate-50/50 font-sans text-xs leading-relaxed text-slate-700 select-text ${viewMode === 'raw' ? 'whitespace-pre-wrap' : ''}`}>
                  {viewMode === 'processed' ? (
                    renderProcessedFeedback(selectedEssayForPreview.feedback_generado?.[0]?.raw_response || '')
                  ) : (
                    selectedEssayForPreview.feedback_generado?.[0]?.raw_response || 'No hay evaluación de la IA guardada para este ensayo.'
                  )}
                </div>
              </div>

            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-slate-200 flex-shrink-0">
              <button
                onClick={() => setSelectedEssayForPreview(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm cursor-pointer"
              >
                Cerrar Vista
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL VER TODAS LAS BECAS Y SUS ENSAYOS ── */}
      {showAllScholarshipsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl h-[520px] max-h-[85vh] rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl relative flex flex-col">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-955">Desglose de Ensayos por Beca</h3>
                  <p className="text-xs text-slate-400 font-semibold">Selecciona una beca para ver e inspeccionar sus ensayos asociados.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllScholarshipsModal(false)} 
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-655 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido dividido en dos paneles */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6 min-h-0 text-left">
              
              {/* Panel Izquierdo: Lista de Becas */}
              <div className="w-full md:w-5/12 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-3">Listado de Becas ({allScholarships.length})</span>
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {allScholarships.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-medium">No hay becas registradas</div>
                  ) : (
                    allScholarships.map((item) => {
                      const isSelected = selectedScholarshipForList === item.beca
                      return (
                        <button
                          key={item.beca}
                          onClick={() => setSelectedScholarshipForList(item.beca)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                              : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/60 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {renderCountryFlag(item.pais)}
                            <div className="min-w-0">
                              <span className={`font-extrabold text-xs block truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>{item.beca}</span>
                              <span className={`text-[9px] font-bold block mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-450'}`}>{item.pais}</span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-lg border shrink-0 ${
                            isSelected 
                              ? 'bg-white/10 border-white/20 text-white' 
                              : 'bg-blue-50 border-blue-100 text-blue-600'
                          }`}>
                            {item.count} {item.count === 1 ? 'ensayo' : 'ensayos'}
                          </span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Panel Derecho: Lista de Ensayos para la beca seleccionada */}
              <div className="w-full md:w-7/12 flex flex-col min-h-0">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block mb-3">
                  {selectedScholarshipForList 
                    ? `Ensayos asociados a: ${selectedScholarshipForList}` 
                    : 'Selecciona una Beca'
                  }
                </span>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {(() => {
                    const currentGroup = allScholarships.find(g => g.beca === selectedScholarshipForList)
                    if (!currentGroup) {
                      return (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
                          <Award className="w-10 h-10 text-slate-200 mb-2" />
                          <p className="text-xs font-semibold">Selecciona una beca de la izquierda para ver su listado de ensayos.</p>
                        </div>
                      )
                    }

                    return currentGroup.essays.map(essay => {
                      const score = essay.feedback_generado?.[0]?.puntaje || 7
                      const date = essay.created_at ? new Date(essay.created_at) : new Date()
                      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`

                      let badgeColors = 'bg-amber-50 border-amber-100 text-amber-700'
                      if (score >= 8) {
                        badgeColors = 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      } else if (score < 5) {
                        badgeColors = 'bg-red-50 border-red-100 text-red-700'
                      }

                      return (
                        <div 
                          key={essay.id} 
                          className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8.5 h-8.5 rounded-full ${getInitialsBg(essay.nombre_usuario || '')} text-white font-extrabold text-xs flex items-center justify-center shrink-0`}>
                              {(essay.nombre_usuario || 'E').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-900 text-xs block truncate">{essay.nombre_usuario || 'Estudiante'}</span>
                              <span className="text-[10px] text-slate-400 font-semibold block truncate mt-0.5">{essay.email_usuario}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-[9px] font-bold text-slate-400 block">{formattedDate}</span>
                              <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded border mt-1 leading-none ${badgeColors}`}>
                                Nota IA: {score}/10
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedEssayForPreview(essay)}
                              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[10px] transition-all shadow-sm cursor-pointer animate-in fade-in"
                            >
                              Ver análisis
                            </button>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>

            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowAllScholarshipsModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm cursor-pointer"
              >
                Cerrar Desglose
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL VER ENSAYOS DE UN MES ESPECÍFICO ── */}
      {selectedMonthForEssaysModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl relative flex flex-col max-h-[80vh]">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-3 flex-shrink-0 text-left">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-extrabold text-base text-slate-955">Evaluaciones de {selectedMonthForEssaysModal}</h3>
                  <p className="text-xs text-slate-400 font-semibold">Listado de ensayos enviados y evaluados por la IA en este mes.</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMonthForEssaysModal(null)} 
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-655 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido / Lista de Ensayos */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-left">
              {essaysForSelectedMonth.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">No hay ensayos registrados para este mes</div>
              ) : (
                essaysForSelectedMonth.map(essay => {
                  const score = essay.feedback_generado?.[0]?.puntaje || 7
                  const date = essay.created_at ? new Date(essay.created_at) : new Date()
                  const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`

                  let badgeColors = 'bg-amber-50 border-amber-100 text-amber-700'
                  if (score >= 8) {
                    badgeColors = 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  } else if (score < 5) {
                    badgeColors = 'bg-red-50 border-red-100 text-red-700'
                  }

                  return (
                    <div 
                      key={essay.id} 
                      className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8.5 h-8.5 rounded-full ${getInitialsBg(essay.nombre_usuario || '')} text-white font-extrabold text-xs flex items-center justify-center shrink-0`}>
                          {(essay.nombre_usuario || 'E').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-900 text-xs block truncate">{essay.nombre_usuario || 'Estudiante'}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block truncate mt-0.5">{essay.email_usuario}</span>
                          <span className="text-[9px] text-[#00A8E8] font-bold block mt-1">{essay.beca_objetivo || 'Beca General'} · {essay.pais_destino || 'Global'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] font-bold text-slate-400 block">{formattedDate}</span>
                          <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded border mt-1 leading-none ${badgeColors}`}>
                            Nota IA: {score}/10
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedEssayForPreview(essay)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[10px] transition-all shadow-sm cursor-pointer"
                        >
                          Ver análisis
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Pie */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedMonthForEssaysModal(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
