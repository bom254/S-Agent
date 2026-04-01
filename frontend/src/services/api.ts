const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export const api = {
  // Health
  health: () => fetchAPI('/health'),
  
  // Articles
  getArticles: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/api/articles${query ? `?${query}` : ''}`);
  },
  syncArticles: () => fetchAPI('/api/articles/sync', { method: 'POST' }),
  
  // Insights
  getInsights: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/api/insights${query ? `?${query}` : ''}`);
  },
  analyzeInsights: (data = {}) => fetchAPI('/api/insights/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Auth
  login: (credentials: { email: string; password: string }) => fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (data: { email: string; password: string; name: string }) => fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Users
  getUser: (id: string) => fetchAPI(`/api/users/${id}`),
  
  // Agent
  getAgentStatus: () => fetchAPI('/api/agent/status'),
  startAgent: () => fetchAPI('/api/agent/start', { method: 'POST' }),
  stopAgent: () => fetchAPI('/api/agent/stop', { method: 'POST' }),
  runAgent: (limit = 5) => fetchAPI(`/api/agent/run?limit=${limit}`, { method: 'POST' }),
};