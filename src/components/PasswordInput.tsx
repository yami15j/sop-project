'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

interface PasswordInputProps {
  id?: string
  name?: string
  placeholder?: string
  required?: boolean
  className?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  hasLeftIcon?: boolean
}

export default function PasswordInput({
  id = 'password',
  name = 'password',
  placeholder = '••••••••',
  required = true,
  className = '',
  onChange,
  hasLeftIcon = false,
}: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative w-full group">
      {hasLeftIcon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00A8E8] transition-colors duration-300 z-10 pointer-events-none">
          <Lock className="w-4.5 h-4.5" />
        </div>
      )}
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        className={`w-full rounded-2xl border border-white/20 bg-slate-950/30 ${hasLeftIcon ? 'pl-11' : 'pl-3.5 sm:pl-4'} pr-11 py-4 text-sm sm:text-base text-white placeholder-slate-500 outline-none transition-all duration-300 hover:bg-slate-950/50 hover:border-white/30 focus:bg-slate-950/80 focus:border-[#00A8E8] focus:ring-4 focus:ring-[#00A8E8]/10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00A8E8] focus:outline-none transition-colors p-1 z-10"
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? (
          <EyeOff className="w-4.5 h-4.5" />
        ) : (
          <Eye className="w-4.5 h-4.5" />
        )}
      </button>
    </div>
  )
}

