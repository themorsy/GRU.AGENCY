// Release policy shared by the Worker (response headers), the layout (GTM) and the tests.
// Production indexing is decided by hostname, not by a dashboard variable that can be
// left at a staging value and silently de-index the live domain.
export const PRODUCTION_ORIGIN='https://gru.agency';
export const PRODUCTION_HOSTS=['gru.agency','www.gru.agency'];
export const DEFAULT_GTM_ID='GTM-54CQR8HS';

const normaliseHost=(hostname:string)=>hostname.toLowerCase().trim().replace(/\.$/,'').replace(/:\d+$/,'');

export function isProductionHost(hostname:string):boolean{
  return PRODUCTION_HOSTS.includes(normaliseHost(hostname));
}

export function isProductionOrigin(origin:string):boolean{
  try{return new URL(origin).origin===PRODUCTION_ORIGIN;}catch{return false;}
}

// Admin, CMS endpoints and confirmation pages are never eligible, on any host.
export function isNoindexPath(pathname:string):boolean{
  const path=pathname.toLowerCase();
  return /^\/admin(?:\/|$)/.test(path)||/^\/api(?:\/|$)/.test(path)||/(?:^|\/)thank-you(?:\/|$)/.test(path);
}

export function isIndexableRequest(url:URL,status:number):boolean{
  return status<400&&isProductionHost(url.hostname)&&!isNoindexPath(url.pathname);
}

// GTM is part of the production release only: the build must target gru.agency and the
// request must arrive on a production host. Preview builds never contain the loader.
export function gtmEnabledForBuild(builtOrigin:string,gtmId:string):boolean{
  return !!gtmId&&isProductionOrigin(builtOrigin);
}

export function gtmEnabledForRequest(builtOrigin:string,hostname:string,gtmId:string):boolean{
  return gtmEnabledForBuild(builtOrigin,gtmId)&&isProductionHost(hostname);
}
