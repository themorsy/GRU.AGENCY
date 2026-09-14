import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import postcss from 'postcss';
import {openSync} from 'fontkit';

// Independent contract: removing a whole CSS family/weight must not silently shrink the gate.
export const expectedFonts={Mammoth:[400],Poppins:[300,400,500]};
export function inspectAssets(root='dist'){
 const base=path.resolve(root),files=[];const walk=dir=>{for(const d of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,d.name);if(d.isDirectory())walk(f);else files.push(f);}};walk(base);
 let count=0;const missing=[],references=new Set(),faces=[],coverage=new Map(),fontCache=new Map();
 const resolve=(css,url)=>{const relative=decodeURIComponent(url.split(/[?#]/)[0]);const target=relative.startsWith('/')?path.resolve(base,'.'+relative):path.resolve(path.dirname(css),relative);if(!target.startsWith(base+path.sep))throw new Error('Asset escapes output directory: '+url);return target;};
 for(const css of files.filter(f=>f.endsWith('.css'))){const source=fs.readFileSync(css,'utf8');
  for(const match of source.matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)){const url=match[1];if(/^(data:|https?:|#)/.test(url))continue;const target=resolve(css,url);count++;references.add(target);if(!fs.existsSync(target))missing.push(path.relative(base,css)+' -> '+url);}
 }
 if(missing.length)throw new Error('Missing CSS assets:\n'+missing.join('\n'));
 for(const css of files.filter(f=>f.endsWith('.css'))){postcss.parse(fs.readFileSync(css,'utf8')).walkAtRules('font-face',rule=>{
  const decl=Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));const family=decl['font-family']?.replace(/^['"]|['"]$/g,''),weight=Number(decl['font-weight']||400);
  if(!family||!Number.isFinite(weight))throw new Error('Invalid static font family/weight');
  const sources=[...(decl.src||'').matchAll(/url\(\s*['"]?([^'"\s)]+)['"]?\s*\)\s*format\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g)].map(m=>({url:m[1],format:m[2]}));
  if(!sources.some(s=>s.format==='woff2'))throw new Error(`Font family ${family} weight ${weight} has no WOFF2 source`);
  for(const source of sources){const target=resolve(css,source.url);let font=fontCache.get(target);if(!font){font=openSync(target);fontCache.set(target,font);}
   const signature=fs.readFileSync(target).subarray(0,4).toString('ascii');if(source.format==='woff2'&&signature!=='wOF2')throw new Error('Invalid WOFF2 format: '+source.url);
   if(font['OS/2'].usWeightClass!==weight)throw new Error(`Font weight mismatch: ${family} declared ${weight}, file is ${font['OS/2'].usWeightClass}: ${source.url}`);
   if(!font.familyName.startsWith(family)||font.numGlyphs<1)throw new Error(`Wrong or empty font family: ${source.url}`);
  }
  if(!coverage.has(family))coverage.set(family,new Set());coverage.get(family).add(weight);faces.push({family,weight,sources,unicodeRange:decl['unicode-range']||'all'});
 });}
 for(const [family,weights] of Object.entries(expectedFonts)){const actual=[...(coverage.get(family)||[])].sort((a,b)=>a-b);if(JSON.stringify(actual)!==JSON.stringify(weights))throw new Error(`Font coverage mismatch for ${family}: expected ${weights}, found ${actual}`);}
 for(const family of coverage.keys())if(!expectedFonts[family])throw new Error('Unexpected font family; update the approved contract: '+family);
 // Detect direct family/weight requests too. Inherited browser matching is additionally measured in Chrome.
 for(const css of files.filter(f=>f.endsWith('.css')))postcss.parse(fs.readFileSync(css,'utf8')).walkRules(rule=>{const d=Object.fromEntries(rule.nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));if(!d['font-family']||!d['font-weight'])return;const family=d['font-family'].split(',')[0].replace(/['"]/g,'').trim(),weight=Number(d['font-weight']);if(expectedFonts[family]&&Number.isFinite(weight)&&!expectedFonts[family].includes(weight))throw new Error(`Unshipped requested weight: ${family} ${weight}`);});
 const orphanFonts=files.filter(f=>/\.(woff2?|otf|ttf)$/.test(f)&&!references.has(f));if(orphanFonts.length)throw new Error('Unreferenced emitted fonts: '+orphanFonts.join(', '));
 const markup=files.filter(f=>/\.(html|js|css)$/.test(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n');
 const assets=files.filter(f=>/\.(woff2?|otf|ttf|png|jpe?g|svg|webp|mp4|ico)$/i.test(f));
 const unused=assets.filter(f=>!references.has(f)&&!markup.includes('/'+path.relative(base,f).replaceAll('\\','/'))).map(f=>({path:path.relative(base,f).replaceAll('\\','/'),bytes:fs.statSync(f).size,reason:'No emitted CSS/HTML/JS path reference; retained pending approval'}));
 return {references:count,families:Object.fromEntries([...coverage].map(([k,v])=>[k,[...v].sort((a,b)=>a-b)])),faces,unused};
}
export function assertAssets(root='dist'){return inspectAssets(root).references;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=inspectAssets();console.log(`Verified ${report.references} CSS references; ${report.faces.length} font declarations with real WOFF2 family/weight coverage.`);
 for(const asset of report.unused)console.log(`Retained unused asset: ${asset.path} (${asset.bytes} bytes)`);
 if(process.env.ASSET_REPORT_PATH)fs.writeFileSync(process.env.ASSET_REPORT_PATH,JSON.stringify(report,null,2));
}
