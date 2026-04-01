import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import articlesRouter from './api/articles.routes.js';
import insightsRouter from './api/insights.routes.js';
import usersRouter from './api/users.routes.js';
import authRouter from './api/auth.routes.js';
import agentRouter from './api/agent.routes.js';
import { initDatabase } from './models/index.js';

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet({
  contentSecurityPolicy: false,
}));

const allowedOrigins = isProduction 
  ? [process.env.FRONTEND_URL || ''].filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/agent/', strictLimiter);
app.use('/api/articles/sync', strictLimiter);

app.disable('x-powered-by');

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'S-Agent API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'S-Agent API',
    version: '1.0.0',
    description: 'DeFi Research Autonomous Agent',
    endpoints: {
      health: '/health',
      articles: '/api/articles',
      insights: '/api/insights',
      users: '/api/users',
      agent: '/api/agent',
    },
  });
});

app.use('/api/articles', articlesRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/agent', agentRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: isProduction ? 'An unexpected error occurred' : err.message,
  });
});

app.use((_req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found',
  });
});

async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`S-Agent API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

startServer();

export default app;