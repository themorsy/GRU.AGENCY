import {defineConfig} from 'astro/config';
import {siteOrigin} from './site.config.mjs';
import {assertAssets} from './scripts/assert-assets.mjs';
export default defineConfig({site:siteOrigin,output:'static',integrations:[{name:'gru-asset-assertion',hooks:{'astro:build:done':()=>{assertAssets();}}}],trailingSlash:'always',devToolbar:{enabled:false}});
