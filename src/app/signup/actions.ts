'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  // Obtener el origen de forma súper robusta para evitar errores como la cadena "null"
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

  const nombre = (formData.get('nombre') as string || '').trim()
  const apellido = (formData.get('apellido') as string || '').trim()
  const email = (formData.get('email') as string || '').trim()
  const password = (formData.get('password') as string || '').trim()

  if (!nombre || !apellido || !email || !password) {
    redirect(`/signup?error=${encodeURIComponent('Por favor, rellena todos los campos del formulario.')}`)
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent('/signup/verified-static')}`,
      data: {
        full_name: `${nombre} ${apellido}`.trim(),
        nombre,
        apellido,
      }
    }
  })

  if (error) {
    console.error('[SIGNUP_ERROR] Error completo de Supabase:', error)
    
    let mensaje = 'Ocurrió un error al crear la cuenta. Por favor, inténtalo de nuevo.'
    const msgLower = error.message.toLowerCase()
    
    if (msgLower.includes('invalid format') || msgLower.includes('unable to validate email') || msgLower.includes('invalid email')) {
      mensaje = 'El correo electrónico ingresado no es válido. Verifica el formato (ej. nombre@correo.com).'
    } else if (msgLower.includes('already registered') || msgLower.includes('already been registered') || msgLower.includes('user already exists')) {
      mensaje = 'Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?'
    } else if (msgLower.includes('password should be') || msgLower.includes('should be at least')) {
      mensaje = 'La contraseña debe tener al menos 6 caracteres.'
    } else if (msgLower.includes('rate limit') || msgLower.includes('too many requests')) {
      mensaje = 'Límite de solicitudes de correo excedido. Por favor, espera unos minutos antes de intentar de nuevo.'
    } else if (msgLower.includes('error sending confirmation email')) {
      mensaje = 'Hubo un problema al enviar el correo de confirmación. Por favor, verifica la configuración de tu servidor de correo en Supabase o inténtalo más tarde.'
    } else if (msgLower.includes('anonymous sign-ins are disabled') || msgLower.includes('anonymous')) {
      mensaje = 'Por favor, rellena todos los campos. Los registros anónimos están desactivados.'
    } else {
      mensaje = `No pudimos completar tu registro: ${error.message}`
    }
    
    redirect(`/signup?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath('/', 'layout')

  if (data?.session) {
    // Si la confirmación de correo está desactivada en Supabase, inicia sesión de inmediato
    redirect('/dashboard?bienvenido=1')
  } else {
    // Si está activada, pide confirmación por correo
    redirect('/signup/confirm')
  }
}

