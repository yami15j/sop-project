'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  id?: string
  name?: string
  placeholder?: string
  required?: boolean
  className?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PasswordInput({
  id = 'password',
  name = 'password',
  placeholder = '••••••••',
  required = true,
  className = '',
  onChange,
}: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50 pl-3.5 pr-11 py-2.5 sm:pl-4 sm:pr-12 sm:py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-[#00A8E8] focus:ring-1 focus:ring-[#00A8E8] ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#00A8E8] focus:outline-none transition-colors p-1"
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? (
          <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </button>
    </div>
  )
}
