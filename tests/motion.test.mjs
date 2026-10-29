import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {createObserver,revealAllContent} from '../src/scripts/motion.ts';

test('unsupported observer fallback reveals all motion content without throwing',()=>{
  const {document}=parseHTML(`<!doctype html><html class="motion-ready hero-motion"><body>
    <h1 data-hero-title>Headline</h1>
    <p data-hero-copy>Body copy</p>
    <div data-hero-actions><a href="#lead">Book a Call</a></div>
    <section data-motion-reveal="heading">Section heading</section>
    <article data-motion-reveal="card">Card</article>
    <div data-reveal>Value item</div>
    <span data-count-to="400">400+</span>
  </body></html>`);
  const root=document.documentElement;
  assert.ok(root.classList.contains('motion-ready'));
  assert.ok(root.classList.contains('hero-motion'));
  assert.doesNotThrow(()=>revealAllContent(document));
  assert.equal(root.classList.contains('motion-ready'),false,'motion-ready removed');
  assert.equal(root.classList.contains('hero-motion'),false,'hero-motion removed');
  for(const selector of ['[data-motion-reveal]','[data-reveal]','[data-hero-title]','[data-hero-copy]','[data-hero-actions]']){
    assert.ok(document.querySelector(selector).classList.contains(selector==='[data-reveal]'?'is-revealed':'is-motion-revealed'),`${selector} revealed`);
  }
  assert.equal(document.querySelector('[data-count-to]').textContent,'400+','counter keeps its final value');
  assert.equal(createObserver(()=>{},{}),null,'missing IntersectionObserver returns null');
});

test('throwing observer construction returns null instead of breaking the page',()=>{
  const original=globalThis.IntersectionObserver;
  globalThis.IntersectionObserver=class{constructor(){throw new Error('unsupported');}};
  try{
    assert.doesNotThrow(()=>createObserver(()=>{},{}));
    assert.equal(createObserver(()=>{},{}),null);
  }finally{
    if(original)globalThis.IntersectionObserver=original;else delete globalThis.IntersectionObserver;
  }
});
