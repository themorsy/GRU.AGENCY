/* ---------------------------------------------------------------------------
   Arabic content — RTL.

   STATUS: draft, except two strings the handoff marks as APPROVED:
     • seo.title  — "GRU | وكالة تسويق رقمي في مصر ودول الخليج"
     • hero.headline — "تسويق مبني على النمو، لا على التخمين."
   Everything else is the planning placeholder from the mockup, kept here so
   the RTL layout is real and final copy can be dropped in string by string
   without touching a component.

   Numerals: Western digits (400+, 2021), per the build decision. The mockup
   drew Arabic-Indic (٤٠٠+، ٢٠٢١); site.arabicIndicNumerals records the
   decision and the alternative values are kept in comments below.
   --------------------------------------------------------------------------- */

import type { LocaleContent } from './types';

const svc = (label: string, slug: string) => ({ label, slug });

export const ar: LocaleContent = {
  locale: 'ar',
  dir: 'rtl',
  base: '/ar/',

  seo: {
    /* APPROVED */
    title: 'GRU | وكالة تسويق رقمي في مصر ودول الخليج',
    /* draft */
    description:
      'GRU وكالة تسويق رقمي متكاملة في مصر، تساعد الشركات في مصر ودول الخليج على النمو من خلال الاستراتيجية، المحتوى، الإعلانات، العلامات التجارية، التجارة الإلكترونية والإنتاج.',
    h1Alternative: 'تسويق مبني على النمو، لا على التخمين.',
    approved: false,
  },

  nav: [
    { label: 'المنهجية', href: '#method' },
    { label: 'الخدمات', href: '#services' },
    { label: 'الحلول', href: '#client-value' },
    { label: 'أعمالنا', href: '#proof' },
    { label: 'من نحن', href: '#who-we-are' },
    { label: 'الوظائف', href: '#lead' },
  ],
  langSwitch: { label: 'EN / AR', toOther: '/en/', otherLabel: 'English' },
  headerCta: 'احجز مكالمة',
  skipToContent: 'انتقل إلى المحتوى',
  menuOpen: 'افتح القائمة',
  menuClose: 'أغلق القائمة',

  hero: {
    /* APPROVED */
    headline: 'تسويق مبني على النمو، لا على التخمين.',
    /* draft */
    supporting:
      'GRU وكالة تسويق رقمي متكاملة في مصر، تساعد الشركات في مصر ودول الخليج على النمو من خلال الاستراتيجية، المحتوى، الإعلانات، العلامات التجارية، التجارة الإلكترونية والإنتاج.',
    primaryCta: 'احجز مكالمة',
    secondaryCta: 'شاهد أعمالنا',
    videoLabel: 'شوريل وكالة GRU',
  },

  proof: {
    eyebrow: 'أرقامنا',
    heading: 'أرقامنا',
    stats: [
      /* Arabic-Indic alternative: '‎+٤٠٠' */
      { value: '+400', label: 'عميل سعيد', numeric: true },
      /* Arabic-Indic alternative: '‎+٤٠ مليون جنيه' */
      { value: '+40 مليون جنيه', label: 'مبيعات متتبعة' },
      /* Arabic-Indic alternative: '٢٠٢١' */
      { value: '2021', label: 'نعمل منذ', numeric: true },
    ],
    logosLabel: 'عملاؤنا',
    logoSlotLabel: 'شعار عميل',
  },

  services: {
    eyebrow: 'الخدمات',
    heading: 'ماذا نفعل',
    categories: [
      {
        num: '01',
        label: 'الاستراتيجية والنمو',
        items: [
          svc('استراتيجيات التسويق الرقمي', 'digital-marketing-strategies'),
          svc('استراتيجيات حسب القطاع', 'industry-based-strategies'),
          svc('استراتيجيات البيع', 'sales-strategies'),
        ],
      },
      {
        num: '02',
        label: 'المحتوى والإبداع',
        items: [
          svc('محتوى السوشيال ميديا', 'social-content'),
          svc('الفيديو والريلز', 'video-reels'),
          svc('التصوير', 'photography'),
          svc('محتوى المستخدمين', 'ugc'),
          svc('الحملات الإبداعية', 'creative-campaigns'),
        ],
      },
      {
        num: '03',
        label: 'الديجيتال والأداء',
        items: [
          svc('شراء الوسائط', 'media-buying'),
          svc('نمو التجارة الإلكترونية', 'e-commerce-growth'),
          svc('البريد الإلكتروني وجذب العملاء', 'email-lead-generation'),
          svc('تحسين محركات البحث', 'seo'),
          svc('التسويق عبر المؤثرين', 'influencer-marketing'),
        ],
      },
      {
        num: '04',
        label: 'العلامة والتجربة',
        items: [
          svc('استراتيجية العلامة', 'brand-strategy'),
          svc('الهوية البصرية', 'visual-identity'),
          svc('تطوير المواقع والتطبيقات', 'web-app-development'),
          svc('التنشيط', 'activations'),
          svc('الإنتاج', 'production'),
        ],
      },
    ],
  },

  work: {
    eyebrow: 'أعمالنا',
    heading: 'أعمال مختارة',
    note: 'اضغط على أي مشروع لعرض التفاصيل',
    slotLabel: 'صورة المشروع',
    caseStudyLabel: 'اطّلع على دراسة الحالة',
    closeLabel: 'إغلاق',
    dialogLabel: 'تفاصيل المشروع',
    projects: [
      {
        slug: 'project-one',
        name: 'المشروع الأول',
        category: 'شراء الوسائط',
        image: null,
        imageAlt: '',
        summary:
          'ملخص مبدئي لدراسة الحالة. تدعم كل بطاقة اسم المشروع أو العميل، وصورة، وتصنيف الخدمة، وترتبط بصفحة دراسة حالة مخصصة لاحقًا.',
        caseStudyHref: null,
      },
      {
        slug: 'project-two',
        name: 'المشروع الثاني',
        category: 'استراتيجية العلامة',
        image: null,
        imageAlt: '',
        summary:
          'ملخص مبدئي لدراسة الحالة. تدعم كل بطاقة اسم المشروع أو العميل، وصورة، وتصنيف الخدمة، وترتبط بصفحة دراسة حالة مخصصة لاحقًا.',
        caseStudyHref: null,
      },
      {
        slug: 'project-three',
        name: 'المشروع الثالث',
        category: 'محتوى السوشيال ميديا',
        image: null,
        imageAlt: '',
        summary:
          'ملخص مبدئي لدراسة الحالة. تدعم كل بطاقة اسم المشروع أو العميل، وصورة، وتصنيف الخدمة، وترتبط بصفحة دراسة حالة مخصصة لاحقًا.',
        caseStudyHref: null,
      },
      {
        slug: 'project-four',
        name: 'المشروع الرابع',
        category: 'نمو التجارة الإلكترونية',
        image: null,
        imageAlt: '',
        summary:
          'ملخص مبدئي لدراسة الحالة. تدعم كل بطاقة اسم المشروع أو العميل، وصورة، وتصنيف الخدمة، وترتبط بصفحة دراسة حالة مخصصة لاحقًا.',
        caseStudyHref: null,
      },
      {
        slug: 'project-five',
        name: 'المشروع الخامس',
        category: 'الإنتاج',
        image: null,
        imageAlt: '',
        summary:
          'ملخص مبدئي لدراسة الحالة. تدعم كل بطاقة اسم المشروع أو العميل، وصورة، وتصنيف الخدمة، وترتبط بصفحة دراسة حالة مخصصة لاحقًا.',
        caseStudyHref: null,
      },
      {
        slug: 'project-six',
        name: 'المشروع السادس',
        category: 'الهوية البصرية',
        image: null,
        imageAlt: '',
        summary:
          'ملخص مبدئي لدراسة الحالة. تدعم كل بطاقة اسم المشروع أو العميل، وصورة، وتصنيف الخدمة، وترتبط بصفحة دراسة حالة مخصصة لاحقًا.',
        caseStudyHref: null,
      },
    ],
  },

  ctaBand: {
    statement: 'هل أنت مستعد لتحويل التسويق إلى نمو قابل للقياس؟',
    button: 'احجز مكالمة',
  },

  clientValue: {
    eyebrow: 'قيمة العميل',
    heading: 'ماذا تحصل عليه كعميل لـ GRU',
    items: [
      {
        title: 'توجيه استراتيجي',
        body: 'اتجاه تسويقي واضح مبني على أهداف عملك وسياق السوق والبيانات المتاحة.',
      },
      {
        title: 'إدارة أذكى للمخاطر',
        body: 'نستخدم البحث والتخطيط وبيانات الأداء لتقليل الهدر ولاتخاذ قرارات تسويقية بثقة أكبر.',
      },
      {
        title: 'تنفيذ متكامل',
        body: 'الاستراتيجية والإبداع والوسائط والإنتاج تُدار من خلال شريك واحد مسؤول، مما يقلل التعقيد التشغيلي على العميل.',
      },
      {
        title: 'كفاءة التكلفة والموارد',
        body: 'نوجّه الميزانية والأدوات والموارد إلى حيث تحقق أكبر قيمة، ونقلل الإنفاق غير الضروري.',
      },
    ],
  },

  method: {
    eyebrow: 'منهجية GRU',
    heading: 'كيف نعمل',
    supporting: 'افتراضات أقل. جهد أقل مهدر. نمو مبني على معلومات أفضل.',
    steps: [
      { num: '01', title: 'نفهم', body: 'العمل، الجمهور، السوق والأهداف.', height: '300px' },
      { num: '02', title: 'نخطط', body: 'الاستراتيجية، القنوات، الميزانية والمؤشرات.', height: '330px' },
      { num: '03', title: 'ننفذ ونطلق', body: 'المحتوى، الحملات، الإنتاج والتنشيط.', height: '360px' },
      { num: '04', title: 'نقيس', body: 'نتابع الأداء واستجابة العمل.', height: '330px' },
      {
        num: '05',
        title: 'نطوّر ونوسّع',
        body: 'نحسّن ما ينجح ونعيد توجيه الموارد لما يحقق قيمة أكبر.',
        height: '380px',
      },
    ],
  },

  whoWeAre: {
    eyebrow: 'من نحن',
    statement: 'التنفيذ بدون توجيه ينتج مخرجات. الاستراتيجية تحوّل هذه المخرجات إلى قيمة للأعمال.',
    body: 'تساعد GRU الشركات على تحديد القيمة التي تقدمها، وتوصيلها بفعالية، وتحويلها إلى نمو قابل للقياس في السوق.',
  },

  form: {
    eyebrow: 'تواصل معنا',
    heading: 'احجز مكالمة',
    intro: 'أخبرنا بما تحتاج المساعدة فيه، وسيتواصل معك أحد أعضاء فريق GRU قريبًا.',
    whatsappLabel: 'واتساب +20 111 111 3442',
    selectPlaceholder: 'اختر الخدمة',
    submit: 'احجز مكالمة',
    submitting: 'جاري الإرسال…',
    submitError: 'حدث خطأ أثناء إرسال طلبك. يُرجى المحاولة مرة أخرى أو التواصل معنا على واتساب.',
    requiredNote: 'الحقول المعلَّمة بـ * مطلوبة.',
    fields: [
      {
        name: 'name',
        label: 'الاسم *',
        placeholder: 'الاسم بالكامل',
        span: 1,
        type: 'text',
        required: true,
        autocomplete: 'name',
        errorRequired: 'يُرجى إدخال الاسم.',
      },
      {
        name: 'email',
        label: 'البريد الإلكتروني *',
        placeholder: 'name@company.com',
        span: 1,
        type: 'email',
        required: true,
        autocomplete: 'email',
        errorRequired: 'يُرجى إدخال البريد الإلكتروني.',
        errorFormat: 'يُرجى إدخال بريد إلكتروني صحيح.',
      },
      {
        name: 'mobile',
        label: 'رقم الموبايل *',
        placeholder: '+20',
        span: 1,
        type: 'tel',
        required: true,
        autocomplete: 'tel',
        errorRequired: 'يُرجى إدخال رقم الموبايل.',
        errorFormat: 'يُرجى إدخال رقم موبايل صحيح.',
      },
      {
        name: 'service',
        label: 'الخدمة المطلوبة *',
        placeholder: 'اختر الخدمة',
        span: 1,
        type: 'select',
        required: true,
        errorRequired: 'يُرجى اختيار الخدمة التي تهمك.',
      },
      {
        name: 'company',
        label: 'الشركة',
        placeholder: 'اختياري',
        span: 2,
        type: 'text',
        required: false,
        autocomplete: 'organization',
        errorRequired: '',
      },
      {
        name: 'brief',
        label: 'نبذة مختصرة — بماذا نساعدك؟',
        placeholder: 'اختياري',
        span: 2,
        type: 'textarea',
        required: false,
        errorRequired: '',
      },
    ],
  },

  footer: {
    blurb: 'استراتيجية، إبداع، أداء وإنتاج مبني على نمو قابل للقياس.',
    sitemapLabel: 'خريطة الموقع',
    contactLabel: 'للتواصل',
    followLabel: 'تابعنا',
    whatsappCta: 'تواصل على واتساب',
    copyright: '© 2026 GRU. جميع الحقوق محفوظة.',
  },

  whatsapp: {
    label: 'واتساب',
    ariaLabel: 'تواصل مع GRU على واتساب',
  },

  thankYou: {
    title: 'شكرًا لك | GRU',
    description: 'تم استلام طلبك. سيتواصل معك أحد أعضاء فريق GRU قريبًا.',
    heading: 'شكرًا لك.',
    body: 'لقد استلمنا طلبك. سيتواصل معك أحد أعضاء فريق GRU قريبًا.',
    cta: 'العودة إلى GRU',
  },
};
