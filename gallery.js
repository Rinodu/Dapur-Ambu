(() => {
  const stage = document.querySelector('.cake-stage');
  const cakes = [...stage.querySelectorAll('.cake-choice')];
  const images = cakes.map(cake => cake.querySelector('img'));
  const data = JSON.parse(document.querySelector('#cake-data').textContent);
  const story = document.querySelector('.cake-story');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.querySelector('.gallery-preview');
  let active = 0, busy = false, queued = null;
  let slots = [-1, 0, 1, 2, 3];
  function layout() {
    cakes.forEach((cake, index) => {
      cake.dataset.slot = slots[index];
      cake.classList.toggle('is-active', index === active);
      cake.setAttribute('aria-pressed', String(index === active));
      cake.setAttribute('aria-label', index === active ? `Perbesar ${data[index].title}` : `Pilih ${data[index].title}`);
    });
  }
  function updateStory() {
    const item = data[active];
    document.querySelector('#cake-category').textContent = `0${active + 1} / ${item.category}`;
    document.querySelector('#cake-title').textContent = item.title;
    document.querySelector('#cake-description').textContent = item.description;
    document.querySelector('#cake-order').href = `order.html?product=Custom%20Cake&theme=${encodeURIComponent(item.title)}`;
    const source = document.querySelector('#cake-source');
    source.hidden = !item.source;
    if (item.source) source.href = item.source;
  }
  async function choose(index) {
    if (busy) { queued = index; return; }
    if (index === active) return;
    busy = true;
    stage.classList.add('is-swapping');
    const previous = images.map(image => image.getBoundingClientRect());
    const former = active;
    slots[former] = slots[index]; slots[index] = -1; active = index;
    layout();
    const animations = images.map((image, i) => {
      const next = image.getBoundingClientRect(), old = previous[i];
      return image.animate([
        {transform:`translate(${old.left-next.left}px,${old.top-next.top}px) scale(${old.width/next.width},${old.height/next.height})`},
        {transform:'translate(0,0) scale(1)'}
      ], {duration:motion.matches?0:800, easing:'cubic-bezier(.22,1,.36,1)'}).finished;
    });
    const text = (async () => {
      await story.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-16px)'}],{duration:motion.matches?0:180,fill:'forwards'}).finished;
      updateStory();
      await story.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:motion.matches?0:480,fill:'forwards',easing:'cubic-bezier(.22,1,.36,1)'}).finished;
      story.getAnimations().forEach(animation => animation.cancel());
    })();
    await Promise.allSettled([...animations,text]);
    stage.classList.remove('is-swapping');
    busy = false;
    if (queued !== null) { const next=queued; queued=null; choose(next); }
  }
  cakes.forEach((cake,index) => cake.addEventListener('click', () => {
    if (index !== active || busy) return choose(index);
    dialog.querySelector('img').src = data[index].image;
    dialog.querySelector('img').alt = data[index].title;
    dialog.showModal();
  }));
  document.querySelector('.preview-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); choose((active + (event.key==='ArrowRight'?1:cakes.length-1))%cakes.length); }
  });
  layout(); updateStory();
  stage.classList.add('gallery-ready');
})();
