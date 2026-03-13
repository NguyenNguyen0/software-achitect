// ── Search Page ───────────────────────────────────────────────────────────
route('/search', async (params) => {
  const q = params.q || '';
  renderShell('search', 'Search', `<div class="empty-state"><div class="loading-spinner" style="margin:0 auto"></div></div>`);

  let resultsHtml = '';

  if (q) {
    try {
      const res = await api.searchContent(q);
      const items = res.items || [];
      resultsHtml = items.length ? `
        <div style="margin-top:20px;font-size:13px;color:var(--text-3);font-family:var(--font-mono);margin-bottom:12px">
          ${res.total} results for "${escHtml(q)}"
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${items.map(c => `
            <div class="card" style="padding:0">
              <div class="card-body" style="padding:16px 20px">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
                  <div style="flex:1;min-width:0">
                    <a href="#/editor?id=${c._id}" style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--text-1);transition:color .15s"
                       onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--text-1)'">
                      ${escHtml(c.title)}
                    </a>
                    <div style="margin-top:6px;font-size:13px;color:var(--text-2);line-height:1.6">${truncate(c.excerpt || '', 180)}</div>
                    <div style="margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                      ${statusBadge(c.status)}
                      <span class="badge badge--blue">${c.type}</span>
                      ${(c.tags || []).map(t => `<span class="badge badge--gray">${t}</span>`).join('')}
                      <span class="text-mono">by ${c.author?.name || '—'}</span>
                    </div>
                  </div>
                  <button class="btn btn-secondary btn-sm" onclick="navigate('/editor?id=${c._id}')">Edit</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div style="margin-top:20px">
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <div class="empty-title">No results for "${escHtml(q)}"</div>
            <div class="empty-text">Try different keywords</div>
          </div>
        </div>
      `;
    } catch (err) {
      resultsHtml = `<div class="error-banner" style="margin-top:20px">${err.message}</div>`;
    }
  }

  document.getElementById('main-content').innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-title">Search</div>
        <div class="page-subtitle">Full-text search across all content</div>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <div style="position:relative">
          <svg style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-3)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input id="search-input" type="text" class="form-input" style="padding-left:44px;height:48px;font-size:16px"
            placeholder="Search by title, body, or tags…" value="${escHtml(q)}" autofocus />
        </div>
      </div>
    </div>
    <div id="search-results">${resultsHtml}</div>
  `;

  // Live search
  let timer;
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(timer);
    const val = e.target.value.trim();
    if (val.length > 1) {
      timer = setTimeout(async () => {
        try {
          const res = await api.searchContent(val);
          const items = res.items || [];
          document.getElementById('search-results').innerHTML = items.length ? `
            <div style="margin-top:20px;font-size:13px;color:var(--text-3);font-family:var(--font-mono);margin-bottom:12px">${res.total} results</div>
            <div style="display:flex;flex-direction:column;gap:12px">
              ${items.map(c => `
                <div class="card"><div class="card-body" style="padding:14px 18px">
                  <a href="#/editor?id=${c._id}" style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--accent)">${escHtml(c.title)}</a>
                  <div style="margin-top:5px;font-size:13px;color:var(--text-2)">${truncate(c.excerpt || '', 150)}</div>
                  <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
                    ${statusBadge(c.status)}<span class="badge badge--blue">${c.type}</span>
                  </div>
                </div></div>
              `).join('')}
            </div>
          ` : `<div class="empty-state" style="margin-top:20px">
            <div class="empty-icon">🔍</div>
            <div class="empty-title">No results</div>
          </div>`;
        } catch {}
      }, 300);
    }
  });
});

// ── Users Page ────────────────────────────────────────────────────────────
route('/users', async () => {
  if (state.user?.role !== 'admin') { navigate('/dashboard'); return; }

  renderShell('users', 'Users', `<div class="empty-state"><div class="loading-spinner" style="margin:0 auto"></div></div>`);

  try {
    const res = await api.listUsers();
    const users = res.users || [];
    const roleColors = { admin: 'blue', editor: 'yellow', author: 'green', viewer: 'gray' };

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title">Users</div>
          <div class="page-subtitle">${users.length} accounts</div>
        </div>
      </div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div style="width:30px;height:30px;border-radius:7px;background:linear-gradient(135deg,var(--accent),var(--accent-3));display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:700;font-size:13px;color:var(--bg);flex-shrink:0">
                        ${u.name.charAt(0).toUpperCase()}
                      </div>
                      <span style="font-weight:500;color:var(--text-1)">${escHtml(u.name)}</span>
                    </div>
                  </td>
                  <td class="td-mono">${escHtml(u.email)}</td>
                  <td><span class="badge badge--${roleColors[u.role] || 'gray'}">${u.role}</span></td>
                  <td>${u.isActive
                    ? '<span class="badge badge--green">Active</span>'
                    : '<span class="badge badge--gray">Inactive</span>'}</td>
                  <td class="text-mono">${u.lastLoginAt ? formatDate(u.lastLoginAt).split(',')[0] : 'Never'}</td>
                  <td class="text-mono">${formatDate(u.createdAt).split(',')[0]}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('main-content').innerHTML = `<div class="error-banner">${err.message}</div>`;
  }
});

// ── Plugins Page ──────────────────────────────────────────────────────────
route('/plugins', async () => {
  renderShell('plugins', 'Plugins', `<div class="empty-state"><div class="loading-spinner" style="margin:0 auto"></div></div>`);

  try {
    const res = await api.plugins();
    const plugins = res.data || [];

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title">Plugins</div>
          <div class="page-subtitle">Microkernel extensions registered at boot</div>
        </div>
        <span class="badge badge--green">${plugins.length} active</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
        ${plugins.map(p => `
          <div class="card">
            <div class="card-header">
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:36px;height:36px;border-radius:8px;background:rgba(94,234,212,0.1);display:flex;align-items:center;justify-content:center;font-size:18px">⊕</div>
                <div>
                  <div class="card-title">${p.name}</div>
                  <div class="text-mono">v${p.version}</div>
                </div>
              </div>
              <div style="width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)"></div>
            </div>
            <div class="card-body">
              <div style="display:flex;flex-direction:column;gap:8px;font-size:13px">
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--text-3)">Status</span>
                  <span class="badge badge--green">Running</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--text-3)">Registered</span>
                  <span class="text-mono">${formatDate(new Date(p.registeredAt)).split(',')[0]}</span>
                </div>
                ${p.name === 'seo' ? `
                  <div style="margin-top:8px;padding:10px;background:var(--bg-3);border-radius:var(--radius-sm);font-size:12px;color:var(--text-2)">
                    Auto-generates meta title, description and keywords from content events
                  </div>
                ` : ''}
                ${p.name === 'search' ? `
                  <div style="margin-top:8px;padding:10px;background:var(--bg-3);border-radius:var(--radius-sm);font-size:12px;color:var(--text-2)">
                    Full-text search via MongoDB <code style="color:var(--accent)">\$text</code> index on title, body and tags
                  </div>
                  <a href="#/search" class="btn btn-secondary btn-sm" style="justify-content:center;margin-top:4px">Open Search →</a>
                ` : ''}
              </div>
            </div>
          </div>
        `).join('')}

        <!-- Add plugin card -->
        <div class="card" style="border-style:dashed;border-color:var(--border-2);opacity:0.5">
          <div class="card-body" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;gap:10px">
            <div style="font-size:32px;opacity:0.4">⊕</div>
            <div style="font-family:var(--font-display);font-size:14px;font-weight:600;color:var(--text-2)">Add Plugin</div>
            <div style="font-size:12px;color:var(--text-3)">Drop a plugin in src/plugins/ and register in app.js</div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('main-content').innerHTML = `<div class="error-banner">${err.message}</div>`;
  }
});
