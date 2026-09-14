import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {parseHTML} from 'linkedom';
const fixture='src/content/pages/codex-qa-campaign.json';
assert.ok(!fs.existsSync(fixture),'Do not overwrite an existing page');
const page=JSON.parse(fs.readFileSync('src/content/pages/home.json','utf8'));
page.title='Local campaign verification';page.slug='codex-qa-campaign';page.languages=['en'];page.published=true;
page.content.en.sectionOrder=['hero','portfolio','proof','form'];
page.content.en.portfolio.projects=page.content.en.portfolio.projects.slice(0,2);
page.content.en.portfolio.projects[0].gallery=page.content.en.portfolio.projects[0].gallery.slice(0,3);
const build=()=>execFileSync(process.execPath,['node_modules/astro/bin/astro.mjs','build'],{env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},stdio:'pipe'});
try{
 fs.writeFileSync(fixture,JSON.stringify(page));build();
 const {document:d}=parseHTML(fs.readFileSync('dist/en/codex-qa-campaign/index.html','utf8'));
 assert.equal(d.querySelectorAll('h1').length,1);
 assert.deepEqual([...d.querySelectorAll('main>section')].map(e=>e.id||e.className),['hero','work','proof','lead']);
 assert.equal(d.querySelectorAll('.project-card').length,2);
 const project=d.querySelector('template#project-1');
 assert.equal(project.content.querySelectorAll('template[data-slide]').length,3);
 assert.equal(d.querySelector('link[hreflang=ar]'),null);
 assert.ok(d.querySelector('link[rel=canonical]').href.endsWith('/en/codex-qa-campaign/'));
 assert.ok(!fs.existsSync('dist/ar/codex-qa-campaign/index.html'));
 assert.ok(fs.readFileSync('dist/sitemap.xml','utf8').includes('/en/codex-qa-campaign/'));
 assert.ok(d.querySelector('[data-lead-form] .form-submit:not([disabled])'),'Enabled form remains visible for lead capture');
 assert.ok(d.querySelector('.contact-whatsapp'),'Enabled form retains the approved WhatsApp contact link');
 assert.ok(d.querySelector('body').getAttribute('data-page-type')==='campaign');
 console.log('Campaign build passed: actual section order, editable project/slide counts, one H1, language-only routes, canonical, sitemap and enabled contact form behaviour.');
}finally{
 fs.unlinkSync(fixture);
 build(); // Restore the review output without the test campaign.
}
