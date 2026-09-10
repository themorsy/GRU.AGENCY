/* ---------------------------------------------------------------------------
   Content layer types.

   All copy and all list content for both languages lives in src/content/en.ts
   and src/content/ar.ts and is typed against LocaleContent. Nothing in
   src/components or src/pages hardcodes a user-visible string — that is what
   lets final Arabic copy drop in, and what makes a CMS swap a change of one
   module rather than a rewrite of the components.
   --------------------------------------------------------------------------- */

export type Locale = 'en' | 'ar';
export const LOCALES: Locale[] = ['en', 'ar'];

export interface NavLink {
  label: string;
  href: string;
}

export interface ServiceItem {
  label: string;
  /** Stable slug, shared across locales. Resolved to a URL by serviceHref()
      in src/content/index.ts, which respects site.servicePagesLive. */
  slug: string;
}

export interface ServiceCategory {
  num: string;
  label: string;
  items: ServiceItem[];
}

export interface Stat {
  value: string;
  label: string;
  /** Digits-only values need an LTR isolate inside RTL text so the figure and
      any sign keep their order. */
  numeric?: boolean;
}

export interface Project {
  /** Stable id, shared across locales, used for the lightbox and future URLs. */
  slug: string;
  name: string;
  category: string;
  /** Client-supplied visual. null renders the marked 4/3 slot. */
  image: string | null;
  imageAlt: string;
  summary: string;
  /** Future per-project case-study page. null hides the link. */
  caseStudyHref: string | null;
}

export interface ValueItem {
  title: string;
  body: string;
}

export interface MethodStep {
  num: string;
  title: string;
  body: string;
  /** Staggered min-heights so the row reads as a skyline. Desktop only. */
  height: string;
}

export type FieldType = 'text' | 'email' | 'tel' | 'select' | 'textarea';

export interface FormField {
  /** Submitted field name. Identical in both locales so one Netlify form
      definition receives both languages. */
  name: string;
  label: string;
  placeholder: string;
  span: 1 | 2;
  type: FieldType;
  required: boolean;
  /** Autocomplete token, for browsers and for a11y. */
  autocomplete?: string;
  /** Inline validation messages, shown on blur. */
  errorRequired: string;
  errorFormat?: string;
}

export interface SocialLink {
  label: string;
  href: string | null;
  icon: 'linkedin' | 'instagram' | 'facebook' | 'tiktok';
}

export interface LocaleContent {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  /** Path prefix for this locale's pages, with trailing slash. */
  base: string;

  seo: {
    title: string;
    description: string;
    /** Alternative H1 supplied by the client — see site.ts › useAlternativeH1. */
    h1Alternative: string;
    /** Marks Arabic strings still awaiting final client copy. */
    approved: boolean;
  };

  nav: NavLink[];
  langSwitch: { label: string; toOther: string; otherLabel: string };
  headerCta: string;
  skipToContent: string;
  menuOpen: string;
  menuClose: string;

  hero: {
    headline: string;
    supporting: string;
    primaryCta: string;
    secondaryCta: string;
    videoLabel: string;
  };

  proof: {
    eyebrow: string;
    heading: string;
    stats: Stat[];
    logosLabel: string;
    logoSlotLabel: string;
  };

  services: {
    eyebrow: string;
    heading: string;
    categories: ServiceCategory[];
  };

  work: {
    eyebrow: string;
    heading: string;
    note: string;
    projects: Project[];
    slotLabel: string;
    caseStudyLabel: string;
    closeLabel: string;
    dialogLabel: string;
  };

  ctaBand: {
    statement: string;
    button: string;
  };

  clientValue: {
    eyebrow: string;
    heading: string;
    items: ValueItem[];
  };

  method: {
    eyebrow: string;
    heading: string;
    supporting: string;
    steps: MethodStep[];
  };

  whoWeAre: {
    eyebrow: string;
    statement: string;
    body: string;
  };

  form: {
    eyebrow: string;
    heading: string;
    intro: string;
    whatsappLabel: string;
    fields: FormField[];
    selectPlaceholder: string;
    submit: string;
    submitting: string;
    submitError: string;
    requiredNote: string;
  };

  footer: {
    blurb: string;
    sitemapLabel: string;
    contactLabel: string;
    followLabel: string;
    whatsappCta: string;
    copyright: string;
  };

  whatsapp: {
    label: string;
    ariaLabel: string;
  };

  thankYou: {
    title: string;
    description: string;
    heading: string;
    body: string;
    cta: string;
  };
}
