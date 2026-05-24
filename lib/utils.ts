import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Detect if the user message likely needs a web search.
 */
export function needsSearch(text: string): boolean {
  const keywords = [
    'hoje', 'agora', 'atual', 'atualidade', 'recente', 'novo', 'nova',
    'noticias', 'notícias', 'news', 'latest', 'recent', 'today', 'now',
    'current', 'this week', 'esta semana', 'this year', 'este ano',
    'aconteceu', 'happened', 'preço', 'preco', 'price', 'valor',
    'quem ganhou', 'who won', 'resultado', 'result', 'clima', 'weather',
    'temperatura', 'temperatura', 'cotação', 'cotacao', 'dólar', 'dollar',
    'bitcoin', 'crypto', 'stock', 'ação', 'pesquise', 'search',
    'encontre', 'find', 'busque', 'lookup',
  ];
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
