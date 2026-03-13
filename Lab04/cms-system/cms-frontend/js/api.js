const API_BASE = 'http://localhost:3000/api';

const api = {
  _token: localStorage.getItem('cms_token'),

  setToken(token) {
    this._token = token;
    if (token) localStorage.setItem('cms_token', token);
    else localStorage.removeItem('cms_token');
  },

  getToken() { return this._token; },

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (this._token) headers['Authorization'] = `Bearer ${this._token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status });
    return data;
  },

  get:    (path)        => api.request('GET',    path),
  post:   (path, body)  => api.request('POST',   path, body),
  patch:  (path, body)  => api.request('PATCH',  path, body),
  delete: (path)        => api.request('DELETE', path),

  // Auth
  login:    (email, password) => api.post('/auth/login', { email, password }),
  me:       ()                => api.get('/auth/me'),

  // Content
  listContent:   (params = {}) => api.get('/content?' + new URLSearchParams(params)),
  getContent:    (id)          => api.get(`/content/${id}`),
  createContent: (data)        => api.post('/content', data),
  updateContent: (id, data)    => api.patch(`/content/${id}`, data),
  publishContent:(id)          => api.post(`/content/${id}/publish`, {}),
  deleteContent: (id)          => api.delete(`/content/${id}`),
  searchContent: (q)           => api.get(`/search?q=${encodeURIComponent(q)}`),
  previewBySlug: (slug)        => api.get(`/content/preview/${slug}`),

  // Users
  listUsers: () => api.get('/users'),

  // Plugins
  plugins: () => api.get('/plugins'),
};

window.api = api;
