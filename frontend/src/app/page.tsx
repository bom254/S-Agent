'use client';

import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Article, Insight, AgentStatus } from '../types';

export default function AuthPage() {
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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('sagent_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (isRegister) {
        const result = await api.register({ email, password, name });
        if (result.success) {
          localStorage.setItem('sagent_user', JSON.stringify(result.data));
          setUser(result.data);
          setEmail('');
          setPassword('');
          setName('');
        }
      } else {
        const result = await api.login({ email, password });
        if (result.success) {
          localStorage.setItem('sagent_user', JSON.stringify(result.data));
          setUser(result.data);
          setEmail('');
          setPassword('');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadData() {
    try {
      const params = user?.id ? { userId: user.id } : {};
      const [articlesRes, insightsRes, statusRes] = await Promise.all([
        api.getArticles({ ...params, limit: 10 }),
        api.getInsights({ ...params, limit: 10 }),
        api.getAgentStatus(),
      ]);

      if (articlesRes.success && articlesRes.data) {
        setArticles(articlesRes.data as Article[]);
      }
      if (insightsRes.success && insightsRes.data) {
        setInsights(insightsRes.data as Insight[]);
      }
      if (statusRes.success && statusRes.data) {
        setStatus(statusRes.data as AgentStatus);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setDashboardLoading(false);
    }
  }

  async function handleSyncArticles() {
    try {
      setSyncing(true);
      await api.syncArticles();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync articles');
    } finally {
      setSyncing(false);
    }
  }

  async function handleRunAgent() {
    try {
      setRunning(true);
      await api.runAgent(5);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run agent');
    } finally {
      setRunning(false);
    }
  }

  async function handleStartAgent() {
    try {
      await api.startAgent();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start agent');
    }
  }

  async function handleStopAgent() {
    try {
      await api.stopAgent();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop agent');
    }
  }

  function handleLogout() {
    localStorage.removeItem('sagent_user');
    setUser(null);
    setArticles([]);
    setInsights([]);
    setStatus(null);
  }

  if (dashboardLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <main>
        <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>S-Agent</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            DeFi Research Autonomous Agent
          </p>
          
          {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}
          
          <div className="card">
            <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            <form onSubmit={handleAuth}>
              {isRegister && (
                <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem' }}>Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>
              )}
              <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  required
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn btn-success" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => { setIsRegister(!isRegister); setError(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isRegister ? 'Sign In' : 'Create one'}
              </button>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {error && <div className="error">{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="agent-controls">
          <button 
            className="btn btn-success" 
            onClick={handleRunAgent}
            disabled={running}
          >
            {running ? 'Running...' : 'Run Agent'}
          </button>
          {status?.isRunning ? (
            <button className="btn btn-danger" onClick={handleStopAgent}>
              Stop Agent
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleStartAgent}>
              Start Agent
            </button>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleSyncArticles}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync Articles'}
          </button>
        </div>
        
        <div>
          <span style={{ marginRight: '1rem', color: 'var(--text-secondary)' }}>
            Welcome, {user.name || user.email}
          </span>
          <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{articles.length}</div>
          <div className="stat-label">Articles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{insights.length}</div>
          <div className="stat-label">Insights</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            <span className="status-indicator">
              <span className={`status-dot ${status?.isRunning ? 'active' : 'inactive'}`}></span>
              {status?.isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
          <div className="stat-label">Agent Status</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{status?.articlesAnalyzed || 0}</div>
          <div className="stat-label">Articles Analyzed</div>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <h2>Recent Articles</h2>
          {articles.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No articles yet</p>
          ) : (
            <div>
              {articles.slice(0, 5).map((article) => (
                <div key={article.id} className="article-item">
                  <div className="article-title">{article.title}</div>
                  <div className="article-meta">
                    {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                    {article.sentiment && (
                      <span className={`badge badge-${article.sentiment}`} style={{ marginLeft: '0.5rem' }}>
                        {article.sentiment}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Latest Insights</h2>
          {insights.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No insights yet</p>
          ) : (
            <div>
              {insights.slice(0, 5).map((insight) => (
                <div key={insight.id} className="insight-item">
                  <span className={`badge badge-${insight.sentiment}`}>
                    {insight.sentiment}
                  </span>
                  <p className="insight-summary" style={{ marginTop: '0.5rem' }}>
                    {insight.summary}
                  </p>
                  {insight.keyPoints.length > 0 && (
                    <ul className="insight-points">
                      {insight.keyPoints.slice(0, 3).map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}
                  {insight.tags.length > 0 && (
                    <div className="tags">
                      {insight.tags.map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Agent Configuration</h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>Status:</strong>{' '}
              {status?.isConfigured ? (
                <span style={{ color: 'var(--accent-green)' }}>Configured</span>
              ) : (
                <span style={{ color: 'var(--accent-yellow)' }}>Not Configured</span>
              )}
            </p>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>Last Analysis:</strong>{' '}
              {status?.lastAnalysis 
                ? new Date(status.lastAnalysis).toLocaleString() 
                : 'Never'}
            </p>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>API Endpoint:</strong>{' '}
              <span style={{ fontFamily: 'monospace' }}>http://localhost:3001</span>
            </p>
            <p style={{ marginBottom: '0.75rem' }}>
              <strong>AI Provider:</strong> {status?.provider || 'Nosana'}
            </p>
            <p>
              <strong>AI Model:</strong> {status?.model || 'Qwen3.5-27B-AWQ'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}