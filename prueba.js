require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Lee el system prompt desde el archivo
const systemPrompt = fs.readFileSync('./prompt_v1.md', 'utf-8');

const ensayoPrueba = `
Siempre he querido estudiar en el extranjero. Soy estudiante de 
ingeniería en Ecuador y quiero hacer una maestría en inteligencia 
artificial en Europa para mejorar mi país cuando regrese. 
Tengo buenas notas y creo que merezco esta oportunidad.
`;

async function analizarEnsayo() {
    console.log('Enviando ensayo a Claude...\n');

    const mensaje = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,       // ← aquí va tu prompt_v1.md
        messages: [
            {
                role: 'user',
                content: ensayoPrueba   // ← solo el ensayo, limpio
            }
        ]
    });

    console.log('Respuesta de Claude:\n');
    console.log(mensaje.content[0].text);
}

analizarEnsayo();