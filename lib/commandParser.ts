/**
 * lib/commandParser.ts
 *
 * Hybrid command system:
 *  - Detects intent purely in the client (zero API cost)
 *  - Falls back to app if installed, else opens web
 *  - Security: only whitelisted targets executed
 */

export interface ParsedCommand {
  action: 'open_url' | 'open_app' | 'search_youtube' | 'search_web';
  target: string;
  displayName: string;
  /** Spoken feedback phrase */
  speech?: string;
}

// ─── Service registry ─────────────────────────────────────────────────────────
// Each entry has: url (web fallback), app (native binary, optional), and aliases
interface ServiceEntry {
  url: string;
  name: string;
  /** Linux binary name — tried first via open_app */
  app?: string;
  aliases: string[];
}

const SERVICES: ServiceEntry[] = [
  // ── Music & video ─────────────────────────────────────────────────
  {
    name: 'Spotify',
    url: 'https://open.spotify.com',
    app: 'spotify',
    aliases: ['spotify', 'musica', 'música', 'music'],
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com',
    aliases: ['youtube', 'yt', 'video', 'vídeo', 'videos'],
  },
  {
    name: 'YouTube Music',
    url: 'https://music.youtube.com',
    aliases: ['youtube music', 'ytmusic', 'yt music'],
  },
  {
    name: 'Netflix',
    url: 'https://netflix.com',
    aliases: ['netflix', 'filmes', 'series', 'séries'],
  },
  {
    name: 'Twitch',
    url: 'https://twitch.tv',
    aliases: ['twitch', 'live', 'stream'],
  },
  // ── Productivity & Dev ────────────────────────────────────────────
  {
    name: 'VSCode',
    url: 'https://vscode.dev',
    app: 'code',
    aliases: ['vscode', 'vs code', 'visual studio code', 'code', 'editor', 'codigo', 'código'],
  },
  {
    name: 'GitHub',
    url: 'https://github.com',
    aliases: ['github', 'git', 'repositorio', 'repositório'],
  },
  {
    name: 'Notion',
    url: 'https://notion.so',
    app: 'notion',
    aliases: ['notion', 'notas', 'notes'],
  },
  {
    name: 'Figma',
    url: 'https://figma.com',
    aliases: ['figma', 'design'],
  },
  // ── AI Tools ─────────────────────────────────────────────────────
  {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    aliases: ['chatgpt', 'gpt', 'openai', 'chat gpt'],
  },
  {
    name: 'Claude',
    url: 'https://claude.ai',
    aliases: ['claude', 'anthropic'],
  },
  {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    aliases: ['gemini', 'bard'],
  },
  {
    name: 'Perplexity',
    url: 'https://perplexity.ai',
    aliases: ['perplexity'],
  },
  // ── Communication ─────────────────────────────────────────────────
  {
    name: 'Discord',
    url: 'https://discord.com/app',
    app: 'discord',
    aliases: ['discord'],
  },
  {
    name: 'WhatsApp',
    url: 'https://web.whatsapp.com',
    aliases: ['whatsapp', 'whats', 'zap'],
  },
  {
    name: 'Telegram',
    url: 'https://web.telegram.org',
    app: 'telegram-desktop',
    aliases: ['telegram'],
  },
  {
    name: 'Gmail',
    url: 'https://mail.google.com',
    aliases: ['gmail', 'email', 'e-mail', 'correio'],
  },
  {
    name: 'Slack',
    url: 'https://app.slack.com',
    app: 'slack',
    aliases: ['slack'],
  },
  {
    name: 'Microsoft Teams',
    url: 'https://teams.microsoft.com',
    aliases: ['teams', 'microsoft teams'],
  },
  // ── Browsers & Search ─────────────────────────────────────────────
  {
    name: 'Google',
    url: 'https://google.com',
    aliases: ['google', 'pesquisa', 'busca', 'search'],
  },
  {
    name: 'Chrome',
    url: 'https://google.com',
    app: 'google-chrome',
    aliases: ['chrome', 'google chrome'],
  },
  {
    name: 'Firefox',
    url: 'https://firefox.com',
    app: 'firefox',
    aliases: ['firefox', 'mozilla'],
  },
  {
    name: 'Brave',
    url: 'https://brave.com',
    app: 'brave-browser',
    aliases: ['brave'],
  },
  // ── Social ───────────────────────────────────────────────────────
  {
    name: 'Reddit',
    url: 'https://reddit.com',
    aliases: ['reddit'],
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com',
    aliases: ['twitter', 'x', 'tweet'],
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com',
    aliases: ['linkedin'],
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com',
    aliases: ['instagram', 'insta'],
  },
  // ── Games & Entertainment ─────────────────────────────────────────
  {
    name: 'Steam',
    url: 'https://store.steampowered.com',
    app: 'steam',
    aliases: ['steam', 'jogos', 'games'],
  },
  {
    name: 'Prime Video',
    url: 'https://primevideo.com',
    aliases: ['prime', 'prime video', 'amazon prime'],
  },
  // ── Education / PUCPR ────────────────────────────────────────────
  {
    name: 'Canvas PUCPR',
    url: 'https://canvas.pucpr.br',
    aliases: [
      'canvas',
      'canvas puc',
      'canvas pucpr',
      'canvas da puc',
      'puc canvas',
      'portal da puc',
      'portal puc',
      'pucpr',
      'faculdade',
      'universidade',
      'ead',
      'aulas online',
      'plataforma',
    ],
  },
  {
    name: 'Google Classroom',
    url: 'https://classroom.google.com',
    aliases: ['classroom', 'google classroom'],
  },
  {
    name: 'Moodle',
    url: 'https://moodle.org',
    aliases: ['moodle'],
  },
  // ── Finance ───────────────────────────────────────────────────────
  {
    name: 'Nubank',
    url: 'https://nubank.com.br/cobrar',
    aliases: ['nubank', 'banco', 'financas', 'finanças'],
  },
  // ── Utilities ────────────────────────────────────────────────────
  {
    name: 'Google Drive',
    url: 'https://drive.google.com',
    aliases: ['drive', 'google drive', 'arquivos google'],
  },
  {
    name: 'Google Docs',
    url: 'https://docs.google.com',
    aliases: ['docs', 'google docs', 'documentos'],
  },
  {
    name: 'Google Sheets',
    url: 'https://sheets.google.com',
    aliases: ['sheets', 'planilha', 'excel google'],
  },
  {
    name: 'Calendar',
    url: 'https://calendar.google.com',
    aliases: ['calendario', 'calendar', 'agenda'],
  },
  {
    name: 'Terminal',
    url: '',
    app: 'x-terminal-emulator',
    aliases: ['terminal', 'bash', 'shell', 'console'],
  },
];

// ─── Open-intent verbs ────────────────────────────────────────────────────────
const OPEN_RE = /(?:abra?(?:\s+o|\s+a)?|abrir(?:\s+o|\s+a)?|abre(?:\s+o|\s+a)?|abra(?:\s+o|\s+a)?|inicia?r?|launcha?r?|open|start|vai\s+para|acessa?r?|entre\s+no?|entra\s+no?)\s+(.+)/i;

// ─── Play/music intent ────────────────────────────────────────────────────────
const MUSIC_RE =
  /(?:toque|tocar|play(?:ing)?|reproduzir|colocar?|quero\s+ouvir|ouv(?:ir|indo))\s+(.+)/i;

// ─── YouTube search ───────────────────────────────────────────────────────────
const YT_RE =
  /(?:pesquise?|busque?|search|procure?|encontre?)\s+(.+?)\s+(?:no\s+)?(?:youtube|yt)/i;

// ─── Raw "want to watch" intent ───────────────────────────────────────────────
const WATCH_RE = /(?:quero\s+(?:ver|assistir|watch))\s+(.+)/i;

function normalise(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .trim();
}

function matchService(query: string): ServiceEntry | null {
  const q = normalise(query);
  // Longest-alias-first so "youtube music" beats "youtube"
  const sorted = [...SERVICES].sort(
    (a, b) =>
      Math.max(...b.aliases.map((a) => a.length)) -
      Math.max(...a.aliases.map((a) => a.length))
  );
  for (const svc of sorted) {
    for (const alias of svc.aliases) {
      const na = normalise(alias);
      if (q === na || q.startsWith(na + ' ') || q.endsWith(' ' + na) || q.includes(na)) {
        return svc;
      }
    }
  }
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function detectUserCommand(text: string): ParsedCommand | null {
  const lower = text.toLowerCase().trim();

  // ── 1. Music play → YouTube search ────────────────────────────────
  const musicMatch = lower.match(MUSIC_RE);
  if (musicMatch) {
    const query = musicMatch[1].replace(/[.!?]$/, '').trim();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    return {
      action: 'open_url',
      target: url,
      displayName: `YouTube: ${query}`,
      speech: `Procurando ${query} no YouTube.`,
    };
  }

  // ── 2. Watch intent → YouTube search ─────────────────────────────
  const watchMatch = lower.match(WATCH_RE);
  if (watchMatch) {
    const query = watchMatch[1].replace(/[.!?]$/, '').trim();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    return {
      action: 'open_url',
      target: url,
      displayName: `YouTube: ${query}`,
      speech: `Buscando ${query}.`,
    };
  }

  // ── 3. YouTube search ──────────────────────────────────────────────
  const ytMatch = lower.match(YT_RE);
  if (ytMatch) {
    const query = ytMatch[1].replace(/[.!?]$/, '').trim();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    return {
      action: 'open_url',
      target: url,
      displayName: `YouTube: "${query}"`,
      speech: `Pesquisando ${query} no YouTube.`,
    };
  }

  // ── 4. Open intent ─────────────────────────────────────────────────
  const openMatch = lower.match(OPEN_RE);
  if (openMatch) {
    const target = openMatch[1].replace(/[.!?]$/, '').trim();
    const svc = matchService(target);
    if (svc) {
      // Prefer native app if available
      if (svc.app) {
        return {
          action: 'open_app',
          target: svc.app,
          displayName: svc.name,
          speech: `Abrindo ${svc.name}.`,
        };
      }
      return {
        action: 'open_url',
        target: svc.url,
        displayName: svc.name,
        speech: `Conectando ao ${svc.name}.`,
      };
    }
  }

  // ── 5. Bare name match (without open verb) ─────────────────────────
  // e.g. "spotify" or "canvas" alone
  const svc = matchService(lower.replace(/[.!?]$/, '').trim());
  if (svc && lower.split(' ').length <= 4) {
    if (svc.app) {
      return {
        action: 'open_app',
        target: svc.app,
        displayName: svc.name,
        speech: `Abrindo ${svc.name}.`,
      };
    }
    if (svc.url) {
      return {
        action: 'open_url',
        target: svc.url,
        displayName: svc.name,
        speech: `Conectando ao ${svc.name}.`,
      };
    }
  }

  return null;
}

// ─── AI CMD protocol ──────────────────────────────────────────────────────────
const CMD_REGEX = /\[CMD:(\{[^}]+\})\]/;

export interface AiCommand {
  action: string;
  target: string;
}

export function extractAiCommand(text: string): AiCommand | null {
  const match = text.match(CMD_REGEX);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as AiCommand;
  } catch {
    return null;
  }
}

export function stripAiCommand(text: string): string {
  return text.replace(CMD_REGEX, '').trim();
}

// ─── Execution via API route ───────────────────────────────────────────────────
export async function executeCommand(action: string, target: string): Promise<void> {
  try {
    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, target }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'unknown' }));
      console.warn('[commandParser] Command failed:', err.error);
    }
  } catch (err) {
    console.error('[commandParser] Network error:', err);
  }
}
