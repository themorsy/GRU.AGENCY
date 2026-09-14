import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import test from 'node:test';import postcss from 'postcss';import {inspectAssets} from '../scripts/assert-assets.mjs';

test('font contract rejects removed families, missing files, false weights and missing WOFF2',()=>{
 fs.mkdirSync('.qa',{recursive:true});const fixture=fs.mkdtempSync(path.resolve('.qa/font-gate-'));fs.cpSync('dist',fixture,{recursive:true});
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 const css=walk(fixture).find(f=>f.endsWith('.css')&&fs.readFileSync(f,'utf8').includes('font-family:Mammoth'));assert.ok(css);const original=fs.readFileSync(css,'utf8');
 const change=fn=>{const p=postcss.parse(original);fn(p);fs.writeFileSync(css,p.toString());};
 try{
  inspectAssets(fixture);
  change(p=>p.walkAtRules('font-face',r=>{if(r.nodes.some(d=>d.prop==='font-family'&&d.value==='Mammoth'))r.remove()}));assert.throws(()=>inspectAssets(fixture),/coverage mismatch for Mammoth/);
  change(p=>p.walkAtRules('font-face',r=>{if(r.nodes.some(d=>d.prop==='font-family'&&d.value==='Mammoth'))r.walkDecls('font-weight',d=>d.value='700')}));assert.throws(()=>inspectAssets(fixture),/weight mismatch/);
  change(p=>p.walkAtRules('font-face',r=>{if(r.nodes.some(d=>d.prop==='font-family'&&d.value==='Mammoth'))r.walkDecls('src',d=>d.value=d.value.split(',').slice(1).join(','))}));assert.throws(()=>inspectAssets(fixture),/no WOFF2/);
  fs.writeFileSync(css,original);const font=walk(fixture).find(f=>/Mammoth\..*\.woff2$/.test(f));assert.ok(font);fs.renameSync(font,font+'.missing');assert.throws(()=>inspectAssets(fixture),/Missing CSS assets/);fs.renameSync(font+'.missing',font);
  fs.writeFileSync(css,original+'\nnav{font-family:Poppins;font-weight:800}');assert.throws(()=>inspectAssets(fixture),/Unshipped requested weight/);
  fs.writeFileSync(css,original);
  fs.writeFileSync(css,original);inspectAssets(fixture);
  const unused=path.join(fixture,'unused.woff2');fs.copyFileSync(font,unused);assert.throws(()=>inspectAssets(fixture),/Unreferenced emitted fonts/);fs.unlinkSync(unused);
 }finally{assert.ok(fixture.startsWith(path.resolve('.qa')+path.sep));fs.rmSync(fixture,{recursive:true,force:true});}
});

