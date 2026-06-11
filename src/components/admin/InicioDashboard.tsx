'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import {
  Users,
  FileText,
  Target,
  Mail,
  Database,
  ArrowRight,
  ShieldCheck,
  Star,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  Activity,
  BarChart3,
  X,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface InicioDashboardProps {
  totalUsers: number
  totalEssays: number
  totalLeads: number
  averageScore?: string
  recentEssays?: any[]
  recentLeads?: any[]
  chartData?: { month: string, val: number }[]
  initialActivities?: any[]
}

export default function InicioDashboard({
  totalUsers,
  totalEssays,
  totalLeads,
  averageScore = "4.8/5",
  recentEssays = [],
  recentLeads = [],
  chartData = [
    { month: 'Ene', val: 0 },
    { month: 'Feb', val: 0 },
    { month: 'Mar', val: 0 },
    { month: 'Abr', val: 0 },
    { month: 'May', val: 0 },
    { month: 'Jun', val: 0 }
  ],
  initialActivities = []
}: InicioDashboardProps) {
  const router = useRouter()
  const supabase = createClient()

  // Realtime States
  const [liveTotalUsers, setLiveTotalUsers] = useState(totalUsers)
  const [liveTotalEssays, setLiveTotalEssays] = useState(totalEssays)
  const [liveTotalLeads, setLiveTotalLeads] = useState(totalLeads)
  const [liveEssays, setLiveEssays] = useState(recentEssays)
  const [liveLeads, setLiveLeads] = useState(recentLeads)
  const [liveActivities, setLiveActivities] = useState(initialActivities)
  const [newActivityAlert, setNewActivityAlert] = useState(false)

  const [emailsSentCount, setEmailsSentCount] = useState(0)
  const [showBanner, setShowBanner] = useState(true)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false)
  const [showAllEssaysModal, setShowAllEssaysModal] = useState(false)



  // Helper para asegurar iniciales correctas y evitar el bug de "UN"
  const getInitials = (name: string) => {
    if (!name) return 'UN'
    const parts = name.trim().split(/[ \-_]+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Helper para mostrar tiempo relativo: "Hace 5 min", "Hace 2 horas", "Hace 1 día"
  const getRelativeTime = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    const now = new Date()
    const then = new Date(dateStr)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `Hace ${diffDays}d`
    if (diffHours > 0) return `Hace ${diffHours}h`
    if (diffMins > 0) return `Hace ${diffMins} min`
    return 'Ahora'
  }

  // Obtener enlace y etiqueta para redirigir desde la línea de vida
  const getActivityLink = (act: any) => {
    const query = act.email || act.name || ''
    const encoded = encodeURIComponent(query)
    
    if (act.type === 'register' || act.text.toLowerCase().includes('registro')) {
      return {
        path: `/admin/usuarios?search=${encoded}`,
        label: 'Ver perfil del estudiante'
      }
    }
    if (act.type === 'essay' || act.text.toLowerCase().includes('ensayo') || act.text.toLowerCase().includes('subió')) {
      return {
        path: `/admin/metricas?search=${encoded}`,
        label: 'Ver evaluación del ensayo'
      }
    }
    if (act.type === 'lead' || act.text.toLowerCase().includes('mentoría')) {
      return {
        path: `/admin/leads?search=${encoded}`,
        label: 'Ver solicitud de mentoría'
      }
    }
    return {
      path: '#',
      label: ''
    }
  }

  // El banner ahora es fijo, no se oculta automáticamente

  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('sop_admin_email_logs')
      if (storedLogs) {
        const logs = JSON.parse(storedLogs)
        setEmailsSentCount(Array.isArray(logs) ? logs.length : 0)
      }
    } catch (e) {
      console.error('Error al cargar logs de correo:', e)
    }

    // ==========================================
    // SUPABASE REALTIME SUBSCRIPTION
    // ==========================================
    const channel = supabase.channel('dashboard-realtime')
      // Escuchar nuevos ensayos
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ensayos_enviados' }, (payload) => {
        const newRecord = payload.new
        
        // Efecto visual de alerta
        setNewActivityAlert(true)
        setTimeout(() => setNewActivityAlert(false), 3000)

        // Actualizar métricas
        setLiveTotalEssays(prev => prev + 1)
        setLiveTotalUsers(prev => prev + 1) // Simplificado: asume usuario nuevo o único en dashboard general
        
        // Agregar a ensayos recientes (arriba de la lista)
        setLiveEssays(prev => {
          const updated = [{
            id: newRecord.id,
            nombre: newRecord.nombre_usuario || newRecord.email_usuario || 'Anónimo',
            email: newRecord.email_usuario || 'Anónimo',
            estado: 'Nuevo',
            fecha: newRecord.created_at
          }, ...prev]
          return updated.slice(0, 5) // Mantener solo 5
        })

        // Agregar a la línea de vida
        setLiveActivities(prev => {
          const act = {
            id: newRecord.id,
            text: `${newRecord.nombre_usuario || newRecord.email_usuario || 'Alguien'} subió un nuevo ensayo`,
            time: 'Hace un momento',
            email: newRecord.email_usuario || '',
            name: newRecord.nombre_usuario || newRecord.email_usuario || 'Alguien',
            type: 'essay'
          }
          return [act, ...prev].slice(0, 50)
        })
      })
      // Escuchar nuevos registros de perfiles
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        const newRecord = payload.new
        if (newRecord.rol === 'admin' || newRecord.rol === 'mentor') return

        setNewActivityAlert(true)
        setTimeout(() => setNewActivityAlert(false), 3000)

        setLiveTotalUsers(prev => prev + 1)

        setLiveActivities(prev => {
          const act = {
            id: newRecord.id,
            text: `Nuevo registro: ${newRecord.nombre || newRecord.email}`,
            time: 'Hace un momento',
            email: newRecord.email || '',
            name: newRecord.nombre || newRecord.email || 'Estudiante',
            type: 'register'
          }
          if (prev.some(a => a.id === newRecord.id)) return prev
          return [act, ...prev].slice(0, 50)
        })
      })
      // Escuchar nuevos leads
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads_mentoria' }, (payload) => {
        const newRecord = payload.new
        
        setNewActivityAlert(true)
        setTimeout(() => setNewActivityAlert(false), 3000)

        setLiveTotalLeads(prev => prev + 1)
        
        setLiveLeads(prev => {
          const updated = [{
            id: newRecord.id,
            nombre: newRecord.nombre || newRecord.email || 'Anónimo',
            estado: 'Nuevo',
            fecha: newRecord.created_at
          }, ...prev]
          return updated.slice(0, 5)
        })

        setLiveActivities(prev => {
          const act = {
            id: newRecord.id,
            text: `Solicitud de Mentoría: ${newRecord.nombre || newRecord.email || 'Alguien'}`,
            time: 'Hace un momento',
            email: newRecord.email || '',
            name: newRecord.nombre || newRecord.email || 'Alguien',
            type: 'lead'
          }
          if (prev.some(a => a.id === newRecord.id)) return prev
          return [act, ...prev].slice(0, 50)
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const stats = [
    {
      title: 'Total de Usuarios',
      value: liveTotalUsers,
      icon: Users,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-100',
      path: '/admin/usuarios'
    },
    {
      title: 'Evaluaciones',
      value: liveTotalEssays,
      icon: FileText,
      color: 'from-[#00A8E8]/10 to-blue-500/10 text-sky-600 border-sky-100',
      path: '/admin/metricas'
    },
    {
      title: 'Leads Mentoría',
      value: liveTotalLeads,
      icon: Target,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100',
      path: '/admin/leads'
    },
    {
      title: 'Correos Enviados',
      value: emailsSentCount,
      icon: Mail,
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-100',
      path: '/admin/correos'
    },
    {
      title: 'Calificación Prom.',
      value: averageScore,
      icon: Star,
      color: 'from-amber-500/10 to-yellow-500/10 text-amber-600 border-amber-100',
      path: '/admin/metricas'
    }
  ]

  // Actividades dinámicas desde realtime state
  const activities = liveActivities.slice(0, 5)

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full text-slate-800">
      





      {/* ── ACCIONES RÁPIDAS ── */}
      <div className="flex flex-col gap-1 text-left mt-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Acciones rápidas</h3>
        <div className="flex flex-wrap border-b border-slate-200">
          {([
            { id: 'usuarios',      label: 'Nuevo Usuario',        icon: <UserPlus className="w-3.5 h-3.5" />,  path: '/admin/usuarios' },
            { id: 'metricas',      label: 'Revisar Evaluaciones', icon: <FileText className="w-3.5 h-3.5" />,  path: '/admin/metricas' },
            { id: 'correos',       label: 'Enviar Correo',        icon: <Mail className="w-3.5 h-3.5" />,      path: '/admin/correos' },
            { id: 'leads',         label: 'Gestionar Leads',      icon: <Target className="w-3.5 h-3.5" />,    path: '/admin/leads' },
          ] as { id: string; label: string; icon: React.ReactNode; path: string }[]).map(action => {
            const isActive = activeAction === action.id
            return (
              <button
                key={action.id}
                onClick={() => { setActiveAction(action.id); router.push(action.path) }}
                className={`
                  relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all duration-200
                  border-b-2 -mb-[2px]
                  ${
                    isActive
                      ? 'border-[#1d63ed] text-[#1d63ed]'
                      : 'border-transparent text-slate-500 hover:text-[#1d63ed] hover:border-[#1d63ed]/40'
                  }
                `}
              >
                {action.icon}
                {action.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── SECCIÓN CENTRAL/INFERIOR (LÍNEA DE VIDA Y LEADS COMPARTIDOS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lado Izquierdo (Línea de Vida + Ensayos Recientes) (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Línea de Vida */}
          <div className="bg-white rounded-2xl p-5 border border-slate-300/70 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Línea de Vida</h3>
              <button 
                onClick={() => setShowAllActivitiesModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Ver todos
              </button>
            </div>

            {/* Contenedor de la línea conectora principal */}
            <div className="relative pl-6 border-l-[1.5px] border-emerald-400 ml-3.5 pb-2">
              <div className="space-y-6">
                {activities.map((act, i) => {
                  const displayName = act.name || (act.email ? act.email.split('@')[0] : 'Usuario')
                  const initials = getInitials(displayName)
                  const linkInfo = getActivityLink(act)
                  const isClickable = linkInfo.path !== '#'

                  return (
                    <div key={i} className="relative flex items-center gap-3">
                      {/* Puntito o icono en la línea */}
                      <div className="absolute -left-[30.5px] bg-white flex items-center justify-center p-0.5 rounded-full z-10">
                        <div className="w-3.5 h-3.5 rounded-full bg-white border border-emerald-400 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                      </div>
                      
                      {isClickable ? (
                        <Link 
                          href={linkInfo.path}
                          className="flex items-center gap-3 p-1.5 rounded-xl flex-1 w-full text-left hover:bg-slate-50 transition-colors group"
                        >
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-slate-950 text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-250 shadow-sm group-hover:scale-105 transition-transform duration-200">
                            {initials}
                          </div>
                          
                          {/* Texto */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                              {act.text}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1">
                              {act.time}
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 p-1.5 rounded-xl flex-1 w-full text-left">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-slate-950 text-white font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-250 shadow-sm">
                            {initials}
                          </div>
                          
                          {/* Texto */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-tight">
                              {act.text}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1">
                              {act.time}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Ensayos Recientes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-300/70 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Ensayos Recientes</h3>
              <button 
                onClick={() => setShowAllEssaysModal(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-4">
              {liveEssays.length > 0 ? liveEssays.slice(0, 3).map((essay, i) => {
                const nombreAMostrar = essay.nombre || (essay.email ? essay.email.split('@')[0] : 'Usuario')
                return (
                  <div
                    key={essay.id || i}
                    onClick={() => router.push(`/admin/metricas?search=${encodeURIComponent(essay.email || nombreAMostrar)}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-950 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {getInitials(nombreAMostrar)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 leading-none mb-1">{nombreAMostrar}</span>
                        <span className="text-[10px] font-medium text-slate-400">{essay.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {essay.fecha && <span className="text-[10px] font-semibold text-slate-400">{getRelativeTime(essay.fecha)}</span>}
                      <span className="text-[10px] font-bold px-3 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                        {essay.estado}
                      </span>
                    </div>
                  </div>
                )
              }) : (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">No hay ensayos recientes</div>
              )}
            </div>
          </div>
        </div>

        {/* Lado Derecho (Leads Recientes) (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-300/70 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Leads Recientes</h3>
              <Link href="/admin/leads" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Ver todos
              </Link>
            </div>
            
            <div className="space-y-4">
              {liveLeads.length > 0 ? liveLeads.slice(0, 5).map((lead, i) => {
                const nombreLead = lead.nombre || (lead.email ? lead.email.split('@')[0] : 'Usuario')
                return (
                  <div
                    key={lead.id || i}
                    onClick={() => router.push(`/admin/leads?search=${encodeURIComponent(lead.email || nombreLead)}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-950 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {getInitials(nombreLead)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800 leading-none mb-1">{nombreLead}</span>
                        {lead.fecha && <span className="text-[10px] font-semibold text-slate-400">{getRelativeTime(lead.fecha)}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-lg bg-blue-50 text-[#1d63ed] border border-blue-100">
                      {lead.estado || 'Nuevo'}
                    </span>
                  </div>
                )
              }) : (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">No hay leads recientes</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL DE HISTORIAL COMPLETO - LÍNEA DE VIDA */}
      {showAllActivitiesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl relative text-left animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#00A8E8] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-950">Historial de Actividad</h3>
              </div>
              <button onClick={() => setShowAllActivitiesModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pl-4 border-l-[1.5px] border-slate-200 ml-6 pb-2 my-2 space-y-6">
              {liveActivities.map((act, i) => {
                let avatarNode = null
                const displayName = act.name || (act.email ? act.email.split('@')[0] : 'Usuario')
                const initials = getInitials(displayName)
                
                if (act.type === 'essay' || act.type === 'lead' || act.type === 'register' || act.text.includes('registro') || act.text.includes('ensayo')) {
                  avatarNode = <img src={`https://ui-avatars.com/api/?name=${initials}&background=0f172a&color=fff&bold=true`} alt={displayName} className="w-full h-full object-cover" />
                } else if (act.text.includes('Correo') || act.type === 'email') {
                  avatarNode = <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                } else {
                  avatarNode = <div className="w-full h-full rounded-full bg-sky-100 flex items-center justify-center"><Target className="w-4 h-4 text-sky-600" /></div>
                }

                const linkInfo = getActivityLink(act)
                const isClickable = linkInfo.path !== '#'

                return (
                  <div key={i} className="relative flex items-center gap-3">
                    {/* Icono indicador en la línea */}
                    <div className="absolute -left-[24.5px] bg-white flex items-center justify-center p-0.5 rounded-full">
                      {act.type === 'register' ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      ) : act.type === 'essay' ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      )}
                    </div>

                    {isClickable ? (
                      <Link 
                        href={linkInfo.path}
                        title={linkInfo.label}
                        onClick={() => setShowAllActivitiesModal(false)}
                        className="flex items-center gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-slate-100 transition-all group flex-1 w-full text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-slate-150 group-hover:scale-105 transition-transform duration-200">
                          {avatarNode}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-snug group-hover:text-sky-600 transition-colors truncate">{act.text}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{act.time}</p>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 pr-1 text-sky-500 shrink-0">
                          <ArrowRight className="w-3.5 h-3.5 translate-x-[-4px] group-hover:translate-x-0 transition-transform" />
                        </div>
                      </Link>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-slate-150">
                          {avatarNode}
                        </div>

                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-slate-800 leading-snug">{act.text}</p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{act.time}</p>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowAllActivitiesModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
      {/* MODAL VER TODOS LOS ENSAYOS */}
      {showAllEssaysModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-5 border-b border-slate-200 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-950">Todos los Ensayos</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">{liveEssays.length} ensayo{liveEssays.length !== 1 ? 's' : ''} registrado{liveEssays.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={() => setShowAllEssaysModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de ensayos con scroll */}
            <div className="overflow-y-auto flex-1 pr-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-200 bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Estudiante</th>
                    <th className="py-3 px-4">Beca / País</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {liveEssays.length > 0 ? liveEssays.map((essay, i) => {
                    const nombreAMostrar = essay.nombre || (essay.email ? essay.email.split('@')[0] : 'Usuario')
                    return (
                      <tr 
                        key={essay.id || i} 
                        className="hover:bg-sky-50/50 transition-colors cursor-pointer group"
                        onClick={() => {
                          setShowAllEssaysModal(false)
                          router.push(`/admin/metricas?search=${encodeURIComponent(essay.email || nombreAMostrar)}`)
                        }}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                              {getInitials(nombreAMostrar)}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 text-[11px] group-hover:text-sky-700 transition-colors">{nombreAMostrar}</div>
                              <div className="text-[9px] text-slate-400 mt-0.5">{essay.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-700 text-[11px]">{essay.beca || 'General'}</div>
                          <div className="text-[9px] text-sky-600 font-extrabold mt-0.5">{essay.pais || 'Global'}</div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${
                            essay.estado === 'Evaluado' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            {essay.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-[10px] text-slate-500 font-medium">
                          {essay.date || '—'}
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400 font-medium text-xs">No hay ensayos registrados aún.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end flex-shrink-0">
              <button
                onClick={() => setShowAllEssaysModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
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
