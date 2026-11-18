// Light/dark switch in the header. The choice is remembered in this browser;
// until the visitor picks one, the page follows the system setting.
(() => {
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');

  const saved = () => { try { return localStorage.getItem('theme'); } catch (e) { return null; } };
  const isDark = () => root.getAttribute('data-theme') === 'dark' || (!root.hasAttribute('data-theme') && system.matches);

  const render = () => {
    const dark = isDark();
    root.classList.toggle('is-dark', dark);
    const label = dark ? 'Włącz tryb jasny' : 'Włącz tryb ciemny';
    button.setAttribute('aria-label', label);
    const text = button.querySelector('.theme-label');
    if (text) text.textContent = label;
  };

  button.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode: works for this page only */ }
    render();
  });
  system.addEventListener('change', () => { if (!saved()) render(); });
  render();
})();
