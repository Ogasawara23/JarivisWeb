import type { SearchResponse } from '@/types';

export async function searchWeb(query: string): Promise<SearchResponse> {
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Search API error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('[searchService] error:', error);
    return {
      results: [],
      query,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

export function formatSearchContext(response: SearchResponse): string {
  if (!response.results.length) return '';

  const lines = response.results.slice(0, 5).map((r, i) => {
    return `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.description}`;
  });

  return `\n\n--- RESULTADOS DE PESQUISA NA INTERNET ---\nConsulta: "${response.query}"\n\n${lines.join('\n\n')}\n--- FIM DOS RESULTADOS ---\n\n`;
}
