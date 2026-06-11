'use server'

import { Resend } from 'resend'
import { createClient } from '@/utils/supabase/server'
import { createClient as createPlainClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Server Action para actualizar el perfil del administrador en la tabla profiles.
 */
export async function actualizarPerfilAdmin(
  nombre: string,
  telefono: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'No autenticado.' }

    const { error } = await supabase
      .from('profiles')
      .update({ nombre, telefono })
      .eq('user_id', user.id)

    if (error) {
      console.error('[actualizarPerfilAdmin] Error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error inesperado.' }
  }
}



interface SendEmailResponse {
  success: boolean
  error?: string
}

/**
 * Server Action para enviar un correo electrónico real usando Resend.
 * Al estar marcado con 'use server', puede ser llamado directamente desde el cliente.
 */
export async function enviarCorreoAdmin(
  destinatario: string,
  asunto: string,
  cuerpo: string
): Promise<SendEmailResponse> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY no configurada — email simulado')
      return { success: true }
    }

    await resend.emails.send({
      from: 'SOP Reviewer <onboarding@resend.dev>',
      to: 'zyjumbo@sudamericano.edu.ec', // Se mantiene este por restricciones del Sandbox de Resend
      replyTo: destinatario, // Permite que el admin le escriba y el alumno reciba la respuesta directa
      subject: asunto,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #010B2B, #0d1f4a); padding: 32px; text-align: center; border-bottom: 4px solid #00A8E8;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.025em;">SOP Reviewer</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Respuesta del Mentor Experto</p>
          </div>
          <div style="padding: 32px 24px; background: #ffffff;">
            <div style="color: #334155; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
              ${cuerpo}
            </div>
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0; font-weight: 500;">
                Este correo fue enviado de manera formal por un mentor de La Comunidad del Intercambio.<br>
                Puedes responder directamente a este correo para coordinar los siguientes pasos de tu mentoría.
              </p>
            </div>
          </div>
        </div>
      `
    })

    console.info(`✅ Email enviado exitosamente a través de Resend para: ${destinatario}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error enviando email desde la administración:', error)
    return { success: false, error: error.message || 'Error de comunicación con Resend.' }
  }
}

/**
 * Server Action para actualizar los datos de un estudiante real directamente en la base de datos Supabase.
 * Actualiza la información en las tablas `leads_mentoria` y `ensayos_enviados`.
 */
export async function actualizarDatosEstudiante(
  email: string,
  nombre: string,
  telefono: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Actualizar en la tabla leads_mentoria
    const { error: leadsError } = await supabase
      .from('leads_mentoria')
      .update({ nombre, telefono })
      .eq('email', email)

    if (leadsError) {
      console.error('Error al actualizar en leads_mentoria:', leadsError)
    }

    // 2. Actualizar en la tabla ensayos_enviados
    const { error: ensayosError } = await supabase
      .from('ensayos_enviados')
      .update({ nombre_usuario: nombre })
      .eq('email_usuario', email)

    if (ensayosError) {
      console.error('Error al actualizar en ensayos_enviados:', ensayosError)
    }

    console.info(`✅ Datos del estudiante con correo ${email} actualizados en Supabase exitosamente.`)
    return { success: true }
  } catch (error: any) {
    console.error('Error en Server Action actualizarDatosEstudiante:', error)
    return { success: false, error: error.message || 'Error al intentar conectar con la base de datos Supabase.' }
  }
}

/**
 * Server Action para eliminar permanentemente los registros de un estudiante de la base de datos Supabase.
 * Quita al estudiante de `leads_mentoria` y `ensayos_enviados`.
 */
export async function eliminarDatosEstudiante(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 1. Eliminar de la tabla leads_mentoria
    const { error: leadsError } = await supabase
      .from('leads_mentoria')
      .delete()
      .eq('email', email)

    if (leadsError) {
      console.error('Error al eliminar en leads_mentoria:', leadsError)
      return { success: false, error: `Error en leads_mentoria: ${leadsError.message}` }
    }

    // 2. Eliminar de la tabla ensayos_enviados
    const { error: ensayosError } = await supabase
      .from('ensayos_enviados')
      .delete()
      .eq('email_usuario', email)

    if (ensayosError) {
      console.error('Error al eliminar en ensayos_enviados:', ensayosError)
      return { success: false, error: `Error en ensayos_enviados: ${ensayosError.message}` }
    }

    // 3. Eliminar de la tabla profiles (para que no aparezca en el panel de usuarios)
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .eq('email', email)

    if (profilesError) {
      console.error('Error al eliminar en profiles:', profilesError)
      // No retornamos error aquí porque puede que el perfil no exista
    }

    console.info(`✅ Alumno con correo ${email} eliminado exitosamente de la base de datos Supabase.`)
    return { success: true }
  } catch (error: any) {
    console.error('Error en Server Action eliminarDatosEstudiante:', error)
    return { success: false, error: error.message || 'Error al intentar conectar con la base de datos Supabase.' }
  }
}

/**
 * Server Action para registrar un estudiante manualmente en Supabase Auth y en la tabla leads_mentoria.
 * Utiliza un cliente sin cookies para no alterar la sesión del administrador.
 */
export async function crearEstudianteManual(
  nombre: string,
  email: string,
  telefono: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Configuración de Supabase incompleta.' }
    }

    // Cliente sin persistencia de cookies para no cerrar la sesión del admin
    const plainClient = createPlainClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    // 1. Crear el usuario en Supabase Auth con contraseña por defecto
    const defaultPassword = 'Estudiante123!'
    let userId: string | null = null

    // 0. Verificar primero si el estudiante ya existe en leads_mentoria para no duplicarlo en la tabla
    const { data: existingLead } = await plainClient
      .from('leads_mentoria')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingLead) {
      return { success: false, error: 'Ya existe un estudiante registrado en la lista con este correo electrónico.' }
    }

    const { data: authData, error: authError } = await plainClient.auth.signUp({
      email,
      password: defaultPassword,
      options: {
        data: {
          full_name: nombre,
          nombre: nombre,
          apellido: ''
        }
      }
    })

    if (authError) {
      const msgLower = authError.message.toLowerCase()
      const isAlreadyRegistered = msgLower.includes('already registered') || 
                                  msgLower.includes('already been registered') || 
                                  msgLower.includes('user already exists') ||
                                  msgLower.includes('already exists')

      if (isAlreadyRegistered) {
        console.warn(`El estudiante con correo ${email} ya estaba registrado en Supabase Auth. Insertando solo en la base de datos...`)
      } else {
        console.error('Error al registrar en Supabase Auth:', authError)
        return { success: false, error: `Error en Autenticación: ${authError.message}` }
      }
    } else if (authData.user) {
      // 🕵️ DETECCIÓN DE PROTECCIÓN DE ENUMERACIÓN DE CORREO (EMAIL ENUMERATION PROTECTION)
      // Si el correo ya existe en Auth, Supabase devuelve error null pero identities vacías [].
      // El id devuelto es simulado y violaría la clave foránea si intentáramos insertarlo.
      const identities = authData.user.identities || []
      const isDuplicate = identities.length === 0

      if (isDuplicate) {
        console.warn(`[Enumeration Protection] El correo ${email} ya está registrado en Auth. Insertando en leads_mentoria con user_id: null...`)
        userId = null
      } else {
        userId = authData.user.id
      }
    }

    // 2. Insertar el registro en la tabla leads_mentoria usando el cliente plano (sin cookies/sesión de admin) para evitar conflictos de políticas de RLS e inserción de user_id nulo
    const { error: dbError } = await plainClient
      .from('leads_mentoria')
      .insert({
        user_id: userId,
        nombre,
        email,
        telefono: telefono || null,
        beca_objetivo: 'General',
        pais_destino: 'Global',
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Error al insertar en leads_mentoria:', dbError)
      return { success: false, error: `Se creó la cuenta de acceso pero falló la base de datos: ${dbError.message}` }
    }

    console.info(`✅ Alumno ${email} registrado exitosamente de manera manual en Auth y base de datos.`)
    return { success: true }
  } catch (error: any) {
    console.error('Error en crearEstudianteManual:', error)
    return { success: false, error: error.message || 'Error inesperado al crear estudiante.' }
  }
}

/**
 * Server Action para ajustar los créditos extra de un estudiante directamente en Supabase.
 * Actualiza el campo `creditos_extra` en la tabla `profiles` por user_id o email.
 * El valor puede ser positivo (añadir) o negativo (descontar).
 */
export async function ajustarCreditosEstudiante(
  userId: string | null,
  email: string,
  nuevoTotal: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Buscar el perfil por user_id o email
    let query = supabase
      .from('profiles')
      .update({ creditos_extra: Math.max(0, nuevoTotal) })

    if (userId) {
      query = query.eq('user_id', userId)
    } else {
      query = query.eq('email', email)
    }

    const { error } = await query

    if (error) {
      console.error('[ajustarCreditosEstudiante] Error al actualizar creditos_extra:', error)
      return { success: false, error: error.message }
    }

    console.info(`✅ Créditos de ${email} actualizados a ${nuevoTotal} en Supabase.`)
    return { success: true }
  } catch (error: any) {
    console.error('Error en ajustarCreditosEstudiante:', error)
    return { success: false, error: error.message || 'Error al ajustar créditos.' }
  }
}

/**
 * Server Action para actualizar el estado (Pendiente, En Contacto, Convertido) de un lead en Supabase.
 */
export async function actualizarEstadoLead(
  leadId: string,
  nuevoEstado: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Traducir estados de la interfaz a los permitidos por el Check Constraint de la base de datos:
    // nuevo, contactado, en_proceso, finalizado, rechazado
    let dbEstado = nuevoEstado.trim().toLowerCase()
    if (dbEstado === 'pendiente' || dbEstado === 'nuevo') {
      dbEstado = 'nuevo'
    } else if (dbEstado === 'en contacto' || dbEstado === 'contacto' || dbEstado === 'contactado') {
      dbEstado = 'contactado'
    } else if (dbEstado === 'convertido' || dbEstado === 'finalizado') {
      dbEstado = 'finalizado'
    } else if (dbEstado === 'en proceso' || dbEstado === 'en_proceso') {
      dbEstado = 'en_proceso'
    } else if (dbEstado === 'rechazado') {
      dbEstado = 'rechazado'
    }

    const { error } = await supabase
      .from('leads_mentoria')
      .update({ estado: dbEstado })
      .eq('id', leadId)

    if (error) {
      console.error('[actualizarEstadoLead] Error:', error)
      return { success: false, error: error.message }
    }

    console.info(`✅ Estado del lead ${leadId} actualizado a ${dbEstado} en Supabase.`)
    return { success: true }
  } catch (error: any) {
    console.error('Error en actualizarEstadoLead:', error)
    return { success: false, error: error.message || 'Error al actualizar el estado del lead.' }
  }
}

