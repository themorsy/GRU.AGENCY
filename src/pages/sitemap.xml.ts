import type {APIRoute} from 'astro';
import {getCollection} from 'astro:content';
export const GET:APIRoute=async({site})=>{
  const origin=site!.origin;
  const pages=(await getCollection('pages')).filter(p=>p.data.published);
  const xml=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${pages.flatMap(({data:p})=>p.languages.map(lang=>{const path=p.slug==='home'?'':p.slug+'/';return `<url><loc>${origin}/${lang}/${path}</loc>${p.languages.map(l=>`<xhtml:link rel="alternate" hreflang="${l}" href="${origin}/${l}/${path}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${origin}/${p.languages.includes('en')?'en':p.languages[0]}/${path}"/></url>`;})).join('')}</urlset>`;
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
