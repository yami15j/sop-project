'use server'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get('email') as string || '').trim()

  if (!email) {
    redirect(`/forgot-password?error=${encodeURIComponent('Por favor, ingresa tu correo electrónico.')}`)
  }

  const supabase = await createClient()

  // Obtener el origen
  const headersList = await headers()
  let origin = headersList.get('origin')
  
  if (!origin || origin === 'null') {
    const host = headersList.get('host')
    if (host) {
      const isHttps = headersList.get('x-forwarded-proto') === 'https'
      origin = `${isHttps ? 'https' : 'http'}://${host}`
    } else {
      origin = 'http://localhost:3000'
    }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
  })

  if (error) {
    console.error('[RESET_PASSWORD_REQUEST_ERROR]', error)
    
    let mensaje = 'No se pudo enviar el correo de recuperación. Por favor, inténtalo de nuevo.'
    const msgLower = error.message.toLowerCase()
    
    if (msgLower.includes('for security purposes, you can only request this after')) {
      const secondsMatch = error.message.match(/(\d+)\s+seconds/)
      const seconds = secondsMatch ? secondsMatch[1] : 'unos'
      mensaje = `Por razones de seguridad, debes esperar ${seconds} segundos antes de volver a solicitar el correo de recuperación.`
    } else if (msgLower.includes('rate limit') || msgLower.includes('too many requests')) {
      mensaje = 'Límite de solicitudes de correo excedido. Por favor, espera unos minutos antes de intentar de nuevo.'
    } else if (msgLower.includes('user not found') || msgLower.includes('email not found')) {
      mensaje = 'No existe ningún usuario registrado con este correo electrónico.'
    } else {
      mensaje = `No se pudo enviar el correo de recuperación: ${error.message}`
    }

    redirect(`/forgot-password?error=${encodeURIComponent(mensaje)}`)
  }

  redirect(`/forgot-password?success=1&email=${encodeURIComponent(email)}`)
}
