(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const marker = 'ambu-form-arrival';
  let busy = false;
  const overlay = document.createElement('div');
  overlay.className = 'form-transition';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.append(overlay);
  const radius = Math.hypot(innerWidth, innerHeight) + 24;
  function animate(from, to, done) {
    if (window.gsap) {
      gsap.fromTo(overlay, { clipPath: from }, { clipPath: to, duration: .55,
        ease: 'power3.inOut', onComplete: done });
    } else {
      overlay.animate([{ clipPath: from }, { clipPath: to }],
        { duration: 550, easing: 'ease-in-out', fill: 'forwards' }).finished.then(done);
    }
  }
  let arrival;
  try { arrival = sessionStorage.getItem(marker); sessionStorage.removeItem(marker); } catch {}
  if (arrival === location.pathname && !reduced.matches) {
    document.body.classList.add('circle-arrival');
    overlay.style.clipPath = `circle(${radius}px at 50% 50%)`;
    animate(`circle(${radius}px at 50% 50%)`, 'circle(0px at 50% 50%)', () => overlay.remove());
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey ||
      event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    const toForm = url.pathname.endsWith('/order.html');
    const fromForm = document.body.classList.contains('order-body') &&
      (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html'));
    if (!toForm && !fromForm) return;
    if (reduced.matches) return;
    event.preventDefault();
    if (busy) return;
    busy = true;
    if (!overlay.isConnected) document.body.append(overlay);
    const rect = link.getBoundingClientRect();
    const x = event.detail ? event.clientX : rect.left + rect.width / 2;
    const y = event.detail ? event.clientY : rect.top + rect.height / 2;
    overlay.style.pointerEvents = 'auto';
    animate(`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`, () => {
      try { sessionStorage.setItem(marker, url.pathname); } catch {}
      window.top.location.assign(url.href);
    });
  });
  addEventListener('pageshow', event => {
    if (event.persisted) {
      window.gsap?.killTweensOf(overlay);
      overlay.getAnimations().forEach(animation => animation.cancel());
      overlay.remove();
      busy = false;
    }
  });
})();
