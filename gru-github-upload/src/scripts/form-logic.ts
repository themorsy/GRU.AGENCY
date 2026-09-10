export type ErrorKey='required'|'email'|'mobile'|'service'|'length';
export function validateField(id:string,value:string,serviceIds:string[]):ErrorKey|null{
  const v=value.trim();
  if(['name','email','mobile','service'].includes(id)&&!v)return 'required';
  const limits:Record<string,number>={name:120,email:254,mobile:40,company:120,brief:3000};
  if(limits[id]&&v.length>limits[id])return 'length';
  if(id==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))return 'email';
  if(id==='mobile'){
    const normalized=v.replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-1632));
    if(!/^\+?[0-9\s().-]+$/.test(normalized)||normalized.replace(/\D/g,'').length<7||normalized.replace(/\D/g,'').length>15)return 'mobile';
  }
  if(id==='service'&&!serviceIds.includes(v))return 'service';
  return null;
}
export interface Receipt {id:string;lang:string;at:number}
export interface Store {getItem(key:string):string|null;setItem(key:string,value:string):void;removeItem(key:string):void}
export const receiptKey='gru-lead-receipt';
export async function postLead(url:string,body:string,live:boolean,send:typeof fetch=fetch){
  if(!live)throw new Error('Form collection requires the Netlify deployment.');
  const response=await send(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error('Submission failed');
}
export function consumeReceipt(storage:Store,lang:string,now=Date.now()):Receipt|null{
  try{
    const raw=storage.getItem(receiptKey);if(!raw)return null;
    const r=JSON.parse(raw) as Receipt;
    if(!r.id||!['en','ar'].includes(r.lang)||typeof r.at!=='number'||now-r.at>600000||r.at>now){storage.removeItem(receiptKey);return null;}
    if(r.lang!==lang)return null;
    storage.removeItem(receiptKey);return r;
  }catch{return null;}
}
