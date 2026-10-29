// Small motion helpers. The observer factory makes unsupported or throwing
// IntersectionObserver environments fall back safely instead of leaving content hidden.
export type ObserverCallback=(entries:IntersectionObserverEntry[],observer:IntersectionObserver)=>void;

export function createObserver(callback:ObserverCallback,options?:IntersectionObserverInit):IntersectionObserver|null{
  if(typeof IntersectionObserver==='undefined')return null;
  try{return new IntersectionObserver(callback,options);}catch{return null;}
}

// Immediately expose every element that the motion layer can hide. Counters are not
// touched: their markup already contains the final values and no animation is started.
export function revealAllContent(doc:Document=document):void{
  doc.documentElement.classList.remove('motion-ready');
  doc.documentElement.classList.remove('hero-motion');
  doc.querySelectorAll('[data-motion-reveal]').forEach(element=>element.classList.add('is-motion-revealed'));
  doc.querySelectorAll('[data-reveal]').forEach(element=>element.classList.add('is-revealed'));
  doc.querySelector('[data-hero-title]')?.classList.add('is-motion-revealed');
  doc.querySelector('[data-hero-copy]')?.classList.add('is-motion-revealed');
  doc.querySelector('[data-hero-actions]')?.classList.add('is-motion-revealed');
}
