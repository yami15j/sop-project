'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Minus,
  GraduationCap,
  MapPin,
  Calendar,
  Phone,
  Mail,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RotateCcw,
  CheckCircle,
  Lightbulb
} from 'lucide-react'
import { EnsayoReal, LeadReal } from './types'
import FeedbackCard from '../FeedbackCard'
import { eliminarDatosEstudiante, crearEstudianteManual, actualizarDatosEstudiante, ajustarCreditosEstudiante } from '../../app/admin/actions'

interface UserDetails {
  nombre: string
  email: string
  telefono: string | null
  becas: string[]
  paises: string[]
  totalEnsayos: number
  totalLeads: number
  latestDate: string
  ensayosList: EnsayoReal[]
  leadsList: LeadReal[]
}

interface UsersTabProps {
  profiles: any[]
  ensayos: EnsayoReal[]
  leads: LeadReal[]
  initialSearch?: string
}

export default function UsersTab({ profiles, ensayos, leads, initialSearch = '' }: UsersTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSearch = searchParams.get('search') || ''

  const [searchTerm, setSearchTerm] = useState(urlSearch || initialSearch)
  const [editingStudentEmail, setEditingStudentEmail] = useState<string | null>(null)

  useEffect(() => {
    setSearchTerm(urlSearch)
  }, [urlSearch])

  // Estados para filtros avanzados
  const [filterRol, setFilterRol] = useState('Todos')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [filterActividad, setFilterActividad] = useState('Todos')
  const [filterFecha, setFilterFecha] = useState('')

  const handleClearFilters = () => {
    setSearchTerm('')
    const params = new URLSearchParams(window.location.search)
    params.delete('search')
    router.replace(`${window.location.pathname}?${params.toString()}`)

    setFilterRol('Todos')
    setFilterEstado('Todos')
    setFilterActividad('Todos')
    setFilterFecha('')
    showNotification('Filtros restablecidos con éxito')
  }

  // Estados para inputs de edición en línea (fila)
  const [rowEditNombre, setRowEditNombre] = useState('')
  const [rowEditTelefono, setRowEditTelefono] = useState('')
  const [rowEditEmail, setRowEditEmail] = useState('')

  // Estados para creación manual de estudiantes
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newStudentNombre, setNewStudentNombre] = useState('')
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [newStudentTelefono, setNewStudentTelefono] = useState('')
  const [creatingStudent, setCreatingStudent] = useState(false)

  // Estados para modals
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<{ id: string; nombre: string; email: string; totalEnsayos: number } | null>(null)
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<UserDetails | null>(null)
  const [isEditingStudent, setIsEditingStudent] = useState(false)
  const [editNombre, setEditNombre] = useState('')
  const [editTelefono, setEditTelefono] = useState('')

  // Preview local de ensayo
  const [selectedEssayForPreview, setSelectedEssayForPreview] = useState<EnsayoReal | null>(null)
  const [viewMode, setViewMode] = useState<'processed' | 'raw'>('processed')

  // Estados locales que antes venían por props
  // localCredits: almacena el valor de creditos_extra en BD, inicializado desde los perfiles
  const [localCredits, setLocalCredits] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    profiles.forEach(p => { init[p.email] = p.creditos_extra ?? 0 })
    return init
  })
  const [modifiedUsers, setModifiedUsers] = useState<Record<string, { nombre: string; telefono: string | null }>>({})
  const [notification, setNotification] = useState<string | null>(null)

  // Cargar datos guardados de usuarios editados desde localStorage
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('sop_admin_modified_users')
      if (storedUsers) setModifiedUsers(JSON.parse(storedUsers))
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

  // Modificar créditos: actualiza localmente Y guarda en Supabase
  const handleModifyCredits = async (profile: any, amount: number) => {
    const email = profile.email
    const currentCredits = localCredits[email] ?? (profile.creditos_extra ?? 0)
    const nuevoTotal = Math.max(0, currentCredits + amount)
    // Actualización optimista en UI
    setLocalCredits(prev => ({ ...prev, [email]: nuevoTotal }))
    showNotification(`${amount > 0 ? '+' : ''}${amount} crédito${Math.abs(amount) !== 1 ? 's' : ''} para ${profile.nombre}. Guardando...`)
    // Guardar en Supabase
    const result = await ajustarCreditosEstudiante(profile.user_id || null, email, nuevoTotal)
    if (!result.success) {
      // Revertir si falla
      setLocalCredits(prev => ({ ...prev, [email]: currentCredits }))
      showNotification(`⚠️ Error al guardar créditos: ${result.error || 'Inténtalo de nuevo.'}`)
    } else {
      showNotification(`Créditos de ${profile.nombre} actualizados a ${nuevoTotal} y guardados.`)
    }
  }

  // Eliminar estudiante de Supabase
  const handleDeleteUser = async (email: string) => {
    showNotification('Eliminando estudiante de Supabase...')
    try {
      const result = await eliminarDatosEstudiante(email)
      if (result.success) {
        showNotification(`Estudiante ${email} eliminado correctamente de la base de datos!`)
        window.location.reload()
      } else {
        showNotification(`Error de Supabase al eliminar: ${result.error || 'No se pudo completar.'}`)
      }
    } catch {
      showNotification('Error de comunicación con el servidor al intentar eliminar.')
    } finally {
      setSelectedUserForDelete(null)
    }
  }

  // Crear estudiante manualmente
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudentNombre || !newStudentEmail) return

    setCreatingStudent(true)
    try {
      const result = await crearEstudianteManual(newStudentNombre, newStudentEmail, newStudentTelefono)
      if (result.success) {
        showNotification(`¡Estudiante registrado y cuenta de acceso creada! Contraseña temporal: Estudiante123!`)
        setShowCreateModal(false)
        setNewStudentNombre('')
        setNewStudentEmail('')
        setNewStudentTelefono('')
        window.location.reload()
      } else {
        showNotification(`Error al crear estudiante: ${result.error || 'No se pudo completar.'}`)
      }
    } catch {
      showNotification('Error al intentar comunicar con el servidor.')
    } finally {
      setCreatingStudent(false)
    }
  }

  // Guardar cambios en la ficha del alumno
  const handleSaveStudentEdit = async (email: string, nombre: string, telefono: string | null) => {
    showNotification('Guardando cambios en Supabase...')
    try {
      const result = await actualizarDatosEstudiante(email, nombre, telefono)
      if (result.success) {
        const updated = {
          ...modifiedUsers,
          [email]: { nombre, telefono }
        }
        setModifiedUsers(updated)
        localStorage.setItem('sop_admin_modified_users', JSON.stringify(updated))

        if (selectedStudentForDetails) {
          setSelectedStudentForDetails({
            ...selectedStudentForDetails,
            nombre,
            telefono
          })
        }
        showNotification(`¡Datos de ${email} guardados correctamente en Supabase!`)
      } else {
        showNotification(`Error de Supabase: ${result.error || 'No se pudo guardar.'}`)
      }
    } catch {
      showNotification('Error de comunicación con el servidor al intentar guardar.')
    } finally {
      setIsEditingStudent(false)
    }
  }

  // Abrir los detalles completos del estudiante
  const handleOpenStudentDetails = (email: string) => {
    const studentEnsayos = ensayos.filter(e => e.email_usuario === email)
    const studentLeads = leads.filter(l => l.email === email)

    const firstEssay = studentEnsayos[0]
    const firstLead = studentLeads[0]
    const nombre = firstEssay?.nombre_usuario || firstLead?.nombre || email.split('@')[0]
    const telefono = studentLeads.map(l => l.telefono).filter(Boolean)[0] || null

    const becasSet = new Set<string>()
    studentEnsayos.forEach(e => { if (e.beca_objetivo) becasSet.add(e.beca_objetivo) })
    studentLeads.forEach(l => { if (l.beca_objetivo) becasSet.add(l.beca_objetivo) })
    const becas = Array.from(becasSet)

    const paisesSet = new Set<string>()
    studentEnsayos.forEach(e => { if (e.pais_destino) paisesSet.add(e.pais_destino) })
    studentLeads.forEach(l => { if (l.pais_destino) paisesSet.add(l.pais_destino) })
    const paises = Array.from(paisesSet)

    const dates = [
      ...studentEnsayos.map(e => new Date(e.created_at)),
      ...studentLeads.map(l => new Date(l.created_at))
    ]
    const latestDate = dates.length > 0
      ? new Date(Math.max(...dates.map(d => d.getTime()))).toLocaleDateString('es-ES')
      : '—'

    setSelectedStudentForDetails({
      nombre,
      email,
      telefono,
      becas,
      paises,
      totalEnsayos: studentEnsayos.length,
      totalLeads: studentLeads.length,
      latestDate,
      ensayosList: studentEnsayos,
      leadsList: studentLeads
    })
  }

  // Agrupar alumnos únicos basándose en email
  const studentsMap = new Map<string, {
    nombre: string;
    email: string;
    totalEnsayos: number;
    totalLeads: number;
    latestDateRaw: Date;
    firstActivityDate: Date;
    telefono?: string | null;
    rol?: string;
  }>()

  // 1. Cargar perfiles de estudiantes registrados
  profiles.forEach(p => {
    const email = p.email
    if (!email) return
    const name = modifiedUsers[email]?.nombre || p.nombre || email.split('@')[0]
    const createdDate = p.created_at ? new Date(p.created_at) : new Date(0)
    const phone = modifiedUsers[email]?.telefono || p.telefono || null
    const rol = p.rol || 'estudiante'

    studentsMap.set(email, {
      nombre: name,
      email,
      totalEnsayos: 0,
      totalLeads: 0,
      latestDateRaw: createdDate,
      firstActivityDate: createdDate,
      telefono: phone,
      rol
    })
  })

  // 2. Incrementar ensayos
  ensayos.forEach(e => {
    const email = e.email_usuario || 'sin-correo@analisis.com'
    const name = modifiedUsers[email]?.nombre || e.nombre_usuario || email.split('@')[0]
    const createdDate = new Date(e.created_at)
    const phone = modifiedUsers[email]?.telefono || null

    if (studentsMap.has(email)) {
      const s = studentsMap.get(email)!
      s.totalEnsayos++
      if (phone && !s.telefono) s.telefono = phone
      if (createdDate < s.firstActivityDate) s.firstActivityDate = createdDate
      if (createdDate > s.latestDateRaw) s.latestDateRaw = createdDate
    } else {
      studentsMap.set(email, {
        nombre: name,
        email,
        totalEnsayos: 1,
        totalLeads: 0,
        latestDateRaw: createdDate,
        firstActivityDate: createdDate,
        telefono: phone,
        rol: 'estudiante'
      })
    }
  })

  // 3. Incrementar leads
  leads.forEach(l => {
    const email = l.email
    const name = modifiedUsers[email]?.nombre || l.nombre || email.split('@')[0]
    const createdDate = new Date(l.created_at)
    const phone = modifiedUsers[email]?.telefono || l.telefono || null

    if (studentsMap.has(email)) {
      const s = studentsMap.get(email)!
      s.totalLeads++
      if (phone && !s.telefono) s.telefono = phone
      if (createdDate < s.firstActivityDate) s.firstActivityDate = createdDate
      if (createdDate > s.latestDateRaw) s.latestDateRaw = createdDate
    } else {
      studentsMap.set(email, {
        nombre: name,
        email,
        totalEnsayos: 0,
        totalLeads: 1,
        latestDateRaw: createdDate,
        firstActivityDate: createdDate,
        telefono: phone,
        rol: 'estudiante'
      })
    }
  })

  const uniqueStudents = Array.from(studentsMap.values()).map(s => {
    const latestDate = s.latestDateRaw.getTime() > 0 ? s.latestDateRaw.toLocaleDateString('es-ES') : '—'
    return {
      nombre: s.nombre,
      email: s.email,
      totalEnsayos: s.totalEnsayos,
      totalLeads: s.totalLeads,
      latestDate,
      firstActivityDate: s.firstActivityDate,
      telefono: s.telefono,
      rol: s.rol || 'estudiante'
    }
  })

  // Filtrar estudiantes por término de búsqueda y filtros avanzados
  const filteredStudents = uniqueStudents.filter(s => {
    // 1. Búsqueda de texto
    const textLower = searchTerm.toLowerCase()
    const matchSearch =
      s.nombre.toLowerCase().includes(textLower) ||
      s.email.toLowerCase().includes(textLower)

    // 2. Filtro de Rol
    const matchRol = filterRol === 'Todos' || s.rol === filterRol

    // 3. Filtro de Estado
    let matchEstado = true
    if (filterEstado !== 'Todos') {
      const now = new Date()
      const msDiff = now.getTime() - s.firstActivityDate.getTime()
      const daysPassed = Math.floor(msDiff / (1000 * 60 * 60 * 24))
      const daysRemaining = 30 - daysPassed
      let status = 'Activo'
      if (daysRemaining <= 0) status = 'Expirado'
      else if (daysRemaining <= 5) status = 'Expira pronto'

      matchEstado = status === filterEstado
    }

    // 4. Filtro de Actividad
    let matchActividad = true
    if (filterActividad === 'Con Ensayos') {
      matchActividad = s.totalEnsayos > 0
    } else if (filterActividad === 'Sin Ensayos') {
      matchActividad = s.totalEnsayos === 0
    } else if (filterActividad === 'Con Solicitudes') {
      matchActividad = s.totalLeads > 0
    } else if (filterActividad === 'Sin Solicitudes') {
      matchActividad = s.totalLeads === 0
    }

    // 5. Filtro de Fecha
    let matchFecha = true
    if (filterFecha) {
      const filterDate = new Date(filterFecha + 'T00:00:00')
      const studentDate = new Date(s.firstActivityDate)
      studentDate.setHours(0, 0, 0, 0)
      matchFecha = studentDate >= filterDate
    }

    return matchSearch && matchRol && matchEstado && matchActividad && matchFecha
  })

  // Helper para normalizar el estado del lead de forma uniforme
  const getNormalizedStatus = (estado: string | null | undefined) => {
    if (!estado) return 'Pendiente'
    const est = estado.trim().toLowerCase()
    if (est === 'nuevo' || est === 'pendiente') return 'Pendiente'
    if (est === 'en contacto' || est === 'contacto' || est === 'contactado') return 'En Contacto'
    if (est === 'convertido' || est === 'finalizado') return 'Convertido'
    return estado
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
    <div className="animate-in fade-in duration-300">

      {/* Notificador flotante */}
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

      {/* ── BARRA DE FILTROS AVANZADOS ── */}
      <div className="flex flex-wrap items-end gap-3.5 mb-0 text-left py-0">
        {/* Rol */}
        <div className="flex flex-col gap-1 w-full sm:w-36">
          <span className="text-[10px] font-bold text-slate-400">Rol</span>
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            className="w-full text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="Todos">Todos los roles</option>
            <option value="estudiante">Estudiante</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Estado */}
        <div className="flex flex-col gap-1 w-full sm:w-28">
          <span className="text-[10px] font-bold text-slate-400">Estado</span>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Expira pronto">Expira pronto</option>
            <option value="Expirado">Expirado</option>
          </select>
        </div>

        {/* Actividad */}
        <div className="flex flex-col gap-1 w-full sm:w-36">
          <span className="text-[10px] font-bold text-slate-400">Actividad</span>
          <select
            value={filterActividad}
            onChange={(e) => setFilterActividad(e.target.value)}
            className="w-full text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="Todos">Todos</option>
            <option value="Con Ensayos">Con Ensayos</option>
            <option value="Sin Ensayos">Sin Ensayos</option>
            <option value="Con Solicitudes">Con Solicitudes</option>
            <option value="Sin Solicitudes">Sin Solicitudes</option>
          </select>
        </div>

        {/* Registrado desde */}
        <div className="flex flex-col gap-1 w-full sm:w-40 relative">
          <span className="text-[10px] font-bold text-slate-400">Registrado desde</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all cursor-pointer shadow-sm"
            />
          </div>
        </div>

        {/* Limpiar filtros */}
        <button
          onClick={handleClearFilters}
          className="px-3 py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm bg-white mt-auto sm:ml-auto w-full sm:w-auto relative -top-3"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpiar filtros</span>
        </button>
      </div>

      {/* Actions Row */}
      <div className="flex justify-end items-center mb-2.5 mt-[-6px]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar estudiante, email o beca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 focus:border-slate-350 text-[11px] rounded-lg outline-none transition-all bg-slate-50/50 focus:bg-white text-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.01)] font-semibold"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Estudiante</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.005)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 bg-slate-50/50 text-[9px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-4">Estudiante</th>
                <th className="py-2.5 px-4">Correo Electrónico</th>
                <th className="py-2.5 px-4">Teléfono / WhatsApp</th>
                <th className="py-2.5 px-4 text-center">Tiempo Restante</th>
                <th className="py-2.5 px-4 text-center">Créditos de Ensayo</th>
                <th className="py-2.5 px-4 text-center">Actividad</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-600">
              {filteredStudents.map(student => {
                // Buscar el perfil de BD para obtener user_id y creditos_extra guardados
                const profile = profiles.find(p => p.email === student.email)
                const finalCredits = localCredits[student.email] ?? (profile?.creditos_extra ?? 0)
                const isEditingRow = editingStudentEmail === student.email

                return (
                  <tr key={student.email} className={`hover:bg-slate-50/30 transition-all duration-100 ${isEditingRow ? 'bg-sky-50/40' : ''}`}>
                    <td className="py-2.5 px-4">
                      {isEditingRow ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7.5 h-7.5 rounded-full bg-[#0F172A] text-white font-black text-[10px] flex items-center justify-center flex-shrink-0">
                            {(rowEditNombre.charAt(0) || 'U').toUpperCase()}
                          </div>
                          <input
                            type="text"
                            value={rowEditNombre}
                            onChange={(e) => setRowEditNombre(e.target.value)}
                            className="p-1.5 border border-slate-200 focus:border-[#00A8E8] text-xs font-bold text-slate-800 rounded-lg outline-none w-full max-w-[150px] bg-white shadow-sm"
                            placeholder="Nombre"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-7.5 h-7.5 rounded-full bg-[#0F172A] text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm" onClick={() => handleOpenStudentDetails(student.email)}>
                            {student.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 cursor-pointer hover:text-[#00A8E8] transition-colors block truncate" onClick={() => handleOpenStudentDetails(student.email)}>
                                {student.nombre}
                              </span>
                              {student.rol === 'admin' && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-wider border border-blue-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                                  Admin
                                </span>
                              )}
                              {student.rol === 'mentor' && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-wider border border-purple-100 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                                  Mentor
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 block mt-0.5 tracking-tight font-medium">{student.email}</span>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      {isEditingRow ? (
                        <input
                          type="email"
                          value={rowEditEmail}
                          disabled
                          className="p-1.5 border border-slate-200 bg-slate-50 text-xs font-medium text-slate-400 rounded-lg outline-none w-full max-w-[180px] cursor-not-allowed"
                          title="El correo es la credencial única de acceso del alumno y no es editable."
                        />
                      ) : (
                        <span className="font-medium text-slate-650 text-[11px]">{student.email}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4">
                      {isEditingRow ? (
                        <input
                          type="text"
                          value={rowEditTelefono}
                          onChange={(e) => setRowEditTelefono(e.target.value)}
                          className="p-1.5 border border-slate-200 focus:border-[#00A8E8] text-xs font-semibold text-slate-700 rounded-lg outline-none w-full max-w-[120px] bg-white shadow-sm"
                          placeholder="No registrado"
                        />
                      ) : (
                        <span className="font-semibold text-slate-600">{student.telefono || '—'}</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      {(() => {
                        const now = new Date()
                        const msDiff = now.getTime() - student.firstActivityDate.getTime()
                        const daysPassed = Math.floor(msDiff / (1000 * 60 * 60 * 24))
                        const daysRemaining = 30 - daysPassed
                        if (daysRemaining <= 0) {
                          return (
                            <div className="flex flex-col items-center gap-1 justify-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-slate-900 border border-rose-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Expirado
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Registrado: {student.firstActivityDate.toLocaleDateString('es-ES')}</span>
                            </div>
                          )
                        } else if (daysRemaining <= 5) {
                          return (
                            <div className="flex flex-col items-center gap-1 justify-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-slate-900 border border-amber-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Expira pronto ({daysRemaining}d)
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Registrado: {student.firstActivityDate.toLocaleDateString('es-ES')}</span>
                            </div>
                          )
                        } else {
                          return (
                            <div className="flex flex-col items-center gap-1 justify-center">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-slate-900 border border-blue-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Activo ({daysRemaining}d rest.)
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Registrado: {student.firstActivityDate.toLocaleDateString('es-ES')}</span>
                            </div>
                          )
                        }
                      })()}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleModifyCredits(profile || { email: student.email, user_id: null, nombre: student.nombre, creditos_extra: finalCredits }, -1)}
                          className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-350 flex items-center justify-center text-slate-500 transition-all shadow-sm"
                          title="Descontar 1 crédito"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-black text-sm text-slate-900 min-w-[20px]">{finalCredits}</span>
                        <button
                          onClick={() => handleModifyCredits(profile || { email: student.email, user_id: null, nombre: student.nombre, creditos_extra: finalCredits }, 1)}
                          className="w-6 h-6 rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-350 flex items-center justify-center text-slate-500 transition-all shadow-sm"
                          title="Añadir 1 crédito"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-center font-medium text-slate-550 text-[10px]">
                      <div>Ensayos: <strong className="text-slate-800 font-extrabold">{student.totalEnsayos}</strong></div>
                      <div className="mt-0.5">Leads: <strong className="text-slate-800 font-extrabold">{student.totalLeads}</strong></div>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      {isEditingRow ? (
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              handleSaveStudentEdit(student.email, rowEditNombre, rowEditTelefono)
                              setEditingStudentEmail(null)
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] transition-all shadow-sm"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingStudentEmail(null)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-[10px] transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2.5 justify-end">
                          <button
                            onClick={() => {
                              setEditingStudentEmail(student.email)
                              setRowEditNombre(student.nombre)
                              setRowEditTelefono(student.telefono || '')
                              setRowEditEmail(student.email)
                            }}
                            className="p-1 text-slate-700 hover:text-slate-950 transition-colors flex items-center justify-center"
                            title="Modificar datos"
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => setSelectedUserForDelete({
                              id: student.email,
                              nombre: student.nombre,
                              email: student.email,
                              totalEnsayos: student.totalEnsayos
                            })}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors flex items-center justify-center"
                            title="Remover alumno"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">No se encontraron usuarios registrados o que coincidan con los filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ELIMINAR USUARIO */}
      {selectedUserForDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-950 mb-2">¿Confirmas remover del directorio?</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Esta acción quitará el registro de <strong className="text-slate-800">{selectedUserForDelete.nombre}</strong> ({selectedUserForDelete.email}) de tu lista visual de alumnos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUserForDelete(null)}
                className="w-1/2 py-3.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUserForDelete.email)}
                className="w-1/2 py-3.5 rounded-xl text-xs font-extrabold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR ESTUDIANTE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl relative text-left">
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-3">
              <h3 className="font-black text-base text-slate-955">Crear Estudiante</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="flex flex-col gap-4">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Nombres y Apellidos Completos</span>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Carlos Pérez Gómez"
                  value={newStudentNombre}
                  onChange={(e) => setNewStudentNombre(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#00A8E8] text-xs text-slate-850 outline-none transition-all"
                />
              </div>

              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Correo Electrónico</span>
                <input
                  type="email"
                  required
                  placeholder="Ej. juan.perez@gmail.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#00A8E8] text-xs text-slate-855 outline-none transition-all"
                />
              </div>

              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Teléfono / WhatsApp</span>
                <input
                  type="text"
                  required
                  placeholder="Ej. +593987654321"
                  value={newStudentTelefono}
                  onChange={(e) => setNewStudentTelefono(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#00A8E8] text-xs text-slate-850 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingStudent}
                  className="w-1/2 py-3.5 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 transition-all"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={creatingStudent}
                  className="w-1/2 py-3.5 rounded-xl text-xs font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}
                >
                  {creatingStudent ? 'Creando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES DEL ESTUDIANTE */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-3xl h-[85vh] rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl relative flex flex-col text-left">
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                  {((isEditingStudent ? editNombre : selectedStudentForDetails.nombre) || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  {isEditingStudent ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 block tracking-wider">Nombre Completo</span>
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 focus:border-[#00A8E8] text-xs font-bold text-slate-800 rounded-xl outline-none transition-all w-full max-w-[240px]"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="font-extrabold text-base text-slate-955">{selectedStudentForDetails.nombre}</h3>
                      <p className="text-xs text-slate-400 font-medium">Ficha de Información del Estudiante</p>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentForDetails(null)
                  setIsEditingStudent(false)
                }}
                className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
              <div className="md:col-span-5 flex flex-col gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Información Personal</span>

                  <div className="flex flex-col gap-2.5">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">Correo Electrónico</span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="break-all">{selectedStudentForDetails.email}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">Número de Teléfono / WhatsApp</span>
                      {isEditingStudent ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <input
                            type="text"
                            value={editTelefono}
                            onChange={(e) => setEditTelefono(e.target.value)}
                            placeholder="No registrado"
                            className="px-3 py-1.5 border border-slate-200 focus:border-[#00A8E8] text-xs font-semibold text-slate-700 rounded-xl outline-none transition-all w-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{selectedStudentForDetails.telefono || 'No registrado'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">Última Actividad</span>
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{selectedStudentForDetails.latestDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex-shrink-0 flex flex-col gap-2">
                    {!isEditingStudent && (
                      <button
                        onClick={() => {
                          router.push(`/admin/correos?destinatario=${selectedStudentForDetails.email}`)
                          setSelectedStudentForDetails(null)
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Redactar Correo al Alumno</span>
                      </button>
                    )}
                    {!isEditingStudent ? (
                      <button
                        onClick={() => {
                          setIsEditingStudent(true)
                          setEditNombre(selectedStudentForDetails.nombre)
                          setEditTelefono(selectedStudentForDetails.telefono || '')
                        }}
                        className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-755 font-extrabold text-[10px] transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span>✏️ Modificar Datos del Usuario</span>
                      </button>
                    ) : (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setIsEditingStudent(false)}
                          className="w-1/2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-[10px] transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveStudentEdit(selectedStudentForDetails.email, editNombre, editTelefono)}
                          className="w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] transition-all shadow-md"
                        >
                          Guardar Datos
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Preferencias de Postulación</span>
                  <div className="flex flex-col gap-2.5">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">Beca Objetivo</span>
                      <div className="flex items-center gap-2 mt-1 text-xs font-bold text-slate-800">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {selectedStudentForDetails.becas.length > 0 ? (
                            selectedStudentForDetails.becas.map((beca, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-extrabold text-slate-700">
                                {beca}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 font-medium text-xs">No especificada</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">Países de Destino</span>
                      <div className="flex items-center gap-2 mt-1 text-xs font-bold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {selectedStudentForDetails.paises.length > 0 ? (
                            selectedStudentForDetails.paises.map((pais, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-extrabold text-sky-700">
                                {pais}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 font-medium text-xs">No especificado</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 flex flex-col gap-4 overflow-y-auto">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Historial de Ensayos ({selectedStudentForDetails.totalEnsayos})</span>
                  <div className="flex flex-col gap-2">
                    {selectedStudentForDetails.ensayosList.length > 0 ? (
                      selectedStudentForDetails.ensayosList.map((ensayo) => {
                        const score = ensayo.feedback_generado?.[0]?.puntaje || 7
                        return (
                          <div key={ensayo.id} className="rounded-xl border border-slate-200 bg-slate-50/30 p-3 flex justify-between items-center gap-3 hover:bg-slate-50 transition-all">
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-800 truncate">{ensayo.beca_objetivo || 'Beca General'}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{ensayo.pais_destino || 'Global'} • {new Date(ensayo.created_at).toLocaleDateString('es-ES')}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${score >= 8
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                : score >= 5
                                  ? 'bg-amber-50 border-amber-100 text-amber-700'
                                  : 'bg-red-50 border-red-100 text-red-700'
                                }`}>
                                {score}/10
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedEssayForPreview(ensayo)
                                }}
                                className="px-2 py-1 rounded bg-slate-900 text-white font-extrabold text-[9px] hover:bg-slate-800 transition-all shadow-sm"
                              >
                                Ver Ensayo
                              </button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-slate-400 py-3 text-center font-medium">Este estudiante aún no ha enviado ningún ensayo para calificar.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Solicitudes de Mentoría ({selectedStudentForDetails.totalLeads})</span>
                  <div className="flex flex-col gap-2">
                    {selectedStudentForDetails.leadsList.length > 0 ? (
                      selectedStudentForDetails.leadsList.map((lead) => {
                        const status = getNormalizedStatus(lead.estado)
                        return (
                          <div key={lead.id} className="rounded-xl border border-slate-200 bg-slate-50/30 p-3 flex justify-between items-center gap-3">
                            <div>
                              <div className="text-xs font-bold text-slate-800 font-extrabold">Beca {lead.beca_objetivo || 'General'}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                WhatsApp: {lead.telefono || '—'}
                                {lead.deadline && ` • Límite: ${new Date(lead.deadline).toLocaleDateString('es-ES')}`}
                              </div>
                            </div>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${status === 'Pendiente' ? 'bg-red-50 border-red-150 text-red-700' :
                              status === 'En Contacto' ? 'bg-amber-50 border-amber-150 text-amber-700' :
                                'bg-emerald-50 border-emerald-150 text-emerald-700'
                              }`}>
                              {status === 'Pendiente' ? '🔴 Pendiente' :
                                status === 'En Contacto' ? '🟡 En Contacto' :
                                  '🟢 Convertido'}
                            </span>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-slate-400 py-3 text-center font-medium">Este estudiante aún no ha enviado solicitudes de mentoría personalizada.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-slate-200 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedStudentForDetails(null)
                  setIsEditingStudent(false)
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE PREVISUALIZACION DE ENSAYO Y ANÁLISIS DE LA IA (LOCAL) ── */}
      {selectedEssayForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
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
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Texto del Ensayo Original</span>
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
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Análisis Técnico de la IA</span>
                    {selectedEssayForPreview.feedback_generado?.[0]?.raw_response && (
                      <div className="inline-flex bg-slate-100 border border-slate-200 p-0.5 rounded-lg text-[9px] font-bold select-none shadow-inner animate-in fade-in">
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
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
              >
                Cerrar Vista
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
