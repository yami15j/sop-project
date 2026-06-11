'use client'

import { useState, useEffect } from 'react'
import { Search, Mail, X, CheckCircle2, Clock, PhoneCall, BadgeCheck, Trash2, AlertTriangle, Plus, FileText, Download, User, BookOpen, Users, ChevronLeft, ChevronRight, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LeadReal } from './types'
import { enviarCorreoAdmin, eliminarDatosEstudiante, crearEstudianteManual, actualizarEstadoLead } from '../../app/admin/actions'

const formatWhatsAppNumber = (phone: string | null | undefined): string => {
  if (!phone) return ''
  let clean = phone.replace(/[^\d+]/g, '')
  if (clean.startsWith('+')) {
    return clean.replace('+', '')
  }
  if (clean.startsWith('593')) {
    return clean
  }
  if (clean.startsWith('09') && clean.length === 10) {
    return '593' + clean.substring(1)
  }
  if (clean.startsWith('9') && clean.length === 9) {
    return '593' + clean
  }
  if (clean.length === 9 || clean.length === 10) {
    if (clean.startsWith('0')) clean = clean.substring(1)
    return '593' + clean
  }
  return clean
}

interface LeadsTabProps {
  leads: LeadReal[]
  initialSearch?: string
}

export default function LeadsTab({ leads, initialSearch = '' }: LeadsTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search') || ''

  const [searchTerm, setSearchTerm] = useState(urlSearch || initialSearch)

  useEffect(() => {
    setSearchTerm(urlSearch)
  }, [urlSearch])
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<LeadReal | null>(null)
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<LeadReal | null>(null)
  const [leadToDelete, setLeadToDelete] = useState<LeadReal | null>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Estados para creación manual de leads
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newLeadNombre, setNewLeadNombre] = useState('')
  const [newLeadEmail, setNewLeadEmail] = useState('')
  const [newLeadTelefono, setNewLeadTelefono] = useState('')
  const [creatingLead, setCreatingLead] = useState(false)

  // Estados locales
  const [leadStates, setLeadStates] = useState<Record<string, string>>({})
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [templates, setTemplates] = useState<Array<{ id: string; nombre: string; asunto: string; preview: string }>>([])
  const [localLeads, setLocalLeads] = useState<LeadReal[]>(leads)

  // Nuevos estados para filtros avanzados
  const [filterEstado, setFilterEstado] = useState<string>('Todos')
  const [filterBecaPais, setFilterBecaPais] = useState<string>('Todos')
  const [filterFecha, setFilterFecha] = useState<string>('Todos')
  const [filterAsesor, setFilterAsesor] = useState<string>('Todos')

  // Estados temporales para los filtros avanzados (se aplican al presionar "Aplicar filtros")
  const [tempFilterEstado, setTempFilterEstado] = useState<string>('Todos')
  const [tempFilterBecaPais, setTempFilterBecaPais] = useState<string>('Todos')
  const [tempFilterFecha, setTempFilterFecha] = useState<string>('Todos')
  const [tempFilterAsesor, setTempFilterAsesor] = useState<string>('Todos')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(true)

  // Nuevos estados para paginación
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  // Helper para normalizar el estado del lead de forma uniforme
  const getNormalizedStatus = (estado: string | null | undefined) => {
    if (!estado) return 'Pendiente'
    const est = estado.trim().toLowerCase()
    if (est === 'nuevo' || est === 'pendiente') return 'Pendiente'
    if (est === 'en contacto' || est === 'contacto' || est === 'contactado') return 'En Contacto'
    if (est === 'convertido' || est === 'finalizado') return 'Convertido'
    return estado
  }

  useEffect(() => {
    setLocalLeads(leads)
    if (leads) {
      const initialStates: Record<string, string> = {}
      leads.forEach(l => {
        initialStates[l.id] = getNormalizedStatus(l.estado)
      })
      setLeadStates(initialStates)
    }
  }, [leads])

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('sop_admin_email_logs')
      if (storedLogs) setEmailLogs(JSON.parse(storedLogs))

      const storedTemplates = localStorage.getItem('sop_admin_correo_templates')
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates))
      } else {
        const defaultTemplates = [
          { id: 'welcome', nombre: 'Bienvenida al Alumno', asunto: '¡Bienvenido a SOP Reviewer! Prepárate para el éxito', preview: 'Hola {nombre}, gracias por registrarte en nuestra plataforma de revisión experta. Tu cuenta de acceso está activa y dispones de 2 créditos de regalo para calificar tus primeros ensayos gratis con nuestro motor de Inteligencia Artificial. Accede aquí: {enlace_dashboard}' },
          { id: 'score_ready', nombre: 'Evaluación de IA Lista', asunto: 'Tu SOP Essay para {beca} ha sido evaluado', preview: 'Hola {nombre}, tu SOP Essay para {beca} ya fue calificado y revisado detalladamente por nuestro motor de IA. Tu calificación obtenida es de {calificacion}. Ingresa a la plataforma para descargar tu informe de mejora en PDF desde tu panel: {enlace_dashboard}' },
          { id: 'lead_received', nombre: 'Solicitud de Mentoría Premium', asunto: 'Te contactaremos para tu sesión de Mentoría Premium', preview: 'Hola {nombre}, hemos recibido tu postulación de Mentoría de Acompañamiento Premium para {beca} con destino en {pais}. Nuestro equipo de mentores se pondrá en contacto contigo en las próximas 24 horas para programar tu videollamada.' }
        ]
        setTemplates(defaultTemplates)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Mostrar notificaciones flotantes localmente
  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => {
      setNotification(null)
    }, 4500)
  }

  // Cambiar estado de leads
  const handleStatusChange = async (leadId: string, nuevoEstado: string) => {
    const newStates = { ...leadStates, [leadId]: nuevoEstado }
    setLeadStates(newStates)
    setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado: nuevoEstado } : l))
    showNotification(`Actualizando estado del lead a ${nuevoEstado} en base de datos...`)

    try {
      const result = await actualizarEstadoLead(leadId, nuevoEstado)
      if (result.success) {
        showNotification(`Estado del lead actualizado a: ${nuevoEstado}`)
        router.refresh()
      } else {
        showNotification(`⚠️ Error al guardar en base de datos: ${result.error}`)
      }
    } catch {
      showNotification('⚠️ Error de red al intentar actualizar el estado.')
    }
  }

  // Resolver placeholders para leads
  const resolvePlaceholders = (text: string, email: string) => {
    if (!text) return ''
    const lead = localLeads.find(l => l.email === email)
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

    const data = {
      nombre: lead?.nombre || email.split('@')[0],
      email: email,
      beca: lead?.beca_objetivo || 'Beca General',
      pais: lead?.pais_destino || 'Global',
      calificacion: '7.5/10',
      pdf_url: 'https://sopreviewer.com/mock-essay.pdf',
      enlace_dashboard: `${origin}/dashboard`
    }

    return text
      .replace(/{nombre}/g, data.nombre)
      .replace(/{beca}/g, data.beca)
      .replace(/{pais}/g, data.pais)
      .replace(/{calificacion}/g, data.calificacion)
      .replace(/{pdf_url}/g, data.pdf_url)
      .replace(/{enlace_dashboard}/g, data.enlace_dashboard)
  }

  // Generar asesores deterministas basados en el ID o email del lead
  const getAdvisors = (lead: LeadReal) => {
    const code = lead.id.charCodeAt(lead.id.length - 1) || 0
    if (code % 2 === 0) return ['JL']
    return []
  }

  // Helper para verificar filtros de fechas
  const matchDate = (createdAtStr: string | null | undefined, option: string) => {
    if (option === 'Todos') return true
    if (!createdAtStr) return false
    const createdDate = new Date(createdAtStr)
    if (isNaN(createdDate.getTime())) return false
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - createdDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (option === 'Últimos 7 días') {
      return diffDays <= 7
    }
    if (option === 'Últimos 30 días') {
      return diffDays <= 30
    }
    if (option === 'Este mes') {
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
    }
    return true
  }

  // Lógica de filtrado combinada
  const filteredLeads = localLeads.filter(l => {
    // 1. Búsqueda por término de texto
    const textLower = searchTerm.toLowerCase()
    const matchSearch =
      (l.nombre || '').toLowerCase().includes(textLower) ||
      (l.email || '').toLowerCase().includes(textLower) ||
      (l.telefono || '').toLowerCase().includes(textLower) ||
      (l.beca_objetivo || '').toLowerCase().includes(textLower) ||
      (l.pais_destino || '').toLowerCase().includes(textLower)

    // 2. Filtro por Estado
    const currentStatus = leadStates[l.id] || 'Pendiente'
    const matchEstado = filterEstado === 'Todos' || currentStatus === filterEstado

    // 3. Filtro por Beca / País
    const matchBecaPais = filterBecaPais === 'Todos' || l.beca_objetivo === filterBecaPais || l.pais_destino === filterBecaPais

    // 4. Filtro por Fecha
    const matchFecha = matchDate(l.created_at, filterFecha)

    // 5. Filtro por Asesor
    const advisors = getAdvisors(l)
    const matchAsesor =
      filterAsesor === 'Todos' ||
      (filterAsesor === 'JL' && advisors.includes('JL')) ||
      (filterAsesor === 'Sin Asesor' && advisors.length === 0)

    return matchSearch && matchEstado && matchBecaPais && matchFecha && matchAsesor
  })

  // Obtener becas y países únicos del dataset para popular los filtros
  const becaPaisOptions = Array.from(
    new Set([
      ...localLeads.map(l => l.beca_objetivo).filter(Boolean),
      ...localLeads.map(l => l.pais_destino).filter(Boolean)
    ])
  ).sort() as string[]

  // Calcular métricas dinámicas basadas en localLeads completos
  const totalLeads = localLeads.length
  const pendingLeads = localLeads.filter(l => (leadStates[l.id] || 'Pendiente') === 'Pendiente').length
  const inContactLeads = localLeads.filter(l => leadStates[l.id] === 'En Contacto').length
  const convertedLeads = localLeads.filter(l => leadStates[l.id] === 'Convertido').length

  const pendingPercentage = totalLeads ? Math.round((pendingLeads / totalLeads) * 100) : 0
  const inContactPercentage = totalLeads ? Math.round((inContactLeads / totalLeads) * 100) : 0
  const convertedPercentage = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0

  // Paginación
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredLeads.length)
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex)

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setSearchTerm('')
    const params = new URLSearchParams(window.location.search)
    params.delete('search')
    router.replace(`${window.location.pathname}?${params.toString()}`)

    setFilterEstado('Todos')
    setFilterBecaPais('Todos')
    setFilterFecha('Todos')
    setFilterAsesor('Todos')
    setTempFilterEstado('Todos')
    setTempFilterBecaPais('Todos')
    setTempFilterFecha('Todos')
    setTempFilterAsesor('Todos')
    setCurrentPage(1)
    showNotification('Filtros restablecidos con éxito')
  }

  // Aplicar filtros avanzados
  const handleApplyFilters = () => {
    setFilterEstado(tempFilterEstado)
    setFilterBecaPais(tempFilterBecaPais)
    setFilterFecha(tempFilterFecha)
    setFilterAsesor(tempFilterAsesor)
    setCurrentPage(1)
    showNotification('Filtros aplicados con éxito')
  }

  // Exportar a Excel (HTML con formato y estilos)
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      showNotification('No hay leads para exportar con los filtros actuales.')
      return
    }

    const headers = ['Nombre Alumno', 'Email', 'WhatsApp', 'Beca Objetivo', 'País Destino', 'Deadline', 'Estado', 'Creado El']
    const rows = filteredLeads.map(lead => {
      const currentStatus = leadStates[lead.id] || 'Pendiente'
      return [
        lead.nombre,
        lead.email,
        lead.telefono || '',
        lead.beca_objetivo || '',
        lead.pais_destino || '',
        lead.deadline ? new Date(lead.deadline).toLocaleDateString('es-ES') : '',
        currentStatus,
        new Date(lead.created_at).toLocaleDateString('es-ES')
      ]
    })

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Leads</x:Name>
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
            <td colspan="8" class="title">Reporte de Leads de Mentoría</td>
          </tr>
          <tr>
            <td colspan="8" class="subtitle">Fecha de generación: ${new Date().toLocaleString('es-ES')}</td>
          </tr>
          <tr>
            <td colspan="8" style="height: 5px;"></td>
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
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `leads_mentoria_${new Date().toISOString().split('T')[0]}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Leads exportados a Excel exitosamente.')
  }

  // Enviar correo real usando Next.js Server Action de Resend
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLeadForEmail) return

    setSendingEmail(true)
    try {
      const result = await enviarCorreoAdmin(selectedLeadForEmail.email, emailSubject, emailBody)
      if (result.success) {
        const newLog = {
          id: String(Date.now()),
          fecha: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          destinatario: selectedLeadForEmail.email,
          asunto: emailSubject,
          estado: 'Enviado (Resend)',
          template: 'Respuesta Lead'
        }

        const updatedLogs = [newLog, ...emailLogs]
        setEmailLogs(updatedLogs)
        localStorage.setItem('sop_admin_email_logs', JSON.stringify(updatedLogs))

        handleStatusChange(selectedLeadForEmail.id, 'Convertido')
        showNotification(`Correo enviado a ${selectedLeadForEmail.email}. Lead marcado como Convertido.`)
        setSelectedLeadForEmail(null)
        setEmailSubject('')
        setEmailBody('')
      } else {
        showNotification(`Error de Resend: ${result.error || 'No se pudo enviar.'}`)
      }
    } catch {
      showNotification('Error al intentar enviar el correo.')
    } finally {
      setSendingEmail(false)
    }
  }

  // Eliminar un estudiante de la lista
  const executeDelete = async (lead: LeadReal) => {
    const originalLeads = [...localLeads]
    setLocalLeads(localLeads.filter(l => l.id !== lead.id))

    try {
      const result = await eliminarDatosEstudiante(lead.email)
      if (result.success) {
        showNotification(`Estudiante ${lead.nombre} eliminado exitosamente.`)
        router.refresh()
      } else {
        setLocalLeads(originalLeads)
        showNotification(`Error al eliminar: ${result.error || 'Inténtalo de nuevo.'}`)
      }
    } catch {
      setLocalLeads(originalLeads)
      showNotification('Error de red al intentar eliminar el estudiante.')
    }
  }

  // Crear lead manualmente
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeadNombre || !newLeadEmail) return

    setCreatingLead(true)
    try {
      const result = await crearEstudianteManual(newLeadNombre, newLeadEmail, newLeadTelefono)
      if (result.success) {
        showNotification(`¡Lead registrado manualmente y cuenta creada con éxito!`)
        setShowCreateModal(false)
        setNewLeadNombre('')
        setNewLeadEmail('')
        setNewLeadTelefono('')
        router.refresh()
      } else {
        showNotification(`Error al crear lead: ${result.error || 'No se pudo completar.'}`)
      }
    } catch {
      showNotification('Error al intentar comunicar con el servidor.')
    } finally {
      setCreatingLead(false)
    }
  }

  // Helper para generar iniciales
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="animate-in fade-in duration-300 relative flex flex-col gap-2 text-slate-800">


      {/* Notificador flotante superior local */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-slate-950/95 backdrop-blur-md border border-slate-800 text-slate-100 px-4.5 py-3.5 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4.5 animate-in slide-in-from-top-4 fade-in duration-300 select-none">
          <div className="flex items-center gap-3">
            {notification.includes('⚠️') || notification.toLowerCase().includes('error') ? (
              <div className="w-7.5 h-7.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
            ) : (
              <div className="w-7.5 h-7.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
            )}
            <span className="text-[11px] font-bold tracking-tight leading-relaxed text-slate-200">{notification.replace(/^⚠️\s*/, '')}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-900 shrink-0 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── SECCIÓN SUPERIOR: Filtros de Métricas y Búsqueda ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-0 pb-0">
        {/* Píldora de Métricas */}
        <div className="bg-white border border-slate-200/80 rounded-full px-4.5 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-wrap items-center gap-6 select-none">
          {/* Todos */}
          <button
            onClick={() => {
              setFilterEstado('Todos')
              setTempFilterEstado('Todos')
              setCurrentPage(1)
            }}
            className={`relative pb-1 pt-0.5 px-1.5 flex items-center gap-2 text-xs font-bold transition-all focus:outline-none ${filterEstado === 'Todos' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <span>Todos</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${filterEstado === 'Todos' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
              }`}>{totalLeads}</span>
            {filterEstado === 'Todos' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
            )}
          </button>

          {/* Pendientes */}
          <button
            onClick={() => {
              setFilterEstado('Pendiente')
              setTempFilterEstado('Pendiente')
              setCurrentPage(1)
            }}
            className={`relative pb-1 pt-0.5 px-1.5 flex items-center gap-2 text-xs font-bold transition-all focus:outline-none ${filterEstado === 'Pendiente' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <span>Pendientes</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${filterEstado === 'Pendiente' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
              }`}>{pendingLeads}</span>
            {filterEstado === 'Pendiente' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
            )}
          </button>

          {/* En Contacto */}
          <button
            onClick={() => {
              setFilterEstado('En Contacto')
              setTempFilterEstado('En Contacto')
              setCurrentPage(1)
            }}
            className={`relative pb-1 pt-0.5 px-1.5 flex items-center gap-2 text-xs font-bold transition-all focus:outline-none ${filterEstado === 'En Contacto' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <span>En Contacto</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${filterEstado === 'En Contacto' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
              }`}>{inContactLeads}</span>
            {filterEstado === 'En Contacto' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
            )}
          </button>

          {/* Convertidos */}
          <button
            onClick={() => {
              setFilterEstado('Convertido')
              setTempFilterEstado('Convertido')
              setCurrentPage(1)
            }}
            className={`relative pb-1 pt-0.5 px-1.5 flex items-center gap-2 text-xs font-bold transition-all focus:outline-none ${filterEstado === 'Convertido' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <span>Convertidos</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${filterEstado === 'Convertido' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
              }`}>{convertedLeads}</span>
            {filterEstado === 'Convertido' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Acciones de Búsqueda (Buscador + Nuevo Lead) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Caja de Búsqueda */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar estudiante, email o beca..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 focus:border-slate-350 text-[11px] rounded-lg outline-none transition-all bg-slate-50/50 focus:bg-white text-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.01)] font-semibold"
            />
          </div>

          {/* Botón "+ Nuevo Lead" */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Lead</span>
          </button>
        </div>
      </div>

      {/* ── BARRA DE FILTROS AVANZADOS EN ACCORDEÓN (Sin recuadro) ── */}
      <div className="flex flex-col gap-2 pt-0 pb-0">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-slate-900 focus:outline-none select-none w-fit"
        >
          <span>Filtros avanzados</span>
          {showAdvancedFilters ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>

        {showAdvancedFilters && (
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8 pt-1 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1">
              {/* Filtro: Estado */}
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[10px] font-bold text-slate-400">Estado</span>
                <select
                  value={tempFilterEstado}
                  onChange={(e) => {
                    const val = e.target.value
                    setTempFilterEstado(val)
                    setFilterEstado(val)
                    setCurrentPage(1)
                  }}
                  className="w-full text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="Todos">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Contacto">En Contacto</option>
                  <option value="Convertido">Convertido</option>
                </select>
              </div>

              {/* Filtro: Beca / País */}
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[10px] font-bold text-slate-400">Beca / País</span>
                <select
                  value={tempFilterBecaPais}
                  onChange={(e) => {
                    const val = e.target.value
                    setTempFilterBecaPais(val)
                    setFilterBecaPais(val)
                    setCurrentPage(1)
                  }}
                  className="w-full text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="Todos">Todos</option>
                  {becaPaisOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Filtro: Fecha */}
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[10px] font-bold text-slate-400">Fecha</span>
                <select
                  value={tempFilterFecha}
                  onChange={(e) => {
                    const val = e.target.value
                    setTempFilterFecha(val)
                    setFilterFecha(val)
                    setCurrentPage(1)
                  }}
                  className="w-full text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="Todos">Todos</option>
                  <option value="Últimos 7 días">Últimos 7 días</option>
                  <option value="Últimos 30 días">Últimos 30 días</option>
                  <option value="Este mes">Este mes</option>
                </select>
              </div>

              {/* Filtro: Asesor */}
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[10px] font-bold text-slate-400">Asesor</span>
                <select
                  value={tempFilterAsesor}
                  onChange={(e) => {
                    const val = e.target.value
                    setTempFilterAsesor(val)
                    setFilterAsesor(val)
                    setCurrentPage(1)
                  }}
                  className="w-full text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="Todos">Todos</option>
                  <option value="JL">Joffre Llerena (JL)</option>
                  <option value="Sin Asesor">Sin Asesor</option>
                </select>
              </div>
            </div>

            {/* Separador visual entre filtros y botones de acción */}
            <div className="hidden md:block w-px h-5.5 bg-slate-200 self-end mb-1 shrink-0" />
            <div className="block md:hidden h-px bg-slate-100 my-1 w-full" />

            {/* Acciones de Filtro */}
            <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-end">
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm bg-white"
                title="Exportar a Excel"
              >
                <Download className="w-3 h-3" />
                <span>Exportar</span>
              </button>
              <button
                onClick={handleClearFilters}
                className="px-2.5 py-1 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm bg-white"
                title="Limpiar todos los filtros"
              >
                <span>Limpiar filtros</span>
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-2.5 py-1 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                title="Aplicar filtros seleccionados"
              >
                <span>Aplicar filtros</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── TABLA DE DATOS PREMIUM ── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.005)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 bg-slate-50/50 text-[9px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-4">Estudiante</th>
                <th className="py-2.5 px-4">Beca / País</th>
                <th className="py-2.5 px-4">WhatsApp</th>
                <th className="py-2.5 px-4">Deadline</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4">Contacto</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-600">
              {paginatedLeads.map(lead => {
                const currentStatus = leadStates[lead.id] || 'Pendiente'
                const advisors = getAdvisors(lead)
                const initials = getInitials(lead.nombre)

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/30 transition-all duration-100">

                    {/* Columna: Estudiante */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7.5 h-7.5 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[10px] font-black select-none shrink-0 shadow-sm">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-900 block truncate hover:text-slate-800 cursor-default">{lead.nombre}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 tracking-tight font-medium">{lead.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Columna: Beca / País */}
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-800">{lead.beca_objetivo}</div>
                      <div className="text-[9px] text-blue-600 font-extrabold mt-0.5">{lead.pais_destino || 'Global'}</div>
                    </td>

                    {/* Columna: WhatsApp */}
                    <td className="py-2.5 px-4">
                      {lead.telefono ? (
                        <a
                          href={`https://wa.me/${formatWhatsAppNumber(lead.telefono)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors font-bold"
                          title="Escribir por WhatsApp"
                        >
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.459 3.475 1.33 4.99L2 22l5.161-1.355a9.92 9.92 0 004.851 1.258h.004c5.505 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.657 14.167c-.273.766-1.378 1.4-1.889 1.487-.463.082-.942.15-2.883-.615-2.483-.98-4.088-3.5-4.212-3.665-.124-.165-1.012-1.344-1.012-2.564 0-1.22.64-1.82.868-2.067.227-.247.495-.309.66-.309.165 0 .33.003.474.01.148.007.35-.059.547.419.206.495.702 1.712.764 1.836.062.124.103.268.02.433-.082.165-.124.268-.247.412-.124.144-.261.32-.372.43-.124.123-.254.257-.109.505.144.247.643 1.062 1.382 1.722.953.85 1.753 1.114 2.001 1.237.248.124.392.103.536-.062.144-.165.62-.722.784-.969.165-.247.33-.206.557-.124.227.082 1.439.678 1.687.802.247.124.412.186.474.289.062.103.062.598-.211 1.364z" />
                          </svg>
                          <span>{lead.telefono}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>

                    {/* Columna: Deadline */}
                    <td className="py-2.5 px-4 text-slate-500 font-bold">
                      {lead.deadline ? new Date(lead.deadline).toLocaleDateString('es-ES') : '—'}
                    </td>

                    {/* Columna: Estado (Badge interactivo) */}
                    <td className="py-2.5 px-4">
                      <div className="relative inline-block hover:scale-[1.02] transition-transform">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${currentStatus === 'Pendiente'
                            ? 'bg-rose-50/50 text-rose-605 border-rose-200'
                            : currentStatus === 'En Contacto'
                              ? 'bg-amber-50/50 text-amber-605 border-amber-200'
                              : 'bg-emerald-50/50 text-emerald-605 border-emerald-200'
                          }`}>
                          <div className={`w-1 h-1 rounded-full shrink-0 ${currentStatus === 'Pendiente' ? 'bg-rose-500' : currentStatus === 'En Contacto' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                          <span>{currentStatus}</span>
                        </div>

                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          title="Cambiar estado manualmente"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Contacto">En Contacto</option>
                          <option value="Convertido">Convertido</option>
                        </select>
                      </div>
                    </td>

                    {/* Columna: Contacto (Asesores initials) */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center">
                        {advisors.map((adv, idx) => (
                          <span
                            key={idx}
                            className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[8px] font-black border border-white -ml-1.5 first:ml-0 shadow-sm ${adv === 'MP'
                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                : 'bg-purple-50 text-purple-600 border-purple-100'
                              }`}
                            title={adv === 'MP' ? 'María Ponce (MP)' : 'Joffre Llerena (JL)'}
                          >
                            {adv}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Columna: Acciones */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex gap-1.5 justify-end items-center">
                        {/* Detalles */}
                        <button
                          onClick={() => setSelectedLeadForDetails(lead)}
                          className="px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] cursor-pointer"
                          title="Ver detalles completos de la solicitud"
                        >
                          Ver detalles
                        </button>

                        {/* Responder (Correo) */}
                        <button
                          onClick={() => {
                            if (getNormalizedStatus(lead.estado) === 'Pendiente') {
                              handleStatusChange(lead.id, 'En Contacto')
                            }
                            setSelectedLeadForEmail(lead)
                            setEmailSubject(`Revisión de SOP — Acompañamiento para Beca ${lead.beca_objetivo || ''}`)
                            setEmailBody(`¡Hola ${lead.nombre}!\n\nRevisé tu solicitud de mentoría para la Beca ${lead.beca_objetivo || ''} con destino en ${lead.pais_destino || 'tu país de interés'}.\n\nMe gustaría que tengamos una sesión diagnóstica rápida por Zoom para revisar a detalle tus debilidades actuales en el ensayo y ayudarte a transformarlo en una postulación ganadora.\n\nQuedo atento a tu respuesta para coordinar la fecha y hora.\n\nUn cordial saludo,\nMentor Experto\nLa Comunidad del Intercambio`)
                          }}
                          className="px-2 py-1 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-md text-[10px] font-bold transition-all inline-flex items-center gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>Responder</span>
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => setLeadToDelete(lead)}
                          className="p-1 rounded-md border border-red-100 hover:border-red-200 hover:bg-red-50 text-red-500 hover:text-red-650 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                          title="Eliminar Estudiante"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                  </tr>
                )
              })}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-bold text-[11px]">
                    No se encontraron leads con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER DE LA TABLA (PAGINACIÓN) ── */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40 select-none">


          {/* Selector de páginas */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-6.5 h-6.5 rounded-md border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {getPageNumbers().map((p, idx) => (
                <button
                  key={idx}
                  disabled={p === '...'}
                  onClick={() => typeof p === 'number' && setCurrentPage(p)}
                  className={`w-6.5 h-6.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer ${currentPage === p
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : p === '...'
                        ? 'text-slate-400 cursor-default'
                        : 'border border-slate-200 hover:border-slate-350 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="w-6.5 h-6.5 rounded-md border border-slate-200 hover:border-slate-350 bg-white flex items-center justify-center text-slate-605 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Tamaño de página */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-white border border-slate-200 rounded-md px-1.5 py-0.5 outline-none font-bold text-slate-700 cursor-pointer focus:border-slate-350 text-[10px]"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── MODAL: CREAR LEAD MANUALMENTE ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl relative text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">Crear Lead</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider">Nombres y Apellidos Completos</span>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Carlos Pérez Gómez"
                  value={newLeadNombre}
                  onChange={(e) => setNewLeadNombre(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-slate-350 text-xs text-slate-800 outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider">Correo Electrónico</span>
                <input
                  type="email"
                  required
                  placeholder="Ej. juan.perez@gmail.com"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-slate-350 text-xs text-slate-800 outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider">Teléfono / WhatsApp</span>
                <input
                  type="text"
                  required
                  placeholder="Ej. +593987654321"
                  value={newLeadTelefono}
                  onChange={(e) => setNewLeadTelefono(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-slate-350 text-xs text-slate-800 outline-none transition-all font-semibold"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingLead}
                  className="w-1/2 py-3 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={creatingLead}
                  className="w-1/2 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 bg-[#0f172a] hover:bg-[#1e293b] cursor-pointer"
                >
                  {creatingLead ? 'Creando...' : 'Crear Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VER DETALLES DEL LEAD ── */}
      {selectedLeadForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl relative text-left flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <h3 className="font-extrabold text-sm text-slate-900">Detalles de Mentoría Premium</h3>
              </div>
              <button onClick={() => setSelectedLeadForDetails(null)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 flex-1 flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Info Personal */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4.5 flex flex-col gap-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <User className="w-3.5 h-3.5" /> Datos Personales
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Nombre del Alumno</span>
                      <span className="text-xs font-extrabold text-slate-800">{selectedLeadForDetails.nombre}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Correo Electrónico</span>
                      <a href={`mailto:${selectedLeadForDetails.email}`} className="text-xs font-bold text-blue-600 hover:underline">{selectedLeadForDetails.email}</a>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">WhatsApp / Teléfono</span>
                      {selectedLeadForDetails.telefono ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-slate-700">{selectedLeadForDetails.telefono}</span>
                          <a
                            href={`https://wa.me/${formatWhatsAppNumber(selectedLeadForDetails.telefono)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[9px] font-bold transition-all shadow-sm"
                          >
                            Chatear
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic font-medium">No proporcionado</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Postulación */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4.5 flex flex-col gap-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Detalles de Postulación
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Beca Objetivo</span>
                        <span className="text-xs font-extrabold text-slate-800">{selectedLeadForDetails.beca_objetivo || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">País Destino</span>
                        <span className="text-xs font-extrabold text-slate-800">{selectedLeadForDetails.pais_destino || '—'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Fecha Límite</span>
                        <span className="text-xs font-bold text-slate-700">
                          {selectedLeadForDetails.deadline ? new Date(selectedLeadForDetails.deadline).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Fecha Registro</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {new Date(selectedLeadForDetails.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Estado del Lead</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={leadStates[selectedLeadForDetails.id] || 'Pendiente'}
                          onChange={(e) => handleStatusChange(selectedLeadForDetails.id, e.target.value)}
                          className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg outline-none focus:border-slate-350 cursor-pointer"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Contacto">En Contacto</option>
                          <option value="Convertido">Convertido</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ensayo */}
              <div className="border border-slate-200/80 rounded-xl p-4.5 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Ensayo de Acompañamiento
                  </h4>
                  {selectedLeadForDetails.ensayo_pdf_url && (
                    <a
                      href={selectedLeadForDetails.ensayo_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-[10px] font-extrabold transition-all shadow-sm"
                    >
                      <Download className="w-3 h-3 text-rose-500" />
                      <span>Descargar PDF</span>
                    </a>
                  )}
                </div>

                {selectedLeadForDetails.ensayo_contenido ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-0.5">
                      <span>Texto original</span>
                      <span>{selectedLeadForDetails.ensayo_contenido.trim().split(/\s+/).length} palabras</span>
                    </div>
                    <div
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-56 overflow-y-auto text-slate-800 text-[13px] leading-relaxed select-text shadow-inner"
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {selectedLeadForDetails.ensayo_contenido}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border border-amber-100 text-amber-800 rounded-xl p-4 text-xs flex items-center gap-2 mt-1 font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>Este estudiante no tiene ningún ensayo registrado en su cuenta de SOP Reviewer.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5 border-t border-slate-100 pt-4 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedLeadForDetails(null)}
                className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  const lead = selectedLeadForDetails
                  setSelectedLeadForDetails(null)
                  if ((leadStates[lead.id] || 'Pendiente') === 'Pendiente') {
                    handleStatusChange(lead.id, 'En Contacto')
                  }
                  setSelectedLeadForEmail(lead)
                  setEmailSubject(`Revisión de SOP — Acompañamiento para Beca ${lead.beca_objetivo || ''}`)
                  setEmailBody(`¡Hola ${lead.nombre}!\n\nRevisé tu solicitud de mentoría para la Beca ${lead.beca_objetivo || ''} con destino en ${lead.pais_destino || 'tu país de interés'}.\n\nMe gustaría que tengamos una sesión diagnóstica rápida por Zoom para revisar a detalle tus debilidades actuales en el ensayo y ayudarte a transformarlo en una postulación ganadora.\n\nQuedo atento a tu respuesta para coordinar la fecha y hora.\n\nUn cordial saludo,\nMentor Experto\nLa Comunidad del Intercambio`)
                }}
                className="w-1/2 py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Responder por Correo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RESPUESTA DE CORREO (CON PLANTILLAS) ── */}
      {selectedLeadForEmail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-150 bg-white p-6 shadow-2xl relative text-left animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Mail className="w-4.5 h-4.5" /></div>
                <h3 className="font-extrabold text-sm text-slate-900">Enviar Respuesta</h3>
              </div>
              <button onClick={() => setSelectedLeadForEmail(null)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-wider">Destinatario</span>
                  <input type="text" readOnly value={selectedLeadForEmail.nombre} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 outline-none font-bold cursor-not-allowed" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-wider">Correo Electrónico</span>
                  <input type="text" readOnly value={selectedLeadForEmail.email} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 outline-none font-bold cursor-not-allowed" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-wider">Cargar Plantilla</span>
                <select
                  onChange={(e) => {
                    const tmplId = e.target.value
                    if (!tmplId) return
                    const tmpl = templates.find(t => t.id === tmplId)
                    if (tmpl) {
                      setEmailSubject(resolvePlaceholders(tmpl.asunto, selectedLeadForEmail.email))
                      setEmailBody(resolvePlaceholders(tmpl.preview, selectedLeadForEmail.email))
                    }
                  }}
                  className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl outline-none focus:bg-white focus:border-slate-350 cursor-pointer"
                >
                  <option value="">-- Seleccionar plantilla --</option>
                  {templates.map(tmpl => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-wider">Asunto</span>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-slate-350 text-xs text-slate-800 outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-wider">Cuerpo del Correo</span>
                <textarea
                  required
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-slate-350 text-xs text-slate-755 outline-none transition-all leading-relaxed font-medium"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForEmail(null)}
                  disabled={sendingEmail}
                  className="px-4 py-3 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all cursor-pointer shrink-0"
                >
                  Cerrar
                </button>

                {selectedLeadForEmail.telefono && (
                  <button
                    type="button"
                    onClick={() => {
                      if (getNormalizedStatus(selectedLeadForEmail.estado) === 'Pendiente') {
                        handleStatusChange(selectedLeadForEmail.id, 'En Contacto')
                      }
                      const cleanPhone = formatWhatsAppNumber(selectedLeadForEmail.telefono)
                      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(emailBody)}`
                      window.open(waUrl, '_blank')
                      setSelectedLeadForEmail(null)
                    }}
                    className="flex-1 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 cursor-pointer animate-in fade-in duration-200"
                    title="Enviar este mensaje por WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.459 3.475 1.33 4.99L2 22l5.161-1.355a9.92 9.92 0 004.851 1.258h.004c5.505 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.657 14.167c-.273.766-1.378 1.4-1.889 1.487-.463.082-.942.15-2.883-.615-2.483-.98-4.088-3.5-4.212-3.665-.124-.165-1.012-1.344-1.012-2.564 0-1.22.64-1.82.868-2.067.227-.247.495-.309.66-.309.165 0 .33.003.474.01.148.007.35-.059.547.419.206.495.702 1.712.764 1.836.062.124.103.268.02.433-.082.165-.124.268-.247.412-.124.144-.261.32-.372.43-.124.123-.254.257-.109.505.144.247.643 1.062 1.382 1.722.953.85 1.753 1.114 2.001 1.237.248.124.392.103.536-.062.144-.165.62-.722.784-.969.165-.247.33-.206.557-.124.227.082 1.439.678 1.687.802.247.124.412.186.474.289.062.103.062.598-.211 1.364z" />
                    </svg>
                    <span>Responder por WhatsApp</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-1.5 bg-[#0f172a] hover:bg-[#1e293b] cursor-pointer"
                >
                  {sendingEmail ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Enviar Correo</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRMACIÓN DE ELIMINACIÓN ── */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-slate-150 bg-white p-6 shadow-2xl relative text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Confirmar Eliminación</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">
                  ¿Estás seguro de que deseas eliminar permanentemente a <span className="font-extrabold text-slate-800">{leadToDelete.nombre}</span>?
                </p>
              </div>
            </div>

            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 mb-5 text-[11px] text-rose-700 leading-relaxed font-semibold">
              Atención: Esta acción no se puede deshacer. Se eliminarán todos sus datos y sus ensayos en la plataforma.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setLeadToDelete(null)}
                className="w-1/2 py-3 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const lead = leadToDelete
                  setLeadToDelete(null)
                  await executeDelete(lead)
                }}
                className="w-1/2 py-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
