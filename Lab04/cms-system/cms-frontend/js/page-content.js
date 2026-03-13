let _contentPage = 1;
let _contentFilters = { status: '', type: '' };

route('/content', async (params) => {
  _contentPage = parseInt(params.page) || 1;
  _contentFilters = { status: params.status || '', type: params.type || '' };

  renderShell('content', 'Content', `<div class="empty-state"><div class="loading-spinner" style="margin:0 auto"></div></div>`);
  await loadContentList();
});

async function loadContentList() {
  try {
    const queryParams = {
      page: _contentPage,
      limit: 15,
      ..._contentFilters.status && { status: _contentFilters.status },
      ..._contentFilters.type   && { type:   _contentFilters.type },
    };

    const res = await api.listContent(queryParams);
    const items = res.items || [];

    const canEdit = ['admin', 'editor', 'author'].includes(state.user?.role);
    const canPublish = ['admin', 'editor'].includes(state.user?.role);
    const canDelete  = ['admin', 'editor'].includes(state.user?.role);

    document.getElementById('main-content').innerHTML = `
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title">Content</div>
          <div class="page-subtitle">${res.total} items total</div>
        </div>
        ${canEdit ? `<button class="btn btn-primary" onclick="navigate('/editor')">+ New Content</button>` : ''}
      </div>

      <div class="card">
        <div class="filters-bar">
          <select class="filter-select" id="filter-status" onchange="applyContentFilter()">
            <option value="">All Statuses</option>
            <option value="published" ${_contentFilters.status === 'published' ? 'selected' : ''}>Published</option>
            <option value="draft"     ${_contentFilters.status === 'draft'     ? 'selected' : ''}>Draft</option>
            <option value="archived"  ${_contentFilters.status === 'archived'  ? 'selected' : ''}>Archived</option>
          </select>
          <select class="filter-select" id="filter-type" onchange="applyContentFilter()">
            <option value="">All Types</option>
            <option value="article" ${_contentFilters.type === 'article' ? 'selected' : ''}>Article</option>
            <option value="post"    ${_contentFilters.type === 'post'    ? 'selected' : ''}>Post</option>
            <option value="page"    ${_contentFilters.type === 'page'    ? 'selected' : ''}>Page</option>
          </select>
          <div style="flex:1"></div>
          <span class="text-mono">${res.total} results</span>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Author</th>
                <th>Views</th>
                <th>Created</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody id="content-tbody">
              ${items.length ? items.map(c => `
                <tr data-id="${c._id}">
                  <td class="td-title" style="max-width:280px">
                    <div style="font-weight:500;color:var(--text-1)">${truncate(c.title, 55)}</div>
                    <div style="margin-top:3px;display:flex;align-items:center;gap:6px">
                      <span class="text-mono">${c.slug}</span>
                      ${c.status === 'published'
                        ? `<a href="#/view/${c.slug}" style="font-size:10px;color:var(--accent);font-family:var(--font-mono);opacity:0.7" title="Public URL">↗ public</a>`
                        : `<button onclick="previewContent('${c.slug}')" style="font-size:10px;color:var(--yellow);font-family:var(--font-mono);background:none;border:none;cursor:pointer;padding:0;opacity:0.8" title="Preview draft">⏵ preview</button>`
                      }
                    </div>
                  </td>
                  <td><span class="badge badge--blue">${c.type}</span></td>
                  <td>${statusBadge(c.status)}</td>
                  <td style="font-size:13px;color:var(--text-2)">${c.author?.name || '—'}</td>
                  <td class="text-mono">${c.viewCount || 0}</td>
                  <td class="text-mono">${formatDate(c.createdAt).split(',')[0]}</td>
                  <td>
                    <div class="gap-2" style="justify-content:flex-end">
                      <button class="btn btn-ghost btn-sm" title="${c.status === 'published' ? 'View public page' : 'Preview draft'}"
                        onclick="${c.status === 'published' ? `navigate('/view/${c.slug}')` : `previewContent('${c.slug}')`}">
                        ${c.status === 'published' ? 'View' : 'Preview'}
                      </button>
                      ${canEdit ? `<button class="btn btn-ghost btn-sm" onclick="navigate('/editor?id=${c._id}')">Edit</button>` : ''}
                      ${canPublish && c.status === 'draft' ? `
                        <button class="btn btn-secondary btn-sm" onclick="publishContent('${c._id}')">Publish</button>
                      ` : ''}
                      ${canDelete ? `
                        <button class="btn btn-danger btn-sm" onclick="deleteContent('${c._id}', '${c.title.replace(/'/g, "\\'")}')">Del</button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="7">
                  <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <div class="empty-title">No content found</div>
                    <div class="empty-text">Try adjusting filters or create new content</div>
                  </div>
                </td></tr>
              `}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        ${res.pages > 1 ? `
          <div class="pagination">
            <div class="pagination-info">Page ${res.page} of ${res.pages} — ${res.total} total</div>
            <button class="page-btn" onclick="goContentPage(${res.page - 1})" ${res.page <= 1 ? 'disabled' : ''}>‹</button>
            ${Array.from({ length: Math.min(res.pages, 7) }, (_, i) => {
              const p = i + 1;
              return `<button class="page-btn ${p === res.page ? 'active' : ''}" onclick="goContentPage(${p})">${p}</button>`;
            }).join('')}
            <button class="page-btn" onclick="goContentPage(${res.page + 1})" ${res.page >= res.pages ? 'disabled' : ''}>›</button>
          </div>
        ` : ''}
      </div>
    `;
  } catch (err) {
    document.getElementById('main-content').innerHTML = `
      <div class="error-banner">Failed to load content: ${err.message}</div>
    `;
  }
}

function applyContentFilter() {
  _contentFilters.status = document.getElementById('filter-status').value;
  _contentFilters.type   = document.getElementById('filter-type').value;
  _contentPage = 1;
  loadContentList();
}

function goContentPage(page) {
  _contentPage = page;
  loadContentList();
}

async function publishContent(id) {
  try {
    await api.publishContent(id);
    toast('Content published!', 'success');
    loadContentList();
  } catch (err) {
    toast(err.message, 'error');
  }
}

async function deleteContent(id, title) {
  const ok = await confirm(`Delete "${truncate(title, 60)}"? This cannot be undone.`, 'Delete Content');
  if (!ok) return;
  try {
    await api.deleteContent(id);
    toast('Content deleted', 'success');
    loadContentList();
  } catch (err) {
    toast(err.message, 'error');
  }
}

window.applyContentFilter = applyContentFilter;
window.goContentPage = goContentPage;
window.publishContent = publishContent;
window.deleteContent = deleteContent;

// ── Preview draft content in a modal overlay ──────────────────────────────
async function previewContent(slug) {
  try {
    const res = await api.previewBySlug(slug);
    const c = res.data;
    showPreviewModal(c);
  } catch (err) {
    toast('Preview failed: ' + err.message, 'error');
  }
}

function showPreviewModal(c) {
  // Remove existing modal if any
  document.getElementById('preview-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'preview-modal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(13,15,20,0.85);backdrop-filter:blur(6px);
    z-index:9990;display:flex;align-items:flex-start;justify-content:center;
    padding:40px 20px;overflow-y:auto;
  `;

  modal.innerHTML = `
    <div style="
      background:var(--bg-2);border:1px solid var(--border-2);border-radius:12px;
      width:100%;max-width:780px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.5);
      animation:fadeInUp .25s cubic-bezier(0.16,1,0.3,1) both;
    ">
      <!-- Modal toolbar -->
      <div style="
        display:flex;align-items:center;gap:12px;padding:14px 20px;
        border-bottom:1px solid var(--border);background:var(--bg-3);
      ">
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-3)">PREVIEW</span>
          <span style="color:var(--border-2)">·</span>
          ${statusBadge(c.status)}
          <span style="font-family:var(--font-mono);font-size:11px;color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.slug}</span>
        </div>
        <div style="display:flex;gap:8px">
          ${c.status === 'draft' && ['admin','editor'].includes(state.user?.role) ? `
            <button class="btn btn-secondary btn-sm" onclick="publishContent('${c._id}');document.getElementById('preview-modal').remove()">
              Publish
            </button>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="navigate('/editor?id=${c._id}');document.getElementById('preview-modal').remove()">
            Edit
          </button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('preview-modal').remove()">✕</button>
        </div>
      </div>

      <!-- Article content -->
      <div style="padding:40px 48px 60px">
        <!-- Meta -->
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap">
          <span class="badge badge--blue">${c.type}</span>
          ${(c.tags || []).map(t => `<span class="badge badge--gray">${t}</span>`).join('')}
          <span style="color:var(--text-3);font-size:12px;font-family:var(--font-mono);margin-left:auto">
            ${c.author?.name || ''} · ${formatDate(c.createdAt).split(',')[0]}
          </span>
        </div>

        <!-- Title -->
        <h1 style="
          font-family:var(--font-display);font-size:34px;font-weight:800;
          letter-spacing:-0.8px;line-height:1.2;color:var(--text-1);margin-bottom:16px;
        ">${c.title}</h1>

        <!-- Excerpt -->
        ${c.excerpt ? `
          <p style="
            font-size:17px;color:var(--text-2);line-height:1.7;
            border-left:3px solid var(--accent);padding-left:16px;
            margin-bottom:28px;font-style:italic;
          ">${c.excerpt}</p>
        ` : ''}

        <!-- Divider -->
        <div style="height:1px;background:var(--border);margin-bottom:28px"></div>

        <!-- Body -->
        <div style="
          font-size:16px;line-height:1.85;color:var(--text-2);
        " class="preview-body">${c.body}</div>

        <!-- SEO section (if exists) -->
        ${c.seo?.metaTitle ? `
          <div style="
            margin-top:40px;padding:16px 20px;border-radius:8px;
            background:var(--bg-3);border:1px solid var(--border);
          ">
            <div style="font-family:var(--font-mono);font-size:10px;color:var(--text-3);letter-spacing:.08em;margin-bottom:10px">SEO METADATA</div>
            <div style="font-size:13px;color:var(--text-2);display:flex;flex-direction:column;gap:6px">
              <div><span style="color:var(--text-3);margin-right:8px">Title:</span>${c.seo.metaTitle}</div>
              <div><span style="color:var(--text-3);margin-right:8px">Desc:</span>${c.seo.metaDescription || '—'}</div>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Close on Escape
  const onKey = (e) => { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);

  document.body.appendChild(modal);
}

window.previewContent = previewContent;
window.showPreviewModal = showPreviewModal;
