'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { solicitarMentoria } from '@/app/dashboard/actions'
import { Phone, Mail, BookOpen, Globe, Calendar, User, Send, CheckCircle2, AlertCircle } from 'lucide-react'

interface MentoriaFormProps {
  nombreDefault?: string
  emailDefault?: string
  becaDefault?: string
  paisDefault?: string
  hasExistingRequest?: boolean
  ensayoDefault?: string
  pdfUrlDefault?: string
}

const CAMPOS = [
  { name: 'nombre', label: 'Nombre completo', type: 'text', placeholder: 'Juan Pérez', icon: User, required: true },
  { name: 'email_visible', label: 'Correo', type: 'email', placeholder: 'tu@correo.com', icon: Mail, required: true },
  { name: 'beca', label: 'Beca objetivo', type: 'text', placeholder: 'Chevening, Fulbright…', icon: BookOpen, required: true },
  { name: 'telefono', label: 'WhatsApp', type: 'tel', placeholder: '+593 999 000 000', icon: Phone, required: true },
  { name: 'deadline', label: 'Fecha límite', type: 'date', placeholder: '', icon: Calendar, required: true },
  { name: 'pais', label: 'País destino', type: 'text', placeholder: 'Reino Unido, Alemania…', icon: Globe, required: true },
]

export default function MentoriaForm({
  nombreDefault = '',
  emailDefault = '',
  becaDefault = '',
  paisDefault = '',
  hasExistingRequest = false,
  ensayoDefault = '',
  pdfUrlDefault = ''
}: MentoriaFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [values, setValues] = useState<Record<string, string>>({
    nombre: nombreDefault,
    email_visible: emailDefault,
    beca: becaDefault,
    telefono: '',
    deadline: '',
    pais: paisDefault,
  })
  const [focused, setFocused] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [redirected, setRedirected] = useState(false)

  // Generar mensaje formateado de WhatsApp
  const generateWhatsAppUrl = () => {
    const phone = '5512996018501' // El número destino preconfigurado

    // Si el estudiante subió un PDF, mandamos el enlace al PDF (que es muy corto e idóneo para WhatsApp)
    // Si no, mandamos un avance corto de 500 caracteres del texto para evitar desbordar el límite del navegador.
    let ensayoSection = ''
    if (pdfUrlDefault?.trim()) {
      ensayoSection = `\n- PDF del Ensayo: ${pdfUrlDefault.trim()}`
    } else if (ensayoDefault?.trim()) {
      const rawText = ensayoDefault.trim()
      const maxChars = 500
      const preview = rawText.length > maxChars
        ? rawText.substring(0, maxChars) + '\n[...Texto adicional enviado completo por correo...]'
        : rawText
      ensayoSection = `\n- Ensayo Enviado:\n${preview}`
    }

    const text = `¡Hola! Acabo de registrar mi solicitud de Mentoría Premium en SOP Reviewer.

Aquí están mis datos para coordinar el agendamiento:
- Nombre: ${values.nombre?.trim() || '-'}
- Correo: ${values.email_visible?.trim() || '-'}
- Beca Objetivo: ${values.beca?.trim() || '-'}
- País Destino: ${values.pais?.trim() || '-'}
- Fecha Límite: ${values.deadline?.trim() || '-'}
- WhatsApp: ${values.telefono?.trim() || '-'}${ensayoSection}

Me gustaría coordinar el día y hora para la mentoría. ¡Muchas gracias!`

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  }

  // Redirección automática a WhatsApp tras 1.5s
  useEffect(() => {
    if (isSuccess) {
      setRedirected(false)
      const waUrl = generateWhatsAppUrl()
      const timer = setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer')
        setRedirected(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  const errors: Record<string, string> = {}
  CAMPOS.forEach(c => {
    if (c.required && !values[c.name]?.trim()) errors[c.name] = 'Requerido'
  })
  const isValid = Object.keys(errors).length === 0
  const filledCount = CAMPOS.filter(c => values[c.name]?.trim()).length
  const progress = Math.round((filledCount / CAMPOS.length) * 100)

  function handleChange(name: string, value: string) {
    setValues(prev => ({ ...prev, [name]: value }))
  }
  function handleBlur(name: string) {
    setTouched(prev => ({ ...prev, [name]: true }))
  }
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const allTouched: Record<string, boolean> = {}
    CAMPOS.forEach(c => { allTouched[c.name] = true })
    setTouched(allTouched)
    if (!isValid) return

    setServerError(null)
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => fd.append(k, v))

    startTransition(async () => {
      try {
        const result = await solicitarMentoria(fd)
        if (result && !result.success) {
          setServerError(result.error || 'Error al enviar la solicitud.')
          return
        }
        setIsSuccess(true)
        router.refresh()
      } catch {
        setServerError('Error de red. Por favor inténtalo de nuevo.')
      }
    })
  }

  if (isSuccess) {
    const waUrl = generateWhatsAppUrl()
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center animate-in zoom-in duration-500 max-w-md mx-auto">
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes progress-bar-fill {
            from { width: 0%; }
            to { width: 100%; }
          }
        ` }} />

        {/* Ícono de Éxito con Glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-[#4ade80]/20 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-full flex items-center justify-center relative z-10 text-4xl"
            style={{
              background: redirected ? 'rgba(37,211,102,0.12)' : 'rgba(74,222,128,0.12)',
              border: redirected ? '1.5px solid rgba(37,211,102,0.35)' : '1.5px solid rgba(74,222,128,0.35)',
              boxShadow: redirected ? '0 0 30px rgba(37,211,102,0.25)' : '0 0 30px rgba(74,222,128,0.25)',
              transition: 'all 0.5s ease'
            }}>
            {redirected ? (
              <svg className="w-10 h-10 text-[#25D366] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <CheckCircle2 className="w-10 h-10 text-[#4ade80]" />
            )}
          </div>
        </div>

        {/* Títulos */}
        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
          {redirected ? '¡Enlace de WhatsApp Listo!' : '¡Solicitud Guardada!'}
        </h3>

        {/* Descripción de Correo */}
        <p className="text-xs sm:text-sm leading-relaxed mb-6 font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Hemos registrado tu postulación en el sistema y enviado un correo de confirmación.
        </p>

        {/* Indicador de Redirección / Estado del flujo */}
        <div className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 mb-6 relative overflow-hidden backdrop-blur-sm">
          {!redirected ? (
            <>
              <div className="flex items-center justify-center gap-3 mb-2.5">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <span className="text-[11px] sm:text-xs font-bold text-emerald-400 tracking-wide">
                  Redirigiéndote a WhatsApp...
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium leading-normal mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Estamos preparando tu mensaje pre-llenado con todos tus datos y el documento adjunto.
              </p>
              {/* Barra de progreso de redirección */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    animation: 'progress-bar-fill 1.5s linear forwards',
                    boxShadow: '0 0 8px #10b981'
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_8px_#25D366] animate-ping" />
                <span className="text-[11px] sm:text-xs font-bold text-[#25D366] tracking-wide uppercase">
                  Redirección Completada
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-medium leading-normal" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Se ha abierto WhatsApp en una pestaña nueva con toda tu información ya escrita. ¡Simplemente envía el mensaje al mentor para agendar!
              </p>
            </>
          )}
        </div>

        {/* Botón WhatsApp Manual */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 rounded-xl font-extrabold text-white text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-lg group relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            boxShadow: '0 10px 30px rgba(37,211,102,0.3)',
          }}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-2.32 0-4.53 1.002-6.07 2.746-1.53 1.743-2.21 4.024-1.87 6.305.65 4.341 4.29 7.625 8.67 7.625 1.15 0 2.27-.25 3.3-.73l3.87 1.02c.45.12.89-.25.81-.7l-1.02-3.87c.64-1.32.97-2.77.97-4.26 0-4.66-3.85-8.45-8.54-8.45zm5.1 11.23c-.22.62-1.29 1.19-1.78 1.25-.43.05-.98.07-2.92-.69-2.48-.97-4.08-3.51-4.2-3.67-.12-.16-.97-1.29-.97-2.46 0-1.17.61-1.74.83-1.98.22-.24.49-.3.65-.3.16 0 .33 0 .47.01.15.01.35-.06.55.42.2.49.69 1.68.75 1.8.06.12.1.26.02.42-.08.16-.18.26-.3.4l-.45.53c-.14.14-.29.3-.12.6.17.29.75 1.25 1.61 2.02.86.77 1.58 1.01 1.88 1.16.3.15.47.12.65-.07.18-.2.77-.9 1.02-1.21.25-.31.5-.26.84-.14.34.12 2.16 1.02 2.53 1.21.37.19.61.28.7.44.09.16.09.93-.13 1.55z" />
          </svg>
          <span>
            {redirected ? 'Abrir WhatsApp Manualmente' : 'Agendar por WhatsApp Ahora'}
          </span>
        </a>

        {/* Ayuda/Fallback */}
        <p className="text-[10px] sm:text-xs mt-3.5 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {redirected ? '¿Se cerró la ventana de WhatsApp? Haz clic arriba para volver a abrirla.' : '¿No se abrió la ventana automática? Haz clic en el botón de arriba.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* ── Estatus de solicitud existente (Insignia Flotante) ── */}
      {hasExistingRequest && (
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-wide select-none transition-all duration-300 hover:bg-opacity-15 cursor-help animate-in fade-in slide-in-from-right-3 duration-500"
          style={{
            background: 'rgba(0, 168, 232, 0.08)',
            border: '1.2px solid rgba(0, 168, 232, 0.35)',
            color: '#00A8E8',
            boxShadow: '0 0 16px rgba(0, 168, 232, 0.12)',
            backdropFilter: 'blur(8px)',
          }}
          title="Ya tienes una solicitud de mentoría registrada. Puedes enviar una nueva si deseas actualizar tus datos."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00A8E8] shadow-[0_0_6px_#00A8E8] animate-pulse" />
          <span>Solicitud Recibida</span>
        </div>
      )}

      {/* ── Barra de progreso ── */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Progreso
          </span>
          <span className="text-[10px] sm:text-[11px] font-black" style={{ color: isValid ? '#4ade80' : '#fb923c' }}>
            {filledCount} / {CAMPOS.length} campos
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: isValid
                ? 'linear-gradient(to right, #22c55e, #4ade80)'
                : 'linear-gradient(to right, #f97316, #fb923c)',
              boxShadow: isValid ? '0 0 8px rgba(74,222,128,0.5)' : '0 0 8px rgba(251,146,60,0.5)',
            }}
          />
        </div>
      </div>

      {/* ── Error del servidor ── */}
      {serverError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold mb-5"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {serverError}
        </div>
      )}

      {/* ── Grid de campos ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4 sm:gap-y-5 mb-5 sm:mb-6">
        {CAMPOS.map(({ name, label, type, placeholder, icon: Icon }) => {
          const hasError = !!(touched[name] && errors[name])
          const isFocused = focused === name
          const filled = !!values[name]?.trim()
          const isOk = filled && !errors[name]

          let borderColor = 'rgba(255,255,255,0.1)'
          if (hasError) borderColor = 'rgba(248,113,113,0.6)'
          else if (isFocused) borderColor = 'rgba(249,115,22,0.8)'
          else if (isOk) borderColor = 'rgba(74,222,128,0.5)'

          let glowColor = 'none'
          if (isFocused) glowColor = '0 0 0 3px rgba(249,115,22,0.12)'
          else if (hasError) glowColor = '0 0 0 2px rgba(248,113,113,0.1)'

          return (
            <div key={name}>
              {/* Label */}
              <label className="flex items-center gap-1.5 mb-1.5"
                style={{ color: hasError ? '#f87171' : isOk ? '#4ade80' : 'rgba(255,255,255,0.45)' }}>
                <Icon className="w-3 h-3" style={{ flexShrink: 0 }} />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{label}</span>
              </label>

              {/* Input wrapper */}
              <div className="relative">
                <input
                  name={name}
                  type={type}
                  value={values[name]}
                  onChange={e => handleChange(name, e.target.value)}
                  onFocus={() => setFocused(name)}
                  onBlur={() => handleBlur(name)}
                  placeholder={placeholder}
                  disabled={isPending}
                  className="w-full text-[13px] sm:text-sm font-medium outline-none transition-all duration-200 disabled:opacity-50 placeholder:font-normal py-2.5 sm:py-3 pl-3.5 pr-10 rounded-xl"
                  style={{
                    background: isFocused ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${borderColor}`,
                    color: '#f1f5f9',
                    boxShadow: glowColor,
                  }}
                />
                {/* Ícono de estado */}
                {isOk && !isFocused && (
                  <CheckCircle2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#4ade80' }} />
                )}
                {hasError && !isFocused && (
                  <AlertCircle className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#f87171' }} />
                )}
              </div>

              {/* Mensaje de error */}
              {hasError && (
                <p className="text-[10px] mt-1.5 font-semibold" style={{ color: '#f87171' }}>
                  ⚠ Este campo es obligatorio
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Botón de envío ── */}
      <div className="flex flex-col gap-3.5">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2.5 font-extrabold text-xs sm:text-sm tracking-wide transition-all duration-300 disabled:cursor-wait py-3.5 px-6 sm:px-8 rounded-xl"
          style={{
            background: isValid
              ? 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #f59e0b 100%)'
              : 'rgba(255,255,255,0.06)',
            border: isValid ? 'none' : '1.5px solid rgba(255,255,255,0.12)',
            color: isValid ? 'white' : 'rgba(255,255,255,0.3)',
            boxShadow: isValid ? '0 8px 32px rgba(249,115,22,0.4), 0 0 0 1px rgba(249,115,22,0.2)' : 'none',
            transform: isPending ? 'scale(0.99)' : 'scale(1)',
          }}
          onMouseEnter={e => { if (isValid && !isPending) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
        >
          {isPending ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Guardando solicitud…</span>
            </>
          ) : isValid ? (
            <>
              <svg className="w-4.5 h-4.5 fill-current animate-pulse" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-2.32 0-4.53 1.002-6.07 2.746-1.53 1.743-2.21 4.024-1.87 6.305.65 4.341 4.29 7.625 8.67 7.625 1.15 0 2.27-.25 3.3-.73l3.87 1.02c.45.12.89-.25.81-.7l-1.02-3.87c.64-1.32.97-2.77.97-4.26 0-4.66-3.85-8.45-8.54-8.45zm5.1 11.23c-.22.62-1.29 1.19-1.78 1.25-.43.05-.98.07-2.92-.69-2.48-.97-4.08-3.51-4.2-3.67-.12-.16-.97-1.29-.97-2.46 0-1.17.61-1.74.83-1.98.22-.24.49-.3.65-.3.16 0 .33 0 .47.01.15.01.35-.06.55.42.2.49.69 1.68.75 1.8.06.12.1.26.02.42-.08.16-.18.26-.3.4l-.45.53c-.14.14-.29.3-.12.6.17.29.75 1.25 1.61 2.02.86.77 1.58 1.01 1.88 1.16.3.15.47.12.65-.07.18-.2.77-.9 1.02-1.21.25-.31.5-.26.84-.14.34.12 2.16 1.02 2.53 1.21.37.19.61.28.7.44.09.16.09.93-.13 1.55z" />
              </svg>
              <span>Confirmar y Agendar por WhatsApp</span>
            </>
          ) : (
            <span>Completa los campos para continuar</span>
          )}
        </button>

        {/* Nota de privacidad */}
        {isValid && (
          <p className="text-center text-[10px] mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            🔒 Se guardará tu postulación y te redirigiremos a WhatsApp.
          </p>
        )}
      </div>

    </form>
  )
}
