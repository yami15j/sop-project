'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { solicitarMentoria } from '@/app/dashboard/actions'
import { Phone, Mail, BookOpen, Globe, Calendar, User, Send, CheckCircle2, AlertCircle } from 'lucide-react'

interface MentoriaFormProps {
  nombreDefault?: string
  emailDefault?: string
  becaDefault?: string
  paisDefault?: string
}

const CAMPOS = [
  { name: 'nombre',        label: 'Nombre completo',  type: 'text',  placeholder: 'Juan Pérez',             icon: User,     required: true },
  { name: 'email_visible', label: 'Correo',            type: 'email', placeholder: 'tu@correo.com',          icon: Mail,     required: true },
  { name: 'beca',          label: 'Beca objetivo',     type: 'text',  placeholder: 'Chevening, Fulbright…',  icon: BookOpen, required: true },
  { name: 'telefono',      label: 'WhatsApp',          type: 'tel',   placeholder: '+593 999 000 000',       icon: Phone,    required: true },
  { name: 'deadline',      label: 'Fecha límite',      type: 'date',  placeholder: '',                       icon: Calendar, required: true },
  { name: 'pais',          label: 'País destino',      type: 'text',  placeholder: 'Reino Unido, Alemania…', icon: Globe,    required: true },
]

export default function MentoriaForm({ nombreDefault = '', emailDefault = '', becaDefault = '', paisDefault = '' }: MentoriaFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [values, setValues] = useState<Record<string, string>>({
    nombre:        nombreDefault,
    email_visible: emailDefault,
    beca:          becaDefault,
    telefono:      '',
    deadline:      '',
    pais:          paisDefault,
  })
  const [focused, setFocused] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const errors: Record<string, string> = {}
  CAMPOS.forEach(c => {
    if (c.required && !values[c.name]?.trim()) errors[c.name] = 'Requerido'
  })
  const isValid     = Object.keys(errors).length === 0
  const filledCount = CAMPOS.filter(c => values[c.name]?.trim()).length
  const progress    = Math.round((filledCount / CAMPOS.length) * 100)

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
    return (
      <div className="flex flex-col items-center justify-center py-10 animate-in zoom-in duration-500">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6"
          style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', boxShadow: '0 0 40px rgba(74,222,128,0.2)' }}>
          <CheckCircle2 className="w-10 h-10 text-[#4ade80]" />
        </div>
        <h3 className="text-2xl font-black text-white mb-3">¡Solicitud Enviada!</h3>
        <p className="text-center text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Hemos recibido tus datos correctamente. Nuestro equipo revisará tu perfil y te contactaremos por correo para el siguiente paso.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>

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
          if (hasError)  borderColor = 'rgba(248,113,113,0.6)'
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
      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 disabled:cursor-wait py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl"
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
              <span>Enviando solicitud…</span>
            </>
          ) : isValid ? (
            <>
              <Send className="w-4 h-4 animate-bounce" />
              <span>Solicitar Mentoría Premium</span>
            </>
          ) : (
            <span>Completa los campos para continuar</span>
          )}
        </button>

        {/* Nota de privacidad */}
        {isValid && (
          <p className="text-center text-[10px] mt-3 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            🔒 Tus datos son confidenciales y nunca serán compartidos con terceros.
          </p>
        )}
      </div>

    </form>
  )
}
