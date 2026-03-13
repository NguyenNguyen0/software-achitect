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
                    <div class="text-mono" style="margin-top:2px">/slug/${c.slug}</div>
                  </td>
                  <td><span class="badge badge--blue">${c.type}</span></td>
                  <td>${statusBadge(c.status)}</td>
                  <td style="font-size:13px;color:var(--text-2)">${c.author?.name || '—'}</td>
                  <td class="text-mono">${c.viewCount || 0}</td>
                  <td class="text-mono">${formatDate(c.createdAt).split(',')[0]}</td>
                  <td>
                    <div class="gap-2" style="justify-content:flex-end">
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
