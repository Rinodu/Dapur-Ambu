(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const isEmbedded = window.self !== window.top;

  function clickPoint(event, link) {
    let rect = link.getBoundingClientRect();
    if (event.detail === 0 && (rect.top < 0 || rect.bottom > innerHeight)) {
      link.scrollIntoView({block: 'center', behavior: 'instant'});
      rect = link.getBoundingClientRect();
    }
    return {
      x: event.detail === 0 ? rect.left + rect.width / 2 : event.clientX,
      y: event.detail === 0 ? rect.top + rect.height / 2 : event.clientY,
    };
  }
  function ordinaryClick(event) {
    return !event.defaultPrevented && event.button === 0 &&
      !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
  }

  // A prepared page never creates another iframe or plays the opening intro.
  if (isEmbedded) {
    document.body.classList.add('circle-arrival');
    document.documentElement.classList.add('portal-preparing');
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || !ordinaryClick(event) || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      event.preventDefault();
      if (link.hasAttribute('data-circle')) {
        window.parent.postMessage({type: 'ambu-portal-navigate', href: url.href, ...clickPoint(event, link)}, location.origin);
      } else {
        // Order pages belong in the main browser, rather than inside the gallery frame.
        window.top.location.assign(url.href);
      }
    });
    return;
  }

  const baseUrl = new URL(location.href);
  const galleryAtStart = document.body.classList.contains('gallery-body');
  const targetUrl = new URL(galleryAtStart ? './' : 'gallery.html', baseUrl);
  const samePage = (first, second) => first.origin === second.origin &&
    first.pathname.replace(/\/index\.html$/, '/') === second.pathname.replace(/\/index\.html$/, '/');
  // A reload makes the current URL the new base page, including history entries
  // that were previously shown inside a prepared frame.
  history.replaceState({...history.state, ambuPortal: false}, '', location.href);
  const baseTitle = document.title;
  const frame = document.createElement('iframe');
  frame.className = 'page-portal';
  frame.title = galleryAtStart ? 'Beranda Dapur Ambu' : 'Galeri custom Dapur Ambu';
  frame.loading = 'eager';
  frame.tabIndex = -1;
  frame.inert = true;
  frame.setAttribute('aria-hidden', 'true');
  frame.dataset.ready = 'false';
  function sizePortal() {
    // Viewport units exclude the reserved scrollbar gutter. Explicit dimensions
    // keep the prepared page aligned with the original page during the reveal.
    frame.style.width = `${innerWidth}px`;
    frame.style.height = `${innerHeight}px`;
  }
  sizePortal();
  addEventListener('resize', sizePortal);
  let visible = false, busy = false, queuedView = null;
  let lastPoint = {x: innerWidth / 2, y: innerHeight / 2};
  let previousFocus;
  const inertBefore = new Map();

  const ready = new Promise((resolve, reject) => {
    frame.addEventListener('error', () => reject(new Error('Prepared page unavailable')), {once: true});
    frame.addEventListener('load', async () => {
      try {
        const page = frame.contentDocument;
        if (!page?.body || (galleryAtStart ? !page.querySelector('.hero') : !page.querySelector('.gallery-ready'))) {
          throw new Error('Prepared page is incomplete');
        }
        const images = [...page.querySelectorAll('img')];
        images.forEach(image => { image.loading = 'eager'; });
        await Promise.allSettled([page.fonts.ready, ...images.map(image => image.decode())]);
        frame.dataset.ready = 'true';
        resolve();
      } catch (error) { reject(error); }
    }, {once: true});
  });
  // Prevent an unhandled rejection if the visitor never opens the prepared page.
  ready.catch(() => {});
  frame.src = targetUrl.href;
  document.body.append(frame);

  function isolatePage(open) {
    for (const element of document.body.children) {
      if (element === frame || element.tagName === 'SCRIPT') continue;
      if (open) {
        inertBefore.set(element, element.inert);
        element.inert = true;
      } else if (inertBefore.has(element)) {
        element.inert = inertBefore.get(element);
      }
    }
    if (!open) inertBefore.clear();
  }
  function coveringRadius(point) {
    return Math.hypot(Math.max(point.x, innerWidth - point.x), Math.max(point.y, innerHeight - point.y)) + 24;
  }
  async function openPortal(point) {
    previousFocus = document.activeElement;
    isolatePage(true);
    document.documentElement.classList.add('portal-active');
    frame.inert = false;
    frame.setAttribute('aria-hidden', 'false');
    frame.contentDocument.documentElement.classList.remove('portal-preparing');
    frame.style.clipPath = `circle(0px at ${point.x}px ${point.y}px)`;
    frame.classList.add('portal-open');
    const animation = frame.animate([
      {clipPath: `circle(0px at ${point.x}px ${point.y}px)`},
      {clipPath: `circle(${coveringRadius(point)}px at ${point.x}px ${point.y}px)`},
    ], {duration: reduced.matches ? 0 : 850, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards'});
    await animation.finished;
    frame.style.clipPath = 'none';
    animation.cancel();
    visible = true;
    document.title = frame.contentDocument.title;
    frame.contentWindow.focus();
  }
  async function closePortal(point) {
    const radius = coveringRadius(point);
    // The old page stays visible while an actual transparent hole grows through it.
    if (!reduced.matches) {
      await new Promise(resolve => {
        let start;
        const draw = time => {
          if (start === undefined) start = time;
          const t = Math.min((time - start) / 850, 1);
          const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const hole = radius * eased;
          const mask = `radial-gradient(circle at ${point.x}px ${point.y}px, transparent ${hole}px, #000 ${hole + 1}px)`;
          frame.style.maskImage = mask;
          frame.style.webkitMaskImage = mask;
          if (t < 1) requestAnimationFrame(draw); else resolve();
        };
        requestAnimationFrame(draw);
      });
    }
    frame.classList.remove('portal-open');
    frame.style.clipPath = '';
    frame.style.maskImage = '';
    frame.style.webkitMaskImage = '';
    frame.inert = true;
    frame.setAttribute('aria-hidden', 'true');
    frame.contentDocument.documentElement.classList.add('portal-preparing');
    visible = false;
    isolatePage(false);
    document.documentElement.classList.remove('portal-active');
    document.title = baseTitle;
    previousFocus?.focus({preventScroll: true});
  }

  async function showPage(open, point, push) {
    if (busy) {
      if (!push) queuedView = {open, point};
      return;
    }
    if (open === visible) return;
    busy = true;
    document.documentElement.classList.add('portal-transitioning');
    lastPoint = point;
    let timeout;
    try {
      if (open) {
        await Promise.race([ready, new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Prepared page timed out')), 15000); })]);
      }
      if (push) history.pushState({ambuPortal: open}, '', open ? targetUrl.href : baseUrl.href);
      if (open) await openPortal(point); else await closePortal(point);
    } catch {
      location.assign(open ? targetUrl.href : baseUrl.href);
    } finally {
      clearTimeout(timeout);
      busy = false;
      document.documentElement.classList.remove('portal-transitioning');
      if (queuedView) {
        const next = queuedView;
        queuedView = null;
        showPage(next.open, next.point, false);
      }
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-circle]');
    if (!link || !ordinaryClick(event) || link.target === '_blank') return;
    const url = new URL(link.href, location.href);
    if (!samePage(url, targetUrl)) return;
    event.preventDefault();
    showPage(true, clickPoint(event, link), true);
  });
  addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || event.data?.type !== 'ambu-portal-navigate') return;
    const url = new URL(event.data.href, baseUrl);
    if (!samePage(url, baseUrl)) return;
    const point = {
      x: Math.max(0, Math.min(innerWidth, Number(event.data.x) || 0)),
      y: Math.max(0, Math.min(innerHeight, Number(event.data.y) || 0)),
    };
    showPage(false, point, true);
  });
  addEventListener('popstate', event => {
    showPage(event.state?.ambuPortal === true, lastPoint, false);
  });
})();
