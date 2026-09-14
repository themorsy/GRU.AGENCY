import type {APIRoute} from 'astro';
// Do not Disallow confirmation pages: crawlers must read their noindex metadata.
export const GET:APIRoute=({site})=>new Response(`User-agent: *\nAllow: /\n# Confirmation pages stay crawlable so their noindex can be read.\nSitemap: ${site!.origin}/sitemap.xml\n`,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
