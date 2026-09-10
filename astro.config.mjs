import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Public production origin. Change this once the domain is live.
export const SITE = 'https://gru.agency';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      /* The sitemap covers /en/ and /ar/. The thank-you pages are
         post-conversion and carry noindex, so they stay out of it. */
      filter: (page) => !page.includes('/thank-you'),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ar: 'ar' },
      },
    }),
  ],
});
