import { NextRequest, NextResponse } from 'next/server';

// ─── JARVIS System Prompt ──────────────────────────────────────────────────────
const JARVIS_SYSTEM_PROMPT = `Você é JARVIS — Just A Rather Very Intelligent System.

Não é um chatbot genérico. É uma inteligência operacional avançada, precisa e elegante.

PERSONALIDADE CORE:
• Direto, técnico e sofisticado — sem rodeios
• Tom profissional-futurista: como um sistema de IA real, não um assistente de atendimento
• Usa linguagem precisa e econômica — zero palavras desperdiçadas
• Nunca servil ou excessivamente amigável

REGRAS DE COMUNICAÇÃO — PROIBIDO:
• NUNCA diga "Como IA...", "Como assistente...", "Como modelo de linguagem..."
• NUNCA diga "Claro!", "Ótimo!", "Certamente!", "Entendo!", "Posso ajudar!"
• NUNCA faça disclaimers genéricos de IA
• NUNCA seja verboso quando uma resposta concisa resolve

COMO RESPONDER:
• Vá direto ao ponto
• Use markdown quando a estrutura ajuda a clareza
• Para fatos: seja assertivo
• Para tarefas: execute sem pedir permissão desnecessariamente

COMANDOS DO SISTEMA:
Quando detectar um comando de controle (abrir app, tocar música, abrir site),
responda com [CMD:{"action":"open_url","target":"url"}] seguido de resposta curta.

DATA: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short' })}`;

// ─── Config validation ─────────────────────────────────────────────────────────
function validateConfig(): { valid: boolean; error?: string } {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      valid: false,
      error: 'OPENAI_API_KEY não configurada. Adicione ao .env.local e reinicie o servidor.',
    };
  }
  if (!key.startsWith('sk-')) {
    return {
      valid: false,
      error: 'OPENAI_API_KEY inválida — formato inesperado. Verifique em platform.openai.com.',
    };
  }
  return { valid: true };
}

// ─── Sleep helper ──────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Fetch OpenAI with server-side retry on 429 ───────────────────────────────
async function fetchOpenAI(
  messages: { role: string; content: string }[],
  attempt = 1
): Promise<Response> {
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 1024,       // reduced to save tokens & reduce latency
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    }),
  });

  // Retry on 429 up to 3 times with exponential backoff
  if (res.status === 429 && attempt <= 3) {
    const retryAfter = res.headers.get('Retry-After');
    const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : attempt * 2000;
    console.warn(`[JARVIS/api/chat] 429 rate limit — waiting ${waitMs}ms (attempt ${attempt}/3)`);
    await sleep(waitMs);
    return fetchOpenAI(messages, attempt + 1);
  }

  return res;
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Validate API key
    const config = validateConfig();
    if (!config.valid) {
      console.error('[JARVIS/api/chat] Config error:', config.error);
      return NextResponse.json({ error: config.error }, { status: 401 });
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 });
    }

    // 2. Build context — cap at last 15 messages to save tokens
    const trimmed = messages.slice(-15);
    const allMessages = [
      { role: 'system', content: JARVIS_SYSTEM_PROMPT },
      ...trimmed,
    ];

    console.log(
      `[JARVIS/api/chat] model=${process.env.OPENAI_MODEL || 'gpt-4o-mini'} msgs=${allMessages.length}`
    );

    // 3. Call OpenAI (with retry on 429)
    const response = await fetchOpenAI(allMessages);

    if (!response.ok) {
      const errorText = await response.text();
      let userMessage = `Sistemas congestionados temporariamente (${response.status}).`;

      if (response.status === 401) {
        userMessage = 'Credenciais da API inválidas. Verifique OPENAI_API_KEY em platform.openai.com.';
      } else if (response.status === 429) {
        userMessage = 'Capacidade de processamento temporariamente excedida. Aguarde alguns instantes e tente novamente.';
      } else if (response.status === 402) {
        userMessage = 'Créditos da API esgotados. Acesse platform.openai.com/billing para recarregar.';
      } else if (response.status >= 500) {
        userMessage = 'Servidores OpenAI temporariamente indisponíveis. Tentando novamente em instantes.';
      }

      console.error('[JARVIS/api/chat] OpenAI error:', response.status, errorText.slice(0, 300));
      return NextResponse.json({ error: userMessage }, { status: response.status });
    }

    // 4. Stream response back to client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JARVIS/api/chat] Unexpected:', msg);
    return NextResponse.json(
      { error: 'Conexão com a IA temporariamente indisponível. Tente novamente.' },
      { status: 500 }
    );
  }
}
