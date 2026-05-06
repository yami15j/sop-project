'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${nombre} ${apellido}`.trim(),
        nombre,
        apellido,
      }
    }
  })

  if (error) {
    let mensaje = 'Ocurrió un error al crear la cuenta. Inténtalo de nuevo.'
    if (error.message.includes('invalid format') || error.message.includes('Unable to validate email')) {
      mensaje = 'El correo electrónico ingresado no es válido. Verifica el formato (ej. nombre@correo.com).'
    } else if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      mensaje = 'Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?'
    } else if (error.message.includes('Password should be')) {
      mensaje = 'La contraseña debe tener al menos 6 caracteres.'
    }
    redirect(`/signup?error=${encodeURIComponent(mensaje)}`)
  }

  revalidatePath('/', 'layout')
  redirect(`/dashboard?bienvenido=1&nuevo=1`)
}
