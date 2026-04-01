import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Insight, Article, User, Feedback } from '../models/index.js';
import { elizaService } from '../services/eliza.service.js';

const router = Router();

const analyzeSchema = z.object({
  articleId: z.string().optional(),
  userId: z.string().optional(),
});

const feedbackSchema = z.object({
  insightId: z.string(),
  userId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, limit = '20', skip = '0' } = req.query;

    const insights = await Insight.findAll({
      where: userId ? { userId: userId as string } : undefined,
      include: [
        { model: Article, as: 'article' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(skip),
    });

    const total = await Insight.count({
      where: userId ? { userId: userId as string } : undefined,
    });

    res.json({
      success: true,
      data: insights,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
      },
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.json({
      success: true,
      data: [],
      pagination: { total: 0, limit: Number(req.query.limit) || 20, skip: Number(req.query.skip) || 0 },
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const insight = await Insight.findByPk(id, {
      include: [
        { model: Article, as: 'article' },
        { model: Feedback, as: 'feedback', include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] },
      ],
    });

    if (!insight) {
      res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Insight not found',
      });
      return;
    }

    res.json({
      success: true,
      data: insight,
    });
  } catch (error) {
    console.error('Error fetching insight:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch insight',
    });
  }
});

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const parsed = analyzeSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: parsed.error.errors,
      });
      return;
    }

    let articlesToAnalyze;

    if (parsed.data.articleId) {
      const article = await Article.findByPk(parsed.data.articleId);
      articlesToAnalyze = article ? [article] : [];
    } else {
      articlesToAnalyze = await Article.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
      });
    }

    if (articlesToAnalyze.length === 0) {
      res.json({
        success: true,
        message: 'No articles to analyze',
        data: [],
      });
      return;
    }

    const insights = await Promise.all(
      articlesToAnalyze.map(async (article) => {
        const analysis = await elizaService.analyzeArticle(
          article.title,
          article.content || ''
        );
        
        const insight = await Insight.create({
          articleId: article.id,
          userId: parsed.data.userId,
          summary: analysis.summary,
          sentiment: analysis.sentiment,
          tags: analysis.tags,
          keyPoints: analysis.keyPoints,
        });

        return insight;
      })
    );

    res.json({
      success: true,
      message: `Generated ${insights.length} insights`,
      data: insights,
    });
  } catch (error) {
    console.error('Error analyzing articles:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to analyze articles',
    });
  }
});

router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const parsed = feedbackSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: parsed.error.errors,
      });
      return;
    }

    const feedback = await Feedback.create({
      insightId: parsed.data.insightId,
      userId: parsed.data.userId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to submit feedback',
    });
  }
});

export default router;
