import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const str=z.string();
const link=z.object({label:str,href:str});
const item=z.object({title:str,body:str});
const locales=defineCollection({
  loader:glob({pattern:'{en,ar}.json',base:'./src/content'}),
  schema:z.object({
    id:z.enum(['en','ar']),lang:z.enum(['en','ar']),dir:z.enum(['ltr','rtl']),copyStatus:str,
    seo:z.object({title:str,description:str}),logoAlt:str,nav:z.array(link),
    ui:z.object({book:str,work:str,skip:str,menu:str,close:str,language:str,navigation:str,whatsapp:str,pause:str,play:str}),
    hero:z.object({headline:str,body:str,video:str,poster:str,videoLabel:str,videoStatus:str}).refine(h=>!h.video||!!h.poster,{message:'Supply a poster whenever a hero video is configured.'}),
    proof:z.object({eyebrow:str,logosLabel:str,stats:z.array(z.object({value:str,label:str})),logos:z.array(z.object({src:str,alt:str})).min(4)}),
    services:z.object({eyebrow:str,title:str,items:z.array(z.object({id:str,num:str,label:str,items:z.array(z.object({id:str,label:str,href:str}))}))}),
    portfolio:z.object({eyebrow:str,title:str,note:str,placeholder:str,caseStudy:str,projects:z.array(z.object({id:str,name:str,category:str,image:str,imageAlt:str,fullImage:str,caseStudyUrl:str,body:str}))}),
    cta:z.object({statement:str}),value:z.object({eyebrow:str,title:str,items:z.array(item)}),
    method:z.object({eyebrow:str,title:str,support:str,items:z.array(item.extend({num:str,h:str}))}),
    about:z.object({eyebrow:str,statement:str,body:str}),
    form:z.object({eyebrow:str,title:str,intro:str,fields:z.array(z.object({id:str,label:str,placeholder:str,span:z.number(),required:z.boolean(),type:z.enum(['text','email','tel','select','textarea'])})),errors:z.object({required:str,email:str,mobile:str,service:str,length:str}),sending:str,submitError:str,noscript:str}),
    footer:z.object({body:str,sitemap:str,contact:str,follow:str,whatsapp:str,copyright:str,socials:z.array(link)}),
    thanks:z.object({title:str,body:str,back:str}),contact:z.object({email:str,phone:str,phoneHref:str,whatsapp:str})
  })
});
export const collections={locales};
