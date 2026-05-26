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
    redirect(`/forgot-password?error=${encodeURIComponent('No se pudo enviar el correo de recuperación: ' + error.message)}`)
  }

  redirect(`/forgot-password?success=1&email=${encodeURIComponent(email)}`)
}
