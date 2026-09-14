import type {APIRoute} from 'astro';
import {getCollection} from 'astro:content';
export const GET:APIRoute=async()=>new Response(JSON.stringify((await getCollection('pages')).find(p=>p.data.slug==='home')!.data),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
