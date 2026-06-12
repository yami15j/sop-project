'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Home,
  FileText,
  Target,
  Users,
  Mail,
  X,
  CheckCircle2,
  LogOut,
  Bell,
  User,
  Clock,
  BookOpen,
  Search,
  ChevronDown,
  AlertTriangle,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface NotifItem {
  id: string
  type: 'essay' | 'lead' | 'register'
  nombre: string
  descripcion: string
  fecha: string
  isNew: boolean
}

interface AdminLayoutClientProps {
  email: string
  nombre: string
  telefono: string | null
  notificaciones: NotifItem[]
  children: React.ReactNode
}

export default function AdminLayoutClient({ email, nombre: nombreInicial, telefono: telefonoInicial, notificaciones = [], children }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchVal = searchParams.get('search') || ''
  const [searchValue, setSearchValue] = useState(searchVal)

  useEffect(() => {
    setSearchValue(searchVal)
  }, [searchVal])

  const [notification, setNotification] = useState<string | null>(null)

  // ── Estados Notificaciones ──
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const [localNotifs, setLocalNotifs] = useState<NotifItem[]>(notificaciones)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalNotifs(notificaciones)
  }, [notificaciones])

  // Realtime subscription for admin notifications and page data sync
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-realtime-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ensayos_enviados' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newRecord = payload.new
          const newNotif: NotifItem = {
            id: `essay-${newRecord.id}`,
            type: 'essay',
            nombre: newRecord.nombre_usuario || newRecord.email_usuario || 'Usuario',
            descripcion: 'Envió un nuevo ensayo para evaluación',
            fecha: newRecord.created_at || new Date().toISOString(),
            isNew: true
          }
          setLocalNotifs(prev => {
            if (prev.some(n => n.id === newNotif.id)) return prev
            return [newNotif, ...prev].slice(0, 20)
          })
          setNotification(`🔔 Nuevo ensayo de ${newNotif.nombre}`)
        }
        router.refresh()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads_mentoria' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newRecord = payload.new
          const newNotif: NotifItem = {
            id: `lead-${newRecord.id}`,
            type: 'lead',
            nombre: newRecord.nombre || newRecord.email || 'Lead',
            descripcion: 'Registró una solicitud de mentoría',
            fecha: newRecord.created_at || new Date().toISOString(),
            isNew: true
          }
          setLocalNotifs(prev => {
            if (prev.some(n => n.id === newNotif.id)) return prev
            return [newNotif, ...prev].slice(0, 20)
          })
          setNotification(`🔔 Nueva solicitud de mentoría de ${newNotif.nombre}`)
        }
        router.refresh()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newRecord = payload.new
          if (newRecord.rol === 'admin' || newRecord.rol === 'mentor') return
          const newNotif: NotifItem = {
            id: `register-${newRecord.id}`,
            type: 'register',
            nombre: newRecord.nombre || newRecord.email || 'Estudiante',
            descripcion: 'Se registró como nuevo estudiante',
            fecha: newRecord.created_at || new Date().toISOString(),
            isNew: true
          }
          setLocalNotifs(prev => {
            if (prev.some(n => n.id === newNotif.id)) return prev
            return [newNotif, ...prev].slice(0, 20)
          })
          setNotification(`🔔 Nuevo registro: ${newNotif.nombre}`)
        }
        router.refresh()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  // ── Estados Sidebar Profile ──
  const [showSidebarProfileMenu, setShowSidebarProfileMenu] = useState(false)
  const sidebarProfileRef = useRef<HTMLDivElement>(null)

  // ── Estados Top Profile ──
  const [showTopProfileMenu, setShowTopProfileMenu] = useState(false)
  const topProfileRef = useRef<HTMLDivElement>(null)

  // Nombre mostrado (se carga de localStorage si existe, o del backend)
  const [displayNombre, setDisplayNombre] = useState(nombreInicial || 'Administrador')
  const [displayFoto, setDisplayFoto] = useState('')

  // Cargar foto y nombre guardados en localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sop_admin_profile')
      if (saved) {
        const p = JSON.parse(saved)
        if (p.foto) setDisplayFoto(p.foto)
        if (p.nombre) setDisplayNombre(p.nombre)
      }
    } catch { }
  }, [])

  // Notificaciones no leídas
  const unreadCount = localNotifs.filter(n => n.isNew && !readIds.has(n.id)).length

  // Cerrar paneles al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false)
      }
      if (sidebarProfileRef.current && !sidebarProfileRef.current.contains(e.target as Node)) {
        setShowSidebarProfileMenu(false)
      }
      if (topProfileRef.current && !topProfileRef.current.contains(e.target as Node)) {
        setShowTopProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = () => {
    setReadIds(new Set(localNotifs.map(n => n.id)))
  }

  const getActiveTab = () => {
    if (pathname === '/admin') return 'inicio'
    if (pathname.includes('/admin/metricas')) return 'metricas'
    if (pathname.includes('/admin/leads')) return 'leads'
    if (pathname.includes('/admin/usuarios')) return 'usuarios'
    if (pathname.includes('/admin/correos')) return 'correos'
    return ''
  }
  const activeTab = getActiveTab()

  const formatTimeAgo = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return `hace ${Math.floor(hrs / 24)}d`
  }

  const initials = displayNombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'A'

  return (
    <div className="flex min-h-screen w-full font-sans text-slate-800 antialiased bg-white">

      {/* Notificador flotante superior */}
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

      {/* ── BARRA LATERAL ── */}
      <aside className="w-72 bg-[#0c1329] border-r border-[#1e293b]/40 flex flex-col justify-between sticky top-0 h-screen flex-shrink-0 z-40">
        <div className="flex flex-col">

          {/* Header del Sidebar */}
          <div className="py-8 px-6 flex flex-col items-center justify-center text-center text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #070c1e 0%, #0c1329 100%)' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#00A8E8]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-20 h-20 rounded-full border-2 border-white/25 bg-white p-1 flex items-center justify-center shadow-lg relative z-10 mb-3.5 overflow-hidden transition-transform hover:scale-[1.05]">
              <img src="/logo.jpg" alt="Logo" className="object-contain w-full h-full rounded-full" />
            </div>
            <h2 className="text-white font-extrabold text-sm tracking-tight flex items-center gap-1.5 justify-center relative z-10 leading-none">
              Comunidad del Intercambio
            </h2>
            <p className="text-[#00A8E8] text-[10px] font-black mt-2 relative z-10 uppercase tracking-widest leading-none">Panel de Administrador</p>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <nav className="flex flex-col gap-1.5 text-left">
              <div className="px-3 mb-2">
                <span className="text-[10px] font-black text-slate-400/80 uppercase tracking-widest block">Menú Principal</span>
              </div>

              {[
                { href: '/admin', tab: 'inicio', icon: Home, label: 'Inicio' },
                { href: '/admin/metricas', tab: 'metricas', icon: FileText, label: 'Evaluaciones' },
                { href: '/admin/leads', tab: 'leads', icon: Target, label: 'Solicitudes de Mentoría' },
                { href: '/admin/usuarios', tab: 'usuarios', icon: Users, label: 'Usuarios' },
                { href: '/admin/correos', tab: 'correos', icon: Mail, label: 'Correos' },
              ].map(({ href, tab, icon: Icon, label }) => (
                <Link
                  key={tab}
                  href={href}
                  className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all ${activeTab === tab
                    ? 'text-white shadow-[0_4px_20px_rgba(0,168,232,0.25)] animate-in duration-200'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  style={activeTab === tab ? { background: 'linear-gradient(135deg, #00A8E8, #0070b8)' } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}

              <div className="h-[1px] bg-white/10 my-3.5" />

              <Link
                href="/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-bold transition-all text-slate-300 hover:text-slate-100 hover:bg-white/5"
              >
                <GraduationCap className="w-4 h-4 text-[#00A8E8]" />
                <span>Vista Estudiante</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 flex flex-col gap-1 text-white relative" style={{ background: 'linear-gradient(135deg, #070c1e 0%, #0c1329 100%)' }} ref={sidebarProfileRef}>
          {/* Popover Menu */}
          {showSidebarProfileMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_10px_40px_rgba(15,23,42,0.15)] p-2 z-50 animate-in slide-in-from-bottom-2 duration-200 flex flex-col gap-1 text-slate-800">
              <Link
                href="/admin/perfil"
                onClick={() => setShowSidebarProfileMenu(false)}
                className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all text-left cursor-pointer"
              >
                <User className="w-4 h-4 text-blue-600" />
                <span>Mi Perfil</span>
              </Link>



              <div className="h-[1px] bg-slate-100 my-1" />
              <button
                onClick={async () => {
                  setShowSidebarProfileMenu(false)
                  const { logout } = await import('@/app/dashboard/actions')
                  await logout()
                }}
                className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-all text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}

          {/* Profile Card Button */}
          <button
            onClick={() => setShowSidebarProfileMenu(v => !v)}
            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-3 text-left transition-all relative z-10 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden flex items-center justify-center text-white text-xs font-extrabold shrink-0 border border-white/10">
              {displayFoto ? (
                <img src={displayFoto} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-xs font-bold text-white leading-none truncate">{displayNombre}</span>
              <span className="text-[10px] font-semibold text-slate-400 leading-none mt-1">Administrador</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>
      </aside>

      {/* ── SECCIÓN DERECHA ── */}
      <div className="flex-1 min-h-screen flex flex-col bg-[#f4f6fa] min-w-0">

        {/* ── HEADER SUPERIOR (Se oculta en /admin/perfil porque tiene su propio header) ── */}
        {!['/admin/perfil'].includes(pathname) && (
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between gap-3 transition-all duration-300 py-3">

            {/* Izquierda: Título de la sección */}
            <div className="flex flex-col text-left justify-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                {pathname === '/admin/usuarios'
                  ? 'Gestión de Usuarios'
                  : pathname === '/admin/metricas'
                    ? 'Evaluaciones y Métricas'
                    : pathname === '/admin'
                      ? 'Inicio'
                      : pathname === '/admin/correos'
                        ? 'Envío de Correos'
                        : 'Solicitudes de Mentoría'}
              </h1>
            </div>

            {/* Derecha: buscador + campana + perfil */}
            <div className="flex items-center gap-3">
              {/* Buscador */}
              <div className="relative w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-400/80" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar en la plataforma..."
                  value={searchValue}
                  onChange={(e) => {
                    const val = e.target.value
                    setSearchValue(val)
                    const params = new URLSearchParams(searchParams.toString())
                    if (val) {
                      params.set('search', val)
                    } else {
                      params.delete('search')
                    }
                    router.replace(`${pathname}?${params.toString()}`)
                  }}
                  className="w-full pl-8 pr-4 py-2 text-xs font-semibold bg-[#f0f3f8] border border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all placeholder-[#94a3b8] text-slate-700"
                />
              </div>

              {/* Campana */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifPanel(v => !v)}
                  className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Panel desplegable de notificaciones */}
                {showNotifPanel && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-slate-200 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
                    {/* Header panel */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">Notificaciones</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{unreadCount} nuevas</p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[10px] font-bold text-blue-600 hover:underline"
                        >
                          Marcar todas
                        </button>
                      )}
                    </div>

                    {/* Lista */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {localNotifs.length === 0 ? (
                        <div className="py-8 text-center">
                          <Bell className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 font-medium">Sin notificaciones</p>
                        </div>
                      ) : localNotifs.map(notif => {
                        const isUnread = notif.isNew && !readIds.has(notif.id)
                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              // 1. Marcar como leída
                              setReadIds(prev => {
                                const next = new Set(prev)
                                next.add(notif.id)
                                return next
                              })
                              // 2. Cerrar panel
                              setShowNotifPanel(false)
                              // 3. Navegar e inicializar filtro de búsqueda
                              let targetPath = ''
                              if (notif.type === 'essay') {
                                targetPath = '/admin/metricas'
                              } else if (notif.type === 'lead') {
                                targetPath = '/admin/leads'
                              } else if (notif.type === 'register') {
                                targetPath = '/admin/usuarios'
                              }
                              if (targetPath) {
                                router.push(`${targetPath}?search=${encodeURIComponent(notif.nombre)}`)
                              }
                            }}
                            className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-slate-50 ${isUnread ? 'bg-blue-50/40' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              notif.type === 'essay'
                                ? 'bg-purple-50 text-purple-600'
                                : notif.type === 'lead'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-blue-50 text-blue-600'
                            }`}>
                              {notif.type === 'essay' ? (
                                <BookOpen className="w-3.5 h-3.5" />
                              ) : notif.type === 'lead' ? (
                                <Target className="w-3.5 h-3.5" />
                              ) : (
                                <Users className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 leading-tight truncate">{notif.nombre}</p>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">{notif.descripcion}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3.5 h-3.5 text-slate-300" />
                                <span className="text-[10px] text-slate-400 font-medium">{formatTimeAgo(notif.fecha)}</span>
                              </div>
                            </div>
                            {isUnread && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer panel */}
                    <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                      <Link
                        href="/admin/leads"
                        onClick={() => setShowNotifPanel(false)}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Ver todos los leads →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Separador */}
              <div className="w-px h-6 bg-slate-200" />

              {/* Avatar + Nombre del Admin */}
              <div className="relative" ref={topProfileRef}>
                <button
                  onClick={() => setShowTopProfileMenu(v => !v)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors animate-in fade-in duration-300 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                    {displayFoto ? (
                      <img src={displayFoto} alt="Admin" className="w-full h-full object-cover" id="admin-avatar-img" />
                    ) : (
                      <span id="admin-avatar-initials">{initials}</span>
                    )}
                  </div>
                  <div className="flex flex-col text-left items-start">
                    <span className="text-xs font-bold text-slate-800 leading-none">{displayNombre}</span>
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 border border-slate-200 text-slate-600 mt-1 leading-none">
                      Admin
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-0.5" />
                </button>

                {/* Menú desplegable */}
                {showTopProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-[0_10px_40px_rgba(15,23,42,0.12)] p-2 z-50 animate-in slide-in-from-top-2 duration-200 flex flex-col gap-1 text-slate-800">
                    <Link
                      href="/admin/perfil"
                      onClick={() => setShowTopProfileMenu(false)}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Mi Perfil</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowTopProfileMenu(false)}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all text-left cursor-pointer"
                    >
                      <GraduationCap className="w-4 h-4 text-[#00A8E8]" />
                      <span>Vista Estudiante</span>
                    </Link>

                    <div className="h-[1px] bg-slate-100 my-1" />
                    <button
                      onClick={async () => {
                        setShowTopProfileMenu(false)
                        const { logout } = await import('@/app/dashboard/actions')
                        await logout()
                      }}
                      className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-all text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Área del Contenido Principal */}
        <main className="px-8 pb-8 flex-1 overflow-x-hidden">
          {children}
        </main>

      </div>

    </div>
  )
}
