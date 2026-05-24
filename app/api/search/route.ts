import { NextRequest, NextResponse } from 'next/server';

const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';
const TIMEOUT_MS = 7000;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) {
      // Graceful fallback: return empty results (AI will answer from its own knowledge)
      return NextResponse.json({
        results: [],
        query,
        error: 'BRAVE_SEARCH_API_KEY not configured — using AI knowledge only',
      });
    }

    const url = new URL(BRAVE_API_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('count', '8');
    url.searchParams.set('search_lang', 'pt');
    url.searchParams.set('safesearch', 'moderate');
    url.searchParams.set('freshness', 'pm'); // past month

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error('[/api/search] Brave API error:', response.status, errText);
      return NextResponse.json({
        results: [],
        query,
        error: `Brave Search error: ${response.status}`,
      });
    }

    const data = await response.json();

    // Parse results from Brave response format
    const results = (data.web?.results || []).map(
      (item: {
        title: string;
        url: string;
        description?: string;
        extra_snippets?: string[];
      }) => ({
        title: item.title || '',
        url: item.url || '',
        description:
          item.description ||
          (item.extra_snippets && item.extra_snippets[0]) ||
          '',
      })
    );

    return NextResponse.json({ results, query });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({
        results: [],
        query: '',
        error: 'Search timed out',
      });
    }

    console.error('[/api/search] Error:', error);
    return NextResponse.json({
      results: [],
      query: '',
      error: 'Internal server error',
    });
  }
}
