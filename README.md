# S-Agent: DeFi Research Autonomous Agent

A production-ready autonomous agent for DeFi research and analysis, powered by Qwen3.5-27B AI model via Nosana decentralized compute.

## 🌟 Features

- **AI-Powered Analysis**: Uses Qwen3.5-27B model via Nosana for intelligent crypto news analysis
- **Real-time News**: Fetches latest crypto news from CryptoPanic API
- **Sentiment Analysis**: Automatically categorizes news as bullish, bearish, or neutral
- **User Authentication**: Secure email/password authentication with JWT
- **RESTful API**: Full backend API with Express.js
- **Modern Dashboard**: Next.js frontend with dark theme UI
- **Agent Orchestration**: Stateful agent with start/stop/run operations
- **Insight Generation**: AI-generated summaries with key points and tags


## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (NeonDB recommended)
- Nosana account for AI inference

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `NOSANA_API_KEY` | Nosana API key for Qwen inference | Yes |
| `QWEN_ENDPOINT` | Qwen model endpoint URL | No |
| `QWEN_MODEL` | Qwen model name | No |
| `CRYPTOPANIC_API_KEY` | CryptoPanic API key for news | Yes |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:3001 |

## 📁 Project Structure

```
s-agent/
├── backend/
│   ├── src/
│   │   ├── api/           # Express routes
│   │   │   ├── articles.routes.ts
│   │   │   ├── insights.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── agent.routes.ts
│   │   ├── db/            # Database configuration
│   │   ├── models/        # Sequelize models (User, Article, Insight, Feedback)
│   │   ├── services/      # Business logic
│   │   │   ├── news.service.ts
│   │   │   ├── eliza.service.ts
│   │   │   └── agent.service.ts
│   │   └── index.ts       # Entry point
│   ├── database/          # SQL schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── services/      # API client
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── Dockerfile             # Container configuration
├── package.json          # Root package (for monorepo)
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT

### Articles
- `GET /api/articles` - Fetch news articles
- `POST /api/articles/sync` - Sync articles from CryptoPanic

### Insights
- `GET /api/insights` - Get AI-generated insights
- `POST /api/insights/analyze` - Analyze articles with AI

### Agent
- `GET /api/agent/status` - Get agent status
- `POST /api/agent/start` - Start the agent
- `POST /api/agent/stop` - Stop the agent
- `POST /api/agent/run` - Run analysis on articles

### Users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/preferences` - Update user preferences

## 🎯 Usage Flow

1. **Register/Login**: Create an account on the frontend
2. **Sync News**: Click "Sync Articles" to fetch latest crypto news
3. **Start Agent**: Click "Start Agent" to begin analysis
4. **Run Analysis**: Click "Run Agent" to analyze articles with AI
5. **View Insights**: See sentiment analysis and key insights

## 🔒 Security

- JWT-based authentication with 7-day expiration
- Password hashing with bcrypt (10 rounds)
- Rate limiting on sensitive endpoints (100 req/15min general, 20 req/15min strict)
- Helmet.js for security headers (CSP, X-Frame-Options, etc.)
- Input validation with Zod
- CORS with configurable origins
- Body parsing limited to 10kb to prevent DoS

## 🛠️ Tech Stack

**Backend:**
- Express.js + TypeScript (strict mode)
- Sequelize ORM + PostgreSQL (NeonDB)
- JWT + bcryptjs for auth
- Qwen3.5-27B via Nosana for AI
- Zod for validation
- Helmet.js + express-rate-limit for security

**Frontend:**
- Next.js 14 + React 18
- TypeScript
- Custom CSS with dark theme

## 🐳 Docker Deployment

```bash
# Build image
docker build -t s-agent .

# Run container
docker run -p 3001:3001 --env-file backend/.env s-agent
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Note**: This project uses Qwen3.5-27B-AWQ-4bit model via Nosana for AI inference. For optimal performance, ensure your Nosana API key is properly configured in the environment variables.