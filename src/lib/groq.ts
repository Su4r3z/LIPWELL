import Groq from 'groq-sdk';

// Criado sob demanda: instanciar no import quebrava o `next build`
// quando GROQ_API_KEY não estava definida no ambiente de build.
let client: Groq | null = null;

export function getGroq(): Groq {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY não configurada');
    client = new Groq({ apiKey });
  }
  return client;
}
