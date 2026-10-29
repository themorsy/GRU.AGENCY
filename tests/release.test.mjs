import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {DEFAULT_GTM_ID,PRODUCTION_ORIGIN,gtmEnabledForBuild,gtmEnabledForRequest,isProductionOrigin} from '../src/scripts/release.ts';

const previewOrigin='https://gru-agency.mod-morsy.workers.dev';
const build=(outDir,origin)=>execFileSync(process.execPath,['node_modules/astro/bin/astro.mjs','build','--outDir',outDir],{env:{...process.env,SITE_URL:origin,ASTRO_TELEMETRY_DISABLED:'1'},stdio:'pipe'});

test('GTM resolves to the production origin and production hostname only',()=>{
  assert.equal(gtmEnabledForBuild(PRODUCTION_ORIGIN,DEFAULT_GTM_ID),true);
  assert.equal(gtmEnabledForRequest(PRODUCTION_ORIGIN,'gru.agency',DEFAULT_GTM_ID),true);
  assert.equal(gtmEnabledForRequest(PRODUCTION_ORIGIN,'www.gru.agency',DEFAULT_GTM_ID),true);
  assert.equal(gtmEnabledForRequest(PRODUCTION_ORIGIN,'gru-agency.mod-morsy.workers.dev',DEFAULT_GTM_ID),false);
  assert.equal(gtmEnabledForBuild(previewOrigin,DEFAULT_GTM_ID),false);
  // Even if a preview build were served on the production host, it would not load GTM.
  assert.equal(gtmEnabledForRequest(previewOrigin,'gru.agency',DEFAULT_GTM_ID),false);
  assert.equal(isProductionOrigin('https://gru.agency'),true);
  assert.equal(isProductionOrigin(previewOrigin),false);
});

test('the production build enables GTM and every public route is indexable',()=>{
  assert.ok(fs.existsSync('dist/en/index.html'),'Run npm run build before npm test.');
  for(const route of ['en','ar']){
    const html=fs.readFileSync(`dist/${route}/index.html`,'utf8');
    assert.match(html,/https:\/\/www\.googletagmanager\.com\/gtm\.js/,`${route}: GTM loader`);
    assert.match(html,/GTM-54CQR8HS/,`${route}: default container preserved`);
    assert.match(html,/productionHosts/,'GTM loader stays hostname-gated');
    assert.match(html,/page_language/,'page_language preserved');
    assert.match(html,/page_path/,'page_path preserved');
    assert.match(html,/page_type/,'page_type preserved');
    assert.doesNotMatch(html,/<meta name="robots"/,`${route}: public route has no noindex meta`);
    assert.match(html,new RegExp(`rel="canonical" href="${PRODUCTION_ORIGIN}/${route}/"`),`${route}: production canonical`);
  }
  assert.match(fs.readFileSync('dist/en/thank-you/index.html','utf8'),/<meta name="robots" content="noindex, follow"/,'thank-you stays noindex');
  assert.match(fs.readFileSync('dist/admin/index.html','utf8'),/<meta name="robots" content="noindex, nofollow"/,'admin stays noindex');
  assert.match(fs.readFileSync('dist/ar/thank-you/index.html','utf8'),/<meta name="robots" content="noindex, follow"/,'Arabic thank-you stays noindex');
});

test('the preview build never emits GTM and marks itself noindex',()=>{
  assert.ok(fs.existsSync('dist/en/index.html'),'Run npm run build before npm test.');
  const out='dist-preview';
  try{
    build(out,previewOrigin);
    for(const route of ['en','ar']){
      const html=fs.readFileSync(`${out}/${route}/index.html`,'utf8');
      assert.doesNotMatch(html,/googletagmanager/,'preview build contains no GTM loader');
      assert.doesNotMatch(html,/gtm\.start/,'preview build contains no gtm.start');
      assert.match(html,/<meta name="robots" content="noindex, follow"/,`${route}: preview build is noindex`);
      assert.match(html,new RegExp(`rel="canonical" href="${previewOrigin}/${route}/"`),`${route}: preview canonical`);
    }
    assert.match(fs.readFileSync(`${out}/en/thank-you/index.html`,'utf8'),/<meta name="robots" content="noindex, follow"/,'preview thank-you noindex');
  }finally{
    fs.rmSync(out,{recursive:true,force:true});
  }
});
