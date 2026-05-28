'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
  const password = (formData.get('password') as string || '').trim()
  const confirmPassword = (formData.get('confirmPassword') as string || '').trim()

  if (!password || !confirmPassword) {
    redirect(`/reset-password?error=${encodeURIComponent('Por favor, completa todos los campos.')}`)
  }

  if (password.length < 6) {
    redirect(`/reset-password?error=${encodeURIComponent('La contraseña debe tener al menos 6 caracteres.')}`)
  }

  if (password !== confirmPassword) {
    redirect(`/reset-password?error=${encodeURIComponent('Las contraseñas no coinciden.')}`)
  }

  const supabase = await createClient()

  // Actualizar la contraseña del usuario actualmente autenticado (puesto que el callback de login ya creó la sesión)
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error('[RESET_PASSWORD_UPDATE_ERROR]', error)
    
    let mensaje = 'No se pudo actualizar la contraseña. Por favor, inténtalo de nuevo.'
    const msgLower = error.message.toLowerCase()
    
    if (msgLower.includes('should be at least') || msgLower.includes('password should be')) {
      mensaje = 'La contraseña debe tener al menos 6 caracteres.'
    } else if (msgLower.includes('different') || msgLower.includes('same as')) {
      mensaje = 'La nueva contraseña debe ser diferente a la actual.'
    } else if (msgLower.includes('expired') || msgLower.includes('invalid')) {
      mensaje = 'El enlace de recuperación ha expirado o ya no es válido. Por favor, solicita uno nuevo.'
    } else {
      mensaje = `No se pudo actualizar la contraseña: ${error.message}`
    }

    redirect(`/reset-password?error=${encodeURIComponent(mensaje)}`)
  }

  // Redirigir al dashboard con un banner informativo de éxito
  redirect('/dashboard?bienvenido=1&verificado=1&contrasena_actualizada=1')
}
