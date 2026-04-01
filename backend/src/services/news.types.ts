export interface CryptoNewsArticle {
  id: string;
  title: string;
  url: string;
  published_at: string;
  source: string;
  content?: string;
  publishedAt?: string;
}

export interface FetchNewsOptions {
  limit?: number;
  filter?: 'hot' | 'latest' | 'rising' | 'bullish' | 'bearish';
}

export interface NewsStatus {
  configured: boolean;
  isFetching: boolean;
  lastFetch?: string;
  fetchIntervalMs?: number;
}

