let _editorContent = null;
let _editorTags = [];
let _editorSaving = false;

route('/editor', async (params) => {
  const isEdit = !!params.id;
  renderShell('editor', isEdit ? 'Edit Content' : 'New Content',
    `<div class="empty-state"><div class="loading-spinner" style="margin:0 auto"></div></div>`);

  _editorContent = null;
  _editorTags = [];

  if (isEdit) {
    try {
      const res = await api.getContent(params.id);
      _editorContent = res.data;
      _editorTags = [...(_editorContent.tags || [])];
    } catch (err) {
      toast('Failed to load content: ' + err.message, 'error');
      navigate('/content');
      return;
    }
  }

  renderEditor();
});

function renderEditor() {
  const c = _editorContent;
  const isEdit = !!c;

  document.getElementById('main-content').innerHTML = `
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-title">${isEdit ? 'Edit Content' : 'New Content'}</div>
        ${isEdit ? `
          <div class="page-subtitle" style="display:flex;align-items:center;gap:8px">
            ${statusBadge(c.status)}
            <span class="text-mono">/slug/${c.slug}</span>
            <span class="text-mono">· ${c.viewCount || 0} views</span>
          </div>
        ` : ''}
      </div>
      <div class="gap-2">
        <button class="btn btn-secondary" onclick="navigate('/content')">← Back</button>
        ${isEdit && c.status === 'draft' && ['admin','editor'].includes(state.user?.role) ? `
          <button class="btn btn-secondary" id="publish-btn" onclick="editorPublish()">Publish</button>
        ` : ''}
        <button class="btn btn-primary" id="save-btn" onclick="editorSave()">
          ${isEdit ? 'Save Changes' : 'Create'}
        </button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start">

      <!-- Left: Main Content -->
      <div style="display:flex;flex-direction:column;gap:16px">

        <!-- Title -->
        <div class="card">
          <div class="card-body">
            <div class="form-group" style="margin:0">
              <label class="form-label">Title *</label>
              <input id="e-title" type="text" class="form-input"
                style="font-family:var(--font-display);font-size:18px;font-weight:600;height:48px"
                placeholder="Enter a compelling title…"
                value="${escHtml(c?.title || '')}" />
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Content Body *</div>
            <div class="gap-2">
              <span class="text-mono" id="word-count">0 words</span>
            </div>
          </div>
          <div class="card-body" style="padding:0">
            <!-- Toolbar -->
            <div class="editor-toolbar">
              ${[
                { cmd: 'bold',          icon: '<b>B</b>',         title: 'Bold' },
                { cmd: 'italic',        icon: '<i>I</i>',         title: 'Italic' },
                { cmd: 'underline',     icon: '<u>U</u>',         title: 'Underline' },
                { sep: true },
                { cmd: 'formatBlock:h2',icon: 'H2',               title: 'Heading 2' },
                { cmd: 'formatBlock:h3',icon: 'H3',               title: 'Heading 3' },
                { cmd: 'formatBlock:p', icon: '¶',                title: 'Paragraph' },
                { sep: true },
                { cmd: 'insertUnorderedList', icon: '≡', title: 'Bullet List' },
                { cmd: 'insertOrderedList',   icon: '1≡', title: 'Numbered List' },
                { sep: true },
                { cmd: 'createLink',    icon: '🔗',               title: 'Link' },
                { cmd: 'formatBlock:blockquote', icon: '❝',       title: 'Quote' },
                { cmd: 'formatBlock:pre', icon: '</>', title: 'Code Block' },
                { sep: true },
                { cmd: 'removeFormat',  icon: '✕',                title: 'Clear Format' },
              ].map(b => b.sep
                ? `<div class="editor-toolbar-sep"></div>`
                : `<button class="editor-toolbar-btn" title="${b.title}"
                    onmousedown="event.preventDefault();editorCmd('${b.cmd}')">${b.icon}</button>`
              ).join('')}
            </div>
            <div id="e-body" class="editor-content" contenteditable="true"
              data-placeholder="Start writing your content here…">
              ${c?.body || ''}
            </div>
          </div>
        </div>

        <!-- Excerpt -->
        <div class="card">
          <div class="card-header"><div class="card-title">Excerpt</div></div>
          <div class="card-body" style="padding:14px">
            <textarea id="e-excerpt" class="form-textarea" style="min-height:80px"
              placeholder="Short description shown in listings… (auto-generated from body if empty)">${escHtml(c?.excerpt || '')}</textarea>
          </div>
        </div>

        <!-- SEO Preview -->
        ${c?.seo?.metaTitle ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title">SEO Preview</div>
              <span class="badge badge--green">Auto-generated</span>
            </div>
            <div class="card-body">
              <div style="background:var(--bg-3);border-radius:var(--radius-sm);padding:14px">
                <div style="color:#4285f4;font-size:18px;font-weight:400;margin-bottom:4px">${c.seo.metaTitle}</div>
                <div style="color:var(--green);font-size:13px;margin-bottom:4px">cms.dev/slug/${c.slug}</div>
                <div style="color:var(--text-2);font-size:13px;line-height:1.5">${c.seo.metaDescription || ''}</div>
              </div>
              ${c.seo.keywords?.length ? `
                <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:5px">
                  ${c.seo.keywords.map(k => `<span class="badge badge--blue">${k}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Right: Meta -->
      <div style="display:flex;flex-direction:column;gap:14px">

        <!-- Publish Settings -->
        <div class="card">
          <div class="card-header"><div class="card-title">Settings</div></div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="e-status" class="form-select">
                <option value="draft"     ${c?.status === 'draft'     ? 'selected':''}>Draft</option>
                <option value="published" ${c?.status === 'published' ? 'selected':''}>Published</option>
                <option value="archived"  ${c?.status === 'archived'  ? 'selected':''}>Archived</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Content Type</label>
              <select id="e-type" class="form-select">
                <option value="article" ${c?.type === 'article' ? 'selected':''}>Article</option>
                <option value="post"    ${c?.type === 'post'    ? 'selected':''}>Post</option>
                <option value="page"    ${c?.type === 'page'    ? 'selected':''}>Page</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="card">
          <div class="card-header"><div class="card-title">Tags</div></div>
          <div class="card-body">
            <div class="tags-input-wrap" id="tags-wrap" onclick="document.getElementById('tags-input').focus()">
              ${_editorTags.map(t => tagChipHtml(t)).join('')}
              <input id="tags-input" class="tags-input" placeholder="Add tag…" />
            </div>
            <div class="form-hint">Press Enter or comma to add</div>
          </div>
        </div>

        <!-- Content Info -->
        ${isEdit ? `
          <div class="card">
            <div class="card-header"><div class="card-title">Info</div></div>
            <div class="card-body">
              <div style="display:flex;flex-direction:column;gap:10px;font-size:12px">
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--text-3)">Created</span>
                  <span class="text-mono">${formatDate(c.createdAt)}</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--text-3)">Updated</span>
                  <span class="text-mono">${formatDate(c.updatedAt)}</span>
                </div>
                ${c.publishedAt ? `
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--text-3)">Published</span>
                  <span class="text-mono">${formatDate(c.publishedAt)}</span>
                </div>` : ''}
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--text-3)">Author</span>
                  <span style="color:var(--text-1)">${c.author?.name || '—'}</span>
                </div>
                <div style="display:flex;justify-content:space-between">
                  <span style="color:var(--text-3)">Views</span>
                  <span class="text-mono">${c.viewCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Danger -->
        ${isEdit && ['admin','editor'].includes(state.user?.role) ? `
          <div class="card" style="border-color:rgba(248,113,113,0.15)">
            <div class="card-header" style="border-color:rgba(248,113,113,0.15)"><div class="card-title" style="color:var(--red)">Danger Zone</div></div>
            <div class="card-body">
              <button class="btn btn-danger" style="width:100%;justify-content:center"
                onclick="deleteContent('${c._id}', '${escHtml(c.title)}')">
                Delete Content
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Word count
  const bodyEl = document.getElementById('e-body');
  function updateWordCount() {
    const words = bodyEl.innerText.trim().split(/\s+/).filter(Boolean).length;
    document.getElementById('word-count').textContent = words + ' words';
  }
  bodyEl.addEventListener('input', updateWordCount);
  updateWordCount();

  // Tags input
  document.getElementById('tags-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(e.target.value.trim().replace(',', ''));
      e.target.value = '';
    }
    if (e.key === 'Backspace' && !e.target.value && _editorTags.length) {
      removeTag(_editorTags[_editorTags.length - 1]);
    }
  });
}

function tagChipHtml(tag) {
  return `<span class="tag-chip">${escHtml(tag)}<span class="tag-chip-remove" onclick="removeTag('${escHtml(tag)}')">✕</span></span>`;
}

function addTag(tag) {
  if (!tag || _editorTags.includes(tag)) return;
  _editorTags.push(tag);
  refreshTagsUI();
}

function removeTag(tag) {
  _editorTags = _editorTags.filter(t => t !== tag);
  refreshTagsUI();
}

function refreshTagsUI() {
  const wrap = document.getElementById('tags-wrap');
  const input = document.getElementById('tags-input');
  if (!wrap) return;
  const chips = wrap.querySelectorAll('.tag-chip');
  chips.forEach(c => c.remove());
  _editorTags.forEach(t => {
    wrap.insertBefore(createTagEl(t), input);
  });
}

function createTagEl(tag) {
  const span = document.createElement('span');
  span.className = 'tag-chip';
  span.innerHTML = `${escHtml(tag)}<span class="tag-chip-remove" onclick="removeTag('${escHtml(tag)}')">✕</span>`;
  return span;
}

function editorCmd(cmd) {
  if (cmd.startsWith('formatBlock:')) {
    document.execCommand('formatBlock', false, cmd.split(':')[1]);
  } else if (cmd === 'createLink') {
    const url = prompt('Enter URL:');
    if (url) document.execCommand('createLink', false, url);
  } else {
    document.execCommand(cmd, false, null);
  }
  document.getElementById('e-body').focus();
}

async function editorSave() {
  if (_editorSaving) return;
  const title   = document.getElementById('e-title').value.trim();
  const body    = document.getElementById('e-body').innerHTML.trim();
  const excerpt = document.getElementById('e-excerpt').value.trim();
  const status  = document.getElementById('e-status').value;
  const type    = document.getElementById('e-type').value;

  if (!title) { toast('Title is required', 'error'); document.getElementById('e-title').focus(); return; }
  if (!body || body === '<br>') { toast('Body content is required', 'error'); return; }

  _editorSaving = true;
  const btn = document.getElementById('save-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  const payload = { title, body, status, type, tags: _editorTags };
  if (excerpt) payload.excerpt = excerpt;

  try {
    if (_editorContent) {
      await api.updateContent(_editorContent._id, payload);
      toast('Content updated!', 'success');
      navigate('/editor?id=' + _editorContent._id);
    } else {
      const res = await api.createContent(payload);
      toast('Content created!', 'success');
      navigate('/editor?id=' + res.data._id);
    }
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = _editorContent ? 'Save Changes' : 'Create';
  } finally {
    _editorSaving = false;
  }
}

async function editorPublish() {
  if (!_editorContent) return;
  try {
    await api.publishContent(_editorContent._id);
    toast('Content published!', 'success');
    navigate('/editor?id=' + _editorContent._id);
  } catch (err) {
    toast(err.message, 'error');
  }
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

window.editorCmd    = editorCmd;
window.editorSave   = editorSave;
window.editorPublish = editorPublish;
window.addTag       = addTag;
window.removeTag    = removeTag;
window.escHtml      = escHtml;
