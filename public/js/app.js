(function () {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored) root.setAttribute('data-theme', stored);

  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const cur = root.getAttribute('data-theme') || 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // Cart badge pop on count increase between navigations
  try {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      const current = parseInt(badge.textContent || '0', 10) || 0;
      const prev = parseInt(sessionStorage.getItem('cartCount') || '0', 10) || 0;
      if (current > prev) {
        badge.classList.add('pop');
        setTimeout(() => badge.classList.remove('pop'), 600);
      }
      sessionStorage.setItem('cartCount', String(current));
    }
  } catch (_) {}

  document.addEventListener('click', async (e) => {
    const t = e.target.closest('.btn-copy');
    if (!t) return;
    e.preventDefault();
    const value = t.dataset.copy || '';
    try {
      await navigator.clipboard.writeText(value);
      const original = t.textContent;
      t.textContent = '✓ Copiado';
      t.classList.add('copied');
      setTimeout(() => {
        t.textContent = original;
        t.classList.remove('copied');
      }, 1600);
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      document.body.removeChild(ta);
    }
  });
})();
