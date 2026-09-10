import type {APIRoute} from 'astro';
export const GET:APIRoute=({site})=>{
  const origin=site!.origin;
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${['','thank-you/'].flatMap(suffix=>['en','ar'].map(lang=>`<url><loc>${origin}/${lang}/${suffix}</loc><xhtml:link rel="alternate" hreflang="en" href="${origin}/en/${suffix}"/><xhtml:link rel="alternate" hreflang="ar" href="${origin}/ar/${suffix}"/><xhtml:link rel="alternate" hreflang="x-default" href="${origin}/en/${suffix}"/></url>`)).join('')}</urlset>`;
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
