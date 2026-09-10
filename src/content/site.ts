/* ---------------------------------------------------------------------------
   Locale-independent site configuration. Phone numbers, URLs, asset paths,
   tracking ids and the outstanding-asset slots all live here so none of them
   are buried in a component.
   --------------------------------------------------------------------------- */

import type { SocialLink } from './types';

export const site = {
  /** Production origin. Also set `site` in astro.config.mjs to match. */
  origin: 'https://gru.agency',

  brand: 'GRU',
  logoAlt: 'GRU — Growth Marketing Agency',
  logoGreen: '/assets/logo-green.png',
  logoCream: '/assets/logo-cream.png',

  email: 'hello@gru.agency',
  phoneDisplay: '+20 111 111 3442',
  phoneHref: 'tel:+201111113442',
  whatsappHref: 'https://wa.me/201111113442',

  /* ---- Tracking -------------------------------------------------------- */
  /** Google Tag Manager container. Replace with the real id; while it is a
      placeholder the loader is skipped so no broken request is made. */
  gtmId: 'GTM-XXXXXXX',
  /** dataLayer event pushed on the thank-you pages — the conversion itself. */
  conversionEvent: 'generate_lead',
  /** dataLayer event pushed the moment a submission succeeds, before the
      redirect. Kept separate from conversionEvent so GTM can count the
      conversion once, on the thank-you page, without double-firing. */
  submitEvent: 'lead_form_submit',
  /** Google Search Console HTML-tag verification token, once issued. */
  searchConsoleToken: '',

  /* ---- Lead form ------------------------------------------------------- */
  form: {
    /** Netlify Forms: the form is detected at deploy time by this name.
        Both languages post to the same form so submissions land in one inbox
        with a `locale` field distinguishing them. */
    netlifyName: 'gru-lead',
    /** Netlify accepts the AJAX POST at the page's own path. */
    endpoint: '/',
    honeypot: 'bot-field',
  },

  /* ---- Hero showreel — client-supplied ---------------------------------- */
  /** Set `sources` once the client delivers the showreel; until then the hero
      renders the marked slot over the black ground with no network request. */
  heroVideo: {
    poster: null as string | null, // e.g. '/assets/video/showreel-poster.jpg'
    sources: [] as { src: string; type: string }[],
    // [{ src: '/assets/video/showreel.webm', type: 'video/webm' },
    //  { src: '/assets/video/showreel.mp4',  type: 'video/mp4' }]
  },

  /** Client logo strip. Eight slots so the marquee loop has enough length to
      show four per viewport without a visible seam. `src: null` renders the
      marked placeholder slot. */
  clientLogos: [
    { src: null, alt: '' },
    { src: null, alt: '' },
    { src: null, alt: '' },
    { src: null, alt: '' },
    { src: null, alt: '' },
    { src: null, alt: '' },
    { src: null, alt: '' },
    { src: null, alt: '' },
  ] as { src: string | null; alt: string }[],

  socials: [
    { label: 'LinkedIn', href: 'https://eg.linkedin.com/company/grueg', icon: 'linkedin' },
    { label: 'Instagram', href: 'https://www.instagram.com/gru.agency.eg', icon: 'instagram' },
    { label: 'Facebook', href: 'https://www.facebook.com/Gru.growth', icon: 'facebook' },
    /** URL still pending from the client — renders as plain text until set. */
    { label: 'TikTok', href: null, icon: 'tiktok' },
  ] as SocialLink[],

  /* ---- Open decisions -------------------------------------------------- */
  /** The client supplied a second English H1 ("Marketing built around growth,
      not guesswork."). The mockup ships the hero headline as the H1; flip this
      to true to promote the alternative instead. */
  useAlternativeH1: false,

  /** Service pages do not exist yet. While this is false, every service pill
      links to the lead form anchor so nothing 404s; each service keeps its
      slug in the content layer, so flipping this to true switches the pills
      over to /<locale>/services/<slug>/ with no other change. */
  servicePagesLive: false,

  /** Per-project case-study pages, same arrangement as servicePagesLive. */
  caseStudiesLive: false,

  /** Arabic numerals: false = Western digits (400+, 40M+, 2021), which is what
      this build ships. true = Arabic-Indic (٤٠٠+، ٢٠٢١) as drawn in the
      mockup. Only affects strings in ar.ts. */
  arabicIndicNumerals: false,

  structuredData: {
    founded: '2021',
    areaServed: ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
    addressCountry: 'EG',
    addressLocality: 'Cairo',
  },
} as const;

export type Site = typeof site;
