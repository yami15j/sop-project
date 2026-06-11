'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, X, Check, RefreshCw, Send, Sparkles, CheckCircle2, HelpCircle, MapPin, Calendar, Star, Users, FileText, Target, Mail, AlertTriangle } from 'lucide-react'
import { EnsayoReal, LeadReal } from './types'
import { enviarCorreoAdmin } from '../../app/admin/actions'

interface EmailsTabProps {
  ensayos: EnsayoReal[]
  leads: LeadReal[]
}

export default function EmailsTab({ ensayos, leads }: EmailsTabProps) {
  const searchParams = useSearchParams()
  const defaultRecipient = searchParams.get('destinatario') || ''

  const [selectedRecipientEmail, setSelectedRecipientEmail] = useState(defaultRecipient)
  const [selectedTemplateId, setSelectedTemplateId] = useState('welcome')

  // Estados locales que antes venían por props
  const [templates, setTemplates] = useState<Array<{ id: string; nombre: string; asunto: string; preview: string }>>([])
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [modifiedUsers, setModifiedUsers] = useState<Record<string, { nombre: string; telefono: string | null }>>({})
  const [notification, setNotification] = useState<string | null>(null)

  // Estados para plantillas temporales en edición
  const [tempAsunto, setTempAsunto] = useState('')
  const [tempPreview, setTempPreview] = useState('')

  // Estados para el borrador de envío activo
  const [activeSendSubject, setActiveSendSubject] = useState('')
  const [activeSendBody, setActiveSendBody] = useState('')

  const [sendingConsoleEmail, setSendingConsoleEmail] = useState(false)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [confirmModal, setConfirmModal] = useState<{ templateId: string; templateName: string } | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  const tempAsuntoRef = useRef<HTMLInputElement>(null)
  const tempPreviewRef = useRef<HTMLTextAreaElement>(null)

  // Cargar localStorage al montar
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('sop_admin_modified_users')
      if (storedUsers) setModifiedUsers(JSON.parse(storedUsers))

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
        localStorage.setItem('sop_admin_correo_templates', JSON.stringify(defaultTemplates))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Sincronizar el correo seleccionado cuando cambia en la URL
  useEffect(() => {
    if (defaultRecipient) {
      setSelectedRecipientEmail(defaultRecipient)
    }
  }, [defaultRecipient])

  // Sincronizar campos del editor cuando cambia la plantilla activa
  useEffect(() => {
    if (templates.length > 0) {
      const active = templates.find(t => t.id === selectedTemplateId) || templates[0]
      if (active) {
        setTempAsunto(active.asunto)
        setTempPreview(active.preview)
      }
    }
  }, [selectedTemplateId, templates])

  // Mostrar notificaciones flotantes localmente
  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => {
      setNotification(null)
    }, 4500)
  }

  // Agrupar alumnos únicos basándonos en email
  const studentsMap = new Map<string, { 
    nombre: string; 
    email: string; 
    totalEnsayos: number; 
    totalLeads: number; 
    latestDate: string; 
    firstActivityDate: Date;
    telefono?: string | null 
  }>()

  ensayos.forEach(e => {
    const email = e.email_usuario || 'sin-correo@analisis.com'
    const name = modifiedUsers[email]?.nombre || e.nombre_usuario || email.split('@')[0]
    const date = new Date(e.created_at).toLocaleDateString('es-ES')
    const createdDate = new Date(e.created_at)
    const phone = modifiedUsers[email]?.telefono || null

    if (studentsMap.has(email)) {
      const s = studentsMap.get(email)!
      s.totalEnsayos++
      if (phone && !s.telefono) s.telefono = phone
      if (createdDate < s.firstActivityDate) s.firstActivityDate = createdDate
    } else {
      studentsMap.set(email, { 
        nombre: name, 
        email, 
        totalEnsayos: 1, 
        totalLeads: 0, 
        latestDate: date, 
        firstActivityDate: createdDate,
        telefono: phone 
      })
    }
  })

  leads.forEach(l => {
    const email = l.email
    const name = modifiedUsers[email]?.nombre || l.nombre || email.split('@')[0]
    const date = new Date(l.created_at).toLocaleDateString('es-ES')
    const createdDate = new Date(l.created_at)
    const phone = modifiedUsers[email]?.telefono || l.telefono || null

    if (studentsMap.has(email)) {
      const s = studentsMap.get(email)!
      s.totalLeads++
      if (phone && !s.telefono) s.telefono = phone
      if (createdDate < s.firstActivityDate) s.firstActivityDate = createdDate
    } else {
      studentsMap.set(email, { 
        nombre: name, 
        email, 
        totalEnsayos: 0, 
        totalLeads: 1, 
        latestDate: date, 
        firstActivityDate: createdDate,
        telefono: phone 
      })
    }
  })

  const uniqueStudents = Array.from(studentsMap.values())

  // Obtener los datos reales de un estudiante/lead
  const getRecipientData = (email: string) => {
    if (!email) {
      return {
        nombre: 'Carlos Mendoza (Ejemplo)',
        email: 'carlos.mendoza@gmail.com',
        beca: 'Beca Chevening',
        pais: 'Reino Unido',
        calificacion: '8.5/10',
        pdf_url: 'https://sopreviewer.com/carlos-essay.pdf',
        enlace_dashboard: 'http://localhost:3000/dashboard'
      }
    }
    const student = uniqueStudents.find(s => s.email === email)
    const studentEnsayos = ensayos.filter(e => e.email_usuario === email)
    const studentLeads = leads.filter(l => l.email === email)
    const latestEssay = studentEnsayos[0]
    const latestLead = studentLeads[0]
    
    const score = latestEssay?.feedback_generado?.[0]?.puntaje
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    const enlace = latestEssay ? `${origin}/dashboard?ensayo=${latestEssay.id}` : `${origin}/dashboard`
    
    return {
      nombre: student?.nombre || latestLead?.nombre || latestEssay?.nombre_usuario || email.split('@')[0],
      email: email,
      beca: latestLead?.beca_objetivo || latestEssay?.beca_objetivo || 'Beca General',
      pais: latestLead?.pais_destino || latestEssay?.pais_destino || 'Global',
      calificacion: score !== undefined ? `${score}/10` : '7.5/10',
      pdf_url: latestEssay?.pdf_url || 'https://sopreviewer.com/mock-essay.pdf',
      enlace_dashboard: enlace
    }
  }

  // Resolver placeholders
  const resolvePlaceholders = (text: string, email: string) => {
    if (!text) return ''
    const data = getRecipientData(email)
    return text
      .replace(/{nombre}/g, data.nombre)
      .replace(/{beca}/g, data.beca)
      .replace(/{pais}/g, data.pais)
      .replace(/{calificacion}/g, data.calificacion)
      .replace(/{pdf_url}/g, data.pdf_url)
      .replace(/{enlace_dashboard}/g, data.enlace_dashboard)
  }

  // Sincronizar asunto y cuerpo del envío activo cuando cambia la plantilla o el destinatario
  useEffect(() => {
    if (templates.length > 0) {
      const activeTmpl = templates.find(t => t.id === selectedTemplateId) || templates[0]
      if (activeTmpl) {
        setActiveSendSubject(resolvePlaceholders(activeTmpl.asunto, selectedRecipientEmail))
        setActiveSendBody(resolvePlaceholders(activeTmpl.preview, selectedRecipientEmail))
      }
    }
  }, [selectedRecipientEmail, selectedTemplateId, templates])

  // Función para insertar marcadores en la posición del cursor
  const insertTagAtCursor = (
    ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
    tag: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const el = ref.current
    if (!el) {
      setter(prev => prev + tag)
      return
    }
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? el.value.length
    const text = el.value
    const before = text.substring(0, start)
    const after = text.substring(end, text.length)
    const newValue = before + tag + after
    setter(newValue)

    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + tag.length, start + tag.length)
    }, 0)
  }

  // Crear una plantilla nueva y añadirla a la lista
  const handleConfirmCreateTemplate = () => {
    const name = newTemplateName.trim()
    if (!name) return
    const id = 'custom_' + Date.now()
    const newTmpl = {
      id,
      nombre: name,
      asunto: 'Asunto de ' + name,
      preview: 'Hola {nombre},\n\nEste es el cuerpo personalizado para tu plantilla ' + name + '.'
    }
    const updated = [...templates, newTmpl]
    setTemplates(updated)
    localStorage.setItem('sop_admin_correo_templates', JSON.stringify(updated))
    setSelectedTemplateId(id)
    setIsCreatingTemplate(false)
    setNewTemplateName('')
    showNotification(`¡Plantilla "${name}" creada correctamente!`)
  }

  const activeRecipientData = getRecipientData(selectedRecipientEmail)
  const isDemoMode = !selectedRecipientEmail

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300 w-full text-slate-800 text-left relative pt-8">

      {/* ── NOTIFICADOR FLOTANTE SUPERIOR ── */}
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

      {/* ── MODAL DE CONFIRMACIÓN PERSONALIZADO ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4">
              <X className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">¿Eliminar plantilla?</h3>
            <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
              Estás a punto de eliminar <span className="font-bold text-slate-700">&ldquo;{confirmModal.templateName}&rdquo;</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = templates.filter(t => t.id !== confirmModal.templateId)
                  setTemplates(updated)
                  localStorage.setItem('sop_admin_correo_templates', JSON.stringify(updated))
                  setSelectedTemplateId('welcome')
                  showNotification(`Plantilla "${confirmModal.templateName}" eliminada.`)
                  setConfirmModal(null)
                }}
                className="flex-1 py-2 px-4 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ── SECCIÓN SUPERIOR: DESTINATARIO E INFO DEL ESTUDIANTE ── */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full items-stretch">
        
        {/* Selector de Destinatario (col-span-8 o full width) */}
        <div className={`${selectedRecipientEmail ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between`}>
          <div className="mb-2">
            <h2 className="text-sm font-black text-slate-900">
              Destinatario del Correo
            </h2>
            <p className="text-slate-400 text-xs mt-0.5 font-medium leading-none">Selecciona al alumno al que le enviarás el correo electrónico.</p>
          </div>

          <div className="flex flex-col gap-3">
            <select
              value={selectedRecipientEmail}
              onChange={(e) => setSelectedRecipientEmail(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 block bg-slate-50 border border-slate-350 px-3.5 py-2.5 rounded-xl shadow-sm outline-none transition-all focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="">Seleccionar un alumno real...</option>
              {uniqueStudents.map(student => (
                <option key={student.email} value={student.email}>
                  {student.nombre} ({student.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tarjeta de Información de Alumno (se muestra solo cuando se selecciona uno) */}
        {selectedRecipientEmail && (
          <div className="lg:col-span-4 bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                {activeRecipientData.nombre.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <strong className="text-xs font-extrabold text-slate-900 block leading-tight">{activeRecipientData.nombre}</strong>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase bg-purple-50 text-purple-700 border border-purple-100">
                  Alumno
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs text-slate-600 font-semibold">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate" title={activeRecipientData.email}>{activeRecipientData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{activeRecipientData.pais || 'Bogotá, Colombia'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Última actividad: 28/05/2026</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECCIÓN CENTRAL/INFERIOR: EDITOR Y VISTA PREVIA ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">

        {/* Columna Izquierda: Configuración de la Plantilla (col-span-12) */}
        <div className="lg:col-span-12 rounded-xl p-4 bg-white border border-slate-200 shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              Configuración de la Plantilla
            </h2>
            <p className="text-slate-400 text-[11px] mt-0.5 font-medium leading-none">Modifica la estructura genérica y añade variables dinámicas usando las etiquetas interactivas.</p>
          </div>

          {/* Selector de Plantillas */}
          <div className="flex gap-1.5 pb-3 overflow-x-auto border-b border-slate-100 scrollbar-thin">
            {templates.map(tmpl => {
              const isSelected = selectedTemplateId === tmpl.id
              const isCustom = tmpl.id.startsWith('custom_')

              return (
                <div key={tmpl.id} className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all border flex items-center cursor-pointer ${
                      isCustom ? 'pr-8' : ''
                    } ${isSelected
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tmpl.nombre}
                  </button>
                  {isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmModal({ templateId: tmpl.id, templateName: tmpl.nombre })
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded cursor-pointer"
                      title="Eliminar plantilla"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )
            })}

            {!isCreatingTemplate ? (
              <button
                type="button"
                onClick={() => setIsCreatingTemplate(true)}
                className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#00A8E8]/10 border border-[#00A8E8]/20 text-[#00A8E8] hover:bg-[#00A8E8]/20 transition-all flex items-center flex-shrink-0 cursor-pointer"
              >
                <span>Nueva</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 flex-shrink-0 animate-in slide-in-from-right-2 duration-250">
                <input
                  type="text"
                  placeholder="Nombre de plantilla..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="px-2 py-0.5 text-[11px] outline-none bg-white border border-slate-200 rounded-md max-w-[120px] font-semibold text-slate-800"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleConfirmCreateTemplate()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleConfirmCreateTemplate}
                  className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingTemplate(false)
                    setNewTemplateName('')
                  }}
                  className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {(() => {
            const activeTmpl = templates.find(t => t.id === selectedTemplateId) || templates[0];
            if (!activeTmpl) return null;

            return (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const updated = templates.map(t =>
                    t.id === activeTmpl.id
                      ? { ...t, asunto: tempAsunto, preview: tempPreview }
                      : t
                  );
                  setTemplates(updated);
                  localStorage.setItem('sop_admin_correo_templates', JSON.stringify(updated));
                  showNotification('¡Plantilla base guardada correctamente!');
                }}
                className="flex flex-col gap-3 pt-3"
              >
                {/* Asunto */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest leading-none mb-0.5">ASUNTO DEL CORREO</span>
                  <div className="relative">
                    <input
                      ref={tempAsuntoRef}
                      type="text"
                      value={tempAsunto}
                      onChange={(e) => setTempAsunto(e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 block bg-white border border-slate-300/80 px-3 py-2 rounded-lg shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                      placeholder="Escribe el asunto del correo..."
                    />
                  </div>
                </div>

                {/* Cuerpo del Correo */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest leading-none mb-0.5">CUERPO DEL CORREO</span>
                  <div className="rounded-lg border border-slate-300/80 overflow-hidden bg-white shadow-sm">
                    {/* Barra de Herramientas del Editor (Mock) */}
                    <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-1.5 shrink-0">
                      <div className="flex items-center gap-1">
                        <select className="bg-transparent border-none outline-none text-slate-600 text-[9.5px] font-bold py-0.5 pl-0 pr-5">
                          <option>Párrafo</option>
                        </select>
                        <span className="h-3.5 w-[1px] bg-slate-200 mx-1"></span>
                        {['B', 'I', 'U'].map(btn => (
                          <button key={btn} type="button" className="w-5.5 h-5.5 rounded hover:bg-slate-200 flex items-center justify-center text-[9.5px] font-extrabold text-slate-500">
                            {btn}
                          </button>
                        ))}
                        <span className="h-3.5 w-[1px] bg-slate-200 mx-1"></span>
                        {/* Listas */}
                        <button type="button" className="w-5.5 h-5.5 rounded hover:bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">⁝≡</button>
                        <button type="button" className="w-5.5 h-5.5 rounded hover:bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">1.</button>
                        <span className="h-3.5 w-[1px] bg-slate-200 mx-1"></span>
                        {/* Enlaces */}
                        <button type="button" className="w-5.5 h-5.5 rounded hover:bg-slate-200 flex items-center justify-center text-[9.5px] font-bold text-slate-500">🔗</button>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <select className="bg-transparent border-none outline-none text-[#1d63ed] text-[9.5px] font-black py-0.5 pl-0 pr-5">
                          <option>Variables</option>
                        </select>
                      </div>
                    </div>

                    <textarea
                      ref={tempPreviewRef}
                      value={tempPreview}
                      onChange={(e) => setTempPreview(e.target.value)}
                      rows={4}
                      className="w-full text-xs text-slate-700 leading-relaxed bg-white p-3 outline-none resize-none min-h-[90px]"
                      required
                      placeholder="Introduce el cuerpo de tu correo..."
                    />
                  </div>
                </div>

                {/* Etiquetas Disponibles */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest leading-none mb-0.5">ETIQUETAS DISPONIBLES</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['{nombre}', '{beca}', '{pais}', '{calificacion}', '{pdf_url}', '{enlace_dashboard}'].map(tag => (
                      <code
                        key={tag}
                        onClick={() => {
                          const activeEl = document.activeElement;
                          if (activeEl === tempAsuntoRef.current) {
                            insertTagAtCursor(tempAsuntoRef, tag, setTempAsunto);
                          } else {
                            insertTagAtCursor(tempPreviewRef, tag, setTempPreview);
                          }
                        }}
                        className="font-mono bg-slate-50 border border-slate-250 px-2 py-1 rounded-lg text-[10px] text-sky-700 font-bold cursor-pointer hover:bg-slate-100 hover:border-slate-350 transition-colors select-none"
                      >
                        {tag}
                      </code>
                    ))}
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-between items-center mt-1 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-extrabold text-white transition-all bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 cursor-pointer"
                  >
                    Guardar Plantilla Base
                  </button>
                  <button
                    type="button"
                    disabled={!selectedRecipientEmail}
                    onClick={() => {
                      setActiveSendSubject(resolvePlaceholders(tempAsunto, selectedRecipientEmail))
                      setActiveSendBody(resolvePlaceholders(tempPreview, selectedRecipientEmail))
                      setShowPreviewModal(true)
                    }}
                    className={`px-3 py-2 rounded-lg border transition-all text-xs font-bold flex items-center gap-1.5 bg-white ${
                      !selectedRecipientEmail
                        ? 'border-slate-250 text-slate-400 cursor-not-allowed opacity-60'
                        : 'border-slate-350 text-slate-650 hover:text-slate-855 hover:bg-slate-50 cursor-pointer shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${!selectedRecipientEmail ? 'text-slate-400' : 'text-emerald-500'}`} />
                    Vista previa rápida
                  </button>
                </div>
              </form>
            )
          })()}
        </div>

      </div>

      {/* ── MODAL DE VISTA PREVIA DEL CORREO ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-xl w-full mx-4 flex flex-col gap-4 animate-in zoom-in-95 duration-200 text-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Vista Previa del Correo</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Así se verá el correo con los datos reales ya resueltos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navegador de Correo Mock */}
            <div className="rounded-2xl border border-slate-300 overflow-hidden shadow-sm bg-slate-50">
              {/* Header del Navegador */}
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  API Ready
                </span>
              </div>

              {/* Cabeceras del Email */}
              <div className="bg-white border-b border-slate-200 text-xs text-slate-700 p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 w-12 text-[11px]">Para:</span>
                  <span className="font-extrabold text-slate-800 text-[11px]">{activeRecipientData.nombre}</span>
                  <span className="text-slate-400 text-[11px]">&lt;{activeRecipientData.email}&gt;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 w-12 text-[11px]">Asunto:</span>
                  <span className="font-extrabold text-slate-900 text-[11px]">{activeSendSubject}</span>
                </div>
              </div>

              {/* Cuerpo del Email */}
              <div className="bg-white p-4 min-h-[160px] text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {activeSendBody}
              </div>
            </div>

            {/* Botones de Envío y Estado */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 flex-grow">
                <button
                  type="button"
                  disabled={sendingConsoleEmail}
                  onClick={async () => {
                    setSendingConsoleEmail(true)
                    try {
                      const result = await enviarCorreoAdmin(selectedRecipientEmail, activeSendSubject, activeSendBody)
                      if (result.success) {
                        const newLog = {
                          id: String(Date.now()),
                          fecha: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                          destinatario: selectedRecipientEmail,
                          asunto: activeSendSubject,
                          estado: 'Enviado (Resend)',
                          template: templates.find(t => t.id === selectedTemplateId)?.nombre || 'Personalizado'
                        }
                        const updatedLogs = [newLog, ...emailLogs]
                        setEmailLogs(updatedLogs)
                        localStorage.setItem('sop_admin_email_logs', JSON.stringify(updatedLogs))
                        showNotification(`Correo enviado de manera real a ${selectedRecipientEmail} mediante Resend.`)
                        setShowPreviewModal(false)
                      } else {
                        showNotification(`Error de Resend: ${result.error || 'No se pudo enviar.'}`)
                      }
                    } catch {
                      showNotification('Error al intentar enviar el correo.')
                    } finally {
                      setSendingConsoleEmail(false)
                    }
                  }}
                  className="flex-1 px-5 py-3 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                >
                  {sendingConsoleEmail ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Correo Real</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const activeTmpl = templates.find(t => t.id === selectedTemplateId) || templates[0]
                    if (activeTmpl) {
                      setActiveSendSubject(resolvePlaceholders(activeTmpl.asunto, selectedRecipientEmail))
                      setActiveSendBody(resolvePlaceholders(activeTmpl.preview, selectedRecipientEmail))
                    }
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-350 hover:border-slate-400 hover:bg-slate-50 text-slate-650 hover:text-slate-850 text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-white shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Revertir</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
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
