import home from '../src/content/pages/home.json' with {type:'json'};
import {validateField} from '../src/scripts/form-logic.ts';
type Language='en'|'ar';
interface Env{
 ASSETS:{fetch(request:Request):Promise<Response>};
 LEAD_RATE_LIMITER:{limit(options:{key:string}):Promise<{success:boolean}>};
 RESEND_API_KEY?:string;LEAD_FROM?:string;LEAD_TO?:string;LEAD_FORM_ENABLED?:string;SITE_INDEXABLE?:string;
 CMS_GITHUB_OAUTH_CLIENT_ID?:string;CMS_GITHUB_OAUTH_CLIENT_SECRET?:string;CLOUDINARY_API_KEY?:string;
}
export function negotiateLanguage(header:string|null):Language{
 const preferences=(header||'').split(',').map((entry,index)=>{const [tag,...params]=entry.trim().toLowerCase().split(';');const qparam=params.find(p=>p.trim().startsWith('q='));const q=qparam?Number(qparam.trim().slice(2)):1;return {tag,q,index};}).filter(p=>Number.isFinite(p.q)&&p.q>0&&p.q<=1).sort((a,b)=>b.q-a.q||a.index-b.index);
 for(const {tag} of preferences){if(/^ar(?:-|$)/.test(tag))return 'ar';if(/^en(?:-|$)/.test(tag))return 'en';}return 'en';
}
export function secure(response:Response,indexable=false):Response{
 const result=new Response(response.body,response);result.headers.set('X-Content-Type-Options','nosniff');result.headers.set('Referrer-Policy','strict-origin-when-cross-origin');result.headers.set('X-Frame-Options','DENY');result.headers.set('Permissions-Policy','geolocation=(), microphone=(), camera=()');if(indexable)result.headers.delete('X-Robots-Tag');else result.headers.set('X-Robots-Tag','noindex, follow');return result;
}
function cmsResponse(body:string,status=200,headers:HeadersInit={}){return new Response(body,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store',...headers}});}
function cmsJson(value:unknown,status=200){return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});}
function cookie(request:Request,name:string){return request.headers.get('Cookie')?.split(';').map(part=>part.trim()).find(part=>part.startsWith(name+'='))?.slice(name.length+1)||'';}
function popupMessage(url:URL,type:'success'|'error',value:unknown){
 const message=`authorization:github:${type}:${JSON.stringify(value)}`.replace(/</g,'\\u003c');
 return cmsResponse(`<!doctype html><meta name="robots" content="noindex, nofollow"><title>GRU CMS</title><script>window.opener&&window.opener.postMessage(${JSON.stringify(message)},${JSON.stringify(url.origin)});window.close();</script><p>You can close this window.</p>`);
}
export async function handleCms(request:Request,env:Env,send:typeof fetch=fetch):Promise<Response>{
 const url=new URL(request.url);
 if(url.pathname==='/api/cms/config')return cmsJson({cloudinary:{cloudName:'r8i4m3mq',apiKey:env.CLOUDINARY_API_KEY||null}});
 if(url.pathname==='/api/cms/auth'){
  if(request.method!=='GET')return new Response(null,{status:405,headers:{Allow:'GET','Cache-Control':'no-store'}});
  if(!env.CMS_GITHUB_OAUTH_CLIENT_ID||!env.CMS_GITHUB_OAUTH_CLIENT_SECRET)return cmsResponse('<!doctype html><meta name="robots" content="noindex, nofollow"><title>CMS setup required</title><p>GitHub OAuth is not configured for this CMS yet.</p>',503);
  const state=crypto.randomUUID();const callback=new URL('/api/cms/callback',url.origin).toString();const authorize=new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id',env.CMS_GITHUB_OAUTH_CLIENT_ID);authorize.searchParams.set('redirect_uri',callback);authorize.searchParams.set('scope','repo');authorize.searchParams.set('state',state);
  return new Response(null,{status:302,headers:{Location:authorize.toString(),'Cache-Control':'no-store','Set-Cookie':`gru_cms_oauth_state=${state}; Path=/api/cms; HttpOnly; Secure; SameSite=Lax; Max-Age=600`}});
 }
 if(url.pathname==='/api/cms/callback'){
  const state=url.searchParams.get('state')||'';const failure=url.searchParams.get('error');
  if(failure)return popupMessage(url,'error',{error:failure});
  if(!state||state!==cookie(request,'gru_cms_oauth_state'))return popupMessage(url,'error',{error:'Invalid or expired CMS login state.'});
  const code=url.searchParams.get('code');if(!code||!env.CMS_GITHUB_OAUTH_CLIENT_ID||!env.CMS_GITHUB_OAUTH_CLIENT_SECRET)return popupMessage(url,'error',{error:'GitHub OAuth is not configured.'});
  try{
   const callback=new URL('/api/cms/callback',url.origin).toString();const body=new URLSearchParams({client_id:env.CMS_GITHUB_OAUTH_CLIENT_ID,client_secret:env.CMS_GITHUB_OAUTH_CLIENT_SECRET,code,redirect_uri:callback});
   const result=await send('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body});
   const payload=await result.json() as {access_token?:string;error?:string};if(!result.ok||!payload.access_token)throw new Error(payload.error||'token exchange failed');
   const response=popupMessage(url,'success',{token:payload.access_token,provider:'github'});response.headers.set('Set-Cookie','gru_cms_oauth_state=; Path=/api/cms; HttpOnly; Secure; SameSite=Lax; Max-Age=0');return response;
  }catch{return popupMessage(url,'error',{error:'GitHub login could not be completed.'});}
 }
 return cmsJson({error:'CMS route not found.'},404);
}
function redirect(lang:Language,status:302|303){return secure(new Response(null,{status,headers:{Location:`/${lang}/${status===303?'thank-you/':''}`,'Cache-Control':'no-store',...(status===302?{'Vary':'Accept-Language'}:{})}}));}
const fieldNames=['name','email','mobile','service','company','brief','language','page_url','submission-id','service-label'] as const;
async function failure(request:Request,env:Env,lang:Language,status:number,values:Record<string,string>={}){
 // A failed native POST gets its input back in the existing localized form; never interpolate HTML.
 const response=await env.ASSETS.fetch(new Request(new URL(`/${lang}/`,request.url)));
 const rewriter=new HTMLRewriter().on('[data-submit-error-message]',{element(e){e.removeAttribute('hidden');e.setInnerContent(home.content[lang].form.submitError);}});
 for(const name of fieldNames){
  if(name==='brief')rewriter.on('textarea[name="brief"]',{element(e){e.setInnerContent(values[name]||'');}});
  else if(name==='service')rewriter.on('select[name="service"] option',{element(e){if(e.getAttribute('value')===values.service)e.setAttribute('selected','');else e.removeAttribute('selected');}});
  else rewriter.on(`input[name="${name}"]`,{element(e){e.setAttribute('value',values[name]||'');}});
 }
 const rendered=rewriter.transform(response);return secure(new Response(rendered.body,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store',...(status===429?{'Retry-After':'60'}:{})}}));
}
export async function handleLead(request:Request,env:Env,send:typeof fetch=fetch):Promise<Response>{
 let lang:Language='en',values:Record<string,string>={};
 try{
  if(Number(request.headers.get('content-length')||0)>20000)return failure(request,env,lang,413);
  const type=request.headers.get('content-type')||'';
  if(!/^(application\/x-www-form-urlencoded|multipart\/form-data)(?:;|$)/i.test(type))return failure(request,env,lang,415);
  // Bound streamed bodies too; Content-Length may be absent or untrusted.
  const reader=request.body?.getReader();const chunks:Uint8Array[]=[];let bytes=0;
  if(reader)while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>20000){await reader.cancel();return failure(request,env,lang,413);}chunks.push(chunk.value);}
  const payload=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){payload.set(chunk,offset);offset+=chunk.byteLength;}
  const form=await new Request(request.url,{method:'POST',headers:request.headers,body:payload.buffer}).formData();for(const name of fieldNames){const value=form.get(name);values[name]=typeof value==='string'?value:'';}
  lang=values.language==='ar'?'ar':'en';
  if(String(form.get('bot-field')||'').trim())return redirect(lang,303);
  // Binding is mandatory: do not silently run an unlimited public endpoint.
  const limited=await env.LEAD_RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'local-unknown'});
  if(!limited.success)return failure(request,env,lang,429,values);
  const services=home.content[lang].services.items;
  if(!['en','ar'].includes(values.language)||['name','email','mobile','service','company','brief'].some(name=>validateField(name,values[name],services.map(s=>s.id))))return failure(request,env,lang,422,values);
  if(Object.values(values).some(v=>v.length>4000))return failure(request,env,lang,422,values);
  if(env.LEAD_FORM_ENABLED!=='true'||!env.RESEND_API_KEY||!env.LEAD_FROM||!env.LEAD_TO)return failure(request,env,lang,503,values);
  // Server resolves the label instead of trusting the hidden field's claimed service.
  values['service-label']=services.find(s=>s.id===values.service)!.label;
  const id=values['submission-id'];if(!/^[a-zA-Z0-9-]{1,80}$/.test(id))values['submission-id']=crypto.randomUUID();
  const result=await send('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`gru-${values['submission-id']}`},body:JSON.stringify({from:env.LEAD_FROM,to:[env.LEAD_TO],reply_to:values.email,subject:`GRU website lead (${lang})`,text:fieldNames.map(name=>`${name}: ${values[name]}`).join('\n\n')}),signal:AbortSignal.timeout(15000)});
  if(!result.ok)return failure(request,env,lang,502,values);
  return redirect(lang,303);
 }catch{return failure(request,env,lang,503,values);}
}
async function dispatch(request:Request,env:Env):Promise<Response>{
 const url=new URL(request.url);
 if(url.pathname==='/')return redirect(negotiateLanguage(request.headers.get('Accept-Language')),302);
 if(url.pathname==='/api/lead'){
  if(request.method!=='POST')return secure(new Response(null,{status:405,headers:{Allow:'POST','Cache-Control':'no-store'}}));
  return handleLead(request,env);
 }
 if(url.pathname.startsWith('/api/cms/'))return handleCms(request,env);
 return env.ASSETS.fetch(request);
}
// One runtime flag governs staging indexing for static and Worker responses.
export default {async fetch(request:Request,env:Env){const url=new URL(request.url);const response=await dispatch(request,env);if(url.pathname.startsWith('/admin/')||url.pathname.startsWith('/api/cms/')){const secured=secure(response,false);secured.headers.set('X-Robots-Tag','noindex, nofollow');secured.headers.set('Cache-Control','no-store');return secured;}return secure(response,env.SITE_INDEXABLE==='true'&&!url.pathname.includes('/thank-you/')&&response.status<400);}};
