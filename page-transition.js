(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'ambu-circle-transition';
  let pending;
  try { pending = JSON.parse(sessionStorage.getItem(key)); sessionStorage.removeItem(key); } catch {}
  const origin = (x,y) => `${x}px ${y}px`;
  const radius = (x,y) => Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y)) + 20;
  function overlay() {
    const layer=document.createElement('div');
    layer.className='circle-transition'; layer.setAttribute('aria-hidden','true');
    document.body.append(layer); return layer;
  }
  if (pending && pending.path===location.pathname && Date.now()-pending.time<15000 && !reduced.matches) {
    document.body.classList.add('circle-arrival');
    const x=pending.x*innerWidth,y=pending.y*innerHeight,r=radius(x,y);
    const layer=overlay();
    layer.style.clipPath=`circle(${r}px at ${origin(x,y)})`;
    const images=[...document.querySelectorAll('.cake-choice img,.teaser-photo img')];
    const ready=Promise.allSettled(images.map(img=>img.decode()));
    Promise.race([ready,new Promise(resolve=>setTimeout(resolve,1200))]).then(async()=>{
      await layer.animate([{opacity:1},{opacity:0}],{duration:400,easing:'ease-out'}).finished;
      layer.remove();
    });
  }
  let navigating=false;
  document.addEventListener('click', async event => {
    const link=event.target.closest('a[data-circle]');
    if (!link || event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reduced.matches) return;
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin || link.target==='_blank') return;
    event.preventDefault();
    if(navigating) return;
    navigating=true;
    let rect=link.getBoundingClientRect();
    if(event.detail===0 && (rect.top<0 || rect.bottom>innerHeight)) {
      link.scrollIntoView({block:'center',behavior:'instant'});
      rect=link.getBoundingClientRect();
    }
    const x=event.detail===0?rect.left+rect.width/2:event.clientX;
    const y=event.detail===0?rect.top+rect.height/2:event.clientY;
    try { sessionStorage.setItem(key,JSON.stringify({path:url.pathname,x:x/innerWidth,y:y/innerHeight,time:Date.now()})); } catch {}
    const layer=overlay(),r=radius(x,y);
    layer.style.clipPath=`circle(0px at ${origin(x,y)})`;
    await layer.animate([{clipPath:`circle(0px at ${origin(x,y)})`},{clipPath:`circle(${r}px at ${origin(x,y)})`}],{duration:650,fill:'forwards',easing:'cubic-bezier(.65,0,.35,1)'}).finished;
    location.assign(url.href);
  });
  addEventListener('pageshow',event=>{if(event.persisted){document.querySelectorAll('.circle-transition').forEach(layer=>layer.remove());navigating=false;}});
})();
