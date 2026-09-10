const dialog=document.querySelector<HTMLDialogElement>('#project-lightbox');
let trigger:HTMLElement|null=null;
document.querySelectorAll<HTMLAnchorElement>('[data-project-open]').forEach(link=>link.addEventListener('click',event=>{
 const template=document.getElementById(link.dataset.projectOpen||'');if(!(template instanceof HTMLTemplateElement)||!dialog)return;
 event.preventDefault();trigger=link;dialog.querySelector('.lightbox-content')?.replaceChildren(template.content.cloneNode(true));document.body.classList.add('modal-open');dialog.showModal();dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]')?.focus();
}));
dialog?.querySelector('[data-lightbox-close]')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
dialog?.addEventListener('close',()=>{document.body.classList.remove('modal-open');dialog.querySelector('.lightbox-content')?.replaceChildren();trigger?.focus({preventScroll:true});});
dialog?.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]'));const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}});
