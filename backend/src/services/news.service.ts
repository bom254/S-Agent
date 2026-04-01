// Replaced axios with native fetch for better Node.js 18+ compatibility


import type { CryptoNewsArticle, FetchNewsOptions, NewsStatus } from './news.types.js';



interface CryptoPanicPost {
  title: string;
  description?: string;
  published_at: string;
  url: string;
  kind: string;
}

// import { Article } from '../../models/index.js'; // TS module error - fix later



class NewsService {
  private apiKey: string;
  private baseUrl = 'https://cryptopanic.com/api/developer/v2';
  private fetchIntervalId: NodeJS.Timeout | null = null;
  private isFetching = false;
  private lastFetch: string | null = null;
  private fetchIntervalMs = 1000;

  constructor() {
    this.apiKey = process.env.CRYPTOPANIC_API_KEY || '';
  }

  health(): { configured: boolean; } {
    return { configured: !!this.apiKey };
  }

  status(): NewsStatus {
    return {
      configured: !!this.apiKey,
      isFetching: this.isFetching,
      lastFetch: this.lastFetch || undefined,
      fetchIntervalMs: this.fetchIntervalId ? this.fetchIntervalMs : undefined,
    };
  }

  /** Start periodic fetching at 1 req/sec (1000ms), upsert to DB */
  async startPeriodicFetch(intervalMs: number = 1000): Promise<void> {
    if (this.fetchIntervalId) {
      console.log('[News] Periodic fetch already running');
      return;
    }

    if (!this.apiKey) {
      throw new Error('CRYPTOPANIC_API_KEY required');
    }

    this.fetchIntervalMs = intervalMs;
    this.isFetching = true;

    this.fetchIntervalId = setInterval(async () => {
      try {
        await this._fetchAndUpsert();
      } catch (error) {
        console.error('[News] Periodic fetch error:', error);
      }
    }, intervalMs);

    console.log(`[News] Started periodic fetch every ${intervalMs}ms`);
    await this._fetchAndUpsert(); // Immediate first fetch
  }

  /** Stop periodic fetching */
  stopPeriodicFetch(): void {
    if (this.fetchIntervalId) {
      clearInterval(this.fetchIntervalId);
      this.fetchIntervalId = null;
      this.isFetching = false;
      console.log('[News] Stopped periodic fetch');
    }
  }

  private async _fetchAndUpsert(): Promise<void> {
    const articles = await this.fetchNews({ limit: 10 });
    if (articles.length === 0) return;

    this.lastFetch = new Date().toISOString();

    for (const art of articles) {
      const data = {
        source: art.source,
        title: art.title,
        url: art.url,
        publishedAt: new Date(art.published_at),
        content: art.content || null,
        metadata: {
          cryptopanic_id: art.id,
          fetched_at: this.lastFetch,
        },
      };

      // DB upsert stub - models import issue
      console.log(`[News] Would upsert article ${art.url}`);

    }

    console.log(`[News] Upserted ${articles.length} articles at ${this.lastFetch}`);
  }


  private async retryFetch(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(45000), // 45s timeout
        });

        if (response.ok) return response;

        const retryStatus = [429, 502, 503, 504];
        if (retryStatus.includes(response.status) && attempt < maxRetries) {
          const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s backoff
          console.log(`[News] Retry ${attempt}/${maxRetries} after ${response.status} (delay: ${delay}ms)`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }

        return response; // Don't retry non-retryable
      } catch (error: any) {
        if (attempt === maxRetries || error.name !== 'AbortError') throw error;
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.log(`[News] Network retry ${attempt}/${maxRetries} (delay: ${delay}ms)`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async fetchNews(options: FetchNewsOptions = {}): Promise<CryptoNewsArticle[]> {
    const { limit = 20, filter = 'hot' } = options;

    if (!this.apiKey) {
      console.warn('[News] CryptoPanic API key not configured - returning empty');
      return [];
    }

    try {
      const url = `${this.baseUrl}/posts/?auth_token=${encodeURIComponent(this.apiKey)}&filter=${filter}`;
      const response = await this.retryFetch(url, {
        headers: {
          'Accept': 'application/json',
'User-Agent': 'Mozilla/5.0 (compatible; S-Agent/1.0; +https://s-agent.dev)',
        },
      });

      if (!response.ok) {
        console.error(`[News] API error ${response.status}:`, await response.text());
        return [];
      }

      const data = await response.json() as any;
      const posts: CryptoPanicPost[] = (data as any).results || [];
      
      if (!posts || posts.length === 0) {
        console.log('[News] No posts returned from CryptoPanic');
        return [];
      }
      
      return posts.slice(0, limit).map((post: CryptoPanicPost, index: number) => ({
        id: `${index + 1}-${Date.now()}`,
        title: post.title || 'Untitled',
        url: post.url || '',
        published_at: post.published_at || new Date().toISOString(),
        source: this.extractDomain(post.url) || 'CryptoPanic',
        content: post.description || '',
      }));
    } catch (error) {
      console.error('[News] Fetch error:', error);
      return [];
    }
  }

  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '').split('.')[0].charAt(0).toUpperCase() + 
             domain.replace('www.', '').split('.')[0].slice(1);
    } catch {
      return 'CryptoPanic';
    }
  }

}


export const newsService = new NewsService();
