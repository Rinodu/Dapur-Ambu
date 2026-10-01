(() => {
  const slides = [...document.querySelectorAll('.gallery-slide')];
  const dots = [...document.querySelectorAll('.gallery-dot')];
  const status = document.querySelector('#gallery-status');
  let current = 0;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === current)));
    status.textContent = `${current + 1} / ${slides.length}`;
  }
  document.querySelector('#gallery-prev').addEventListener('click', () => show(current - 1));
  document.querySelector('#gallery-next').addEventListener('click', () => show(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  const stage = document.querySelector('.gallery-stage');
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  let start;
  stage.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') start = [event.clientX, event.clientY]; });
  stage.addEventListener('pointerup', event => {
    if (!start) return;
    const dx = event.clientX - start[0], dy = event.clientY - start[1];
    start = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => { start = null; });
  const dialog = document.querySelector('.gallery-preview');
  const close = () => dialog.close();
  document.querySelector('.preview-close').addEventListener('click', close);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  document.querySelectorAll('.gallery-photo').forEach(button => button.addEventListener('click', () => {
    const img = button.querySelector('img');
    const preview = dialog.querySelector('img');
    preview.src = img.src; preview.alt = img.alt;
    dialog.showModal();
  }));
  show(0);
})();
