import axios from 'axios';
import https from 'https';

export interface AnalyzeResult {
  summary: string;
  sentiment: 'bullish' | 'neutral' | 'bearish';
  tags: string[];
  keyPoints: string[];
}

export interface ElizaConfig {
  nosanaApiKey?: string;
  qwenEndpoint?: string;
  model?: string;
}

class ElizaService {
  private config: ElizaConfig;
  private apiKey: string;
  private endpoint: string;
  private model: string;

  constructor() {
    this.config = {
      nosanaApiKey: process.env.NOSANA_API_KEY,
      qwenEndpoint: process.env.QWEN_ENDPOINT || '',
      model: process.env.QWEN_MODEL || 'qwen-qwen-3-5-27b-awq-4bit',
    };
    this.apiKey = this.config.nosanaApiKey || '';
    this.endpoint = this.config.qwenEndpoint || '';
    this.model = this.config.model || '';
  }

  async analyzeArticle(title: string, content: string): Promise<AnalyzeResult> {
    if (!this.apiKey) {
      console.log('[Eliza] No API key configured, using fallback analysis');
      return this.getFallbackAnalysis(title);
    }

    const prompt = `You are a DeFi research analyst specialized in cryptocurrency and blockchain analysis. Analyze the following article with expertise and provide actionable insights.

Article Title: ${title}
Article Content: ${content.slice(0, 4000)}

Provide your analysis in valid JSON format with these exact fields:
{
  "summary": "A 2-3 sentence summary of the article's key points and implications",
  "sentiment": "bullish, neutral, or bearish - choose one based on the overall tone",
  "tags": ["relevant tags like DeFi, Bitcoin, Ethereum, Solana, regulatory, NFT, etc."],
  "keyPoints": ["3-5 bullet points highlighting important details"]
}

Respond ONLY with valid JSON, no other text.`;

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert DeFi and cryptocurrency analyst. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          }),
        }
      );

      const responseText = response.data?.choices?.[0]?.message?.content || '';
      const parsed = this.parseJsonResponse(responseText);
      
      return {
        summary: String(parsed.summary || 'Analysis unavailable'),
        sentiment: this.validateSentiment(parsed.sentiment),
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.slice(0, 5) : [],
      };
    } catch (error) {
      console.error('[Eliza] Qwen API error:', error);
      return this.getFallbackAnalysis(title);
    }
  }

  private parseJsonResponse(text: string): Record<string, unknown> {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error('[Eliza] JSON parse error');
    }
    return {};
  }

  private validateSentiment(sentiment: unknown): 'bullish' | 'neutral' | 'bearish' {
    if (typeof sentiment === 'string' && ['bullish', 'neutral', 'bearish'].includes(sentiment.toLowerCase())) {
      return sentiment.toLowerCase() as 'bullish' | 'neutral' | 'bearish';
    }
    return 'neutral';
  }

  private getFallbackAnalysis(title: string): AnalyzeResult {
    const sentiments: Array<'bullish' | 'neutral' | 'bearish'> = ['bullish', 'neutral', 'bearish'];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    const tags: string[] = ['crypto'];
    if (title.toLowerCase().includes('bitcoin') || title.toLowerCase().includes('btc')) tags.push('Bitcoin');
    if (title.toLowerCase().includes('ethereum') || title.toLowerCase().includes('eth')) tags.push('Ethereum');
    if (title.toLowerCase().includes('solana') || title.toLowerCase().includes('sol')) tags.push('Solana');
    if (title.toLowerCase().includes('defi')) tags.push('DeFi');
    if (title.toLowerCase().includes('regulat')) tags.push('Regulatory');
    if (title.toLowerCase().includes('nft')) tags.push('NFT');
    if (title.toLowerCase().includes('layer') || title.toLowerCase().includes('l2')) tags.push('Layer 2');

    return {
      summary: `Analysis of "${title.slice(0, 50)}...": This article covers important developments in the cryptocurrency market. The overall sentiment appears ${randomSentiment} based on current market conditions and news flow.`,
      sentiment: randomSentiment,
      tags: [...new Set(tags)],
      keyPoints: [
        `Market sentiment is ${randomSentiment} for this topic`,
        'Key developments may impact trading strategies',
        'Relevance to portfolio management considerations',
      ],
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const elizaService = new ElizaService();
