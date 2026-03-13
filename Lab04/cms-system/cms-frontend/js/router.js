// ── App State ─────────────────────────────────────────────────────────────
const state = {
  user: null,
  token: localStorage.getItem('cms_token'),
};

// ── Router ────────────────────────────────────────────────────────────────
const routes = {};

function route(hash, fn) {
  routes[hash] = fn;
}

async function navigate(hash) {
  window.location.hash = hash;
}

async function handleRoute() {
  const raw = window.location.hash.slice(1) || '/';
  // Extract base path and params
  // Support /view/some-slug style routes — match registered prefix
  const [withoutQuery, ...queryParts] = raw.split('?');
  const segments = withoutQuery.split('/').filter(Boolean);

  // Check for prefix routes like /view/:slug → registered as /view
  let path = withoutQuery;
  let params = Object.fromEntries(new URLSearchParams(queryParts.join('?')));

  if (segments.length >= 2) {
    const prefix = '/' + segments[0];
    if (routes[prefix]) {
      path = prefix;
      params = { ...params, slug: segments.slice(1).join('/') };
    }
  }

  const [_path, ...rest] = raw.split('?');
  void _path; void rest; // legacy compat

  // Auth guard
  if (path !== '/login' && !state.token) {
    return navigate('/login');
  }
  if (path === '/login' && state.token) {
    return navigate('/dashboard');
  }

  // Lazy-load user on first nav
  if (state.token && !state.user) {
    try {
      const res = await api.me();
      state.user = res.data;
      renderUserBadge();
    } catch {
      logout();
      return;
    }
  }

  const handler = routes[path];
  if (handler) {
    await handler(params);
  } else {
    navigate('/dashboard');
  }
}

function logout() {
  state.user = null;
  state.token = null;
  api.setToken(null);
  navigate('/login');
}

function renderUserBadge() {
  const el = document.getElementById('user-badge');
  if (!el || !state.user) return;
  const roleColors = { admin: '#FF6B6B', editor: '#FFD93D', author: '#6BCB77', viewer: '#4D96FF' };
  el.innerHTML = `
    <span class="badge-avatar">${state.user.name.charAt(0).toUpperCase()}</span>
    <span class="badge-info">
      <span class="badge-name">${state.user.name}</span>
      <span class="badge-role" style="color:${roleColors[state.user.role] || '#aaa'}">${state.user.role}</span>
    </span>
  `;
}

window.state = state;
window.navigate = navigate;
window.logout = logout;
window.route = route;
window.handleRoute = handleRoute;

window.addEventListener('hashchange', handleRoute);
