/* GRU's shared homepage/campaign editor. Hidden language fields remain in the document. */
(async function(){
const response=await fetch('/admin/template.json');
if(!response.ok)throw new Error('The content template could not be loaded. Reload before editing.');
const template=await response.json();
const runtime=await fetch('/api/cms/config',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null);
const cloudinary=runtime?.cloudinary?.apiKey?{cloud_name:runtime.cloudinary.cloudName,api_key:runtime.cloudinary.apiKey,multiple:true}:null;
const copy=value=>JSON.parse(JSON.stringify(value));
const h=window.h;
const initial=copy(template.content);
const sections={sectionOrder:'Page sections',portfolio:'Portfolio',proof:'Clients & proof',hero:'Hero',services:'Services',value:'Client value',method:'Method',about:'About',cta:'Call to action',form:'Lead form',contact:'Contact details',seo:'SEO',nav:'Navigation',footer:'Footer',thanks:'Thank-you',ui:'Button labels'};
const labels={headline:'Headline',body:'Text',eyebrow:'Section label',title:'Title',src:'Media URL',alt:'Image description',image:'Card image',imageAlt:'Image description',fullImage:'Full-size image',poster:'Video poster',video:'Background video',gallery:'Project gallery',projects:'Projects',logos:'Client logos',stats:'Stats',items:'Items',value:'Number or value',label:'Label',href:'Link',name:'Name',category:'Service category',caseStudyUrl:'Case-study link',sectionOrder:'Page sections',seo:'Search appearance',description:'Description',phoneHref:'Phone link',whatsapp:'WhatsApp link',copyStatus:'Copy status'};
const locked=new Set(['id','lang','dir','num','span','required','h','videoLabel','videoStatus','copyStatus','type']);
const label=k=>labels[k]||k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase());
const blankSlide=()=>({src:'',alt:'',type:'image',poster:''});
const Control=window.createClass({
 getInitialState(){return {language:'both',section:'portfolio',error:''};},
 data(){return this.props.value?.toJS?this.props.value.toJS():this.props.value||copy(template.content);},
 componentDidMount(){if(!this.props.value)this.props.onChange(copy(template.content));},
 change(path,value){const data=copy(this.data());let node=data;for(const k of path.slice(0,-1))node=node[k];node[path.at(-1)]=value;this.props.onChange(data);},
 isValid(){const d=this.data();for(const lang of ['en','ar']){const c=d[lang];if(!c.sectionOrder.includes('hero')||new Set(c.sectionOrder).size!==c.sectionOrder.length)return {error:{message:'Include Hero exactly once.'}};if(c.hero.video&&!c.hero.poster)return {error:{message:'A background video needs a poster.'}};}return true;},
 media(path,multiple=false){
  if(!window.cloudinary||!cloudinary){this.setState({error:'Cloudinary is not configured yet. An administrator must add CLOUDINARY_API_KEY to the Cloudflare Worker.'});return;}
  window.cloudinary.openMediaLibrary({...cloudinary,multiple},{insertHandler:result=>{
   const assets=result.assets.filter(a=>['image','video'].includes(a.resource_type));
   if(!assets.length){this.setState({error:'Choose an image or video.'});return;}
   if(multiple){let value=this.data();for(const k of path)value=value[k];this.change(path,[...value,...assets.map(a=>({src:a.derived?.[0]?.secure_url||a.secure_url,alt:a.display_name||a.public_id,type:a.resource_type,poster:''}))]);}
   else{const a=assets[0];const data=copy(this.data());let node=data;for(const k of path.slice(0,-1))node=node[k];node[path.at(-1)]=a.derived?.[0]?.secure_url||a.secure_url;if(path.at(-1)==='src'&&path.includes('gallery'))node.type=a.resource_type;this.props.onChange(data);}
  }});
 },
 move(path,list,i,delta){const next=copy(list);[next[i],next[i+delta]]=[next[i+delta],next[i]];this.change(path,next);},
 field(value,path,key){
  if(locked.has(key))return null;
  const id='gru-'+path.join('-');
  if(Array.isArray(value)){
   // Form structure is fixed because the Worker validation depends on these field names.
   if(key==='fields')return h('div',{},h('p',{},'Edit labels and placeholders. Field structure is fixed.'),...value.map((item,i)=>h('details',{key:item.id},h('summary',{},item.label),this.field(item,[...path,i],'entry'))));
   if(key==='sectionOrder')return h('div',{},h('p',{className:'help'},'Move sections to change their published order. Hero supplies the page H1.'),...value.map((v,i)=>h('div',{key:v,className:'gru-toolbar'},h('span',{},sections[v]||v),h('button',{type:'button',disabled:i===0,onClick:()=>this.move(path,value,i,-1),'aria-label':`Move ${sections[v]} up`},'↑'),h('button',{type:'button',disabled:i===value.length-1,onClick:()=>this.move(path,value,i,1),'aria-label':`Move ${sections[v]} down`},'↓'),h('button',{type:'button',disabled:v==='hero',onClick:()=>this.change(path,value.filter((_,n)=>n!==i))},'Hide'))),h('select',{value:'',onChange:e=>e.target.value&&this.change(path,[...value,e.target.value]),'aria-label':'Add section'},h('option',{value:''},'Add section…'),...template.content.en.sectionOrder.filter(v=>!value.includes(v)).map(v=>h('option',{value:v,key:v},sections[v]))));
   return h('div',{},h('h3',{},label(key)),...value.map((item,i)=>h('details',{key:item.id||i},h('summary',{},item.name||item.title||item.label||item.alt||`${label(key)} ${i+1}`),h('div',{className:'gru-toolbar'},h('button',{type:'button',disabled:i===0,onClick:()=>this.move(path,value,i,-1)},'Move up'),h('button',{type:'button',disabled:i===value.length-1,onClick:()=>this.move(path,value,i,1)},'Move down'),h('button',{type:'button',onClick:()=>this.change(path,value.filter((_,n)=>n!==i))},'Remove')),this.field(item,[...path,i],'entry'))),h('div',{className:'gru-toolbar'},h('button',{type:'button',onClick:()=>{let item=copy(value[0]||this.sample(path)||{});if(key==='gallery')item=blankSlide();const renewIds=x=>{if(!x||typeof x!=='object')return;if(x.id)x.id='item-'+crypto.randomUUID().slice(0,8);Object.values(x).forEach(v=>{if(Array.isArray(v))v.forEach(renewIds);});};renewIds(item);if(key==='projects'){item.name='New project';item.gallery=Array.from({length:4},blankSlide);}this.change(path,[...value,item]);}},`Add ${key==='projects'?'project':key==='gallery'?'slide':'item'}`),key==='gallery'&&h('button',{type:'button',onClick:()=>this.media(path,true)},'Upload / add from Cloudinary')));
  }
  if(value&&typeof value==='object')return h('div',{},...Object.entries(value).map(([k,v])=>h('div',{key:k},this.field(v,[...path,k],k))));
  const media=['src','image','fullImage','poster','video'].includes(key);
  return h('label',{className:'gru-field',htmlFor:id},h('span',{},label(key)),h(typeof value==='string'&&(value.length>90||['body','headline','description','statement','intro','support'].includes(key))?'textarea':'input',{id,value:value??'',onChange:e=>this.change(path,typeof value==='number'?Number(e.target.value):e.target.value),dir:path[0]==='ar'&&!media&&!['href','email','phone','phoneHref','whatsapp','caseStudyUrl'].includes(key)?'rtl':'ltr'}),media&&h('button',{type:'button',onClick:()=>this.media(path)},'Upload / choose media'),media&&h('small',{},'Choose from Cloudinary, or paste a media URL. Add a poster for video.'),key==='src'&&path.includes('gallery')&&h('select',{'aria-label':'Media type',value:this.read([...path.slice(0,-1),'type']),onChange:e=>this.change([...path.slice(0,-1),'type'],e.target.value)},...['image','video','youtube'].map(t=>h('option',{value:t,key:t},t))));
 },
 read(path){let v=this.data();for(const k of path)v=v?.[k];return v;},
 sample(path){let v=template.content;for(const k of path)v=v?.[typeof k==='number'?0:k];return Array.isArray(v)?v[0]:v;},
 render(){const data=this.data();const langs=this.state.language==='both'?['en','ar']:[this.state.language];return h('div',{className:'gru-editor'},h('div',{className:'gru-toolbar'},h('button',{type:'button',onClick:()=>this.props.onChange(copy(initial))},'Use homepage template'),h('button',{type:'button',onClick:()=>{const d=copy(initial);for(const lang of ['en','ar']){d[lang].sectionOrder=['hero','form'];d[lang].hero.headline='';d[lang].hero.body='';d[lang].seo.title='';d[lang].seo.description='';}this.props.onChange(d);this.setState({section:'hero'});}},'Start blank')),h('div',{className:'gru-toolbar',role:'group','aria-label':'Editing language'},...['en','ar','both'].map(l=>h('button',{key:l,type:'button','aria-pressed':this.state.language===l,onClick:()=>this.setState({language:l})},l==='en'?'English only':l==='ar'?'Arabic only':'Both'))),this.state.error&&h('p',{role:'alert',className:'error'},this.state.error),h('div',{className:'gru-layout'},h('nav',{className:'gru-sections','aria-label':'Content sections'},...Object.entries(sections).map(([key,title])=>h('button',{key,type:'button',className:this.state.section===key?'selected':'',onClick:()=>this.setState({section:key})},title))),h('div',{},h('h2',{},sections[this.state.section]),h('div',{className:'gru-pair'},...langs.map(lang=>h('fieldset',{key:lang},h('legend',{},lang==='en'?'English':'العربية'),this.field(data[lang][this.state.section],[lang,this.state.section],this.state.section)))))));}
});
CMS.registerWidget('gru-page',Control);
// Reject invalid published content before a Git commit; build schema remains the final guard.
CMS.registerEventListener({name:'preSave',handler:({entry})=>{
 const data=entry.get('data');const page=data.toJS();
 if(!page.languages?.length)throw new Error('Choose at least one published language.');
 if(['en','ar','admin','thank-you','assets','fonts','robots','sitemap'].includes(page.slug))throw new Error('That page URL is reserved.');
 const original=entry.get('path');
 if(original?.endsWith('/home.json')&&page.slug!=='home')throw new Error('Keep the homepage URL name as home.');
 if(page.slug==='home'&&(!page.published||!['en','ar'].every(l=>page.languages.includes(l))))throw new Error('Keep the homepage published in both languages.');
 if(page.published)for(const lang of page.languages){const c=page.content[lang];if(!c?.hero?.headline?.trim()||!c?.seo?.title?.trim()||!c?.seo?.description?.trim())throw new Error('Complete the '+lang+' headline, SEO title and SEO description before publishing.');}
 const allowed=(src,type)=>{if(!src)return true;if(src.startsWith('/assets/'))return type!=='youtube';if(type==='youtube')return /^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//.test(src);const cloudinaryMatch=new RegExp('^https://res\\.cloudinary\\.com/'+runtime?.cloudinary?.cloudName+'/(?:image|video)/upload/');return cloudinaryMatch.test(src);};
 for(const lang of ['en','ar']){const c=page.content[lang];for(const logo of c.proof.logos){if(logo.src&&(!allowed(logo.src,'image')||!logo.alt.trim()))throw new Error('Each client logo needs a supported image URL and an accessible description.');}for(const project of c.portfolio.projects){if(project.image&&(!allowed(project.image,'image')||!project.imageAlt.trim()))throw new Error('Each visible portfolio card needs a supported image URL and image description.');for(const slide of project.gallery){if(slide.src&&(!allowed(slide.src,slide.type)||!slide.alt.trim()))throw new Error('Each gallery item needs a supported media URL and accessible description.');}}}
 return data;
}});
// The same Cloudflare Worker hosts the GitHub OAuth exchange. This configuration contains no OAuth secret.
const local=new URLSearchParams(location.search).has('demo')&&['localhost','127.0.0.1'].includes(location.hostname);
CMS.init({config:{load_config_file:false,backend:local?{name:'test-repo'}:{name:'github',repo:'themorsy/GRU.AGENCY',branch:'main',base_url:location.origin,auth_endpoint:'api/cms/auth'},site_url:location.origin,display_url:location.origin,logo_url:'/assets/logo-green.png',media_folder:'public/assets/cms',public_folder:'/assets/cms',...(cloudinary?{media_library:{name:'cloudinary',config:cloudinary}}:{}),collections:[{name:'pages',label:'Pages',label_singular:'Page',folder:'src/content/pages',create:true,delete:false,extension:'json',format:'json',identifier_field:'title',slug:'{{fields.slug}}',summary:'{{title}} — {{slug}}',editor:{preview:false},fields:[{name:'title',label:'Page name',widget:'string'},{name:'slug',label:'Page URL name',widget:'string',hint:'Use lowercase words and hyphens. Keep home for the homepage.',pattern:['^[a-z0-9]+(?:-[a-z0-9]+)*$','Use lowercase words and hyphens.']},{name:'published',label:'Published',widget:'boolean',default:false,hint:'Draft pages are saved but are not included in the generated public site.'},{name:'languages',label:'Published languages',widget:'select',multiple:true,options:[{label:'English',value:'en'},{label:'Arabic',value:'ar'}],default:['en','ar']},{name:'content',label:'Page content',widget:'gru-page',default:template.content}]}]}});
})();



