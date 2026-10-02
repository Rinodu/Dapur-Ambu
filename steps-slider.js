(() => {
  const track = document.querySelector('.step-grid');
  if (!track) return;
  const cards = [...track.querySelectorAll('.step')];
  const mobile = matchMedia('(max-width: 700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controls = document.createElement('div');
  controls.className = 'steps-controls';
  controls.innerHTML = '<div class="step-dots"></div><span class="step-status" aria-live="polite" aria-atomic="true"></span>';
  track.after(controls);
  const status = controls.querySelector('.step-status');
  const dots = cards.map((card, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Langkah ${index + 1}: ${card.querySelector('h3').textContent}`);
    dot.addEventListener('click', () => go(index));
    controls.querySelector('.step-dots').append(dot);
    return dot;
  });
  let current = -1;
  const animated = () => !reduced.matches && !document.body.classList.contains('motion-paused');
  function go(index) {
    index = Math.max(0, Math.min(cards.length - 1, index));
    track.scrollTo({ left: cards[index].offsetLeft - cards[0].offsetLeft,
      behavior: animated() ? 'smooth' : 'instant' });
  }
  function update() {
    if (!mobile.matches) {
      cards.forEach(card => {
        card.style.removeProperty('--step-scale');
        card.style.removeProperty('--step-blur');
      });
      return;
    }
    const spacing = cards[1].offsetLeft - cards[0].offsetLeft;
    cards.forEach(card => {
      const distance = Math.min(1, Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft) / spacing);
      card.style.setProperty('--step-scale', animated() ? 1 - distance * .08 : 1);
      card.style.setProperty('--step-blur', `${animated() ? distance * 2 : 0}px`);
    });
    const index = cards.reduce((best, card, i) =>
      Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft) <
      Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - track.scrollLeft) ? i : best, 0);
    if (index === current) return;
    current = index;
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    cards.forEach((card, i) => card.classList.toggle('step-active', i === index));
    status.textContent = `${index + 1} / ${cards.length}`;
  }
  track.tabIndex = 0;
  track.addEventListener('keydown', event => {
    if (!mobile.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    go(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let frame;
  track.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = null; update(); });
  }, { passive: true });
  reduced.addEventListener('change', update);
  document.querySelector('.motion-control')?.addEventListener('click', update);
  addEventListener('resize', () => { current = -1; update(); });
  update();
})();
