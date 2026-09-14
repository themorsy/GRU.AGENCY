import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'file:///C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const origin=process.env.CMS_REGRESSION_ORIGIN||'http://127.0.0.1:4333';
const output=' .qa/cms-restore-2026-09-14'.trim();
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try{
  for(const width of [390,1440])for(const lang of ['en','ar']){
    const page=await browser.newPage({viewport:{width,height:1200},deviceScaleFactor:1});
    const response=await page.goto(`${origin}/${lang}/`,{waitUntil:'networkidle'});
    await page.screenshot({path:path.join(output,`public-after-${lang}-${width}.png`),fullPage:true});
    results.push(await page.evaluate(({lang,width,status,headers})=>{
      const style=element=>{const computed=getComputedStyle(element),box=element.getBoundingClientRect();return {fontFamily:computed.fontFamily,fontSize:computed.fontSize,fontWeight:computed.fontWeight,lineHeight:computed.lineHeight,width:box.width,height:box.height,display:computed.display};};
      const form=document.querySelector('[data-lead-form]');const video=document.querySelector('.hero video');
      return {lang,width,status,headers,document:{dir:document.documentElement.dir,h1:document.querySelectorAll('h1').length,sections:[...document.querySelectorAll('main>section')].map(section=>section.id||section.className),horizontalOverflow:document.documentElement.scrollWidth>innerWidth},hero:style(document.querySelector('.hero h1')),sectionHeading:style(document.querySelector('.services .section-heading h2')),methodCard:style(document.querySelector('.method-card')),portfolio:{cards:document.querySelectorAll('.project-card').length,images:document.querySelectorAll('.project-card img').length},form:{visible:!!form,disabled:form?.querySelector('.form-submit')?.disabled===true},video:{desktop:video?.dataset.desktop,mobile:video?.dataset.mobile}};
    },{lang,width,status:response?.status()||0,headers:Object.fromEntries(Object.entries(response?.headers()||{}).filter(([key])=>['x-robots-tag','cache-control'].includes(key)))}));
    await page.close();
  }
}finally{await browser.close();}
fs.writeFileSync(path.join(output,'public-regression-after.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
