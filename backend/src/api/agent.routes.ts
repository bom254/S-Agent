import { Router, Request, Response } from 'express';
import { agentService } from '../services/agent.service.js';

const router = Router();

router.get('/status', (_req: Request, res: Response) => {
  const state = agentService.getState();
  res.json({
    success: true,
    data: {
      ...state,
      isConfigured: agentService.isConfigured(),
      model: process.env.QWEN_MODEL || 'qwen-qwen-3-5-27b-awq-4bit',
      provider: 'Nosana/Qwen3.5',
    },
  });
});

router.post('/start', async (_req: Request, res: Response) => {
  try {
    await agentService.start();
    res.json({
      success: true,
      message: 'Agent started successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to start agent',
    });
  }
});

router.post('/stop', async (_req: Request, res: Response) => {
  try {
    await agentService.stop();
    res.json({
      success: true,
      message: 'Agent stopped successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to stop agent',
    });
  }
});

router.post('/run', async (req: Request, res: Response) => {
  try {
    const { userId, limit } = req.query;
    if (!userId) {
      res.status(400).json({ error: 'MISSING_USER_ID', message: 'userId required' });
    } else {
      const analyzed = await agentService.analyzeArticles(userId as string, Number(limit) || 5);
      res.json({
        success: true,
        message: `Analyzed ${analyzed} articles for user ${userId}`,
        analyzed,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Failed to run agent',
    });
  }
});

export default router;
