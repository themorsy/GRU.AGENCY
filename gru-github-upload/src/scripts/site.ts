const header=document.querySelector<HTMLElement>('[data-header]');
let previous=window.scrollY,queued=false;
window.addEventListener('scroll',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;const y=window.scrollY;if(y<80){header?.style.setProperty('transform','translateY(0)');previous=y;return;}if(Math.abs(y-previous)<6)return;header?.style.setProperty('transform',y<previous?'translateY(0)':'translateY(-160%)');previous=y;});},{passive:true});
header?.addEventListener('focusin',()=>header.style.setProperty('transform','translateY(0)'));
const menu=document.querySelector<HTMLDialogElement>('#mobile-menu');
const menuButton=document.querySelector<HTMLButtonElement>('[data-menu-open]');
menuButton?.addEventListener('click',()=>{menu?.showModal();document.body.classList.add('modal-open');menuButton.setAttribute('aria-expanded','true');});
menu?.addEventListener('close',()=>{document.body.classList.remove('modal-open');menuButton?.setAttribute('aria-expanded','false');menuButton?.focus();});
menu?.querySelector('[data-menu-close]')?.addEventListener('click',()=>menu.close());
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.close()));
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const video=document.querySelector<HTMLVideoElement>('[data-video]');
const videoButton=document.querySelector<HTMLButtonElement>('[data-video-toggle]');
const updateVideoLabel=()=>{if(videoButton&&video){const label=video.paused?videoButton.dataset.play:videoButton.dataset.pause;videoButton.textContent=label||'';videoButton.setAttribute('aria-label',label||'');}};
const startVideo=()=>{if(!video)return;if(!video.src)video.src=video.dataset.src||'';video.play().then(updateVideoLabel).catch(updateVideoLabel);};
if(video){video.muted=true;window.addEventListener('load',()=>{if(!motion.matches)setTimeout(startVideo,300);},{once:true});motion.addEventListener('change',()=>{if(motion.matches){video.pause();updateVideoLabel();}});videoButton?.addEventListener('click',()=>{if(video.paused)startVideo();else{video.pause();updateVideoLabel();}});updateVideoLabel();}

