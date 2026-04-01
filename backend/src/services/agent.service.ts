import { elizaService } from '../services/eliza.service.js';
import { Article, Insight, sequelize } from '../models/index.js';
import { Transaction } from 'sequelize';

export interface AgentState {
  isRunning: boolean;
  lastAnalysis: Date | null;
  articlesAnalyzed: number;
}

class AgentService {
  private state: AgentState = {
    isRunning: false,
    lastAnalysis: null,
    articlesAnalyzed: 0,
  };

  getState(): AgentState {
    return { ...this.state };
  }

  async start(): Promise<void> {
    this.state.isRunning = true;
    console.log('[Agent] S-Agent started (ElizaOS + Qwen3.5)');
  }

  async stop(): Promise<void> {
    this.state.isRunning = false;
    console.log('[Agent] S-Agent stopped');
  }

  async analyzeArticles(userId: string, limit: number = 5): Promise<number> {
    if (!this.state.isRunning) {
      throw new Error('Agent is not running');
    }

    let articles: Article[];
    try {
      articles = await sequelize.transaction(async (transaction: Transaction) => {
        return await Article.findAll({
          limit,
          order: [['createdAt', 'DESC']],
          transaction,
        });
      });
    } catch (error: any) {
      console.error('[Agent] DB transaction failed, retrying:', error.message);
      await new Promise(r => setTimeout(r, 2000));
      articles = await Article.findAll({
        limit,
        order: [['createdAt', 'DESC']],
      });
    }

    console.log(`[Agent] Analyzing ${articles.length} articles with Qwen3.5...`);

    for (const article of articles) {
      const analysis = await elizaService.analyzeArticle(
        article.title,
        article.content || ''
      );

      await Insight.create({
        articleId: article.id,
        userId,
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        tags: analysis.tags,
        keyPoints: analysis.keyPoints,
      });

      this.state.articlesAnalyzed++;
      console.log(`[Agent] Analyzed: ${article.title.slice(0, 40)}... -> ${analysis.sentiment}`);
    }

    this.state.lastAnalysis = new Date();
    return articles.length;
  }

  isConfigured(): boolean {
    return elizaService.isConfigured();
  }
}

export const agentService = new AgentService();
