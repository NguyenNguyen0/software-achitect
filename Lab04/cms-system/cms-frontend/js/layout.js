function renderShell(activeNav, title, content) {
  document.getElementById('app').innerHTML = `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-mark">C</div>
          <div>
            <div class="logo-text">CMS Studio</div>
            <div class="logo-version">v1.0.0 · Hybrid</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-section-label">Main</div>
          ${[
            { id: 'dashboard', label: 'Dashboard', icon: '⊞', hash: '/dashboard' },
            { id: 'content',   label: 'Content',   icon: '≡', hash: '/content' },
            { id: 'editor',    label: 'New Post',   icon: '+', hash: '/editor' },
          ].map(item => `
            <button class="nav-item ${activeNav === item.id ? 'active' : ''}"
              onclick="navigate('${item.hash}')">
              <span class="nav-icon">${item.icon}</span>
              ${item.label}
            </button>
          `).join('')}

          ${state.user?.role === 'admin' ? `
            <div class="nav-section-label" style="margin-top:12px">Admin</div>
            <button class="nav-item ${activeNav === 'users' ? 'active' : ''}" onclick="navigate('/users')">
              <span class="nav-icon">◎</span> Users
            </button>
          ` : ''}
          <div class="nav-section-label" style="margin-top:12px">System</div>
          <button class="nav-item ${activeNav === 'search' ? 'active' : ''}" onclick="navigate('/search')">
            <span class="nav-icon">◯</span> Search
          </button>
          <button class="nav-item ${activeNav === 'plugins' ? 'active' : ''}" onclick="navigate('/plugins')">
            <span class="nav-icon">⊕</span> Plugins
          </button>
        </nav>
        <div class="sidebar-footer">
          <div id="user-badge"></div>
          <button class="logout-btn" onclick="logout()">
            <span>↩</span> Sign out
          </button>
        </div>
      </aside>

      <!-- Header -->
      <header class="app-header">
        <div class="header-title">${title}</div>
        <div class="header-search">
          <span class="header-search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input type="text" placeholder="Search content…" id="global-search" />
        </div>
      </header>

      <!-- Main -->
      <main class="main-content" id="main-content">
        ${content}
      </main>
    </div>

    <div id="toast-container"></div>
    <div id="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading...</div>
    </div>
    <div id="confirm-modal">
      <div class="modal-box">
        <div class="modal-title"></div>
        <div class="modal-message"></div>
        <div class="modal-actions">
          <button class="btn btn-secondary modal-cancel">Cancel</button>
          <button class="btn btn-danger modal-ok">Delete</button>
        </div>
      </div>
    </div>
  `;

  renderUserBadge();

  // Global search
  let searchTimer;
  document.getElementById('global-search')?.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const q = e.target.value.trim();
    if (q.length > 1) {
      searchTimer = setTimeout(() => navigate('/search?q=' + encodeURIComponent(q)), 400);
    }
  });
}

window.renderShell = renderShell;
