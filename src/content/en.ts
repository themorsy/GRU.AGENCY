/* ---------------------------------------------------------------------------
   English content. Every string here is verbatim from the "Copy & Changes"
   tab of the design handoff, which the brief names as the source of truth for
   text. Do not reword, shorten or "improve" any of it.

   One knowing exception is noted inline: the hero supporting paragraph reads
   "We combines strategy..." in the copy sheet. It is reproduced exactly as
   supplied; flag it with the client rather than silently fixing it.
   --------------------------------------------------------------------------- */

import type { LocaleContent } from './types';

const svc = (label: string, slug: string) => ({ label, slug });

export const en: LocaleContent = {
  locale: 'en',
  dir: 'ltr',
  base: '/en/',

  seo: {
    title: 'GRU | Digital Marketing Agency in Egypt, GCC & Europe',
    description:
      'GRU is a data-driven digital marketing agency in Egypt helping businesses across Egypt and the GCC grow through strategy, content, performance marketing, branding, e-commerce and production.',
    h1Alternative: 'Marketing built around growth, not guesswork.',
    approved: true,
  },

  /* Client asked to keep the current nav labels for now. */
  nav: [
    { label: 'Method', href: '#method' },
    { label: 'Services', href: '#services' },
    { label: 'Solutions', href: '#client-value' },
    { label: 'Proof', href: '#proof' },
    { label: 'About', href: '#who-we-are' },
    { label: 'Careers', href: '#lead' },
  ],
  langSwitch: { label: 'EN / AR', toOther: '/ar/', otherLabel: 'العربية' },
  headerCta: 'Book a Call',
  skipToContent: 'Skip to content',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',

  hero: {
    headline: "We Don't Sell Tactics, We Sell Strategies to Grow",
    supporting:
      'We combines strategy, creative, performance and production to help businesses make better marketing decisions, reduce wasted effort and turn marketing into measurable growth.',
    primaryCta: 'Book a Call',
    secondaryCta: 'View Our Work',
    videoLabel: 'GRU agency showreel',
  },

  proof: {
    eyebrow: 'Proof',
    heading: 'Proof',
    stats: [
      { value: '400+', label: 'Happy Clients' },
      { value: '40M+ EGP', label: 'Tracked Sales' },
      { value: '2021', label: 'Operating Since' },
    ],
    logosLabel: 'Clients we work with',
    logoSlotLabel: 'Client logo',
  },

  services: {
    eyebrow: 'Services',
    heading: 'What We Do',
    categories: [
      {
        num: '01',
        label: 'Strategy & Growth',
        items: [
          svc('Digital Marketing Strategies', 'digital-marketing-strategies'),
          svc('Industry-Based Strategies', 'industry-based-strategies'),
          svc('Sales Strategies', 'sales-strategies'),
        ],
      },
      {
        num: '02',
        label: 'Content & Creative',
        items: [
          svc('Social Content', 'social-content'),
          svc('Video / Reels', 'video-reels'),
          svc('Photography', 'photography'),
          svc('UGC', 'ugc'),
          svc('Creative Campaigns', 'creative-campaigns'),
        ],
      },
      {
        num: '03',
        label: 'Digital & Performance',
        items: [
          svc('Media Buying', 'media-buying'),
          svc('E-commerce Growth', 'e-commerce-growth'),
          svc('E-mail & Lead Generation', 'email-lead-generation'),
          svc('SEO', 'seo'),
          svc('Influencer Marketing', 'influencer-marketing'),
        ],
      },
      {
        num: '04',
        label: 'Brand & Experience',
        items: [
          svc('Brand Strategy', 'brand-strategy'),
          svc('Visual Identity', 'visual-identity'),
          svc('Web & App Development', 'web-app-development'),
          svc('Activations', 'activations'),
          svc('Production', 'production'),
        ],
      },
    ],
  },

  work: {
    eyebrow: 'Portfolio',
    heading: 'Selected Work',
    note: 'Click a project to expand',
    slotLabel: 'Project visual',
    caseStudyLabel: 'View case study',
    closeLabel: 'Close',
    dialogLabel: 'Project detail',
    projects: [
      {
        slug: 'project-one',
        name: 'Project One',
        category: 'Media Buying',
        image: null,
        imageAlt: '',
        summary:
          'Placeholder case-study summary. Each card supports a project or client name, a visual and a service category label, and links to a future dedicated case-study page.',
        caseStudyHref: null,
      },
      {
        slug: 'project-two',
        name: 'Project Two',
        category: 'Brand Strategy',
        image: null,
        imageAlt: '',
        summary:
          'Placeholder case-study summary. Each card supports a project or client name, a visual and a service category label, and links to a future dedicated case-study page.',
        caseStudyHref: null,
      },
      {
        slug: 'project-three',
        name: 'Project Three',
        category: 'Social Content',
        image: null,
        imageAlt: '',
        summary:
          'Placeholder case-study summary. Each card supports a project or client name, a visual and a service category label, and links to a future dedicated case-study page.',
        caseStudyHref: null,
      },
      {
        slug: 'project-four',
        name: 'Project Four',
        category: 'E-commerce Growth',
        image: null,
        imageAlt: '',
        summary:
          'Placeholder case-study summary. Each card supports a project or client name, a visual and a service category label, and links to a future dedicated case-study page.',
        caseStudyHref: null,
      },
      {
        slug: 'project-five',
        name: 'Project Five',
        category: 'Production',
        image: null,
        imageAlt: '',
        summary:
          'Placeholder case-study summary. Each card supports a project or client name, a visual and a service category label, and links to a future dedicated case-study page.',
        caseStudyHref: null,
      },
      {
        slug: 'project-six',
        name: 'Project Six',
        category: 'Visual Identity',
        image: null,
        imageAlt: '',
        summary:
          'Placeholder case-study summary. Each card supports a project or client name, a visual and a service category label, and links to a future dedicated case-study page.',
        caseStudyHref: null,
      },
    ],
  },

  ctaBand: {
    statement: 'Ready to turn marketing into measurable growth?',
    button: 'Book a Call',
  },

  clientValue: {
    eyebrow: 'GRU Client Value',
    heading: 'What You Get As a GRU Client',
    items: [
      {
        title: 'Strategic Guidance',
        body: 'Clear marketing direction based on your business goals, market context and available data.',
      },
      {
        title: 'Smarter Risk Management',
        body: 'We use research, planning and performance data to reduce avoidable waste and make marketing decisions with greater confidence.',
      },
      {
        title: 'Integrated Execution',
        body: 'Strategy, creative, media and production are coordinated through one accountable partner, reducing operational friction for the client.',
      },
      {
        title: 'Cost & Resource Efficiency',
        body: 'We focus budget, tools and resources where they can create the greatest value and reduce unnecessary spending.',
      },
    ],
  },

  method: {
    eyebrow: 'GRU Method',
    heading: 'How We Work',
    supporting: 'Less assumption. Less wasted effort. Better-informed growth.',
    steps: [
      { num: '01', title: 'Understand', body: 'Business, audience, market and objectives.', height: '300px' },
      { num: '02', title: 'Plan', body: 'Strategy, channels, budget and KPIs.', height: '330px' },
      { num: '03', title: 'Create & Launch', body: 'Content, campaigns, production and activation.', height: '360px' },
      { num: '04', title: 'Measure', body: 'Track performance and business response.', height: '330px' },
      {
        num: '05',
        title: 'Optimize & Scale',
        body: 'Improve what works and redirect resources where they create more value.',
        height: '380px',
      },
    ],
  },

  whoWeAre: {
    eyebrow: 'Who We Are',
    statement:
      'Execution without direction creates output. Strategy turns that output into business value.',
    body: 'GRU helps businesses define the value they offer, communicate it effectively and turn it into measurable market growth.',
  },

  form: {
    eyebrow: 'Contact',
    heading: 'Book a Call',
    intro: 'Tell us what you need help with. A member of the GRU team will get in touch shortly.',
    whatsappLabel: 'WhatsApp +20 111 111 3442',
    selectPlaceholder: 'Select a service',
    submit: 'Book a Call',
    submitting: 'Sending…',
    submitError: 'Something went wrong sending your request. Please try again, or reach us on WhatsApp.',
    requiredNote: 'Fields marked * are required.',
    fields: [
      {
        name: 'name',
        label: 'Name *',
        placeholder: 'Full name',
        span: 1,
        type: 'text',
        required: true,
        autocomplete: 'name',
        errorRequired: 'Please enter your name.',
      },
      {
        name: 'email',
        label: 'Email *',
        placeholder: 'name@company.com',
        span: 1,
        type: 'email',
        required: true,
        autocomplete: 'email',
        errorRequired: 'Please enter your email address.',
        errorFormat: 'Please enter a valid email address.',
      },
      {
        name: 'mobile',
        label: 'Mobile *',
        placeholder: '+20',
        span: 1,
        type: 'tel',
        required: true,
        autocomplete: 'tel',
        errorRequired: 'Please enter your mobile number.',
        errorFormat: 'Please enter a valid mobile number.',
      },
      {
        name: 'service',
        label: 'Service Interested In *',
        placeholder: 'Select a service',
        span: 1,
        type: 'select',
        required: true,
        errorRequired: 'Please choose the service you are interested in.',
      },
      {
        name: 'company',
        label: 'Company',
        placeholder: 'Optional',
        span: 2,
        type: 'text',
        required: false,
        autocomplete: 'organization',
        errorRequired: '',
      },
      {
        name: 'brief',
        label: 'Short Brief / What do you need help with?',
        placeholder: 'Optional',
        span: 2,
        type: 'textarea',
        required: false,
        errorRequired: '',
      },
    ],
  },

  footer: {
    blurb: 'Strategy, creative, performance and production built around measurable business growth.',
    sitemapLabel: 'Sitemap',
    contactLabel: 'Contact',
    followLabel: 'Follow',
    whatsappCta: 'WhatsApp us',
    copyright: '© 2026 GRU. All rights reserved.',
  },

  whatsapp: {
    label: 'WhatsApp',
    ariaLabel: 'Message GRU on WhatsApp',
  },

  thankYou: {
    title: 'Thank you | GRU',
    description: 'Your request has been received. A member of the GRU team will be in touch shortly.',
    heading: 'Thank you.',
    body: 'We’ve received your request. A member of the GRU team will get in touch with you shortly.',
    cta: 'Back to GRU',
  },
};
