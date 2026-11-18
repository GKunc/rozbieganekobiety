// Phone menu: the button in the header shows and hides the nav links.
(() => {
  const button = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  if (!button || !nav) return;

  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };

  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      button.focus();
    }
  });
})();
