// Seed EN: globals (siteSettings) and pages (home, services, interventions,
// about, blog, FAQ, contact, one-pager).
//
// Faithful transcription of the Rempart Extermination copy (content bible,
// docs/CONTENU-DEMO-REMPART.md, sections 1 and 5). The pageBuilder composition
// reproduces the Minimalist family template via the intelligent-block modes;
// the faq block is pure manual selection, no mode or limit, and the FAQ page is
// composed in sections by theme in faqPage.sections. The detail copy for the
// pages lives on each service and project (collections), not in servicesPage or
// projectsPage. Deterministic ids (bible, section 4).
// Image policy (bible, section 3): figures carry alt, label, caption, ratio but
// NO image field; brand.logo is OMITTED (text wordmark fallback).
// The {year} (copyright) and {email} (form failure banner) tokens stay as is:
// replaced at resolution time.

// ── Local factories (recurring links and figures) ────────────────────────────

/** Internal link to a document (deterministic -en id). */
const internal = (label, ref) => ({
  _type: 'link',
  label,
  type: 'internal',
  internalRef: { _type: 'reference', _ref: ref }
})

/** Anchor link on the current page (one-pager). */
const anchor = (label, target) => ({
  _type: 'link',
  label,
  type: 'anchor',
  anchor: target
})

/** External link (e.g. phone call). The `link` schema field is `externalUrl`
 *  (validated scheme http/https/mailto/tel), not `href`. */
const external = (label, url) => ({
  _type: 'link',
  label,
  type: 'external',
  externalUrl: url
})

/** Home hero figure (same framing, two ratios). */
const heroFigure = (ratio, caption) => ({
  _type: 'figure',
  image: { _imagePath: '/images/hero.jpg' },
  alt: 'Rempart Extermination technician, clipboard in hand, in front of the service van in a residential driveway on the South Shore of Quebec City.',
  label: 'Our team, on the ground',
  caption,
  ratio
})

// ── Blocks shared across pages (identical copy, _key unique to each page) ──

/** Highlights block (home + about): four concrete commitments. */
const highlightsBlock = (key) => ({
  _type: 'highlights',
  _key: key,
  heading: 'What you get when you call us.',
  lead: 'No vague promises. Four clear commitments we keep on every job, at home and at the business.',
  items: [
    {
      _type: 'highlightItem',
      _key: 'item-permis',
      icon: 'lucide:shield-check',
      title: 'Licensed and insured',
      body: 'Provincial pesticide application certification (MELCCFP) and full insurance. You know exactly who is coming into your home.'
    },
    {
      _type: 'highlightItem',
      _key: 'item-garantie',
      icon: 'lucide:badge-check',
      title: 'Results guarantee',
      body: 'If the problem comes back during the covered period, we come back at no charge. We settle the situation for good, not just for today.'
    },
    {
      _type: 'highlightItem',
      _key: 'item-securite',
      icon: 'lucide:heart-handshake',
      title: 'Safe for the family',
      body: 'Health Canada approved products, applied by trained and certified technicians. We explain what to do before and after every treatment.'
    },
    {
      _type: 'highlightItem',
      _key: 'item-urgence',
      icon: 'lucide:clock',
      title: '24/7 emergency service',
      body: 'A wasp nest above the door on a Sunday evening? We answer. Evenings and weekends, we stay reachable for emergencies.'
    }
  ]
})

/** Stats block (home + about): trust markers. */
const statsBlock = (key) => ({
  _type: 'stats',
  _key: key,
  heading: 'Fifteen years protecting the South Shore, in a few numbers.',
  items: [
    { _type: 'statItem', _key: 'stat-fonde', value: '2011', label: 'Serving the Quebec City area' },
    { _type: 'statItem', _key: 'stat-experience', value: '15 years', label: 'Of hands-on experience' },
    { _type: 'statItem', _key: 'stat-google', value: '4.9', label: 'Google rating across 312 reviews' },
    { _type: 'statItem', _key: 'stat-urgence', value: '24/7', label: 'Emergency service, evenings and weekends' }
  ]
})

/** Process steps (without the n: derived from position). */
const processSteps = () => ([
  {
    _type: 'processStep',
    _key: 'step-1',
    title: 'The inspection',
    body: 'We identify the pest, find how it gets in and assess how big the problem is. You get a clear diagnosis, no jargon, before we treat anything.'
  },
  {
    _type: 'processStep',
    _key: 'step-2',
    title: 'The treatment',
    body: 'We apply the right method for your situation: targeted baits, localized treatment or heat treatment. Always with approved products and a plan suited to your building.'
  },
  {
    _type: 'processStep',
    _key: 'step-3',
    title: 'The prevention',
    body: 'We seal the entry points and give you the right habits so the problem does not come back. Half the job is preventing the next visit.'
  },
  {
    _type: 'processStep',
    _key: 'step-4',
    title: 'The guarantee',
    body: 'We follow up and stay available. If the pest comes back during the covered period, we come back at no charge. That is what settling the problem for good means.'
  }
])

/** Full process block/object. _key omitted outside pageBuilder. */
const processContent = (key) => ({
  _type: 'process',
  ...(key ? { _key: key } : {}),
  eyebrow: 'The process',
  heading: 'How an intervention unfolds',
  lead: 'From the first call to the follow-up, a proven method and a single goal: the pest leaves and does not come back.',
  cta: external('418 555 0147', 'tel:+14185550147'),
  steps: processSteps()
})

/** About block (about + one-pager). */
const aboutBlock = (key) => ({
  _type: 'about',
  _key: key,
  eyebrow: 'About',
  heading: 'A local team that answers, and comes back if needed.',
  body: [
    'Rempart Extermination is Mathieu Bouchard and his team of six technicians, based in Lévis since 2011. Mathieu started out on his own, with a truck and his certification in hand. Fifteen years later, we serve the whole South Shore of Quebec City and Chaudière-Appalaches, but the approach has not changed: you talk to real people from the region, not a call centre.',
    'Karine, David, Jean-Philippe, Stéphanie and Olivier round out the team. All certified, all trained to clearly explain what they are doing and why. Our trade is not just chasing insects: it is giving you back your peace of mind at home.'
  ],
  photo: {
    _type: 'figure',
    image: { _imagePath: '/images/hero.jpg' },
    alt: 'Mathieu Bouchard, founder of Rempart Extermination, in front of the service truck in Lévis.',
    label: 'Mathieu Bouchard, founder',
    caption: 'Portrait, 3:4',
    ratio: '3/4'
  },
  figcaption: 'Mathieu Bouchard, founder and certified technician. Rempart Extermination, Lévis.',
  diffs: [
    {
      _type: 'aboutDiff',
      _key: 'diff-local',
      title: 'Local.',
      body: "Based in Lévis, we know the region's buildings and pests. We get out fast across the whole South Shore."
    },
    {
      _type: 'aboutDiff',
      _key: 'diff-certifie',
      title: 'Certified.',
      body: 'MELCCFP licensed and insured. Every technician is trained in the safe application of products.'
    },
    {
      _type: 'aboutDiff',
      _key: 'diff-garantie',
      title: 'Results guarantee.',
      body: 'We do not disappear after the treatment. If the problem comes back during the covered period, we come back at no charge.'
    }
  ]
})

/** Full contact block (Contact page + one-pager). The contact detail values
 *  live in siteSettings (joined at resolution); only the labels and the form
 *  copy are stored here. */
const contactBlock = (key) => ({
  _type: 'contact',
  _key: key,
  eyebrow: 'Contact',
  heading: 'Tell us about your problem.',
  lead: 'Describe what you see or hear, and where. We will get back to you quickly with a plan of action. For an emergency, the phone is still the fastest.',
  metaLabels: {
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    hours: 'Hours'
  },
  form: {
    labels: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message'
    },
    errors: {
      nameRequired: 'Your name is required.',
      emailInvalid: 'Invalid email address.',
      privacyRequired: 'Please accept the privacy policy to send your request.'
    },
    submit: { idle: 'Send request', loading: 'Sending...' },
    errorBanner: {
      title: 'Could not send.',
      body: 'Check your connection and try again, or write to us directly at {email}.'
    },
    privacy: {
      text: 'I agree to have my information handled according to the',
      link: internal('privacy policy', 'legalPage-confidentialite-en')
    }
  },
  success: {
    title: 'Message received.',
    body: 'Thank you. We will get back to you as soon as possible. For an emergency, call us at 418 555 0147.'
  }
})

// ── Conversion blocks specific to the Ancrée family ──────────────────────────

/** Reassurance chips (same-day, 24/7, free estimate, firm price). */
const reassuranceBlock = (key) => ({
  _type: 'reassurance',
  _key: key,
  items: [
    { _type: 'reassuranceItem', _key: 'r-jour', icon: 'lucide:calendar-check', label: 'Same-day service' },
    { _type: 'reassuranceItem', _key: 'r-urgence', icon: 'lucide:clock', label: '24/7 emergency' },
    { _type: 'reassuranceItem', _key: 'r-estimation', icon: 'lucide:badge-check', label: 'Free estimate' },
    { _type: 'reassuranceItem', _key: 'r-prix', icon: 'lucide:coins', label: 'Firm price upfront' }
  ]
})

/** Service area block (South Shore of Quebec City). */
const serviceAreaBlock = (key) => ({
  _type: 'serviceArea',
  _key: key,
  eyebrow: 'Service area',
  heading: 'We cover the whole South Shore of Quebec City',
  lead: 'Based in Lévis, we get out fast. Same day to next day depending on the urgency and your area.',
  areas: [
    { _type: 'serviceAreaItem', _key: 'a-levis', name: 'Lévis' },
    { _type: 'serviceAreaItem', _key: 'a-quebec', name: 'Québec' },
    { _type: 'serviceAreaItem', _key: 'a-st-romuald', name: 'Saint-Romuald' },
    { _type: 'serviceAreaItem', _key: 'a-st-nicolas', name: 'Saint-Nicolas' },
    { _type: 'serviceAreaItem', _key: 'a-charny', name: 'Charny' },
    { _type: 'serviceAreaItem', _key: 'a-chaudiere', name: 'Chaudière-Appalaches' },
    { _type: 'serviceAreaItem', _key: 'a-bellechasse', name: 'Bellechasse' },
    { _type: 'serviceAreaItem', _key: 'a-lotbiniere', name: 'Lotbinière' },
    { _type: 'serviceAreaItem', _key: 'a-beauce', name: 'Beauce' },
    { _type: 'serviceAreaItem', _key: 'a-portneuf', name: 'Portneuf' }
  ],
  note: 'Not sure we cover your area? Give us a call, we will tell you in two minutes.'
})

/** Before / after gallery (figures without image: tidy placeholders). */
const beforeAfterBlock = (key) => ({
  _type: 'beforeAfter',
  _key: key,
  eyebrow: 'Before / after',
  heading: 'Results we show, not just promise',
  lead: 'A few recent interventions, from the problem solved to prevention that holds.',
  items: [
    {
      _type: 'beforeAfterItem',
      _key: 'ba-restaurant',
      before: { _type: 'figure', alt: 'Restaurant kitchen before the cockroach treatment.', label: 'Before treatment', caption: 'Old Lévis restaurant', ratio: '4/3' },
      after: { _type: 'figure', alt: 'Same restaurant kitchen, clean and sealed, after treatment.', label: 'After treatment', caption: 'Old Lévis restaurant', ratio: '4/3' },
      caption: 'Old Lévis restaurant: cockroaches eradicated, entry points sealed, monthly follow-up.'
    },
    {
      _type: 'beforeAfterItem',
      _key: 'ba-duplex',
      before: { _type: 'figure', alt: 'Duplex bedroom before the heat treatment for bed bugs.', label: 'Before treatment', caption: 'Charny duplex', ratio: '4/3' },
      after: { _type: 'figure', alt: 'Same bedroom after heat treatment, ready to move back in.', label: 'After treatment', caption: 'Charny duplex', ratio: '4/3' },
      caption: 'Charny duplex: bed bugs eliminated in a single heat-treatment visit.'
    },
    {
      _type: 'beforeAfterItem',
      _key: 'ba-fourmis',
      before: { _type: 'figure', alt: 'Basement joist chewed up by carpenter ants.', label: 'Before treatment', caption: 'Saint-Nicolas home', ratio: '4/3' },
      after: { _type: 'figure', alt: 'Treated and protected structure, carpenter ants stopped.', label: 'After treatment', caption: 'Saint-Nicolas home', ratio: '4/3' },
      caption: 'Saint-Nicolas home: carpenter ant colony stopped before the damage spread.'
    }
  ]
})

/** Three-field quote form (client-side simulated, like the contact form). */
const quoteFormBlock = (key) => ({
  _type: 'quoteForm',
  _key: key,
  eyebrow: 'Free quote',
  heading: 'Get your free quote',
  lead: 'Three details, we call you back today. For an emergency, call us directly.',
  nameLabel: 'Your name',
  phoneLabel: 'Phone',
  serviceLabel: 'Type of problem',
  serviceOptions: [
    { _type: 'quoteServiceOption', _key: 'opt-souris', label: 'Mice or rats' },
    { _type: 'quoteServiceOption', _key: 'opt-fourmis', label: 'Ants' },
    { _type: 'quoteServiceOption', _key: 'opt-guepes', label: 'Wasps or hornets' },
    { _type: 'quoteServiceOption', _key: 'opt-punaises', label: 'Bed bugs' },
    { _type: 'quoteServiceOption', _key: 'opt-coquerelles', label: 'Cockroaches' },
    { _type: 'quoteServiceOption', _key: 'opt-autre', label: 'Other pest' }
  ],
  submitLabel: 'Get my quote',
  successTitle: 'Request received.',
  successBody: 'Thank you. We will call you back today. For an emergency, call 418 555 0147.',
  privacyNote: 'By submitting, you agree to be contacted about your request.'
})

// ── Documents ────────────────────────────────────────────────────────────────

export const docs = [
  // ── Globals (siteSettings) ─────────────────────────────────────────────────
  {
    _id: 'siteSettings-en',
    _type: 'siteSettings',
    language: 'en',
    brand: {
      name: 'Rempart Extermination',
      homeAriaLabel: 'Rempart Extermination, back to home',
      tagline: 'Pest control for home and business. We take back control, for good.',
      foundedYear: 2011
    },
    contact: {
      phone: '418 555 0147',
      email: 'bonjour@rempartextermination.ca',
      address: {
        line1: '2750 avenue des Lilas',
        cityProv: 'Lévis QC',
        city: 'Lévis',
        region: 'QC',
        country: 'CA',
        postal: 'G6W 0M5'
      },
      areaServed: [
        'Lévis',
        'Quebec City',
        'Saint-Romuald',
        'Saint-Nicolas',
        'Charny',
        'Chaudière-Appalaches',
        'Bellechasse',
        'Lotbinière',
        'Beauce',
        'Portneuf',
        'South Shore of Quebec City'
      ],
      hours: {
        weekdays: 'Mon to Fri, 7 am to 7 pm',
        weekend: 'Sat and Sun, 24/7 emergencies'
      }
    },
    nav: {
      landing: {
        primary: [
          { _key: 'nav-about', ...anchor('About', 'about') },
          { _key: 'nav-services', ...anchor('Services', 'services') },
          { _key: 'nav-testimonials', ...anchor('Testimonials', 'testimonials') },
          { _key: 'nav-faq', ...anchor('FAQ', 'faq') }
        ],
        cta: anchor('Free quote', 'contact')
      },
      multipage: {
        primary: [
          { _key: 'nav-services', ...internal('Services', 'servicesPage-en') },
          { _key: 'nav-projets', ...internal('Interventions', 'projectsPage-en') },
          { _key: 'nav-a-propos', ...internal('About', 'aboutPage-en') },
          { _key: 'nav-blogue', ...internal('Blog', 'blogPage-en') },
          { _key: 'nav-contact', ...internal('Contact', 'contactPage-en') }
        ],
        cta: internal('Free quote', 'contactPage-en')
      }
    },
    footer: {
      primary: [
        { _key: 'footer-services', ...internal('Services', 'servicesPage-en') },
        { _key: 'footer-projets', ...internal('Interventions', 'projectsPage-en') },
        { _key: 'footer-a-propos', ...internal('About', 'aboutPage-en') },
        { _key: 'footer-blogue', ...internal('Blog', 'blogPage-en') },
        { _key: 'footer-contact', ...internal('Contact', 'contactPage-en') }
      ],
      socials: [
        {
          _type: 'socialLink',
          _key: 'social-instagram',
          label: 'Instagram',
          href: 'https://instagram.com',
          icon: 'ri:instagram-fill'
        },
        {
          _type: 'socialLink',
          _key: 'social-facebook',
          label: 'Facebook',
          href: 'https://facebook.com',
          icon: 'ri:facebook-box-fill'
        }
      ],
      utility: [
        { _key: 'util-faq', ...internal('FAQ', 'faqPage-en') }
      ],
      pageLinks: [
        { _key: 'legal-conditions', ...internal('Terms of use', 'legalPage-conditions-en') },
        { _key: 'legal-confidentialite', ...internal('Privacy policy', 'legalPage-confidentialite-en') }
      ],
      copyright: '© {year} Rempart Extermination. All rights reserved.',
      credit: {
        label: 'Created by',
        studio: 'Patoine Studio',
        product: 'WebForge, Anchored family',
        studioUrl: 'https://patoinestudio.ca'
      }
    },
    seo: {
      titleSuffix: 'Rempart Extermination',
      defaultDescription: 'Pest control and extermination in Lévis and the Quebec City area. Ants, mice, wasps, bed bugs, cockroaches. Licensed, insured, results guarantee. 24/7 emergency service.'
    }
  },

  // ── Home (homePage) ────────────────────────────────────────────────────────
  {
    _id: 'homePage-en',
    _type: 'homePage',
    language: 'en',
    hero: [{ _type: 'heroHome', _key: 'hero',
      title: 'We take back control of your home. For good.',
      lead: 'Ants, mice, wasps, bed bugs, cockroaches: pest control for home and business in Lévis and the Quebec City area. 24/7 emergencies.',
      primaryCta: external('418 555 0147', 'tel:+14185550147'),
      secondaryCta: internal('Free quote', 'contactPage-en'),
      meta: [
        { _type: 'heroMetaItem', _key: 'meta-google', icon: 'lucide:star', label: 'Google', value: '4.9' },
        { _type: 'heroMetaItem', _key: 'meta-permis', icon: 'lucide:shield-check', label: 'Permit', value: 'Licensed and insured' },
        { _type: 'heroMetaItem', _key: 'meta-depuis', icon: 'lucide:award', label: 'Since', value: '2011' }
      ],
      visual: heroFigure('4/5', 'Service call, 4:5'),
      visualMobile: heroFigure('4/3', 'Service call, 4:3')
    }],
    pageBuilder: [
      reassuranceBlock('home-reassurance'),
      highlightsBlock('home-highlights'),
      {
        _type: 'projectsPreview',
        _key: 'home-projects',
        heading: 'Interventions that speak for themselves',
        lead: 'A few situations we have settled recently, from the first visit to the final result.',
        cta: internal('All interventions', 'projectsPage-en'),
        mode: 'featured',
        limit: 3
      },
      {
        _type: 'services',
        _key: 'home-services',
        eyebrow: 'Services',
        heading: 'What we handle for you',
        lead: 'Five pests we treat every day, at home and at the business.',
        cta: internal('Free quote', 'contactPage-en'),
        mode: 'auto',
      },
      beforeAfterBlock('home-before-after'),
      statsBlock('home-stats'),
      serviceAreaBlock('home-service-area'),
      {
        _type: 'mediaText',
        _key: 'home-story',
        heading: 'A local team that answers, and comes back if needed',
        body: [
          'We have been based in Lévis since 2011. When you call, real people from the region answer, not a call centre. We know the buildings and the pests around here.',
          'Our goal is not just to treat once: it is to settle the situation for good. We seal the entry points, explain what to watch for, and guarantee our work.'
        ],
        mediaSide: 'right',
        image: {
          _type: 'figure',
          image: { _imagePath: '/images/inspection.jpg' },
          alt: 'Rempart Extermination technician inspecting the perimeter of a home on the South Shore.',
          label: 'Residential inspection',
          caption: 'On site, 4:3',
          ratio: '4/3'
        },
        cta: internal('About the team', 'aboutPage-en')
      },
      {
        _type: 'testimonials',
        _key: 'home-testimonials',
        eyebrow: 'Testimonials',
        heading: 'What our clients say',
        mode: 'featured'
      },
      quoteFormBlock('home-quote'),
      {
        _type: 'blogPreview',
        _key: 'home-blog',
        heading: 'The blog',
        lead: 'Prevention, pest identification and tips for a healthy home.',
        cta: internal('All blog posts', 'blogPage-en'),
        limit: 3
      },
      {
        _type: 'ctaBand',
        _key: 'home-cta',
        title: 'A pest in your home?',
        subtitle: 'The estimate is free. Call us, we will tell you what to do.',
        primaryCta: external('418 555 0147', 'tel:+14185550147')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Rempart Extermination | Extermination in Lévis and the Quebec City area',
      description: 'Pest control and extermination in Lévis and the Quebec City area. Ants, mice, wasps, bed bugs, cockroaches. Licensed, insured, results guarantee. 24/7 emergency service.'
    }
  },

  // ── Services page (servicesPage) ───────────────────────────────────────────
  {
    _id: 'servicesPage-en',
    _type: 'servicesPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'What we handle, and how we handle it',
      lead: 'Five pests we treat every day on the South Shore. If your situation is not on the list, call us anyway: we will point you to the right solution, honestly.',
      image: {
        _type: 'figure',
        alt: 'Technician applying a targeted treatment along a house foundation.',
        label: 'Rempart Extermination, targeted treatment',
        caption: 'Service call, 2:1',
        ratio: '2/1'
      }
    }],
    pageBuilder: [
      reassuranceBlock('services-reassurance'),
      {
        _type: 'services',
        _key: 'services-grid',
        eyebrow: 'Services',
        heading: 'Five pests, one proven method',
        lead: 'Each card leads to the treatment details. Your situation is not here? Call us, chances are we have seen your case before.',
        cta: internal('Free quote', 'contactPage-en'),
        mode: 'auto',
      },
      processContent('services-process'),
      serviceAreaBlock('services-area'),
      {
        _type: 'testimonials',
        _key: 'services-testimonials',
        eyebrow: 'Testimonials',
        heading: 'Clients at ease, intervention after intervention',
        mode: 'featured'
      },
      {
        _type: 'faq',
        _key: 'services-faq',
        eyebrow: 'FAQ',
        heading: 'Frequently asked questions about our services',
        items: [
          { _key: 'faq-delai', _type: 'reference', _ref: 'faqItem-delai-en' },
          { _key: 'faq-soumission', _type: 'reference', _ref: 'faqItem-soumission-en' },
          { _key: 'faq-produits', _type: 'reference', _ref: 'faqItem-produits-en' },
          { _key: 'faq-garantie', _type: 'reference', _ref: 'faqItem-garantie-en' }
        ]
      },
      {
        _type: 'ctaBand',
        _key: 'services-cta',
        title: 'Ready to settle the situation?',
        subtitle: 'Describe what you are seeing. We will reply with a clear plan.',
        primaryCta: external('418 555 0147', 'tel:+14185550147')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Services',
      description: 'Extermination of ants, mice and rats, wasps and hornets, bed bugs and cockroaches in Lévis and the Quebec City area. Licensed, insured, results guarantee.'
    }
  },

  // ── Interventions page (projectsPage) ──────────────────────────────────────
  {
    _id: 'projectsPage-en',
    _type: 'projectsPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'Real situations, settled for good',
      lead: 'Every intervention answers a concrete problem, in a real home or a real business in the region. Here are some of the ones that speak loudest.',
      image: {
        _type: 'figure',
        alt: 'Restaurant kitchen made clean again after a cockroach intervention.',
        label: 'Old Lévis restaurant, intervention',
        caption: 'Intervention, 2:1',
        ratio: '2/1'
      }
    }],
    pageBuilder: [
      beforeAfterBlock('projects-before-after'),
      serviceAreaBlock('projects-area'),
      {
        _type: 'ctaBand',
        _key: 'projects-cta',
        title: 'Your situation will be the next one settled',
        subtitle: 'Tell us what is going on at your place. We will tell you honestly what to do.',
        primaryCta: external('418 555 0147', 'tel:+14185550147')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Interventions',
      description: 'Pest control case studies: cockroaches, bed bugs, rodents, carpenter ants and wasps, settled on the South Shore of Quebec City.'
    }
  },

  // ── About (aboutPage) ──────────────────────────────────────────────────────
  {
    _id: 'aboutPage-en',
    _type: 'aboutPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'A local, certified team that answers',
      lead: 'Rempart Extermination has protected homes and businesses on the South Shore since 2011. Mathieu Bouchard and his team of six technicians know the region, and stay available well after the treatment.',
      image: {
        _type: 'figure',
        image: { _imagePath: '/images/equipe.jpg' },
        alt: 'The Rempart Extermination team in front of the service van in Lévis.',
        label: 'Rempart Extermination team, Lévis',
        caption: 'Team, 2:1',
        ratio: '2/1'
      }
    }],
    pageBuilder: [
      aboutBlock('about-story'),
      highlightsBlock('about-values'),
      statsBlock('about-stats'),
      {
        _type: 'logos',
        _key: 'about-logos',
        eyebrow: 'Credentials',
        heading: 'Standards we stand behind, in writing.',
        items: [
          { _type: 'logoItem', _key: 'logo-acgp', label: 'CPMA member' },
          { _type: 'logoItem', _key: 'logo-melccfp', label: 'MELCCFP licensed' },
          { _type: 'logoItem', _key: 'logo-assure', label: 'Insured' },
          { _type: 'logoItem', _key: 'logo-garantie', label: 'Results guarantee' },
          { _type: 'logoItem', _key: 'logo-sante-canada', label: 'Health Canada approved products' }
        ]
      },
      {
        _type: 'testimonials',
        _key: 'about-testimonials',
        eyebrow: 'Testimonials',
        heading: 'The trust of our clients',
        mode: 'featured'
      },
      {
        _type: 'ctaBand',
        _key: 'about-cta',
        title: 'Want us to handle your problem?',
        subtitle: 'The estimate is free, at home and at the business.',
        primaryCta: external('418 555 0147', 'tel:+14185550147')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'About',
      description: 'A local extermination team in Lévis since 2011. MELCCFP licensed, insured and backed by a results guarantee on the South Shore of Quebec City.'
    }
  },

  // ── Blog page (blogPage) ───────────────────────────────────────────────────
  {
    _id: 'blogPage-en',
    _type: 'blogPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'The blog',
      lead: 'Prevention, pest identification, healthy home. The practical advice we give our clients every day, before a problem even sets in.'
    }],
    listCta: {
      _type: 'ctaBand',
      title: 'A situation that cannot wait?',
      subtitle: 'Call us. The estimate is free and we answer emergencies 24/7.',
      primaryCta: external('418 555 0147', 'tel:+14185550147')
    },
    categoryCta: {
      _type: 'ctaBand',
      title: 'A pest in your home?',
      subtitle: 'The estimate is free. Call us, we will tell you what to do.',
      primaryCta: external('418 555 0147', 'tel:+14185550147')
    },
    articleCta: {
      _type: 'ctaBand',
      title: 'Need an intervention?',
      subtitle: 'Describe your situation. The estimate is free and with no obligation.',
      primaryCta: internal('Free quote', 'contactPage-en')
    },
    related: { heading: 'Read next' },
    pageBuilder: [],
    seo: {
      _type: 'seo',
      title: 'Blog',
      description: 'The Rempart Extermination blog: prevention, pest identification and tips for keeping a healthy home on the South Shore of Quebec City.'
    }
  },

  // ── FAQ page (faqPage) ─────────────────────────────────────────────────────
  {
    _id: 'faqPage-en',
    _type: 'faqPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'The questions people ask us',
      lead: 'Timelines, service area, estimate, safety, guarantee, price, follow-up and process. The honest answers, before we even talk.'
    }],
    // 8 sections in manual mode, one per theme; Price and payment carries price
    // then deposit. Reproduces the template composition exactly.
    sections: [
      {
        _type: 'faqSection',
        _key: 'section-urgence',
        theme: { _type: 'reference', _ref: 'faqTheme-urgence-en' },
        mode: 'manual',
        items: [
          { _key: 'q-delai', _type: 'reference', _ref: 'faqItem-delai-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-zone',
        theme: { _type: 'reference', _ref: 'faqTheme-zone-en' },
        mode: 'manual',
        items: [
          { _key: 'q-zone', _type: 'reference', _ref: 'faqItem-zone-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-soumission',
        theme: { _type: 'reference', _ref: 'faqTheme-soumission-en' },
        mode: 'manual',
        items: [
          { _key: 'q-soumission', _type: 'reference', _ref: 'faqItem-soumission-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-securite',
        theme: { _type: 'reference', _ref: 'faqTheme-securite-en' },
        mode: 'manual',
        items: [
          { _key: 'q-produits', _type: 'reference', _ref: 'faqItem-produits-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-garantie',
        theme: { _type: 'reference', _ref: 'faqTheme-garantie-en' },
        mode: 'manual',
        items: [
          { _key: 'q-garantie', _type: 'reference', _ref: 'faqItem-garantie-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-prix',
        theme: { _type: 'reference', _ref: 'faqTheme-prix-en' },
        mode: 'manual',
        items: [
          { _key: 'q-prix', _type: 'reference', _ref: 'faqItem-prix-en' },
          { _key: 'q-acompte', _type: 'reference', _ref: 'faqItem-acompte-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-suivi',
        theme: { _type: 'reference', _ref: 'faqTheme-suivi-en' },
        mode: 'manual',
        items: [
          { _key: 'q-suivi', _type: 'reference', _ref: 'faqItem-suivi-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-processus',
        theme: { _type: 'reference', _ref: 'faqTheme-processus-en' },
        mode: 'manual',
        items: [
          { _key: 'q-processus', _type: 'reference', _ref: 'faqItem-processus-en' }
        ]
      }
    ],
    pageBuilder: [
      {
        _type: 'ctaBand',
        _key: 'faq-cta',
        title: 'Cannot find your answer?',
        subtitle: 'Call us, we answer in person. The estimate is free and with no obligation.',
        primaryCta: external('418 555 0147', 'tel:+14185550147')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Frequently asked questions',
      description: 'Timelines, service area, estimate, product safety, guarantee, price and follow-up: honest answers to the most common questions, before we even talk.'
    }
  },

  // ── Contact (contactPage) ──────────────────────────────────────────────────
  {
    _id: 'contactPage-en',
    _type: 'contactPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'We will handle your problem',
      lead: 'A nest, some traces, noises in the walls or just a hunch: write to us about what you are noticing. We will get back to you with a clear plan. For an emergency, call us, it is faster.'
    }],
    pageBuilder: [
      contactBlock('contact-page')
    ],
    seo: {
      _type: 'seo',
      title: 'Contact',
      description: 'Get a free quote for an extermination intervention in Lévis and the Quebec City area. Write to us or call us. 24/7 emergencies.'
    }
  },

  // ── One-Pager, tier 1 (onePager) ───────────────────────────────────────────
  {
    _id: 'onePager-en',
    _type: 'onePager',
    language: 'en',
    hero: [{ _type: 'heroHome', _key: 'hero',
      title: 'We take back control of your home. For good.',
      lead: 'Ants, mice, wasps, bed bugs, cockroaches: pest control for home and business in Lévis and the Quebec City area. 24/7 emergencies.',
      primaryCta: external('418 555 0147', 'tel:+14185550147'),
      secondaryCta: anchor('Free quote', 'contact'),
      meta: [
        { _type: 'heroMetaItem', _key: 'meta-google', icon: 'lucide:star', label: 'Google', value: '4.9' },
        { _type: 'heroMetaItem', _key: 'meta-permis', icon: 'lucide:shield-check', label: 'Permit', value: 'Licensed and insured' },
        { _type: 'heroMetaItem', _key: 'meta-depuis', icon: 'lucide:award', label: 'Since', value: '2011' }
      ],
      visual: heroFigure('4/5', 'Service call, 4:5'),
      visualMobile: heroFigure('4/3', 'Service call, 4:3')
    }],
    pageBuilder: [
      reassuranceBlock('one-pager-reassurance'),
      aboutBlock('one-pager-about'),
      {
        _type: 'services',
        _key: 'one-pager-services',
        eyebrow: 'Services',
        heading: 'The pests we handle most often.',
        lead: 'We do not pretend to do everything. Here is what we treat every day, at home and at the business, across the whole South Shore.',
        cta: anchor('Free quote', 'contact'),
        mode: 'auto',
        limit: 4,
      },
      {
        _type: 'testimonials',
        _key: 'one-pager-testimonials',
        eyebrow: 'Testimonials',
        heading: 'Three clients, three situations, the same peace of mind regained.',
        mode: 'featured'
      },
      {
        _type: 'faq',
        _key: 'one-pager-faq',
        eyebrow: 'FAQ',
        heading: 'The questions people ask us most often.',
        items: [
          { _key: 'faq-delai', _type: 'reference', _ref: 'faqItem-delai-en' },
          { _key: 'faq-zone', _type: 'reference', _ref: 'faqItem-zone-en' },
          { _key: 'faq-soumission', _type: 'reference', _ref: 'faqItem-soumission-en' },
          { _key: 'faq-produits', _type: 'reference', _ref: 'faqItem-produits-en' },
          { _key: 'faq-garantie', _type: 'reference', _ref: 'faqItem-garantie-en' }
        ]
      },
      quoteFormBlock('one-pager-quote'),
      contactBlock('one-pager-contact')
    ],
    seo: {
      _type: 'seo',
      title: 'Rempart Extermination | Extermination in Lévis and the Quebec City area',
      description: 'Pest control and extermination in Lévis and the Quebec City area. Licensed, insured, results guarantee. 24/7 emergency service.'
    }
  }
]
