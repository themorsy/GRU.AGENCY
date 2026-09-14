import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import fs from 'node:fs';
const str=z.string();
const link=z.object({label:str,href:str});
const item=z.object({title:str,body:str,icon:z.enum(['pattern','care','partnership'])});
export const localeSchema=z.object({
    id:z.enum(['en','ar']),lang:z.enum(['en','ar']),dir:z.enum(['ltr','rtl']),copyStatus:str,
    sectionOrder:z.array(z.enum(['hero','proof','services','portfolio','cta','value','method','about','form'])).refine(a=>new Set(a).size===a.length&&a.includes('hero'),'Sections must be unique and include Hero for one H1'),
    seo:z.object({
      title:str,
      description:str,
      indexable:z.boolean(),
      includeInSitemap:z.boolean(),
      socialTitle:str,
      socialDescription:str,
      socialImage:str,
      socialImageAlt:str,
      canonicalUrl:str
    }),logoAlt:str,nav:z.array(link),
    ui:z.object({previous:str,next:str,slide:str,carousel:str,book:str,work:str,skip:str,menu:str,close:str,language:str,navigation:str,languagePair:str,whatsapp:str,pause:str,play:str}),
    hero:z.object({headline:str,body:str,video:str,poster:str,videoWebm:str,videoMobile:str}).refine(h=>!h.video||!!h.poster,{message:'Supply a poster whenever a hero video is configured.'}),
    proof:z.object({eyebrow:str,logosLabel:str,stats:z.array(z.object({value:str,label:str,dir:z.enum(['ltr','rtl']),countTo:z.number().nullable()})),logos:z.array(z.object({src:str,alt:str})).min(4)}),
    services:z.object({eyebrow:str,title:str,items:z.array(z.object({id:str,num:str,label:str,items:z.array(z.object({id:str,label:str,href:str}))}))}),
    portfolio:z.object({eyebrow:str,title:str,note:str,placeholder:str,caseStudy:str,projects:z.array(z.object({id:str,name:str,category:str,image:str,imageAlt:str,fullImage:str,caseStudyUrl:str,body:str,gallery:z.array(z.object({src:str,alt:str,type:z.enum(['image','video','youtube']),poster:str})).min(1)}))}),
    cta:z.object({statement:str}),value:z.object({eyebrow:str,title:str,items:z.array(item)}),
    method:z.object({eyebrow:str,title:str,support:str,items:z.array(item.extend({num:str,titleBreakAfter:z.number().int().positive().optional()}))}),
    about:z.object({eyebrow:str,statement:str,body:str}),
    form:z.object({eyebrow:str,title:str,intro:str,fields:z.array(z.object({id:str,label:str,placeholder:str,span:z.number(),required:z.boolean(),type:z.enum(['text','email','tel','select','textarea'])})),errors:z.object({required:str,email:str,mobile:str,service:str,length:str}),sending:str,submitError:str,noscript:str}),
    footer:z.object({body:str,sitemap:str,contact:str,follow:str,whatsapp:str,copyright:str,socials:z.array(link)}),
    thanks:z.object({title:str,body:str,back:str}),contact:z.object({email:str,phone:str,phoneHref:str,whatsapp:str})
  }).superRefine((c,ctx)=>{
    // CMS edits must preserve identifiers used by anchors, select options and validation.
    const unique=(ids:string[],label:string)=>{if(ids.some(id=>!id.trim())||new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:label+' identifiers must be nonempty and unique'});};
    unique(c.portfolio.projects.map(p=>p.id),'Project');
    unique(c.services.items.flatMap(p=>[p.id,...p.items.map(s=>s.id)]),'Service');
    const expected=['name','email','mobile','service','company','brief'];
    const ids=c.form.fields.map(f=>f.id);
    if(ids.length!==expected.length||expected.some(id=>!ids.includes(id)))ctx.addIssue({code:'custom',message:'Keep the six approved form fields; edit labels and placeholders only'});
    if(c.lang!==c.id||c.dir!==(c.lang==='ar'?'rtl':'ltr'))ctx.addIssue({code:'custom',message:'Language identity and direction must match'});
  });
const locales=defineCollection({loader:async()=>Object.values(JSON.parse(fs.readFileSync('./src/content/pages/home.json','utf8')).content) as any[],schema:localeSchema.refine(c=>!!c.hero.headline&&!!c.seo.title&&!!c.seo.description,'Homepage headline and SEO are required')});
const pages=defineCollection({loader:glob({pattern:'*.json',base:'./src/content/pages'}),schema:z.object({title:z.string().min(1),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).refine(s=>!['en','ar','admin','thank-you','assets','fonts','robots','sitemap'].includes(s),'Reserved page URL'),published:z.boolean(),languages:z.array(z.enum(['en','ar'])).min(1).refine(a=>new Set(a).size===a.length,'Languages must be unique'),gtmId:z.string().regex(/^$|^GTM-[A-Z0-9]+$/,'Use a GTM container ID such as GTM-ABC1234').default(''),content:z.object({en:localeSchema,ar:localeSchema})}).superRefine((p,ctx)=>{for(const lang of ['en','ar'] as const)if(p.content[lang].lang!==lang)ctx.addIssue({code:'custom',message:'Content language does not match its key'});if(p.published)for(const lang of p.languages){const c=p.content[lang];if(!c.hero.headline||!c.seo.title||!c.seo.description)ctx.addIssue({code:'custom',message:lang+' headline and SEO are required to publish'});}if(p.slug==='home'&&(!p.published||p.languages.length!==2))ctx.addIssue({code:'custom',message:'The approved homepage must remain published in both languages'});})});
export const collections={locales,pages};


