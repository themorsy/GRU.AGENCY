const header=document.querySelector<HTMLElement>('[data-header]');
const updateHeader=()=>{const solid=window.scrollY>24||document.body.dataset.thanks==='true';header?.classList.toggle('is-scrolled',solid);const logo=header?.querySelector<HTMLImageElement>('[data-header-logo]');if(logo)logo.src=solid?'/assets/logo-green.png':'/assets/logo-cream.png';};updateHeader();
let previous=window.scrollY,queued=false;
window.addEventListener('scroll',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;const y=window.scrollY;updateHeader();if(y<110){header?.style.setProperty('transform','translateY(0)');previous=y;return;}if(Math.abs(y-previous)<6)return;header?.style.setProperty('transform',y<previous?'translateY(0)':'translateY(-100%)');previous=y;});},{passive:true});
header?.addEventListener('focusin',()=>header.style.setProperty('transform','translateY(0)'));
const menu=document.querySelector<HTMLDialogElement>('#mobile-menu');
const menuButton=document.querySelector<HTMLButtonElement>('[data-menu-open]');
menuButton?.addEventListener('click',()=>{menu?.showModal();menu?.classList.toggle('is-scrollable',menu.scrollHeight>menu.clientHeight+1);document.body.classList.add('modal-open');menuButton.setAttribute('aria-expanded','true');});
menu?.addEventListener('close',()=>{document.body.classList.remove('modal-open');menuButton?.setAttribute('aria-expanded','false');menuButton?.focus();});
menu?.querySelector('[data-menu-close]')?.addEventListener('click',()=>menu.close());
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',event=>{const url=new URL(a.href);menu.close();document.body.classList.remove('modal-open');if(url.pathname===location.pathname&&url.hash){event.preventDefault();history.pushState(null,'',url.hash);document.querySelector(url.hash)?.scrollIntoView({behavior:'instant'});}}));
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const motionRoot=document.documentElement;
const syncMotionState=()=>motionRoot.classList.toggle('motion-ready',!motion.matches);
syncMotionState();
const video=document.querySelector<HTMLVideoElement>('[data-video]');
const startVideo=()=>{
 if(!video||motion.matches||video.dataset.started)return;
 const mobile=matchMedia('(max-width:767px)').matches;
 const webm=video.querySelector<HTMLSourceElement>('[data-hero-webm]')!;
 const mp4=video.querySelector<HTMLSourceElement>('[data-hero-mp4]')!;
 if(!mobile)webm.src=video.dataset.webm||'';else webm.remove();
 mp4.src=(mobile?video.dataset.mobile:video.dataset.desktop)||'';
 video.dataset.started='true';video.load();video.play().catch(()=>{});
};
if(video){video.muted=true;window.addEventListener('load',()=>{if(!motion.matches)setTimeout(startVideo,300);},{once:true});motion.addEventListener('change',()=>{syncMotionState();if(motion.matches)video.pause();else startVideo();});}
// Stat values remain crawlable. Once Proof is 35% visible, every figure shares the same 1.4s easing window.
const proof=document.querySelector<HTMLElement>('#proof');
const counters=[...document.querySelectorAll<HTMLElement>('#proof [data-count-to]')];
const formatNumber=(value:string,count:number)=>value.replace(/\d[\d,]*/,new Intl.NumberFormat('en-US').format(count));
if(proof&&counters.length){
 const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;counterObserver.unobserve(entry.target);if(motion.matches)return;const start=performance.now();const values=counters.map(el=>({el,final:el.textContent||'',target:Number(el.dataset.countTo||0)}));values.forEach(({el,final})=>{el.setAttribute('aria-label',final);el.querySelector('bdi')?.setAttribute('aria-hidden','true');});const tick=(now:number)=>{const progress=Math.min(1,(now-start)/1400),eased=1-Math.pow(1-progress,3);values.forEach(({el,final,target})=>{const text=el.querySelector('bdi');if(text)text.textContent=formatNumber(final,Math.round(target*eased));});if(progress<1&&!motion.matches)requestAnimationFrame(tick);else values.forEach(({el,final})=>{const text=el.querySelector('bdi');if(text)text.textContent=final;});};requestAnimationFrame(tick);}),{threshold:.35});counterObserver.observe(proof);
}
const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-revealed');reveal.unobserve(e.target);}}),{threshold:.2});
if(!motion.matches)document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(e=>reveal.observe(e));

// The animation layer is additive: source content remains fully readable if JavaScript
// or motion is unavailable. Hero words are wrapped only after the page is ready.
const heroTitle=document.querySelector<HTMLElement>('[data-hero-title]');
const prepareHeroWords=()=>{
 if(!heroTitle||motion.matches||heroTitle.dataset.motionPrepared)return;
 heroTitle.dataset.motionPrepared='true';
 const label=heroTitle.textContent?.replace(/\s+/g,' ').trim();
 if(label)heroTitle.setAttribute('aria-label',label);
 const textNodes:Text[]=[];
 const walker=document.createTreeWalker(heroTitle,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.nodeValue?.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT});
 while(walker.nextNode())textNodes.push(walker.currentNode as Text);
 let wordIndex=0;
 textNodes.forEach(node=>{
  const fragment=document.createDocumentFragment();
  (node.nodeValue||'').split(/(\s+)/).forEach(part=>{
   if(!part)return;
   if(/^\s+$/.test(part)){fragment.append(part);return;}
   const word=document.createElement('span');
   word.className=`motion-word ${wordIndex%2?'motion-word-from-bottom':'motion-word-from-top'}`;
   word.style.setProperty('--motion-index',String(wordIndex++));
   word.setAttribute('aria-hidden','true');
   const inner=document.createElement('span');inner.textContent=part;word.append(inner);fragment.append(word);
  });
  node.replaceWith(fragment);
 });
 requestAnimationFrame(()=>window.setTimeout(()=>{
  heroTitle.classList.add('is-motion-revealed');
  document.querySelector<HTMLElement>('[data-hero-copy]')?.classList.add('is-motion-revealed');
  document.querySelector<HTMLElement>('[data-hero-actions]')?.classList.add('is-motion-revealed');
 },120));
};
prepareHeroWords();

const motionReveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
 if(!entry.isIntersecting)return;
 entry.target.classList.add('is-motion-revealed');
 motionReveal.unobserve(entry.target);
}),{threshold:.18,rootMargin:'0px 0px -8%'});
if(!motion.matches)document.querySelectorAll<HTMLElement>('[data-motion-reveal]').forEach(element=>motionReveal.observe(element));
motion.addEventListener('change',()=>{
 syncMotionState();
 if(!motion.matches){prepareHeroWords();document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)').forEach(element=>reveal.observe(element));document.querySelectorAll<HTMLElement>('[data-motion-reveal]:not(.is-motion-revealed)').forEach(element=>motionReveal.observe(element));}
});

const rail=document.querySelector<HTMLElement>('[data-project-rail]');
const moveRail=(previous:boolean)=>{if(!rail)return;const card=rail.querySelector<HTMLElement>('.project-card');const gap=Number.parseFloat(getComputedStyle(rail).gap)||0;const step=(card?.getBoundingClientRect().width||rail.clientWidth*.84)+gap;const direction=getComputedStyle(rail).direction==='rtl'?-1:1;const delta=(previous?-step:step)*direction;rail.scrollLeft=Math.max(0,Math.min(rail.scrollWidth-rail.clientWidth,rail.scrollLeft+delta));};
document.querySelector<HTMLButtonElement>('[data-rail-previous]')?.addEventListener('click',()=>moveRail(true));
document.querySelector<HTMLButtonElement>('[data-rail-next]')?.addEventListener('click',()=>moveRail(false));

// Preserve attribution parameters across real EN/AR links; explicit URL language wins.
document.querySelectorAll<HTMLAnchorElement>('a.language, .footer-bottom a[aria-label]').forEach(link=>{
 const target=new URL(link.href,location.href);
 if(!/^\/(en|ar)\/(?:[a-z0-9-]+\/)?$/.test(target.pathname))return;
 target.search=location.search;link.href=target.href;
 link.addEventListener('click',()=>{
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push({event:'language_switch',page_language:document.documentElement.lang,target_language:target.pathname.split('/')[1],page_path:location.pathname,page_type:document.body.dataset.pageType||'homepage'});
 });
});
