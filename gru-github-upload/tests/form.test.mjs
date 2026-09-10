import test from 'node:test';
import assert from 'node:assert/strict';
import {validateField,consumeReceipt,receiptKey,postLead} from '../src/scripts/form-logic.ts';
const services=['media-buying','social-content'];
test('required fields and optional fields follow the handoff',()=>{
  for(const id of ['name','email','mobile','service'])assert.equal(validateField(id,' ',services),'required');
  for(const id of ['company','brief'])assert.equal(validateField(id,'',services),null);
});
test('email, phone and service validation rejects malformed or unknown values',()=>{
  assert.equal(validateField('email','person@example.com',services),null);
  for(const v of ['a@b','a@b c.com','a@@b.com'])assert.equal(validateField('email',v,services),'email');
  for(const v of ['+20 111 111 3442','٠١١١١١١٣٤٤٢'])assert.equal(validateField('mobile',v,services),null);
  for(const v of ['hello12345678','123','1'.repeat(16)])assert.equal(validateField('mobile',v,services),'mobile');
  assert.equal(validateField('service','media-buying',services),null);
  assert.equal(validateField('service','tampered-service',services),'service');
  assert.equal(validateField('brief','a'.repeat(3001),services),'length');
});
const makeStore=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
test('accepted leads count once, with correct language; direct views do not count',()=>{
  const storage=makeStore();assert.equal(consumeReceipt(storage,'en',10000),null);
  storage.setItem(receiptKey,JSON.stringify({id:'lead-1',lang:'ar',at:10000}));
  assert.equal(consumeReceipt(storage,'en',10001),null);
  assert.equal(consumeReceipt(storage,'ar',10001).id,'lead-1');
  assert.equal(consumeReceipt(storage,'ar',10002),null);
});
test('stale, corrupt and inaccessible receipts do not produce false conversions',()=>{
  const storage=makeStore();
  for(const raw of ['broken',JSON.stringify({id:'x',lang:'en',at:0}),JSON.stringify({id:'x',lang:'ar',at:10000000})]){
    storage.setItem(receiptKey,raw);assert.equal(consumeReceipt(storage,'en',700000),null);
  }
  assert.equal(consumeReceipt({getItem(){throw Error('blocked');}},'en'),null);
});
test('local previews never POST or claim successful collection',async()=>{
  let sent=false;await assert.rejects(()=>postLead('/en/thank-you/','',false,async()=>{sent=true;return new Response();}));assert.equal(sent,false);
});
test('Netlify POST uses URL-encoded fields and requires a successful response',async()=>{
  let called=false;
  await postLead('https://gru.agency/ar/thank-you/','form-name=gru-lead-ar&name=Test',true,async(url,options)=>{
    called=true;assert.equal(url,'https://gru.agency/ar/thank-you/');assert.equal(options.method,'POST');assert.equal(options.headers['Content-Type'],'application/x-www-form-urlencoded');assert.match(options.body,/form-name=gru-lead-ar/);return new Response('',{status:200});
  });assert.equal(called,true);
  for(const status of [400,404,429,500])await assert.rejects(()=>postLead('/en/thank-you/','',true,async()=>new Response('',{status})));
  await assert.rejects(()=>postLead('/en/thank-you/','',true,async()=>{throw Error('network');}));
});
