(() => {
  if (!window.gsap || !window.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 700px)');
  const returned = window.dapurReturnFromOrder || document.body.classList.contains('circle-arrival');
  let context;
  let firstRun = !returned;
  const revealed = new WeakSet();
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const preview = document.querySelector('.product-preview');
  let previewTween;
  let closing = false;
  const motionEnabled = () => !reduced.matches && !document.body.classList.contains('motion-paused');
  function resetPreview() {
    previewTween?.kill();
    gsap.set(preview, { clearProps: 'transform,opacity' });
    if (closing) preview.close();
    closing = false;
  }
  window.dapurClosePreview = () => {
    if (closing) return;
    previewTween?.kill();
    if (!motionEnabled()) { preview.close(); resetPreview(); return; }
    closing = true;
    previewTween = gsap.to(preview, { scale: .97, opacity: 0, duration: .18,
      ease: 'power2.in', onComplete: () => { preview.close(); resetPreview(); } });
  };
  preview.addEventListener('cancel', event => {
    if (motionEnabled()) { event.preventDefault(); window.dapurClosePreview(); }
  });
  preview.addEventListener('close', resetPreview);
  document.querySelectorAll('.product-zoom').forEach(button => button.addEventListener('click', () => {
    resetPreview();
    if (motionEnabled()) previewTween = gsap.fromTo(preview, { scale: .95, opacity: 0 },
      { scale: 1, opacity: 1, duration: .3, ease: 'power3.out', clearProps: 'transform,opacity' });
  }));
  document.querySelectorAll('.step').forEach(step => {
    const line = document.createElement('span');
    line.className = 'step-connector';
    line.setAttribute('aria-hidden', 'true');
    step.append(line);
  });
  document.querySelectorAll('.product-card').forEach(card => {
    const image = card.querySelector('.product-photo img');
    const zoom = scale => {
      if (!motionEnabled() || !finePointer.matches || mobile.matches) return;
      context.add(() => gsap.to(image, { scale, duration: .45, ease: 'power2.out', overwrite: true }));
    };
    card.addEventListener('pointerenter', () => zoom(1.045));
    card.addEventListener('pointerleave', () => zoom(1));
  });

  function updateMotion() {
    context?.revert();
    resetPreview();
    document.body.classList.toggle('gsap-hover', motionEnabled() && finePointer.matches && !mobile.matches);
    if (reduced.matches || document.body.classList.contains('motion-paused')) {
      firstRun = false;
      return;
    }
    context = gsap.context(() => {
      if (firstRun) {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro.set('.intro', { visibility: 'visible' })
          .from('.intro-content', { opacity: 0, y: 20, duration: .55 })
          .to('.intro-rule', { scaleX: 1, duration: .65 }, .2)
          .to('.intro-content', { opacity: 0, y: -12, duration: .3 }, .95)
          .to('.intro-top', { yPercent: -105, duration: .75 }, 1.15)
          .to('.intro-bottom', { yPercent: 105, duration: .75 }, 1.15)
          .set('.intro', { visibility: 'hidden' })
          .from('.hero-copy .eyebrow, .title-line, .hero-description, .hero-copy .button, .hero-note',
            { opacity: 0, y: mobile.matches ? 14 : 24, stagger: .065, duration: .65, clearProps: 'opacity,transform' }, 1.45)
          .from('.cake-scene', { opacity: 0, scale: 1.06, duration: .9, clearProps: 'opacity,transform' }, 1.45);
      }
      firstRun = false;
      document.querySelectorAll('.story-section, .product-card').forEach(element => {
        if (revealed.has(element) || element.getBoundingClientRect().top < window.innerHeight) return;
        gsap.timeline({ scrollTrigger: { trigger: element, start: 'top bottom+=24', once: true } })
          .from(element, { y: mobile.matches ? 10 : 16, duration: .7,
            onStart: () => revealed.add(element),
            ease: 'power2.out', immediateRender: false, clearProps: 'transform' });
      });
      document.querySelectorAll('#catalog-title, #steps-title').forEach(heading => {
        if (revealed.has(heading) || heading.getBoundingClientRect().top < window.innerHeight) return;
        gsap.from(heading.querySelectorAll('.heading-line'), {
          y: 18, stagger: .12, duration: .8, ease: 'power3.out', immediateRender: false,
          clearProps: 'transform', onStart: () => revealed.add(heading),
          scrollTrigger: { trigger: heading, start: 'top bottom+=24', once: true }
        });
      });
      gsap.to('.spark', { rotation: '+=35', ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 } });
      document.querySelectorAll('.step').forEach((step, index) => {
        if (revealed.has(step) || step.getBoundingClientRect().top < window.innerHeight) return;
        gsap.timeline({ scrollTrigger: { trigger: step, start: 'top bottom+=24', once: true } })
          .from(step.querySelector(':scope > span'), { y: 12, duration: .5, immediateRender: false,
            clearProps: 'transform', onStart: () => revealed.add(step) })
          .from(step.querySelector('.step-connector'), { scaleX: 0, duration: .6,
            immediateRender: false, clearProps: 'transform', ease: 'power2.out' },
            .15 + (index % (mobile.matches ? 1 : window.innerWidth <= 1100 ? 2 : 4)) * .12);
      });
    });
  }
  reduced.addEventListener('change', updateMotion);
  mobile.addEventListener('change', updateMotion);
  finePointer.addEventListener('change', updateMotion);
  document.querySelector('.motion-control').addEventListener('click', updateMotion);
  updateMotion();
})();
