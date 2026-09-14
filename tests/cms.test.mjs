import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {handleCms} from '../worker/index.ts';
import worker from '../worker/index.ts';

test('CMS config exposes only the Cloudinary public configuration',async()=>{
  const response=await handleCms(new Request('https://cms.example/api/cms/config'),{CLOUDINARY_API_KEY:'public-key'});
  assert.deepEqual(await response.json(),{cloudinary:{cloudName:'r8i4m3mq',apiKey:'public-key'}});
});

test('CMS GitHub OAuth starts with state protection and never exposes the client secret',async()=>{
  const env={CMS_GITHUB_OAUTH_CLIENT_ID:'client-id',CMS_GITHUB_OAUTH_CLIENT_SECRET:'not-for-the-browser'};
  const response=await handleCms(new Request('https://cms.example/api/cms/auth'),env);
  assert.equal(response.status,200);
  const handshake=await response.text();
  assert.match(handshake,/message='authorizing:'\+provider/);
  assert.match(handshake,/provider="github"/);
  const state=response.headers.get('set-cookie').match(/gru_cms_oauth_state=([^;]+)/)[1];
  const start=await handleCms(new Request('https://cms.example/api/cms/authorize',{headers:{Cookie:'gru_cms_oauth_state='+state}}),env);
  assert.equal(start.status,302);
  const location=new URL(start.headers.get('location'));
  assert.equal(location.origin,'https://github.com');
  assert.equal(location.searchParams.get('client_id'),'client-id');
  assert.equal(location.searchParams.get('redirect_uri'),'https://cms.example/api/cms/callback');
  assert.equal(location.searchParams.get('scope'),'repo');
  assert.equal(location.searchParams.get('state'),state);
  assert.ok(response.headers.get('set-cookie').includes('HttpOnly'));
  assert.ok(!start.headers.get('location').includes('not-for-the-browser'));
});

test('CMS OAuth rejects a mismatched callback state and accepts a matching mocked exchange',async()=>{
  const env={CMS_GITHUB_OAUTH_CLIENT_ID:'client-id',CMS_GITHUB_OAUTH_CLIENT_SECRET:'server-only'};
  const started=await handleCms(new Request('https://cms.example/api/cms/auth'),env);
  const state=started.headers.get('set-cookie').match(/gru_cms_oauth_state=([^;]+)/)[1];
  const denied=await handleCms(new Request('https://cms.example/api/cms/callback?code=code&state=wrong',{headers:{Cookie:'gru_cms_oauth_state='+state}}),env);
  assert.match(await denied.text(),/Invalid or expired/);
  const accepted=await handleCms(new Request('https://cms.example/api/cms/callback?code=code&state='+state,{headers:{Cookie:'gru_cms_oauth_state='+state}}),env,async(url,options)=>{
    assert.equal(url,'https://github.com/login/oauth/access_token');
    assert.match(options.body.toString(),/client_secret=server-only/);
    return new Response(JSON.stringify({access_token:'test-access-token'}),{headers:{'Content-Type':'application/json'}});
  });
  const body=await accepted.text();
  assert.match(body,/authorization:github:success/);
  assert.match(body,/test-access-token/);
  assert.ok(!body.includes('server-only'));
});

test('admin and CMS API responses are always noindex, nofollow and uncached',async()=>{
  const env={ASSETS:{fetch:async()=>new Response('<!doctype html>',{status:200})}};
  for(const path of ['/admin/','/api/cms/config']){
    const response=await worker.fetch(new Request('https://cms.example'+path),env);
    assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
    assert.equal(response.headers.get('cache-control'),'no-store');
  }
});

test('CMS editor exposes bilingual filtering, section ordering, campaigns and accessible media validation',()=>{
  const editor=fs.readFileSync('public/admin/editor.js','utf8');
  for(const text of ['English only','Arabic only','Both','sectionOrder',"key==='projects'", "key==='gallery'",'Published','supported media URL','accessible description'])assert.ok(editor.includes(text),text);
  assert.ok(editor.includes("folder:'src/content/pages'"));
  assert.ok(editor.includes('create:true'));
  assert.ok(editor.includes("font-family:'Arabic Typesetting'" )===false,'Typography belongs in the stylesheet.');
  assert.ok(!editor.includes('784414732372788'),'Old Cloudinary credentials must not remain in the editor.');
  assert.ok(!editor.includes('Mammoth'),'Arabic CMS fields must not load Mammoth.');
  assert.ok(fs.readFileSync('public/admin/editor.css','utf8').includes("'Arabic Typesetting'"));
  const admin=fs.readFileSync('src/pages/admin/index.astro','utf8');
  assert.ok(admin.includes('decap-cms@3.16.0'));
  assert.ok(!admin.includes('react@18.3.1'),'Decap must own the single React runtime used by the custom widget.');
});
