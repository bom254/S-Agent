import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { newsService } from '../services/news.service.js';
import { Article } from '../models/index.js';

const router = Router();

const fetchNewsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional(),
  filter: z.enum(['hot', 'latest', 'rising', 'bullish', 'bearish']).optional(),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const parsed = fetchNewsSchema.safeParse(req.query);
    
    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: parsed.error.errors,
      });
      return;
    }

    const articles = await newsService.fetchNews(parsed.data);
    
    // Format dates for frontend display
    const formattedArticles = articles.map(article => ({
      ...article,
      publishedAt: article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) : 'No date',
      published_at: undefined // Avoid frontend confusion
    }));
    
    res.json({
      success: !!articles.length,
      data: formattedArticles,
      count: articles.length,
      status: newsService.status(),
    });
  } catch (error) {
    console.error('Articles route error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch articles',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findByPk(id as string);

    if (!article) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Article not found',
      });
      return;
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch article',
    });
  }
});

router.post('/sync', async (_req: Request, res: Response) => {
  try {
    const articles = await newsService.fetchNews({ limit: 20 });
    
    if (articles.length === 0) {
      res.json({
        success: true,
        message: 'No articles available to sync (check API key)',
        count: 0,
        status: newsService.status(),
      });
      return;
    }

    // Upsert logic (update if exists)
    const results = await Promise.all(
      articles.map(async (articleData) => {
        const data = {
          source: articleData.source,
          title: articleData.title,
          url: String(articleData.url),
          publishedAt: new Date(articleData.published_at),
          content: articleData.content || null,
          metadata: {
            synced_at: new Date().toISOString(),
          },
        };

        try {
          const [article, created] = await Article.findOrCreate({
            where: { url: data.url as string },
            defaults: data,
          });

          if (!created) {
            await article.update({
              publishedAt: data.publishedAt,
              content: data.content,
              metadata: data.metadata,
            });
          }

          return article;
        } catch (err) {
          console.error(`Failed to sync ${articleData.url}:`, err);
          return null;
        }
      })
    );

    const successCount = results.filter(Boolean).length;

    res.json({
      success: true,
      message: `Synced/Upserted ${successCount} articles`,
      count: successCount,
      status: newsService.status(),
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: 'SYNC_FAILED',
      message: 'Failed to sync articles',
    });
  }
});

router.post('/start', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      intervalMs: z.coerce.number().min(500).max(10000).optional().default(1000),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        details: parsed.error.errors,
      });
    } else {
      await newsService.startPeriodicFetch(parsed.data.intervalMs);
      res.json({
        success: true,
        message: 'Periodic news fetching started',
        status: newsService.status(),
      });
    }
  } catch (error) {
    console.error('Start fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'START_FAILED',
      message: error instanceof Error ? error.message : 'Failed to start fetching',
    });
  }
});

router.post('/stop', async (_req: Request, res: Response) => {
  try {
    newsService.stopPeriodicFetch();
    
    res.json({
      success: true,
      message: 'Periodic news fetching stopped',
      status: newsService.status(),
    });
  } catch (error) {
    console.error('Stop fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'STOP_FAILED',
      message: 'Failed to stop fetching',
    });
  }
});

router.get('/status', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: newsService.status(),
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: 'STATUS_FAILED',
      message: 'Failed to get status',
    });
  }
});

export default router;
