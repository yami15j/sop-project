'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function switchAccount() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function solicitarMentoria(formData: FormData) {
  const supabase = await createClient()

  // 1. Verificamos quién es el usuario
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  // Obtener el último ensayo del usuario para incluirlo en el correo de mentoría
  const { data: ensayos } = await supabase
    .from('ensayos_enviados')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const ultimoEnsayo = ensayos && ensayos.length > 0 ? ensayos[0] : null

  // 2. Extraemos los datos del formulario
  const nombre = formData.get('nombre') as string
  const emailVisible = formData.get('email_visible') as string  // email que el estudiante escribe
  const beca = formData.get('beca') as string
  const telefono = formData.get('telefono') as string
  const deadline = formData.get('deadline') as string
  const pais = formData.get('pais') as string

  // El correo de contacto: primero el que escribió en el form, si no el de su cuenta
  const emailContacto = emailVisible?.trim() || user.email || ''

  // 3. Guardamos en la base de datos
  const { error } = await supabase
    .from('leads_mentoria')
    .insert({
      user_id: user.id,
      email: emailContacto,
      nombre: nombre || 'Desconocido',
      telefono: telefono || null,
      beca_objetivo: beca || null,
      deadline: deadline || null,
    })

  if (error) {
    console.error('Error guardando lead:', error)
    return { success: false, error: `Error al guardar: ${error.message}` }
  }

  // 4. Envío de Email con Resend
  // El reply_to hace que al responder el correo, vaya directo al estudiante
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY no configurada — email simulado')
      console.info(`📧 [SIMULADO] Lead de: ${nombre} <${emailContacto}>`)
    } else {
      await resend.emails.send({
        from: 'SOP Reviewer <onboarding@resend.dev>',
        to: 'zyjumbo@sudamericano.edu.ec',      // 🏢 TIENE QUE SER ESTE CORREO POR RESTRICCIÓN DE RESEND
        replyTo: emailContacto,                   // 📩 Al responder → va al estudiante
        subject: `🎓 Nueva solicitud de mentoría — ${nombre}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #010B2B, #0d1f4a); padding: 32px; text-align: center;">
              <h1 style="color: #00A8E8; margin: 0; font-size: 22px;">🎓 SOP Reviewer</h1>
              <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Nueva solicitud de Mentoría Premium</p>
            </div>

            <!-- Contenido -->
            <div style="padding: 32px; background: white;">
              <h2 style="color: #010B2B; margin-top: 0;">¡Tienes un nuevo estudiante interesado! 🚀</h2>
              <p style="color: #64748b; margin-bottom: 24px;">
                <strong>${nombre}</strong> ha solicitado una mentoría premium. 
                Puedes responder este correo directamente para contactarle.
              </p>

              <!-- Datos del estudiante -->
              <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden;">
                <tr style="background: #f1f5f9;">
                  <td style="padding: 12px 16px; font-weight: bold; color: #475569; width: 40%;">👤 Nombre</td>
                  <td style="padding: 12px 16px; color: #1e293b;">${nombre || '—'}</td>
                </tr>
                <tr style="background: white;">
                  <td style="padding: 12px 16px; font-weight: bold; color: #475569;">📧 Email</td>
                  <td style="padding: 12px 16px; color: #1e293b;">
                    <a href="mailto:${emailContacto}" style="color: #00A8E8;">${emailContacto}</a>
                  </td>
                </tr>
                <tr style="background: #f1f5f9;">
                  <td style="padding: 12px 16px; font-weight: bold; color: #475569;">📱 WhatsApp</td>
                  <td style="padding: 12px 16px; color: #1e293b;">${telefono || '—'}</td>
                </tr>
                <tr style="background: white;">
                  <td style="padding: 12px 16px; font-weight: bold; color: #475569;">🎯 Beca objetivo</td>
                  <td style="padding: 12px 16px; color: #1e293b;">${beca || '—'}</td>
                </tr>
                <tr style="background: #f1f5f9;">
                  <td style="padding: 12px 16px; font-weight: bold; color: #475569;">🌍 País destino</td>
                  <td style="padding: 12px 16px; color: #1e293b;">${pais || '—'}</td>
                </tr>
                <tr style="background: white;">
                  <td style="padding: 12px 16px; font-weight: bold; color: #475569;">📅 Deadline</td>
                  <td style="padding: 12px 16px; color: #1e293b;">${deadline || '—'}</td>
                </tr>
              </table>

              <!-- Ensayo del estudiante -->
              ${ultimoEnsayo ? `
                <div style="margin-top: 28px; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1.5px dashed #cbd5e1; text-align: left;">
                  <h3 style="color: #010B2B; margin-top: 0; margin-bottom: 12px; font-size: 16px; font-weight: bold;">
                    📄 Ensayo Adjunto para Mentoría
                  </h3>
                  
                  ${ultimoEnsayo.pdf_url ? `
                    <div style="margin-bottom: 18px; background: #e0f2fe; border: 1px solid #bae6fd; padding: 14px; border-radius: 8px; text-align: center;">
                      <p style="color: #0369a1; font-size: 13px; font-weight: bold; margin: 0 0 10px 0;">
                        El estudiante subió este ensayo en formato PDF original.
                      </p>
                      <a href="${ultimoEnsayo.pdf_url}" target="_blank" rel="noopener noreferrer"
                         style="display: inline-block; background: #0284c7; color: white; text-decoration: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; font-size: 13px;">
                        📥 Descargar PDF Original
                      </a>
                    </div>
                  ` : ''}

                  <p style="color: #475569; font-size: 11px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                    Contenido del Ensayo (${ultimoEnsayo.contenido?.trim().split(/\s+/).length || 0} palabras):
                  </p>
                  <div style="background: white; padding: 18px; border-radius: 8px; border: 1px solid #e2e8f0; font-family: 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap; max-height: 350px; overflow-y: auto;">
                    ${ultimoEnsayo.contenido || 'Sin contenido textual.'}
                  </div>
                </div>
              ` : `
                <div style="margin-top: 28px; padding: 16px; background: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7; text-align: center;">
                  <p style="color: #b45309; font-size: 13px; font-weight: bold; margin: 0;">
                    Nota: No se encontró ningún ensayo previo en el historial de este estudiante.
                  </p>
                </div>
              `}

              <!-- CTA -->
              <div style="margin-top: 28px; text-align: center;">
                <a href="mailto:${emailContacto}"
                   style="display: inline-block; background: linear-gradient(135deg, #00A8E8, #0070b8); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px;">
                  ✉️ Responder al estudiante
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 20px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                Este correo fue generado automáticamente por SOP Reviewer.<br>
                Al hacer clic en "Responder" escribirás directamente a <strong>${emailContacto}</strong>.
              </p>
            </div>

          </div>
        `,
      })
      console.info(`✅ Email enviado — lead de: ${nombre} <${emailContacto}>`)
    }
  } catch (emailError) {
    console.error('Error enviando email:', emailError)
    // No retornamos error para no bloquear al usuario si falla el correo
  }

  // 5. Recargamos los datos del dashboard
  revalidatePath('/dashboard')
  return { success: true }
}

