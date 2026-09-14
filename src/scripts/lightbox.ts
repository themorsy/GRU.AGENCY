const dialog=document.querySelector<HTMLDialogElement>('#project-lightbox');
let trigger:HTMLElement|null=null;
let activeSlide=0;
function showSlide(index:number){
 const gallery=dialog?.querySelector<HTMLElement>('[data-gallery]');
 const slides=gallery?.querySelectorAll<HTMLTemplateElement>('template[data-slide]');
 if(!gallery||!slides?.length)return;
 activeSlide=(index+slides.length)%slides.length;
 // Only the active slide exists in the stage: hidden videos cannot intercept clicks or preload.
 gallery.querySelector('[data-slide-stage]')?.replaceChildren(slides[activeSlide].content.cloneNode(true));
 const status=gallery.querySelector<HTMLElement>('[data-gallery-status]');
 if(status)status.textContent=`${status.dataset.label} ${activeSlide+1} / ${slides.length}`;
 const video=gallery.querySelector<HTMLVideoElement>('video');
 if(video)video.src=video.dataset.lazySrc||'';
 gallery.querySelector<HTMLButtonElement>('[data-youtube]')?.addEventListener('click',event=>{
  const button=event.currentTarget as HTMLButtonElement;
  try {const u=new URL(button.dataset.youtube||'');const host=u.hostname.replace(/^www\./,'');
   const id=host==='youtu.be'?u.pathname.slice(1):['youtube.com','m.youtube.com'].includes(host)?u.searchParams.get('v')||u.pathname.split('/')[2]:null;
   if(!id||!/^[-\w]{11}$/.test(id))return;
   const iframe=document.createElement('iframe');iframe.src=`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&autoplay=1`;iframe.title=button.getAttribute('aria-label')||'Video';iframe.allow='autoplay; encrypted-media; picture-in-picture';iframe.allowFullscreen=true;button.replaceWith(iframe);
  }catch{}
 });
}
document.querySelectorAll<HTMLAnchorElement>('[data-project-open]').forEach(link=>link.addEventListener('click',event=>{
 const template=document.getElementById(link.dataset.projectOpen||'');if(!(template instanceof HTMLTemplateElement)||!dialog)return;
 event.preventDefault();trigger=link;dialog.querySelector('.lightbox-content')?.replaceChildren(template.content.cloneNode(true));document.body.classList.add('modal-open');dialog.showModal();dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]')?.focus();
 showSlide(0);
}));
dialog?.addEventListener('click',event=>{const button=(event.target as Element).closest<HTMLElement>('[data-gallery-step]');if(button)showSlide(activeSlide+Number(button.dataset.galleryStep));});
dialog?.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key)||(event.target as Element).closest('video,iframe'))return;event.preventDefault();const forward=event.key===(document.documentElement.dir==='rtl'?'ArrowLeft':'ArrowRight');showSlide(activeSlide+(forward?1:-1));});
dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
dialog?.addEventListener('close',()=>{document.body.classList.remove('modal-open');dialog.querySelector('.lightbox-content')?.replaceChildren();trigger?.focus({preventScroll:true});});
dialog?.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]'));const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}});
