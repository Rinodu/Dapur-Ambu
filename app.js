(() => {
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let introTimer;
  function playIntro() {
    if (reducedMotion.matches) return;
    clearTimeout(introTimer);
    body.classList.remove('intro-running');
    void body.offsetWidth;
    body.classList.add('intro-running');
    introTimer = setTimeout(() => body.classList.remove('intro-running'), 3600);
  }
  playIntro();
  document.querySelector('.replay').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    playIntro();
  });

  const motionControl = document.querySelector('.motion-control');
  motionControl.addEventListener('click', () => {
    const paused = body.classList.toggle('motion-paused');
    motionControl.setAttribute('aria-pressed', String(paused));
    motionControl.setAttribute('aria-label', paused ? 'Lanjutkan animasi' : 'Jeda animasi');
    document.querySelector('.motion-label').textContent = paused ? 'Lanjutkan animasi' : 'Jeda animasi';
    if (paused) document.querySelectorAll('.cake').forEach(cake => {
      cake.style.setProperty('--dx', '0px');
      cake.style.setProperty('--dy', '0px');
    });
  });

  const hero = document.querySelector('.hero');
  const cakes = [...document.querySelectorAll('.cake')];
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', event => {
      if (reducedMotion.matches || body.classList.contains('motion-paused')) return;
      const box = hero.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      cakes.forEach((cake, index) => {
        const depth = (index + 1) * 7;
        cake.style.setProperty('--dx', `${x * depth}px`);
        cake.style.setProperty('--dy', `${y * depth}px`);
      });
    });
    hero.addEventListener('pointerleave', () => cakes.forEach(cake => {
      cake.style.setProperty('--dx', '0px');
      cake.style.setProperty('--dy', '0px');
    }));
  }

  const dialog = document.querySelector('.order-dialog');
  document.querySelectorAll('[data-order]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
})();