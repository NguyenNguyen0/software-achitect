route('/dashboard', async () => {
  renderShell('dashboard', 'Dashboard', `<div class="empty-state"><div class="loading-spinner" style="margin:0 auto"></div></div>`);

  try {
    const [allContent, publishedContent, draftContent, plugins] = await Promise.all([
      api.listContent({ limit: 5 }),
      api.listContent({ status: 'published', limit: 5 }),
      api.listContent({ status: 'draft', limit: 5 }),
      api.plugins(),
    ]);

    const recent = allContent.items || [];
    const pluginList = plugins.data || [];

    document.getElementById('main-content').innerHTML = `
      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card" style="--accent-color:var(--accent)">
          <div class="stat-icon">📄</div>
          <div class="stat-value">${allContent.total || 0}</div>
          <div class="stat-label">Total Content</div>
        </div>
        <div class="stat-card" style="--accent-color:var(--green)">
          <div class="stat-icon" style="background:rgba(52,211,153,0.1)">✓</div>
          <div class="stat-value" style="color:var(--green)">${publishedContent.total || 0}</div>
          <div class="stat-label">Published</div>
        </div>
        <div class="stat-card" style="--accent-color:var(--yellow)">
          <div class="stat-icon" style="background:rgba(251,191,36,0.1)">✏</div>
          <div class="stat-value" style="color:var(--yellow)">${draftContent.total || 0}</div>
          <div class="stat-label">Drafts</div>
        </div>
        <div class="stat-card" style="--accent-color:var(--accent-3)">
          <div class="stat-icon" style="background:rgba(167,139,250,0.1)">⊕</div>
          <div class="stat-value" style="color:var(--accent-3)">${pluginList.length}</div>
          <div class="stat-label">Active Plugins</div>
        </div>
      </div>

      <!-- Recent + Plugins row -->
      <div style="display:grid;grid-template-columns:1fr 340px;gap:20px">

        <!-- Recent Content -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Recent Content</div>
            <button class="btn btn-secondary btn-sm" onclick="navigate('/content')">View all →</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${recent.length ? recent.map(c => `
                  <tr>
                    <td class="td-title"><a href="#/editor?id=${c._id}">${truncate(c.title, 50)}</a></td>
                    <td><span class="text-mono">${c.type}</span></td>
                    <td>${statusBadge(c.status)}</td>
                    <td style="font-size:12px;color:var(--text-3)">${c.author?.name || '—'}</td>
                    <td class="text-mono">${formatDate(c.createdAt).split(',')[0]}</td>
                    <td>
                      <button class="btn btn-ghost btn-sm" onclick="navigate('/editor?id=${c._id}')">Edit</button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr><td colspan="6">
                    <div class="empty-state" style="padding:30px">
                      <div class="empty-icon">📝</div>
                      <div class="empty-title">No content yet</div>
                      <div class="empty-text" style="margin-top:10px">
                        <button class="btn btn-primary btn-sm" onclick="navigate('/editor')">Create first post</button>
                      </div>
                    </div>
                  </td></tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right column -->
        <div style="display:flex;flex-direction:column;gap:16px">

          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header"><div class="card-title">Quick Actions</div></div>
            <div class="card-body" style="display:flex;flex-direction:column;gap:8px">
              <button class="btn btn-primary" style="justify-content:center" onclick="navigate('/editor')">
                + New Post
              </button>
              <button class="btn btn-secondary" style="justify-content:center" onclick="navigate('/content')">
                Manage Content
              </button>
              ${state.user?.role === 'admin' ? `
              <button class="btn btn-secondary" style="justify-content:center" onclick="navigate('/users')">
                Manage Users
              </button>` : ''}
            </div>
          </div>

          <!-- Plugins -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">Active Plugins</div>
              <span class="badge badge--green">${pluginList.length} running</span>
            </div>
            <div class="card-body">
              ${pluginList.length ? pluginList.map(p => `
                <div class="plugin-item">
                  <div class="plugin-dot"></div>
                  <div class="plugin-name">${p.name}</div>
                  <div class="plugin-version">v${p.version}</div>
                </div>
              `).join('') : '<div style="color:var(--text-3);font-size:13px">No plugins registered</div>'}
            </div>
          </div>

          <!-- User Info -->
          <div class="card">
            <div class="card-header"><div class="card-title">Session</div></div>
            <div class="card-body">
              <div style="font-size:13px;color:var(--text-2);display:flex;flex-direction:column;gap:8px">
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--text-3)">User</span>
                  <span style="font-weight:500;color:var(--text-1)">${state.user?.name || '—'}</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--text-3)">Role</span>
                  <span class="badge badge--blue">${state.user?.role || '—'}</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--text-3)">Email</span>
                  <span style="font-family:var(--font-mono);font-size:11px">${state.user?.email || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('main-content').innerHTML = `
      <div class="error-banner">Failed to load dashboard: ${err.message}</div>
    `;
  }
});
