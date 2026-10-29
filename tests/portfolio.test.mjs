import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {parseHTML} from 'linkedom';

const contentFile='src/content/pages/home.json';
const slide=(src,alt)=>({src,alt,type:'image',poster:''});

test('homepage uses one flat project list with the original semantic fields',()=>{
  const page=JSON.parse(fs.readFileSync(contentFile,'utf8'));
  for(const lang of ['en','ar']){
    const portfolio=page.content[lang].portfolio;
    assert.ok(!('categories' in portfolio),`${lang}: no fixed category list`);
    assert.ok(!('allWork' in portfolio),`${lang}: no All work fallback`);
    for(const project of portfolio.projects){
      assert.ok(!('categoryId' in project),`${lang}/${project.id}: no category assignment`);
      assert.ok(!('cardCover' in project)&&!('cardCoverAlt' in project),`${lang}/${project.id}: original field names`);
      assert.ok(!('fullImage' in project),`${lang}/${project.id}: no fullImage`);
      for(const key of ['id','name','category','image','imageAlt','gallery'])assert.ok(key in project,`${lang}/${project.id}: ${key}`);
      assert.ok(Array.isArray(project.gallery)&&project.gallery.length>0,`${lang}/${project.id}: gallery`);
    }
    assert.ok(portfolio.projects.some(project=>!project.image),`${lang}: a blank-cover project is preserved`);
  }
});

test('CMS card and gallery changes reach one flat EN and AR rail',()=>{
  assert.ok(fs.existsSync('dist/en/index.html'),'Run npm run build before npm test.');
  const original=fs.readFileSync(contentFile,'utf8');
  try{
    const page=JSON.parse(original);
    const en=page.content.en.portfolio;
    const ar=page.content.ar.portfolio;
    const enProject=id=>en.projects.find(project=>project.id===id);
    const arProject=id=>ar.projects.find(project=>project.id===id);
    const originalEnProjects=en.projects.length;
    const originalArProjects=ar.projects.length;
    const originalEnGallery=enProject('project-1').gallery.length;

    // Card fields come straight from the CMS.
    enProject('project-1').name='Make It Updated';
    enProject('project-1').category='Branding Test';
    enProject('project-1').image='/assets/projects/project-1-2.webp';
    enProject('project-1').imageAlt='Updated Make It card cover';
    enProject('project-1').gallery=[...enProject('project-1').gallery,slide('/assets/projects/project-5-1.webp','Added gallery slide')];
    // Reorder the rail and add a seventh project to prove there is no four-card cap.
    en.projects=en.projects.filter(project=>project.id!=='project-qa-7');
    en.projects=[enProject('project-6'),enProject('project-1'),...en.projects.filter(project=>!['project-6','project-1'].includes(project.id)),{
      id:'project-qa-7',name:'Seventh Project',category:'Test Category',image:'/assets/projects/project-2-2.webp',imageAlt:'Seventh cover',
      caseStudyUrl:'',body:'Seventh project body',gallery:[slide('/assets/projects/project-2-3.webp','Seventh gallery one'),slide('/assets/projects/project-2-4.webp','Seventh gallery two')]
    }];

    arProject('project-1').name='Make It AR Updated';
    arProject('project-1').category='Test AR Category';
    arProject('project-1').image='/assets/projects/project-1-1.webp';
    arProject('project-1').imageAlt='AR updated cover';
    arProject('project-1').gallery=[...arProject('project-1').gallery,slide('/assets/projects/project-5-2.webp','AR added gallery slide')];
    ar.projects=ar.projects.filter(project=>project.id!=='project-qa-7');
    ar.projects=[...ar.projects,{
      id:'project-qa-7',name:'Seventh AR Project',category:'Test AR Category Two',image:'/assets/projects/project-2-4.webp',imageAlt:'Seventh AR cover',
      caseStudyUrl:'',body:'Seventh AR project body',gallery:[slide('/assets/projects/project-2-3.webp','AR seventh gallery one')]
    }];

    fs.writeFileSync(contentFile,JSON.stringify(page,null,2)+'\n');
    // Content collection snapshots can otherwise retain the prior same-second file state on Windows.
    // Give the edited CMS source a distinct timestamp and force Vite to reload it for this fixture build.
    fs.utimesSync(contentFile,new Date(),new Date(Date.now()+2000));
    execFileSync(process.execPath,['node_modules/astro/bin/astro.mjs','build','--force','--outDir','dist-fixture'],{env:{...process.env,ASTRO_TELEMETRY_DISABLED:'1'},stdio:'pipe'});
    const enDoc=parseHTML(fs.readFileSync('dist-fixture/en/index.html','utf8')).document;
    assert.equal(enDoc.querySelectorAll('[data-project-rail]').length,1,'one rail');
    assert.equal(enDoc.querySelectorAll('.project-card').length,originalEnProjects+1,'every project plus the new card renders');
    assert.equal(enDoc.querySelectorAll('[data-portfolio-filter],[data-portfolio-group],.portfolio-filter').length,0,'no filters or groups');
    assert.ok(!enDoc.body.textContent.includes('All work'),'no All work UI');
    assert.deepEqual([...enDoc.querySelectorAll('.project-card h3')].map(node=>node.textContent),en.projects.map(project=>project.name),'CMS project order');
    const updated=[...enDoc.querySelectorAll('.project-card')].find(card=>card.querySelector('[data-project-open="project-1"]'));
    assert.ok(updated,'updated card renders');
    assert.equal(updated.querySelector('h3').textContent,'Make It Updated','title change');
    assert.equal(updated.querySelector('.project-category').textContent,'Branding Test','category change');
    assert.equal(updated.querySelector('.project-visual img').getAttribute('src'),'/assets/projects/project-1-2.webp','cover change');
    assert.equal(updated.querySelector('.project-visual img').getAttribute('alt'),'Updated Make It card cover','cover alt change');
    const five=updated.querySelector('template[id="project-1"]')||enDoc.getElementById('project-1');
    const gallery=[...five.content.querySelectorAll('template[data-slide]')];
    assert.equal(gallery.length,originalEnGallery+1,'added gallery item renders in the lightbox');
    assert.ok(gallery.some(template=>template.content.querySelector('img')?.getAttribute('alt')==='Added gallery slide'),'added gallery item preserved');
    assert.ok(gallery.some(template=>template.content.querySelector('img')?.getAttribute('src')==='/assets/projects/project-1-2.webp'),'gallery copy of the chosen cover remains');
    assert.ok(!updated.querySelector('.project-visual .project-placeholder'),'first project has a cover');
    const placeholderCard=[...enDoc.querySelectorAll('.project-card')].find(card=>card.querySelector('[data-project-open="project-4"]'));
    assert.ok(placeholderCard.querySelector('.project-placeholder[role=img][aria-label]'),'blank-cover project keeps an accessible placeholder');
    assert.ok(!placeholderCard.querySelector('.project-visual img'),'blank-cover project has no image element');
    assert.equal(enDoc.querySelector('[data-project-open="project-qa-7"] h3').textContent,'Seventh Project','seventh card renders');
    assert.equal(enDoc.querySelector('[data-project-open="project-qa-7"] .project-category').textContent,'Test Category','seventh card category');
    assert.equal(enDoc.querySelector('[data-project-open="project-qa-7"] .project-visual img').getAttribute('src'),'/assets/projects/project-2-2.webp','seventh card cover');
    const arDoc=parseHTML(fs.readFileSync('dist-fixture/ar/index.html','utf8')).document;
    assert.equal(arDoc.documentElement.dir,'rtl');
    assert.equal(arDoc.querySelectorAll('.project-card').length,originalArProjects+1,'Arabic rail renders every project plus the new card');
    assert.equal(arDoc.querySelectorAll('[data-portfolio-filter],[data-portfolio-group],.portfolio-filter').length,0,'Arabic has no filters or groups');
    assert.ok(!arDoc.body.textContent.includes('All work'),'Arabic has no All work UI');
    const arUpdated=[...arDoc.querySelectorAll('.project-card')].find(card=>card.querySelector('[data-project-open="project-1"]'));
    assert.equal(arUpdated.querySelector('h3').textContent,'Make It AR Updated','Arabic title change');
    assert.equal(arUpdated.querySelector('.project-category').textContent,'Test AR Category','Arabic category change');
    assert.equal(arUpdated.querySelector('.project-visual img').getAttribute('alt'),'AR updated cover','Arabic cover alt change');
    assert.equal(arDoc.querySelector('[data-project-open="project-qa-7"] h3').textContent,'Seventh AR Project','Arabic seventh card');
  }finally{
    fs.writeFileSync(contentFile,original);
    fs.rmSync('dist-fixture',{recursive:true,force:true});
  }
});
