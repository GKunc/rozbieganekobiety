(() => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById('lead-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  // Messages live in data-msg-* attributes on the form so they can be translated in HTML.
  const msg = (key) => form.dataset['msg' + key[0].toUpperCase() + key.slice(1)] || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = msg('sending');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = msg('success');
    } catch {
      status.textContent = msg('error');
    }
  });
})();
