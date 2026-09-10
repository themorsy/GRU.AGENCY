import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
const routes=['en/','ar/','en/thank-you/','ar/thank-you/'];
const read=p=>fs.readFileSync(p,'utf8');
const documents=new Map(routes.map(route=>[route,parseHTML(read(`dist/${route}index.html`)).document]));
let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks++;};
for(const [route,doc] of documents){
  const lang=route.split('/')[0],thanks=route.includes('thank-you');
  const c=JSON.parse(read(`src/content/${lang}.json`));
  ok(doc.documentElement.lang===lang,`${route}: lang`);
  ok(doc.documentElement.dir===(lang==='ar'?'rtl':'ltr'),`${route}: direction`);
  ok(doc.querySelectorAll('h1').length===1,`${route}: exactly one H1`);
  ok(doc.querySelector('h1').textContent.trim()===(thanks?c.thanks.title:c.hero.headline),`${route}: exact H1`);
  ok(doc.querySelector('link[rel=canonical]').href===`https://gru.agency/${route}`,`${route}: canonical`);
  ok(doc.querySelectorAll('link[hreflang]').length===3,`${route}: alternate languages`);
  ok(doc.querySelector('.floating-whatsapp')?.href===c.contact.whatsapp,`${route}: WhatsApp`);
  ok(doc.querySelector('.floating-whatsapp')?.getAttribute('aria-label'),`${route}: WhatsApp accessible name`);
  ok(doc.querySelector('script:not([src])')?.textContent.includes('schema.org'),`${route}: structured data`);
  ok(doc.querySelector('head').textContent.includes('GTM-54CQR8HS'),`${route}: GTM`);
  ok(!doc.querySelector('sc-for,sc-if,x-dc,[data-screen-label]'),`${route}: no review runtime`);
  for(const arch of doc.querySelectorAll('.arches,.accent'))ok(arch.getAttribute('aria-hidden')==='true',`${route}: decorative arch`);
  for(const img of doc.querySelectorAll('img')){ok(img.hasAttribute('alt'),`${route}: image alt`);ok(img.hasAttribute('width')&&img.hasAttribute('height'),`${route}: image dimensions`);}
  const allIds=Array.from(doc.querySelectorAll('[id]')).map(e=>e.id);
  ok(new Set(allIds).size===allIds.length,`${route}: unique IDs`);
  for(const node of doc.querySelectorAll('[src],link[href],a[href]')){
    const attr=node.getAttribute('src')||node.getAttribute('href');
    if(!attr||/^(https?:|mailto:|tel:|data:)/.test(attr))continue;
    const url=new URL(attr,`https://gru.agency/${route}`);
    if(url.hash){const targetRoute=url.pathname.replace(/^\//,'');const target=documents.get(targetRoute);if(target)ok(!!target.getElementById(url.hash.slice(1)),`${route}: anchor ${attr}`);}
    if(!url.pathname.endsWith('/'))ok(fs.existsSync(path.join('dist',decodeURIComponent(url.pathname))),`${route}: asset ${attr}`);
    else if(!url.hash)ok(fs.existsSync(path.join('dist',url.pathname,'index.html')),`${route}: route ${attr}`);
  }
  if(!thanks){
    ok(!doc.querySelector('[data-marquee-toggle]'),`${route}: no visible pause control`);
    if(!c.hero.video)ok(doc.querySelector('.hero-video-slot'),`${route}: visible showreel slot`);
    const order=Array.from(doc.querySelectorAll('main>section')).map(s=>s.id||s.className);
    ok(order.join('|')==='hero|proof|services|work|cta-band|value|method|about|lead',`${route}: section order`);
    ok(doc.querySelectorAll('.service-row').length===4,`${route}: categories`);
    ok(doc.querySelectorAll('.service-pill').length===18,`${route}: service count`);
    ok(doc.querySelectorAll('.project-card').length===6,`${route}: project count`);
    ok(doc.querySelectorAll('.method-card').length===5,`${route}: method steps`);
    ok(doc.querySelector('.hero-content p').textContent===c.hero.body,`${route}: verbatim hero paragraph`);
    ok(doc.querySelector('.logo-group[aria-hidden=true]'),`${route}: silent duplicate logos`);
    ok(doc.querySelector('dialog#project-lightbox[aria-labelledby]'),`${route}: native lightbox`);
    ok(doc.querySelectorAll('form [required]').length===4,`${route}: required fields`);
    ok(doc.querySelector('form').getAttribute('action')===`/${lang}/thank-you/`,`${route}: form redirect`);
    ok(doc.querySelector('form').getAttribute('data-netlify')==='true',`${route}: Netlify detection`);
    ok(doc.querySelector('input[name=form-name]').value===`gru-lead-${lang}`,`${route}: form name`);
    ok(doc.querySelector('select').querySelectorAll('option').length===19,`${route}: service options`);
    ok(!doc.querySelector('button[type=submit]').disabled,`${route}: initially enabled`);
    for(const field of doc.querySelectorAll('.field input,.field select,.field textarea')){
      ok(doc.querySelector(`label[for="${field.id}"]`),`${route}: field label`);
      ok(doc.getElementById(field.getAttribute('aria-describedby')),`${route}: error description`);
    }
    for(const item of [...c.value.items,...c.method.items])ok(doc.body.textContent.includes(item.body),`${route}: complete copy ${item.title}`);
  }
}
const xml=read('dist/sitemap.xml');for(const route of routes)ok(xml.includes(`<loc>https://gru.agency/${route}</loc>`),`sitemap: ${route}`);
const css=fs.readdirSync('dist/_astro').filter(f=>f.endsWith('.css')).map(f=>read('dist/_astro/'+f)).join('');
ok(!/(?:#fff(?:fff)?\b|:\s*white\s*[;}])/i.test(css),'no pure white in CSS');
ok(css.includes('prefers-reduced-motion'),'reduced motion CSS');
ok(css.includes('font-display:swap'),'self-hosted font swap');
ok(!css.includes('fonts.googleapis.com'),'no remote font requests');
const rgb=hex=>hex.match(/\w\w/g).map(x=>parseInt(x,16));
const lum=c=>c.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
const pairs=[['33332C','F1EFDB'],['33332C','E6E4CE'],['6B6B5E','F1EFDB'],['626256','E6E4CE'],['1F5B33','F1EFDB']];
for(const [fg,bg] of pairs){const contrast=ratio(rgb(fg),rgb(bg));console.log(`Contrast #${fg} / #${bg}: ${contrast.toFixed(2)}:1`);ok(contrast>=4.5,`text contrast ${fg}/${bg}`);}
console.log(`Passed ${checks} generated-page, copy, asset, SEO and accessibility checks.`);
