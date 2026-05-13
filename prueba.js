require('dotenv').config({ path: '.env.local' });
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Lee el system prompt y rellena las variables del template
let systemPrompt = fs.readFileSync('./prompt_v1.md', 'utf-8');

const ensayoPrueba = `
Siempre he querido estudiar en el extranjero. Soy estudiante de 
ingeniería en Ecuador y quiero hacer una maestría en inteligencia 
artificial en Alemania para mejorar mi país cuando regrese. 
Tengo buenas notas y creo que merezco esta oportunidad porque soy muy trabajador.
`;

// Inyectamos los datos en el prompt
systemPrompt = systemPrompt
    .replace('{beca}', 'DAAD')
    .replace('{pais}', 'Alemania')
    .replace('{area}', 'Inteligencia Artificial')
    .replace('{ensayo}', ensayoPrueba);

async function analizarEnsayo() {
    console.log('Enviando ensayo a Claude...\n');

    const mensaje = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [
            {
                role: 'user',
                content: "Por favor, evalúa mi ensayo."
            }
        ]
    });

    console.log('Respuesta de Claude:\n');
    console.log(mensaje.content[0].text);
}

analizarEnsayo();