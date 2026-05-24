import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// ─── Allowed URLs (domain whitelist) ──────────────────────────────────────────
const ALLOWED_DOMAINS = new Set([
  'youtube.com',
  'music.youtube.com',
  'open.spotify.com',
  'spotify.com',
  'chatgpt.com',
  'chat.openai.com',
  'claude.ai',
  'gemini.google.com',
  'perplexity.ai',
  'discord.com',
  'github.com',
  'mail.google.com',
  'google.com',
  'netflix.com',
  'twitch.tv',
  'reddit.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'notion.so',
  'figma.com',
  'web.whatsapp.com',
  'web.telegram.org',
  'app.slack.com',
  'teams.microsoft.com',
  'instagram.com',
  'store.steampowered.com',
  'primevideo.com',
  // Education
  'canvas.pucpr.br',
  'classroom.google.com',
  'moodle.org',
  // Productivity
  'drive.google.com',
  'docs.google.com',
  'sheets.google.com',
  'calendar.google.com',
  'vscode.dev',
  // Finance
  'nubank.com.br',
  // Browsers
  'brave.com',
  'firefox.com',
]);

// ─── Allowed native app binaries ──────────────────────────────────────────────
const ALLOWED_APPS: Record<string, { binary: string; webFallback: string }> = {
  'code':              { binary: 'code',              webFallback: 'https://vscode.dev' },
  'spotify':           { binary: 'spotify',           webFallback: 'https://open.spotify.com' },
  'discord':           { binary: 'discord',           webFallback: 'https://discord.com/app' },
  'firefox':           { binary: 'firefox',           webFallback: 'https://firefox.com' },
  'google-chrome':     { binary: 'google-chrome',     webFallback: 'https://google.com' },
  'brave-browser':     { binary: 'brave-browser',     webFallback: 'https://brave.com' },
  'chromium-browser':  { binary: 'chromium-browser',  webFallback: 'https://google.com' },
  'x-terminal-emulator': { binary: 'x-terminal-emulator', webFallback: '' },
  'steam':             { binary: 'steam',             webFallback: 'https://store.steampowered.com' },
  'notion':            { binary: 'notion',            webFallback: 'https://notion.so' },
  'slack':             { binary: 'slack',             webFallback: 'https://app.slack.com' },
  'telegram-desktop':  { binary: 'telegram-desktop',  webFallback: 'https://web.telegram.org' },
};

// ─── URL validation ───────────────────────────────────────────────────────────
function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;

    const host = parsed.hostname.replace(/^www\./, '');

    // Always allow youtube.com search queries (music)
    if (host === 'youtube.com' || host === 'www.youtube.com') return true;

    // Check exact domain or subdomain of allowed domain
    return [...ALLOWED_DOMAINS].some(
      (d) => host === d || host.endsWith('.' + d)
    );
  } catch {
    return false;
  }
}

// ─── Check if binary is installed ─────────────────────────────────────────────
async function isInstalled(binary: string): Promise<boolean> {
  try {
    await execAsync(`which ${binary}`);
    return true;
  } catch {
    return false;
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, target } = body as { action: string; target: string };

    if (!action || !target) {
      return NextResponse.json({ error: 'action and target required' }, { status: 400 });
    }

    // ── Open App (hybrid: try native first, fallback to web) ─────────────────
    if (action === 'open_app') {
      const appKey = target.toLowerCase().trim();
      const appEntry = ALLOWED_APPS[appKey];

      if (!appEntry) {
        return NextResponse.json(
          { error: `App "${target}" não está na whitelist.` },
          { status: 403 }
        );
      }

      // Check if the native binary exists
      const installed = await isInstalled(appEntry.binary);

      if (installed) {
        console.log(`[JARVIS/command] Launching native app: ${appEntry.binary}`);
        exec(`${appEntry.binary} &`);
        return NextResponse.json({ success: true, method: 'native', app: appEntry.binary });
      }

      // Fallback to web
      if (appEntry.webFallback) {
        console.log(`[JARVIS/command] App not found, opening web fallback: ${appEntry.webFallback}`);
        if (!isAllowedUrl(appEntry.webFallback)) {
          return NextResponse.json({ error: 'Web fallback URL not in whitelist' }, { status: 403 });
        }
        await execAsync(`xdg-open "${appEntry.webFallback}"`);
        return NextResponse.json({ success: true, method: 'web-fallback', url: appEntry.webFallback });
      }

      return NextResponse.json({ error: `App "${target}" não encontrado.` }, { status: 404 });
    }

    // ── Open URL ──────────────────────────────────────────────────────────────
    if (action === 'open_url') {
      let url = target;

      // If not a URL, treat as a YouTube search query
      if (!url.startsWith('http')) {
        const safe = encodeURIComponent(url.replace(/[<>"|\&;`$(){}]/g, '').trim().slice(0, 200));
        url = `https://www.youtube.com/results?search_query=${safe}`;
      }

      if (!isAllowedUrl(url)) {
        console.warn('[JARVIS/command] Blocked URL:', url);
        return NextResponse.json({ error: 'URL não autorizada pela política de segurança.' }, { status: 403 });
      }

      console.log('[JARVIS/command] Opening URL:', url);
      await execAsync(`xdg-open "${url}"`);
      return NextResponse.json({ success: true, method: 'url', url });
    }

    return NextResponse.json({ error: `Ação desconhecida: ${action}` }, { status: 400 });

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[JARVIS/command] Error:', msg);
    return NextResponse.json({ error: 'Falha ao executar comando.' }, { status: 500 });
  }
}
