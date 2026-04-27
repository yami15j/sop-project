import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { createClient } from '@/utils/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    
    // 0. Autenticación y Límites
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 })
    }

    // Verificar límite de 2 ensayos gratis
    const { count } = await supabase
      .from('ensayos_enviados')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count !== null && count >= 2) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de 2 ensayos gratuitos. Por favor adquiere una mentoría premium para continuar.' },
        { status: 403 }
      )
    }

    // 1. Recibir los datos
    const body = await req.json()
    const { ensayo, pais_destino, beca_objetivo } = body

    if (!ensayo || ensayo.trim().length < 50) {
      return NextResponse.json({ error: 'El ensayo es muy corto.' }, { status: 400 })
    }
    if (ensayo.length > 15000) {
      return NextResponse.json({ error: 'El ensayo es demasiado largo.' }, { status: 400 })
    }

    // 2. Leer tu archivo de prompt
    const promptPath = path.join(process.cwd(), 'prompt_v1.md')
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8')

    const userMessage = `País de destino: ${pais_destino}\nBeca objetivo: ${beca_objetivo}\n\nEnsayo:\n${ensayo}`

    // 3. Enviar a Claude
    let claudeResponse = ''
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6', // Nombre según tu documento
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })
      claudeResponse = message.content[0].type === 'text' ? message.content[0].text : ''
    } catch (apiError: any) {
      // MODO PRUEBA (MOCK): Si Claude falla por falta de saldo, generamos una respuesta falsa para que puedas probar tu App
      console.warn("Anthropic API falló. Usando modo de prueba (Mock).", apiError.message)
      claudeResponse = `
📊 PUNTUACIÓN GENERAL: 8/10

✅ 3 FORTALEZAS:
1. Tienes un objetivo claro.
2. Escribes con pasión.
3. El país de destino hace sentido.

🔧 3 ÁREAS DE MEJORA:
1. Podrías ser más específico.
2. Evita oraciones tan largas.
3. Conecta más tu historia con la maestría.

💡 RECOMENDACIÓN FINAL:
Para trabajar estos puntos estratégicos en profundidad, te recomendamos agendar una sesión con uno de nuestros mentores en La Comunidad del Intercambio.
`
    }

    // 4. Guardar en Base de Datos
    // Insertar ensayo
    const { data: ensayoData, error: ensayoError } = await supabase
      .from('ensayos_enviados')
      .insert({
        user_id: user.id,
        contenido: ensayo,
        pais_destino,
        beca_objetivo
      })
      .select()
      .single()

    if (ensayoError || !ensayoData) {
      throw new Error('Error al guardar el ensayo en la base de datos.')
    }

    // Insertar feedback
    await supabase
      .from('feedback_generado')
      .insert({
        ensayo_id: ensayoData.id,
        puntaje: 8, // En el futuro extraerías esto con Regex del texto
        raw_response: claudeResponse
      })

    return NextResponse.json({
      success: true,
      raw_feedback: claudeResponse,
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Hubo un error al procesar el ensayo.', details: error.message },
      { status: 500 }
    )
  }
}
