route('/login', async () => {
  document.getElementById('app').innerHTML = `
    <div class="login-page">
      <div class="login-left">
        <div class="login-brand">
          <div class="login-logo-mark">C</div>
          <div class="login-brand-name">CMS Studio</div>
          <div class="login-brand-sub">A hybrid microkernel content management system built on Node.js + MongoDB</div>
          <div class="login-features">
            <div class="login-feature"><span class="login-feature-dot"></span>Microkernel plugin architecture</div>
            <div class="login-feature"><span class="login-feature-dot"></span>Role-based access control</div>
            <div class="login-feature"><span class="login-feature-dot"></span>Full-text search via MongoDB</div>
            <div class="login-feature"><span class="login-feature-dot"></span>Auto SEO meta generation</div>
            <div class="login-feature"><span class="login-feature-dot"></span>Real-time event bus</div>
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form-wrap">
          <div class="login-form-title">Welcome back</div>
          <div class="login-form-sub">Sign in to your CMS workspace</div>

          <div id="login-error" class="error-banner" style="display:none"></div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input id="l-email" type="email" class="form-input" placeholder="admin@cms.dev" autocomplete="email" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input id="l-password" type="password" class="form-input" placeholder="••••••••" autocomplete="current-password" />
          </div>

          <button id="l-submit" class="btn btn-primary" style="width:100%;justify-content:center;height:42px;font-size:14px;margin-top:8px">
            Sign in
          </button>

          <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border)">
            <div style="font-size:12px;color:var(--text-3);font-family:var(--font-mono);margin-bottom:10px;">DEMO ACCOUNTS</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${[
                ['admin@cms.dev', 'Admin1234!', 'admin'],
                ['editor@cms.dev', 'Editor123!', 'editor'],
                ['author@cms.dev', 'Author123!', 'author'],
              ].map(([email, pw, role]) => `
                <button class="demo-login-btn btn btn-secondary btn-sm" data-email="${email}" data-pw="${pw}"
                  style="justify-content:space-between;font-size:12px;">
                  <span style="font-family:var(--font-mono)">${email}</span>
                  <span class="badge badge--${role === 'admin' ? 'blue' : role === 'editor' ? 'yellow' : 'green'}">${role}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Quick-fill demo accounts
  document.querySelectorAll('.demo-login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('l-email').value = btn.dataset.email;
      document.getElementById('l-password').value = btn.dataset.pw;
    });
  });

  async function doLogin() {
    const email = document.getElementById('l-email').value.trim();
    const password = document.getElementById('l-password').value;
    const errEl = document.getElementById('login-error');
    const btn = document.getElementById('l-submit');

    if (!email || !password) {
      errEl.textContent = 'Please fill in all fields';
      errEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Signing in…';
    errEl.style.display = 'none';

    try {
      const res = await api.login(email, password);
      api.setToken(res.data.token);
      state.token = res.data.token;
      state.user = res.data.user;
      toast('Welcome back, ' + res.data.user.name + '!', 'success');
      navigate('/dashboard');
    } catch (err) {
      errEl.textContent = err.message;
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  }

  document.getElementById('l-submit').addEventListener('click', doLogin);
  document.getElementById('l-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });
});
