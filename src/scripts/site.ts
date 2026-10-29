import {createObserver,revealAllContent} from './motion';

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
let motionObserversAvailable=true;
const syncMotionState=()=>motionRoot.classList.toggle('motion-ready',!motion.matches&&motionObserversAvailable);
syncMotionState();

const video=document.querySelector<HTMLVideoElement>('[data-video]');
const startVideo=()=>{
 if(!video||motion.matches||video.dataset.started)return;
 const mobile=matchMedia('(max-width:767px)').matches;
 const webm=video.querySelector<HTMLSourceElement>('[data-hero-webm]')!;
 const mp4=video.querySelector<HTMLSourceElement>('[data-hero-mp4]')!;
 const webmSrc=video.dataset.webm||'';
 if(!mobile&&webmSrc){webm.src=webmSrc;}else webm.remove();
 const source=(mobile?video.dataset.mobile:video.dataset.desktop)||'';
 if(!source){mp4.remove();return;}
 mp4.src=source;
 video.dataset.started='true';video.load();
 const playing=video.play();if(playing)playing.catch(()=>{});
};
// The poster is visible immediately and the muted showreel starts at once; the headline
// is scheduled by the inline reveal in Base.astro.
if(video){video.muted=true;startVideo();motion.addEventListener('change',()=>{syncMotionState();if(motion.matches)video.pause();else startVideo();});}

// Stat values remain crawlable. Once Proof is 35% visible, every figure shares the same 1.4s easing window.
const proof=document.querySelector<HTMLElement>('#proof');
const counters=[...document.querySelectorAll<HTMLElement>('#proof [data-count-to]')];
const formatNumber=(value:string,count:number)=>value.replace(/\d[\d,]*/,new Intl.NumberFormat('en-US').format(count));
let counterObserver:IntersectionObserver|null=null;
if(proof&&counters.length){
 counterObserver=createObserver((entries,observer)=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  observer.unobserve(entry.target);
  if(motion.matches)return;
  const start=performance.now();
  const values=counters.map(el=>({el,final:el.textContent||'',target:Number(el.dataset.countTo||0)}));
  values.forEach(({el,final})=>{el.setAttribute('aria-label',final);el.querySelector('bdi')?.setAttribute('aria-hidden','true');});
  const tick=(now:number)=>{const progress=Math.min(1,(now-start)/1400),eased=1-Math.pow(1-progress,3);values.forEach(({el,final,target})=>{const text=el.querySelector('bdi');if(text)text.textContent=formatNumber(final,Math.round(target*eased));});if(progress<1&&!motion.matches)requestAnimationFrame(tick);else values.forEach(({el,final})=>{const text=el.querySelector('bdi');if(text)text.textContent=final;});};
  requestAnimationFrame(tick);
 }),{threshold:.35});
 if(counterObserver)counterObserver.observe(proof);
}

const reveal=createObserver((entries,observer)=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}}),{threshold:.2});
if(reveal&&!motion.matches)document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element=>reveal.observe(element));

// The hero reveal is scheduled by the inline script in Base.astro so it starts at parse
// time; the shared layer keeps section reveals additive.
const motionReveal=createObserver((entries,observer)=>entries.forEach(entry=>{
 if(!entry.isIntersecting)return;
 entry.target.classList.add('is-motion-revealed');
 observer.unobserve(entry.target);
}),{threshold:.18,rootMargin:'0px 0px -8%'});
if(motionReveal&&!motion.matches)document.querySelectorAll<HTMLElement>('[data-motion-reveal]').forEach(element=>motionReveal.observe(element));

// If any observer could not be created, expose every element the motion layer can hide.
// Counters are already rendered at their final values and are intentionally left alone.
const observersAvailable=(!proof||!counters.length||!!counterObserver)&&!!reveal&&!!motionReveal;
if(!observersAvailable){motionObserversAvailable=false;syncMotionState();revealAllContent(document);}

motion.addEventListener('change',()=>{
 syncMotionState();
 if(!motion.matches&&motionObserversAvailable){
  document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)').forEach(element=>reveal?.observe(element));
  document.querySelectorAll<HTMLElement>('[data-motion-reveal]:not(.is-motion-revealed)').forEach(element=>motionReveal?.observe(element));
 }
});

const rail=document.querySelector<HTMLElement>('[data-project-rail]');
const railStep=(element:HTMLElement)=>{const card=element.querySelector<HTMLElement>('.project-card');const gap=Number.parseFloat(getComputedStyle(element).gap)||0;return (card?.getBoundingClientRect().width||element.clientWidth*.84)+gap;};
const scrollRail=(element:HTMLElement,delta:number)=>{const rtl=getComputedStyle(element).direction==='rtl';const max=Math.max(0,element.scrollWidth-element.clientWidth);const next=element.scrollLeft+delta*(rtl?-1:1);element.scrollLeft=rtl?Math.min(0,Math.max(-max,next)):Math.max(0,Math.min(max,next));};
const moveRail=(previous:boolean)=>{if(rail)scrollRail(rail,(previous?-1:1)*railStep(rail));};
document.querySelector<HTMLButtonElement>('[data-rail-previous]')?.addEventListener('click',()=>moveRail(true));
document.querySelector<HTMLButtonElement>('[data-rail-next]')?.addEventListener('click',()=>moveRail(false));
rail?.addEventListener('keydown',event=>{
 if(event.target!==rail||!['ArrowLeft','ArrowRight'].includes(event.key))return;
 event.preventDefault();
 const rtl=getComputedStyle(rail).direction==='rtl';
 const forward=event.key===(rtl?'ArrowLeft':'ArrowRight');
 scrollRail(rail,(forward?1:-1)*railStep(rail));
});

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
