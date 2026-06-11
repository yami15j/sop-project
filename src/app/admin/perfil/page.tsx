'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  User,
  Camera,
  Save,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  Search,
  Info,
  Headphones,
  Bell,
  Clock,
  ZoomIn,
  ZoomOut,
  Crop,
  X
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { actualizarPerfilAdmin } from '@/app/admin/actions'

// ── TIPOS PARA EL CROP ──────────────────────────────────────────────
interface CropState {
  x: number
  y: number
  scale: number
}

// ── HOOK DE CROP CON CANVAS ─────────────────────────────────────────
function useCropCanvas(
  imageSrc: string,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, scale: 1 })
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement | null>(null)
  const CANVAS_SIZE = 300

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    const img = imgRef.current
    const scale = crop.scale
    const sw = img.naturalWidth * scale
    const sh = img.naturalHeight * scale
    const offsetX = (CANVAS_SIZE - sw) / 2 + crop.x
    const offsetY = (CANVAS_SIZE - sh) / 2 + crop.y

    ctx.drawImage(img, offsetX, offsetY, sw, sh)

    // Overlay oscuro fuera del círculo (usando regla 'evenodd' para no borrar la imagen de fondo)
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.beginPath()
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 4, 0, Math.PI * 2)
    ctx.fill('evenodd')
    ctx.restore()

    // Borde del círculo
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 4, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }, [crop, canvasRef])

  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      // Escala inicial: que llene el canvas
      const ratio = Math.max(CANVAS_SIZE / img.naturalWidth, CANVAS_SIZE / img.naturalHeight)
      setCrop({ x: 0, y: 0, scale: ratio })
    }
    img.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    draw()
  }, [draw])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setCrop(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
  }
  const handleMouseUp = () => { isDragging.current = false }

  // Touch support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    isDragging.current = true
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return
    const dx = e.touches[0].clientX - lastPos.current.x
    const dy = e.touches[0].clientY - lastPos.current.y
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    setCrop(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
  }
  const handleTouchEnd = () => { isDragging.current = false }

  const zoomIn = () => setCrop(prev => ({ ...prev, scale: Math.min(prev.scale * 1.15, 5) }))
  const zoomOut = () => setCrop(prev => ({ ...prev, scale: Math.max(prev.scale * 0.87, 0.1) }))
  const reset = () => {
    if (!imgRef.current) return
    const ratio = Math.max(CANVAS_SIZE / imgRef.current.naturalWidth, CANVAS_SIZE / imgRef.current.naturalHeight)
    setCrop({ x: 0, y: 0, scale: ratio })
  }

  const getCroppedBase64 = (): string => {
    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = CANVAS_SIZE
    outputCanvas.height = CANVAS_SIZE
    const ctx = outputCanvas.getContext('2d')
    if (!ctx || !imgRef.current) return ''

    const img = imgRef.current
    const scale = crop.scale
    const sw = img.naturalWidth * scale
    const sh = img.naturalHeight * scale
    const offsetX = (CANVAS_SIZE - sw) / 2 + crop.x
    const offsetY = (CANVAS_SIZE - sh) / 2 + crop.y

    // Recorte circular
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, offsetX, offsetY, sw, sh)

    return outputCanvas.toDataURL('image/jpeg', 0.92)
  }

  return {
    crop,
    handleMouseDown, handleMouseMove, handleMouseUp,
    handleTouchStart, handleTouchMove, handleTouchEnd,
    zoomIn, zoomOut, reset,
    getCroppedBase64
  }
}

// ── MODAL DE CROP ───────────────────────────────────────────────────
function CropModal({
  imageSrc,
  onConfirm,
  onCancel,
}: {
  imageSrc: string
  onConfirm: (base64: string) => void
  onCancel: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const {
    handleMouseDown, handleMouseMove, handleMouseUp,
    handleTouchStart, handleTouchMove, handleTouchEnd,
    zoomIn, zoomOut, reset,
    getCroppedBase64
  } = useCropCanvas(imageSrc, canvasRef)

  const handleApply = () => {
    const base64 = getCroppedBase64()
    if (base64) onConfirm(base64)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <Crop className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Recortar foto</h3>
              <p className="text-[10px] text-slate-400 font-medium">Arrastra para ajustar</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas de crop */}
        <div className="flex flex-col items-center gap-4 p-5 bg-slate-50">
          <div className="rounded-full overflow-hidden shadow-lg border-4 border-white ring-2 ring-slate-200">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="cursor-grab active:cursor-grabbing block"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          {/* Controles de zoom */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            <button
              onClick={zoomOut}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Alejar"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="px-3 py-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zoom</span>
            </div>
            <button
              onClick={zoomIn}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Acercar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <button
              onClick={reset}
              className="px-3 h-8 rounded-lg hover:bg-slate-100 text-[10px] font-bold text-slate-500 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center">
            Arrastra la imagen · Usa los botones para ajustar el zoom
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-slate-100 bg-white">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/15 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Crop className="w-3.5 h-3.5" />
            Aplicar recorte
          </button>
        </div>
      </div>
    </div>
  )
}

// ── PÁGINA PRINCIPAL ─────────────────────────────────────────────────
export default function PerfilPage() {
  // Profile fields state
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [pais, setPais] = useState('Ecuador')
  const [zonaHoraria, setZonaHoraria] = useState('(GMT-5) Quito')
  const [foto, setFoto] = useState('')

  // Crop modal state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)

  // Metadata fields
  const [memberSince, setMemberSince] = useState('15 de abril de 2024')
  const [lastAccess, setLastAccess] = useState('')

  // State management
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Real Database Notifications states
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  const fileInputRef = useRef<HTMLInputElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  // Load initial data
  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setEmail(user.email || '')

          // Get additional fields from profile table
          const { data: profile } = await supabase
            .from('profiles')
            .select('nombre, telefono, created_at')
            .eq('user_id', user.id)
            .maybeSingle()

          if (profile) {
            setNombre(profile.nombre || '')
            setTelefono(profile.telefono || '')
            if (profile.created_at) {
              const date = new Date(profile.created_at)
              setMemberSince(date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }))
            }
          }

          // Format last access time
          const now = new Date()
          setLastAccess(`${now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}, ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`)
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()

    // Load photo from localStorage
    try {
      const saved = localStorage.getItem('sop_admin_profile')
      if (saved) {
        const p = JSON.parse(saved)
        if (p.foto) setFoto(p.foto)
      }
    } catch { }
  }, [])

  // Load notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: recentEssays } = await supabase
          .from('ensayos_enviados')
          .select('id, nombre_usuario, email_usuario, created_at')
          .order('created_at', { ascending: false })
          .limit(6)

        const { data: recentLeads } = await supabase
          .from('leads_mentoria')
          .select('id, nombre, email, created_at')
          .order('created_at', { ascending: false })
          .limit(6)

        const combined = [
          ...(recentEssays || []).map(e => ({
            id: `essay-${e.id}`,
            type: 'essay' as const,
            nombre: e.nombre_usuario || e.email_usuario || 'Usuario',
            descripcion: 'Envió un nuevo ensayo para evaluación',
            fecha: e.created_at,
            isNew: e.created_at >= since24h
          })),
          ...(recentLeads || []).map(l => ({
            id: `lead-${l.id}`,
            type: 'lead' as const,
            nombre: l.nombre || l.email || 'Lead',
            descripcion: 'Registró una solicitud de mentoría',
            fecha: l.created_at,
            isNew: l.created_at >= since24h
          }))
        ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 10)

        setNotificaciones(combined)
      } catch (err) {
        console.error('Error cargando notificaciones:', err)
      }
    }
    loadNotifications()
  }, [])

  // Close notifications panel on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Handle avatar upload — abre el modal de crop
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setNotification({ message: 'La imagen excede el límite de 5MB.', type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setCropImageSrc(base64)   // Abre el modal de crop
    }
    reader.readAsDataURL(file)

    // Reset input para permitir re-seleccionar el mismo archivo
    e.target.value = ''
  }

  // Confirmación del crop: guarda la imagen recortada
  const handleCropConfirm = (croppedBase64: string) => {
    setFoto(croppedBase64)
    setCropImageSrc(null)
    try {
      const saved = localStorage.getItem('sop_admin_profile')
      const existing = saved ? JSON.parse(saved) : {}
      localStorage.setItem('sop_admin_profile', JSON.stringify({ ...existing, foto: croppedBase64 }))
    } catch { }
    setNotification({ message: 'Foto recortada y lista. Guarda los cambios para aplicarla.', type: 'success' })
    setTimeout(() => setNotification(null), 3500)
  }

  // Handle save changes
  const handleSave = async () => {
    setSaving(true)
    setNotification(null)
    try {
      const res = await actualizarPerfilAdmin(nombre, telefono || null)
      if (res.success) {
        try {
          localStorage.setItem('sop_admin_profile', JSON.stringify({
            nombre: nombre,
            foto: foto
          }))
        } catch { }

        setNotification({ message: '¡Información de perfil guardada exitosamente!', type: 'success' })

        setTimeout(() => {
          window.location.reload()
        }, 1200)
      } else {
        setNotification({ message: `Error al guardar: ${res.error}`, type: 'error' })
      }
    } catch (err: any) {
      setNotification({ message: `Error: ${err.message || 'Error inesperado'}`, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const formatTimeAgo = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return `hace ${Math.floor(hrs / 24)}d`
  }

  const markAllRead = () => setReadIds(new Set(notificaciones.map(n => n.id)))
  const unreadCount = notificaciones.filter(n => n.isNew && !readIds.has(n.id)).length
  const initials = nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'A'

  return (
    <>
      {/* ── MODAL DE CROP ── */}
      {cropImageSrc && (
        <CropModal
          imageSrc={cropImageSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => {
            setCropImageSrc(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
          }}
        />
      )}

      <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full text-left">

        {/* ── HEADER ROW (Floating Style) ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-start gap-4 pt-8">
          {/* Izquierda: Título y Breadcrumbs */}
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 font-extrabold text-2xl tracking-tight leading-none">Mi Perfil</h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">Administra tu información personal y de cuenta</p>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-8">
              <span className="hover:text-slate-600 cursor-pointer">Inicio</span>
              <span>&gt;</span>
              <span className="text-blue-600 font-bold">Mi Perfil</span>
            </div>
          </div>

          {/* Derecha: Buscador + Campana + Perfil */}
          <div className="flex items-center gap-3 self-stretch lg:self-auto justify-end lg:pt-1">
            {/* Buscador */}
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400/80" />
              </span>
              <input
                type="text"
                placeholder="Buscar en la plataforma..."
                className="w-full pl-8 pr-4 py-2 text-xs font-semibold bg-[#f0f3f8] border border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all placeholder-[#94a3b8] text-slate-700"
              />
            </div>

            {/* Campana de Notificaciones */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifPanel(v => !v)}
                className="relative w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all shadow-sm cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Panel desplegable */}
              {showNotifPanel && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-slate-200 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
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

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notificaciones.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 font-medium">Sin notificaciones</p>
                      </div>
                    ) : notificaciones.map(notif => {
                      const isUnread = notif.isNew && !readIds.has(notif.id)
                      return (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors ${isUnread ? 'bg-blue-50/40' : ''}`}
                        >
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                            <User className="w-3.5 h-3.5" />
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
                </div>
              )}
            </div>

            {/* Separador */}
            <div className="w-px h-6 bg-slate-200" />

            {/* Avatar + Nombre del Admin */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-200/50 transition-all">
              <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                {foto ? (
                  <img src={foto} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="flex flex-col text-left items-start">
                <span className="text-xs font-bold text-slate-800 leading-none">{nombre || 'Administrador'}</span>
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 border border-slate-200 text-slate-600 mt-1 leading-none">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── NOTIFICACIONES STATUS ── */}
        {notification && (
          <div className={`p-4 rounded-xl border text-xs font-bold flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200 ${notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-150 text-emerald-800'
            : 'bg-red-50 border-red-150 text-red-800'
            }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4.5 h-4.5 shrink-0 ${notification.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`} />
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="hover:opacity-85 text-sm">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-xs text-slate-400 font-bold">Cargando perfil...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Columna Izquierda (8/12) */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* CARD: Información Personal */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-5 text-left">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Información personal</h3>
                  <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Actualiza tu información personal y de contacto.</p>
                </div>

                <div className="h-[1px] bg-slate-100" />

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Foto de perfil */}
                  <div className="flex flex-col items-center gap-3 shrink-0 self-center md:self-start">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-white font-extrabold text-2xl border-4 border-slate-100 shadow-md">
                        {foto ? (
                          <img src={foto} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Cambiar foto
                    </button>
                    <span className="text-[10px] text-slate-400 font-medium">JPG, PNG o GIF. Máx. 5MB</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFotoChange}
                    />
                  </div>

                  {/* Campos de texto */}
                  <div className="flex-1 w-full grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nombre completo</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Correo electrónico</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </span>
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Teléfono / WhatsApp</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                          <Phone className="h-4 w-4 text-slate-400" />
                        </span>
                        <input
                          type="tel"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="+593 999 000 000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">País</label>
                        <select
                          value={pais}
                          onChange={(e) => setPais(e.target.value)}
                          className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="Ecuador">Ecuador</option>
                          <option value="Colombia">Colombia</option>
                          <option value="Perú">Perú</option>
                          <option value="México">México</option>
                          <option value="España">España</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Zona horaria</label>
                        <select
                          value={zonaHoraria}
                          onChange={(e) => setZonaHoraria(e.target.value)}
                          className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="(GMT-5) Quito">(GMT-5) Quito</option>
                          <option value="(GMT-5) Bogotá">(GMT-5) Bogotá</option>
                          <option value="(GMT-6) CDMX">(GMT-6) CDMX</option>
                          <option value="(GMT-4) Santiago">(GMT-4) Santiago</option>
                          <option value="(GMT+1) Madrid">(GMT+1) Madrid</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100" />

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Guardar cambios</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Columna Derecha (4/12) */}
            <div className="lg:col-span-4 flex flex-col gap-6">

              {/* CARD: Resumen de la cuenta */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4 text-left">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Resumen de la cuenta</h3>
                  <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Información general de tu cuenta.</p>
                </div>

                <div className="h-[1px] bg-slate-100" />

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400">Rol</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">Administrador</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400">Miembro desde</span>
                    <span className="text-xs font-bold text-slate-700">{memberSince}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400">Último acceso</span>
                    <span className="text-[11px] font-bold text-slate-700 text-right">{lastAccess || 'Hoy, hace un momento'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-xs font-semibold text-slate-400">Estado de cuenta</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Activa</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── BOTTOM BANNER ── */}
        <div className="w-full p-4 rounded-2xl bg-blue-50/40 border border-blue-100/60 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">¿Necesitas ayuda?</h4>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Si tienes problemas para actualizar tu información, contacta al soporte técnico.</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all shrink-0 cursor-pointer">
            <Headphones className="w-3.5 h-3.5 text-slate-500" />
            <span>Contactar soporte</span>
          </button>
        </div>

      </div>
    </>
  )
}
