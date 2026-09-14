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
if(video){video.muted=true;window.addEventListener('load',()=>{if(!motion.matches)setTimeout(startVideo,300);},{once:true});motion.addEventListener('change',()=>{if(motion.matches)video.pause();else startVideo();});}
// Stat values remain crawlable. Once Proof is 35% visible, every figure shares the same 1.4s easing window.
const proof=document.querySelector<HTMLElement>('#proof');
const counters=[...document.querySelectorAll<HTMLElement>('#proof [data-count-to]')];
const formatNumber=(value:string,count:number)=>value.replace(/\d[\d,]*/,new Intl.NumberFormat('en-US').format(count));
if(proof&&counters.length){
 const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;counterObserver.unobserve(entry.target);if(motion.matches)return;const start=performance.now();const values=counters.map(el=>({el,final:el.textContent||'',target:Number(el.dataset.countTo||0)}));values.forEach(({el,final})=>{el.setAttribute('aria-label',final);el.querySelector('bdi')?.setAttribute('aria-hidden','true');});const tick=(now:number)=>{const progress=Math.min(1,(now-start)/1400),eased=1-Math.pow(1-progress,3);values.forEach(({el,final,target})=>{const text=el.querySelector('bdi');if(text)text.textContent=formatNumber(final,Math.round(target*eased));});if(progress<1&&!motion.matches)requestAnimationFrame(tick);else values.forEach(({el,final})=>{const text=el.querySelector('bdi');if(text)text.textContent=final;});};requestAnimationFrame(tick);}),{threshold:.35});counterObserver.observe(proof);
}
const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-revealed');reveal.unobserve(e.target);}}),{threshold:.2});document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(e=>reveal.observe(e));

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
