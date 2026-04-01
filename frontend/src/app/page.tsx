'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { Article, Insight, AgentStatus, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Square, RefreshCw, LogOut, TrendingUp, TrendingDown, Minus, Wallet, Brain, FileText, Zap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('sagent_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    else setDashboardLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      const params: Record<string, string> = user?.id ? { userId: user.id, limit: '10' } : { limit: '10' };
      const [articlesRes, insightsRes, statusRes] = await Promise.all([
        fetchAPI(`/api/articles?${new URLSearchParams(params)}`),
        fetchAPI(`/api/insights?${new URLSearchParams(params)}`),
        fetchAPI('/api/agent/status'),
      ]);
      if (articlesRes.success) setArticles(articlesRes.data || []);
      if (insightsRes.success) setInsights(insightsRes.data || []);
      if (statusRes.success) setStatus(statusRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setDashboardLoading(false);
    }
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? { email, password, name } : { email, password };
      const result = await fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(body) });
      if (result.success) {
        localStorage.setItem('sagent_user', JSON.stringify(result.data));
        setUser(result.data);
        setEmail(''); setPassword(''); setName('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncArticles() {
    setSyncing(true);
    try {
      await fetchAPI('/api/articles/sync', { method: 'POST' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync articles');
    } finally {
      setSyncing(false);
    }
  }

  async function handleRunAgent() {
    setRunning(true);
    try {
      await fetchAPI('/api/agent/run?limit=5', { method: 'POST' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run agent');
    } finally {
      setRunning(false);
    }
  }

  async function handleStartAgent() {
    try {
      await fetchAPI('/api/agent/start', { method: 'POST' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start agent');
    }
  }

  async function handleStopAgent() {
    try {
      await fetchAPI('/api/agent/stop', { method: 'POST' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop agent');
    }
  }

  function handleLogout() {
    localStorage.removeItem('sagent_user');
    setUser(null);
    setArticles([]); setInsights([]); setStatus(null);
  }

  function getSentimentIcon(sentiment: string) {
    if (sentiment === 'bullish') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (sentiment === 'bearish') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  }

  function getSentimentVariant(sentiment: string) {
    if (sentiment === 'bullish') return 'success';
    if (sentiment === 'bearish') return 'destructive';
    return 'warning';
  }

  if (dashboardLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">S-Agent</CardTitle>
            <CardDescription className="text-muted-foreground">
              DeFi Research Autonomous Agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isRegister ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsRegister(!isRegister); setError(null); }}
                className="text-primary hover:underline"
              >
                {isRegister ? 'Sign In' : 'Create one'}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">S-Agent</h1>
              <p className="text-xs text-muted-foreground">DeFi Research Agent</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.name || user.email?.split('@')[0]}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Button onClick={handleRunAgent} disabled={running} className="gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {running ? 'Running...' : 'Run Agent'}
          </Button>
          {status?.isRunning ? (
            <Button variant="destructive" onClick={handleStopAgent} className="gap-2">
              <Square className="h-4 w-4" />
              Stop Agent
            </Button>
          ) : (
            <Button variant="outline" onClick={handleStartAgent} className="gap-2">
              <Play className="h-4 w-4" />
              Start Agent
            </Button>
          )}
          <Button variant="outline" onClick={handleSyncArticles} disabled={syncing} className="gap-2">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {syncing ? 'Syncing...' : 'Sync Articles'}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{articles.length}</div>
              <p className="text-xs text-muted-foreground">Total articles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insights</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{insights.length}</div>
              <p className="text-xs text-muted-foreground">AI-generated</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agent Status</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${status?.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-2xl font-bold">{status?.isRunning ? 'Running' : 'Stopped'}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analyzed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{status?.articlesAnalyzed || 0}</div>
              <p className="text-xs text-muted-foreground">Articles processed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
            </CardHeader>
            <CardContent>
              {articles.length === 0 ? (
                <p className="text-muted-foreground text-sm">No articles yet. Click "Sync Articles" to fetch news.</p>
              ) : (
                <div className="space-y-4">
                  {articles.slice(0, 5).map((article) => (
                    <div key={article.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium line-clamp-2">{article.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {article.sentiment && (
                        <Badge variant={getSentimentVariant(article.sentiment)} className="ml-2">
                          {article.sentiment}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Latest Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <p className="text-muted-foreground text-sm">No insights yet. Run the agent to analyze articles.</p>
              ) : (
                <div className="space-y-4">
                  {insights.slice(0, 5).map((insight) => (
                    <div key={insight.id} className="space-y-2 border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(insight.sentiment)}
                        <Badge variant={getSentimentVariant(insight.sentiment)}>{insight.sentiment}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{insight.summary}</p>
                      {insight.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {insight.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}