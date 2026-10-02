(() => {
  const track = document.querySelector('.step-grid');
  if (!track) return;
  const cards = [...track.querySelectorAll('.step')];
  const mobile = matchMedia('(max-width: 700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controls = document.createElement('div');
  controls.className = 'steps-controls';
  controls.innerHTML = '<button type="button" class="step-prev" aria-label="Langkah sebelumnya">←</button><div class="step-dots"></div><span class="step-status" aria-live="polite" aria-atomic="true"></span><button type="button" class="step-next" aria-label="Langkah berikutnya">→</button>';
  track.after(controls);
  const prev = controls.querySelector('.step-prev');
  const next = controls.querySelector('.step-next');
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
    if (!mobile.matches) return;
    const index = cards.reduce((best, card, i) =>
      Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft) <
      Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - track.scrollLeft) ? i : best, 0);
    if (index === current) return;
    current = index;
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
    prev.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    status.textContent = `${index + 1} / ${cards.length}`;
    if (window.gsap && animated()) gsap.fromTo(cards[index].querySelector('.step-icon'),
      { y: 7 }, { y: 0, duration: .45, ease: 'power2.out', overwrite: true, clearProps: 'transform' });
  }
  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  track.tabIndex = 0;
  track.addEventListener('keydown', event => {
    if (!mobile.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    go(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { current = -1; update(); });
  update();
})();
