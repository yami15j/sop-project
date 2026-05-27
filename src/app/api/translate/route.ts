import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/utils/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // 0. Autenticación de seguridad
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado. Inicia sesión.' }, { status: 401 })
    }

    const { text, targetLang } = await req.json()
    if (!text || text.trim().length < 5) {
      return NextResponse.json({ error: 'El texto es muy corto para ser traducido.' }, { status: 400 })
    }

    const prompt = `Traduce el siguiente texto académico (Statement of Purpose / Personal Statement) al ${targetLang === 'es' ? 'español' : 'inglés'}.
Conserva de manera exacta todos los párrafos, saltos de línea y estructura en prosa original.
NO agregues notas del traductor, introducciones, saludos ni comentarios. Devuelve ÚNICAMENTE la traducción directa en prosa:

${text}`

    // Usamos claude-sonnet-4-6 porque es el modelo activo en tu cuenta para Sonnet
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [
        { role: 'user', content: prompt }
      ]
    })

    const translatedText = message.content
      .filter((c): c is Anthropic.TextBlock => c.type === 'text')
      .map(c => c.text)
      .join('')

    if (!translatedText) {
      throw new Error('La IA no devolvió contenido traducido.')
    }

    return NextResponse.json({
      success: true,
      translatedText: translatedText.trim()
    })

  } catch (error: any) {
    console.error('[API TRANSLATE] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Hubo un error al traducir el ensayo.' },
      { status: 500 }
    )
  }
}
