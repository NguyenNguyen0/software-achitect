// ── Toast notifications ───────────────────────────────────────────────────
function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(el);

  requestAnimationFrame(() => el.classList.add('toast--visible'));
  setTimeout(() => {
    el.classList.remove('toast--visible');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

// ── Loading overlay ───────────────────────────────────────────────────────
function setLoading(active, text = 'Loading...') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  if (active) {
    overlay.querySelector('.loading-text').textContent = text;
    overlay.classList.add('active');
  } else {
    overlay.classList.remove('active');
  }
}

// ── Confirm modal ─────────────────────────────────────────────────────────
function confirm(message, title = 'Confirm') {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return resolve(false);
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-message').textContent = message;
    modal.classList.add('active');

    const ok = modal.querySelector('.modal-ok');
    const cancel = modal.querySelector('.modal-cancel');

    const cleanup = (val) => {
      modal.classList.remove('active');
      ok.removeEventListener('click', onOk);
      cancel.removeEventListener('click', onCancel);
      resolve(val);
    };
    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    ok.addEventListener('click', onOk);
    cancel.addEventListener('click', onCancel);
  });
}

// ── Format helpers ────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
}

function truncate(str, max = 100) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function statusBadge(status) {
  const map = {
    published: { label: 'Published', cls: 'badge--green' },
    draft:     { label: 'Draft',     cls: 'badge--yellow' },
    archived:  { label: 'Archived',  cls: 'badge--gray' },
  };
  const s = map[status] || { label: status, cls: 'badge--gray' };
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

window.toast = toast;
window.setLoading = setLoading;
window.confirm = confirm;
window.formatDate = formatDate;
window.truncate = truncate;
window.statusBadge = statusBadge;
