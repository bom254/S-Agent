export interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  content: string;
  publishedAt: string;
  sentiment?: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  summary: string;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  tags: string[];
  keyPoints: string[];
  createdAt: string;
  article?: Article;
}

export interface AgentStatus {
  isRunning: boolean;
  isConfigured: boolean;
  lastAnalysis: string | null;
  articlesAnalyzed: number;
  model?: string;
  provider?: string;
}

export interface User {
  id: string;
  telegramId?: string;
  email?: string;
  name?: string;
  preferences: Record<string, unknown>;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
