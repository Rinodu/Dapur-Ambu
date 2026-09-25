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
  if (new URLSearchParams(window.location.search).get('from') === 'order') {
    window.history.replaceState(null, '', window.location.pathname + window.location.hash);
  } else playIntro();
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
  cakes.forEach(cake => {
    let startX, startY;
    cake.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      if (event.pointerType === 'touch' && typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().catch(() => {});
      }
      startX = event.clientX;
      startY = event.clientY;
      cake.setPointerCapture(event.pointerId);
      cake.classList.add('dragging');
    });
    cake.addEventListener('pointermove', event => {
      if (!cake.hasPointerCapture(event.pointerId)) return;
      cake.style.setProperty('--dx', `${event.clientX - startX}px`);
      cake.style.setProperty('--dy', `${event.clientY - startY}px`);
    });
    cake.addEventListener('lostpointercapture', () => {
      cake.classList.remove('dragging');
      cake.style.setProperty('--dx', '0px');
      cake.style.setProperty('--dy', '0px');
    });
    cake.addEventListener('pointerup', event => cake.releasePointerCapture(event.pointerId));
  });
  window.addEventListener?.('deviceorientation', event => {
    if (reducedMotion.matches || body.classList.contains('motion-paused') || event.gamma == null || event.beta == null) return;
    cakes.forEach((cake, index) => {
      if (cake.classList.contains('dragging')) return;
      const depth = (index + 1) * 7;
      cake.style.setProperty('--dx', `${Math.max(-1, Math.min(1, event.gamma / 30)) * depth}px`);
      cake.style.setProperty('--dy', `${Math.max(-1, Math.min(1, event.beta / 30)) * depth}px`);
    });
  });
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', event => {
      if (reducedMotion.matches || body.classList.contains('motion-paused')) return;
      const box = hero.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      cakes.forEach((cake, index) => {
        if (cake.classList.contains('dragging')) return;
        const depth = (index + 1) * 7;
        cake.style.setProperty('--dx', `${x * depth}px`);
        cake.style.setProperty('--dy', `${y * depth}px`);
      });
    });
    hero.addEventListener('pointerleave', () => cakes.forEach(cake => {
      if (cake.classList.contains('dragging')) return;
      cake.style.setProperty('--dx', '0px');
      cake.style.setProperty('--dy', '0px');
    }));
  }

  const preview = document.querySelector('.product-preview');
  const previewImage = preview.querySelector('img');
  document.querySelectorAll('.product-zoom').forEach(button => button.addEventListener('click', () => {
    const image = button.querySelector('img');
    previewImage.src = image.src;
    previewImage.alt = image.alt;
    preview.showModal();
  }));
  preview.querySelector('.preview-close').addEventListener('click', () => preview.close());
  previewImage.addEventListener('click', () => preview.close());

})();
