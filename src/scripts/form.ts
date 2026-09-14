import {validateField,receiptKey,postLead} from './form-logic';
import type {ErrorKey} from './form-logic';
const form=document.querySelector<HTMLFormElement>('[data-lead-form]');
if(form){
 form.noValidate=true;
 const pageUrl=form.elements.namedItem('page_url') as HTMLInputElement;pageUrl.value=location.origin+location.pathname;
 const fields=Array.from(form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('.field input,.field select,.field textarea'));
 const service=form.querySelector<HTMLSelectElement>('#service')!;
 const serviceIds=Array.from(service.options).map(o=>o.value).filter(Boolean);
 const errors=JSON.parse(form.dataset.errors||'{}') as Record<ErrorKey,string>;
 const touched=new Set<string>();
 const validate=(field:typeof fields[number])=>{const error=validateField(field.name,field.value,serviceIds);const target=document.getElementById(`${field.id}-error`);if(target)target.textContent=error?errors[error]:'';field.setAttribute('aria-invalid',String(!!error));return !error;};
 fields.forEach(field=>{field.addEventListener('blur',()=>{touched.add(field.id);validate(field);});for(const name of ['input','change'])field.addEventListener(name,()=>{if(touched.has(field.id))validate(field);});});
 document.querySelectorAll<HTMLAnchorElement>('[data-service]').forEach(link=>link.addEventListener('click',()=>{if(link.getAttribute('href')!=='#lead')return;service.value=link.dataset.service||'';if(touched.has('service'))validate(service);}));
 let submitting=false,submissionId=crypto.randomUUID();
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(submitting || form.dataset.live!=='true')return;
  let firstInvalid:typeof fields[number]|undefined;
  fields.forEach(field=>{touched.add(field.id);if(!validate(field)&&!firstInvalid)firstInvalid=field;});
  if(firstInvalid){firstInvalid.focus();return;}
  // Requested event: a valid attempt, not proof of delivery. No personal field values.
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push({event:'generate_lead',lead_id:submissionId,page_language:document.documentElement.lang,page_path:location.pathname,page_type:document.body.dataset.pageType||'homepage',form_name:form.name});
  const submit=form.querySelector<HTMLButtonElement>('[type=submit]')!,errorMessage=form.querySelector<HTMLElement>('[data-submit-error-message]')!;
  const originalLabel=submit.textContent;
  submitting=true;submit.disabled=true;submit.textContent=form.dataset.sending||'';form.setAttribute('aria-busy','true');errorMessage.hidden=true;
  try{
   (form.elements.namedItem('submission-id') as HTMLInputElement).value=submissionId;
   (form.elements.namedItem('service-label') as HTMLInputElement).value=service.selectedOptions[0]?.textContent||'';
   const payload=new URLSearchParams();new FormData(form).forEach((value,key)=>payload.append(key,String(value)));
   await postLead(form.action,payload.toString(),form.dataset.live==='true');
   const receipt={id:submissionId,lang:document.documentElement.lang,at:Date.now()};
   try{sessionStorage.setItem(receiptKey,JSON.stringify(receipt));}catch{}
   // Storage-blocked visits cannot prove a confirmation on the next page; do not invent one.
   // The server still captures the lead. Confirmation analytics is pending in that case.
   window.location.assign(`/${document.documentElement.lang}/thank-you/`);
  }catch{errorMessage.textContent=form.dataset.submitError||'';errorMessage.hidden=false;}
  finally{submitting=false;submit.disabled=false;submit.textContent=originalLabel;form.removeAttribute('aria-busy');}
 });
 window.addEventListener('pageshow',event=>{if(event.persisted){submissionId=crypto.randomUUID();form.reset();touched.clear();fields.forEach(f=>{f.removeAttribute('aria-invalid');const e=document.getElementById(`${f.id}-error`);if(e)e.textContent='';});}});
}


