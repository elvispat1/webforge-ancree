// Seed EN: globales (siteSettings) et pages (accueil, services, projets,
// à propos, blogue, FAQ, contact, one-pager).
//
// Miroir structurel exact de site-pages-fr.mjs: mêmes documents (_id en -en),
// mêmes _key, mêmes marqueurs { _imagePath }, mêmes modes de blocs (le bloc
// faq est en sélection manuelle pure, spec 4.4; la page FAQ se compose en
// sections par thème dans faqPage.sections, spec 6.7); seuls les textes et
// libellés sont traduits (en-CA). Les refs internes pointent les documents
// -en; les _id gardent la clé canonique FR (spec, section 11).
// Les jetons {year} (copyright) et {email} (bandeau d'échec du formulaire)
// restent tels quels: remplacés à la résolution.

// ── Fabriques locales (liens et figures récurrents) ──────────────────────────

/** Lien interne vers un document (id déterministe -en). */
const internal = (label, ref) => ({
  _type: 'link',
  label,
  type: 'internal',
  internalRef: { _type: 'reference', _ref: ref }
})

/** Lien ancre sur la page courante (one-pager). */
const anchor = (label, target) => ({
  _type: 'link',
  label,
  type: 'anchor',
  anchor: target
})

/** Figure du héros d'accueil (art direction: même image, deux ratios). */
const heroFigure = (ratio, caption) => ({
  _type: 'figure',
  image: { _imagePath: '/images/hero.jpg' },
  alt: 'Cabinetmaking workshop, workbench with an ash board, hand planes and wood chisels.',
  label: 'Workshop, ash workbench',
  caption,
  ratio
})

// ── Blocs partagés entre pages (copie identique, _key propre à chaque page) ──

/** Bloc highlights (HIGHLIGHTS_CONTENT, accueil + à propos). */
const highlightsBlock = (key) => ({
  _type: 'highlights',
  _key: key,
  heading: 'What you get when you work with me.',
  lead: 'No marketing promises. Four concrete commitments I honour on every piece that leaves the shop.',
  items: [
    {
      _type: 'highlightItem',
      _key: 'item-bois',
      icon: 'lucide:trees',
      title: 'Local wood',
      body: 'Ash, maple, yellow birch and black walnut sourced within 200 km of Chambly. I know where every board comes from.'
    },
    {
      _type: 'highlightItem',
      _key: 'item-mains',
      icon: 'lucide:hammer',
      title: 'One pair of hands',
      body: 'From the first sketch to delivery, I do everything myself. You are always talking to the person who builds.'
    },
    {
      _type: 'highlightItem',
      _key: 'item-joinage',
      icon: 'lucide:ruler',
      title: 'Traditional joinery',
      body: 'Hand-cut mortise and tenon joints and dovetails. No hidden hardware covering up a shortcut.'
    },
    {
      _type: 'highlightItem',
      _key: 'item-garantie',
      icon: 'lucide:shield-check',
      title: 'Lifetime structural warranty',
      body: 'If a joint ever gives, I repair it at no charge. A solid wood piece gets handed down, not thrown away.'
    }
  ]
})

/** Bloc stats (STATS_CONTENT, accueil + à propos). */
const statsBlock = (key) => ({
  _type: 'stats',
  _key: key,
  heading: 'Ten years in the shop, in a few numbers.',
  items: [
    { _type: 'statItem', _key: 'stat-fonde', value: '2014', label: 'Workshop founded in Chambly' },
    { _type: 'statItem', _key: 'stat-pieces', value: '140+', label: 'Pieces delivered by hand' },
    { _type: 'statItem', _key: 'stat-rayon', value: '200 km', label: 'Wood sourcing radius' },
    { _type: 'statItem', _key: 'stat-garantie', value: 'Lifetime', label: 'Warranty on the structure' }
  ]
})

/** Étapes du processus (PROCESS_CONTENT, sans le n: dérivé de la position). */
const processSteps = () => ([
  {
    _type: 'processStep',
    _key: 'step-1',
    title: 'The meeting',
    body: 'An hour together, at the shop or at your place, to understand your project and your space. Free, with no obligation.'
  },
  {
    _type: 'processStep',
    _key: 'step-2',
    title: 'The quote and the drawing',
    body: 'A firm written quote within the week: wood species, dimensions, timeline. We lock down the drawing together before I saw a single board.'
  },
  {
    _type: 'processStep',
    _key: 'step-3',
    title: 'The build',
    body: 'I mill, assemble and finish everything at the Chambly shop. I keep you posted at the key stages, sometimes with a photo.'
  },
  {
    _type: 'processStep',
    _key: 'step-4',
    title: 'Delivery and installation',
    body: 'I deliver and install the piece myself. Adjustments and finishing touches happen on site. The balance is only due once the piece is in place.'
  }
])

/** Bloc/objet process complet (PROCESS_CONTENT). _key omis hors pageBuilder. */
const processContent = (key) => ({
  _type: 'process',
  ...(key ? { _key: key } : {}),
  eyebrow: 'How it works',
  heading: 'How a project unfolds',
  lead: 'From the first call to the final installation, a single point of contact: me.',
  cta: internal('Contact me', 'contactPage-en'),
  steps: processSteps()
})

/** Bloc about (ABOUT_CONTENT, à propos + one-pager). */
const aboutBlock = (key) => ({
  _type: 'about',
  _key: key,
  eyebrow: 'About',
  heading: 'One person, from drawing to delivery.',
  body: [
    "I learned the trade in my grandfather's workshop in Saint-Hyacinthe, then spent five years with a master cabinetmaker in Lévis. Since 2014, I have worked alone in Chambly. I am the one who draws, saws, assembles and delivers. If you call, I am the one who answers.",
    'My approach is simple: fewer pieces, better made. If I am not the right person for your project, I will tell you straight out.'
  ],
  photo: {
    _type: 'figure',
    image: { _imagePath: '/images/about.jpg' },
    alt: "The cabinetmaker's hands carving a walnut piece with a wood chisel.",
    label: 'Workshop, hands at work',
    caption: 'Workshop photo, 3:4',
    ratio: '3/4'
  },
  figcaption: 'Maxime Cormier, founder. Atelier Cormier, Chambly.',
  diffs: [
    {
      _type: 'aboutDiff',
      _key: 'diff-bois',
      title: 'Local wood.',
      body: 'Ash, maple, yellow birch and black walnut, sourced within 200 km of the shop.'
    },
    {
      _type: 'aboutDiff',
      _key: 'diff-solo',
      title: 'A one-person shop.',
      body: 'You talk to the person building your piece. No middleman, no subcontracting.'
    },
    {
      _type: 'aboutDiff',
      _key: 'diff-joinage',
      title: 'Traditional joinery.',
      body: 'Mortise and tenon joints, dovetails. No hidden hardware filling in for the craft.'
    }
  ]
})

/** Bloc contact complet (CONTACT_CONTENT, page Contact + one-pager). Les
 *  valeurs des coordonnées vivent dans siteSettings (join à la résolution);
 *  seuls les libellés et la copie du formulaire sont stockés ici. */
const contactBlock = (key) => ({
  _type: 'contact',
  _key: key,
  eyebrow: 'Contact',
  heading: 'Tell me about your project.',
  lead: "A one-hour meeting, at the shop or at your place, is enough to know whether we're a good fit to work together. No commitment until the quote is signed.",
  metaLabels: {
    phone: 'Phone',
    email: 'Email',
    address: 'Workshop',
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
    submit: { idle: 'Send your request', loading: 'Sending...' },
    errorBanner: {
      title: 'Your message could not be sent.',
      body: 'Check your connection and try again, or write to me directly at {email}.'
    },
    privacy: {
      text: 'I agree to have my information handled according to the',
      link: internal('privacy policy', 'legalPage-confidentialite-en')
    }
  },
  success: {
    title: 'Message received.',
    body: 'Thank you very much. You will hear back from me very soon.'
  }
})

// ── Documents ────────────────────────────────────────────────────────────────

export const docs = [
  // ── Globales (siteSettings) ────────────────────────────────────────────────
  {
    _id: 'siteSettings-en',
    _type: 'siteSettings',
    language: 'en',
    brand: {
      name: 'Atelier Cormier',
      logo: { _imagePath: '/seed-assets/logo-atelier-cormier.svg' },
      homeAriaLabel: 'Atelier Cormier, back to home',
      tagline: 'Custom cabinetmaking, Chambly QC. Established in 2014.',
      foundedYear: 2014
    },
    contact: {
      phone: '450 555 0188',
      email: 'bonjour@ateliercormier.ca',
      address: {
        line1: '14 rue Bourgogne',
        cityProv: 'Chambly QC',
        city: 'Chambly',
        region: 'QC',
        country: 'CA',
        postal: 'J3L 1A4'
      },
      areaServed: ['Chambly', 'Montérégie', 'South Shore of Montreal', 'Montreal', 'Eastern Townships'],
      hours: {
        weekdays: 'Mon to Fri, 8 am to 5 pm',
        weekend: 'Sat by appointment'
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
        cta: anchor('Start a project', 'contact')
      },
      multipage: {
        primary: [
          { _key: 'nav-services', ...internal('Services', 'servicesPage-en') },
          { _key: 'nav-projets', ...internal('Projects', 'projectsPage-en') },
          { _key: 'nav-a-propos', ...internal('About', 'aboutPage-en') },
          { _key: 'nav-blogue', ...internal('Blog', 'blogPage-en') },
          { _key: 'nav-contact', ...internal('Contact', 'contactPage-en') }
        ],
        cta: internal('Start a project', 'contactPage-en')
      }
    },
    footer: {
      primary: [
        { _key: 'footer-services', ...internal('Services', 'servicesPage-en') },
        { _key: 'footer-projets', ...internal('Projects', 'projectsPage-en') },
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
      copyright: '© {year} Atelier Cormier. All rights reserved.',
      credit: {
        label: 'Created by',
        studio: 'Patoine Studio',
        product: 'WebForge, Minimalist family',
        studioUrl: 'https://patoinestudio.ca'
      }
    },
    seo: {
      titleSuffix: 'Atelier Cormier',
      defaultDescription: 'Custom cabinetmaking in Chambly, Quebec. Kitchens, furniture and restoration in local solid wood. Independent workshop established in 2014.'
    }
  },

  // ── Accueil (homePage) ─────────────────────────────────────────────────────
  {
    _id: 'homePage-en',
    _type: 'homePage',
    language: 'en',
    hero: [{ _type: 'heroHome', _key: 'hero',
      title: 'Local solid wood, shaped by hand, built to last a hundred years.',
      lead: 'Kitchens, furniture and restoration, from an independent workshop in Montérégie since 2014.',
      primaryCta: internal('Start a project', 'contactPage-en'),
      secondaryCta: internal('See the services', 'servicesPage-en'),
      meta: [
        { _type: 'heroMetaItem', _key: 'meta-etabli', label: 'Established', value: '2014' },
        { _type: 'heroMetaItem', _key: 'meta-projets', label: 'Projects delivered', value: '140+' },
        { _type: 'heroMetaItem', _key: 'meta-rayon', label: 'Radius', value: '200 km' }
      ],
      visual: heroFigure('4/5', 'Workshop photo, 4:5'),
      visualMobile: heroFigure('4/3', 'Workshop photo, 4:3')
    }],
    pageBuilder: [
      highlightsBlock('home-highlights'),
      {
        _type: 'projectsPreview',
        _key: 'home-projects',
        heading: 'Projects that speak for themselves',
        lead: 'A few recent builds, from sketch to installation.',
        cta: internal('All projects', 'projectsPage-en'),
        mode: 'featured',
        limit: 3
      },
      {
        _type: 'services',
        _key: 'home-services',
        eyebrow: 'Services',
        heading: 'What I build',
        lead: 'Five families of projects, each delivered dozens of times.',
        cta: internal('Start a project', 'contactPage-en'),
        mode: 'auto',
      },
      statsBlock('home-stats'),
      {
        _type: 'mediaText',
        _key: 'home-story',
        heading: 'One person, from drawing to delivery',
        body: [
          'I have worked alone in Chambly since 2014. I am the one who draws, saws, assembles and delivers. If you call, I am the one who answers.',
          'Fewer pieces, better made: if I am not the right person for your project, I will tell you straight out.'
        ],
        mediaSide: 'right',
        image: {
          _type: 'figure',
          image: { _imagePath: '/images/about.jpg' },
          alt: "The cabinetmaker's hands carving a walnut piece with a wood chisel.",
          label: 'Workshop, hands at work',
          caption: 'Workshop photo, 3:4',
          ratio: '4/3'
        },
        cta: internal('About the workshop', 'aboutPage-en')
      },
      {
        _type: 'testimonials',
        _key: 'home-testimonials',
        eyebrow: 'Testimonials',
        heading: 'What my clients say',
        mode: 'featured'
      },
      {
        _type: 'blogPreview',
        _key: 'home-blog',
        heading: 'The blog',
        lead: 'Wood, techniques and the stories behind the projects.',
        cta: internal('All blog posts', 'blogPage-en'),
        limit: 3
      },
      {
        _type: 'ctaBand',
        _key: 'home-cta',
        title: 'Have a project in mind?',
        subtitle: "The first meeting is free, with no obligation. Let's talk about it.",
        primaryCta: internal('Start a project', 'contactPage-en')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Atelier Cormier | Custom Cabinetmaking in Chambly',
      description: 'Custom cabinetmaking in Chambly, Quebec. Kitchens, furniture and restoration in local solid wood. Independent workshop established in 2014.'
    }
  },

  // ── Page Services (servicesPage) ───────────────────────────────────────────
  {
    _id: 'servicesPage-en',
    _type: 'servicesPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'What I build, and how',
      lead: 'Five families of projects, each delivered dozens of times. If it is not on the list, I am probably not the right person for it, and I will tell you so frankly.',
      image: {
        _type: 'figure',
        image: { _imagePath: '/images/service-bibliotheques.jpg' },
        alt: 'Built-in yellow birch bookcase covering an entire living room wall.',
        label: 'Atelier Cormier, custom build',
        caption: 'Custom build, 2:1',
        ratio: '2/1'
      }
    }],
    pageBuilder: [
      {
        _type: 'services',
        _key: 'services-grid',
        eyebrow: 'Services',
        heading: 'Five families of projects',
        lead: "Each card leads to the full details. If you don't see what you need, write to me anyway: I will point you in the right direction.",
        cta: internal('Start a project', 'contactPage-en'),
        mode: 'auto',
      },
      processContent('services-process'),
      {
        _type: 'testimonials',
        _key: 'services-testimonials',
        eyebrow: 'Testimonials',
        heading: 'Satisfied clients, project after project',
        mode: 'featured'
      },
      {
        _type: 'faq',
        _key: 'services-faq',
        eyebrow: 'FAQ',
        heading: 'Frequently asked questions about the services',
        items: [
          { _key: 'faq-delai', _type: 'reference', _ref: 'faqItem-delai-en' },
          { _key: 'faq-estimation', _type: 'reference', _ref: 'faqItem-estimation-en' },
          { _key: 'faq-essences', _type: 'reference', _ref: 'faqItem-essences-en' },
          { _key: 'faq-garantie', _type: 'reference', _ref: 'faqItem-garantie-en' }
        ]
      },
      {
        _type: 'ctaBand',
        _key: 'services-cta',
        title: 'Ready to start your project?',
        subtitle: 'Describe what you have in mind. You will get a reply from me personally.',
        primaryCta: internal('Start a project', 'contactPage-en')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Services',
      description: 'Custom kitchens, furniture, built-in bookcases, restoration and commercial millwork in local solid wood, from a Chambly workshop.'
    }
  },

  // ── Page Projets (projectsPage) ────────────────────────────────────────────
  {
    _id: 'projectsPage-en',
    _type: 'projectsPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'Real projects, not catalogue photos',
      lead: 'Every piece was drawn, cut and installed for a real home and real people. Here are some of the ones that tell the story best.',
      image: {
        _type: 'figure',
        image: { _imagePath: '/images/project-cafe-comptoir.jpg' },
        alt: 'Solid wood café counter with matching wall shelves.',
        label: 'Café Le Moulin, Chambly',
        caption: 'Project, 2:1',
        ratio: '2/1'
      }
    }],
    pageBuilder: [
      {
        _type: 'ctaBand',
        _key: 'projects-cta',
        title: 'Your project could be next',
        subtitle: 'Tell me what you are imagining. I will tell you frankly what is possible.',
        primaryCta: internal('Start a project', 'contactPage-en')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Projects',
      description: 'Custom cabinetmaking projects: kitchens, furniture, bookcases and restoration in local solid wood, in Montérégie.'
    }
  },

  // ── À propos (aboutPage) ───────────────────────────────────────────────────
  {
    _id: 'aboutPage-en',
    _type: 'aboutPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'One person, from drawing to delivery',
      lead: 'I have worked alone in Chambly since 2014. I am the one who draws, saws, assembles and delivers. And I am the one who answers when you call.',
      image: {
        _type: 'figure',
        image: { _imagePath: '/images/hero.jpg' },
        alt: 'Cabinetmaking workshop, workbench with an ash board, hand planes and wood chisels.',
        label: 'Workshop in Chambly',
        caption: 'Workshop, 2:1',
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
        heading: 'Standards I put my name behind.',
        items: [
          { _type: 'logoItem', _key: 'logo-guilde', label: 'Quebec Guild of Artisan Cabinetmakers' },
          { _type: 'logoItem', _key: 'logo-fsc', label: 'FSC-certified wood' },
          { _type: 'logoItem', _key: 'logo-fournisseurs', label: 'Montérégie suppliers' },
          { _type: 'logoItem', _key: 'logo-finitions', label: 'VOC-free oil finishes' },
          { _type: 'logoItem', _key: 'logo-garantie', label: 'Lifetime structural warranty' }
        ]
      },
      {
        _type: 'testimonials',
        _key: 'about-testimonials',
        eyebrow: 'Testimonials',
        heading: 'The trust of my clients',
        mode: 'featured'
      },
      {
        _type: 'ctaBand',
        _key: 'about-cta',
        title: 'Want to meet?',
        subtitle: 'At the shop or at your place, the first meeting is free.',
        primaryCta: internal('Start a project', 'contactPage-en')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'About',
      description: 'A solo cabinetmaker in Chambly since 2014. From drawing to delivery, local wood and traditional joinery.'
    }
  },

  // ── Page Blogue (blogPage) ─────────────────────────────────────────────────
  {
    _id: 'blogPage-en',
    _type: 'blogPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'The blog',
      lead: 'Wood, techniques and the stories behind the projects. Everything I wish someone had explained to me before ordering a custom piece.'
    }],
    listCta: {
      _type: 'ctaBand',
      title: 'A project inspired by these reads?',
      subtitle: "Let's talk about it. The first meeting is free, with no obligation.",
      primaryCta: internal('Start a project', 'contactPage-en')
    },
    categoryCta: {
      _type: 'ctaBand',
      title: 'Have a project in mind?',
      subtitle: 'The first meeting is free, with no obligation.',
      primaryCta: internal('Start a project', 'contactPage-en')
    },
    articleCta: {
      _type: 'ctaBand',
      title: 'Thinking about a custom piece?',
      subtitle: 'Describe your project. The first meeting is free, with no obligation.',
      primaryCta: internal('Start a project', 'contactPage-en')
    },
    related: { heading: 'Read next' },
    pageBuilder: [],
    seo: {
      _type: 'seo',
      title: 'Blog',
      description: "The Atelier Cormier blog: wood, techniques and the stories behind the workshop's projects."
    }
  },

  // ── Page FAQ (faqPage) ─────────────────────────────────────────────────────
  {
    _id: 'faqPage-en',
    _type: 'faqPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'The questions people ask me',
      lead: 'Timelines, prices, materials, warranty, care. Honest answers, before we even talk.'
    }],
    // 8 sections en mode manuel, mêmes _key et même ordre que le FR
    // (spec 6.7): reproduit la page V1 à l'identique.
    sections: [
      {
        _type: 'faqSection',
        _key: 'section-delais',
        theme: { _type: 'reference', _ref: 'faqTheme-delais-en' },
        mode: 'manual',
        items: [
          { _key: 'q-delai', _type: 'reference', _ref: 'faqItem-delai-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-zone-desservie',
        theme: { _type: 'reference', _ref: 'faqTheme-zone-desservie-en' },
        mode: 'manual',
        items: [
          { _key: 'q-zone', _type: 'reference', _ref: 'faqItem-zone-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-estimation-et-devis',
        theme: { _type: 'reference', _ref: 'faqTheme-estimation-et-devis-en' },
        mode: 'manual',
        items: [
          { _key: 'q-estimation', _type: 'reference', _ref: 'faqItem-estimation-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-materiaux',
        theme: { _type: 'reference', _ref: 'faqTheme-materiaux-en' },
        mode: 'manual',
        items: [
          { _key: 'q-essences', _type: 'reference', _ref: 'faqItem-essences-en' }
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
        _key: 'section-prix-et-paiement',
        theme: { _type: 'reference', _ref: 'faqTheme-prix-et-paiement-en' },
        mode: 'manual',
        items: [
          { _key: 'q-prix', _type: 'reference', _ref: 'faqItem-prix-en' },
          { _key: 'q-acompte', _type: 'reference', _ref: 'faqItem-acompte-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-entretien',
        theme: { _type: 'reference', _ref: 'faqTheme-entretien-en' },
        mode: 'manual',
        items: [
          { _key: 'q-entretien', _type: 'reference', _ref: 'faqItem-entretien-en' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-processus',
        theme: { _type: 'reference', _ref: 'faqTheme-processus-en' },
        mode: 'manual',
        items: [
          { _key: 'q-modifications', _type: 'reference', _ref: 'faqItem-modifications-en' }
        ]
      }
    ],
    pageBuilder: [
      {
        _type: 'ctaBand',
        _key: 'faq-cta',
        title: "Can't find your answer?",
        subtitle: 'Write to me, I answer personally. The first meeting is free, with no obligation.',
        primaryCta: internal('Contact me', 'contactPage-en')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Frequently asked questions',
      description: 'Materials, timelines, prices, care, warranty and process: honest answers to the most common questions, before we even talk.'
    }
  },

  // ── Contact (contactPage) ──────────────────────────────────────────────────
  {
    _id: 'contactPage-en',
    _type: 'contactPage',
    language: 'en',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: "Let's start your project",
      lead: 'An idea, a sketch on a napkin or just an itch: write to me. The first meeting is free, with no obligation.'
    }],
    pageBuilder: [
      contactBlock('contact-page')
    ],
    seo: {
      _type: 'seo',
      title: 'Contact',
      description: 'Start a custom cabinetmaking project in Chambly. Write to me or call the workshop. First meeting free, with no obligation.'
    }
  },

  // ── One-Pager, palier 1 (onePager) ─────────────────────────────────────────
  {
    _id: 'onePager-en',
    _type: 'onePager',
    language: 'en',
    hero: [{ _type: 'heroHome', _key: 'hero',
      title: 'Local solid wood, shaped by hand, built to last a hundred years.',
      lead: 'Kitchens, furniture and restoration, from an independent workshop in Montérégie since 2014.',
      primaryCta: anchor('Start a project', 'contact'),
      secondaryCta: anchor('See the services', 'services'),
      meta: [
        { _type: 'heroMetaItem', _key: 'meta-etabli', label: 'Established', value: '2014' },
        { _type: 'heroMetaItem', _key: 'meta-projets', label: 'Projects delivered', value: '140+' },
        { _type: 'heroMetaItem', _key: 'meta-rayon', label: 'Radius', value: '200 km' }
      ],
      visual: heroFigure('4/5', 'Workshop photo, 4:5'),
      visualMobile: heroFigure('4/3', 'Workshop photo, 4:3')
    }],
    pageBuilder: [
      aboutBlock('one-pager-about'),
      {
        _type: 'services',
        _key: 'one-pager-services',
        eyebrow: 'Services',
        heading: 'Four things, done properly.',
        lead: 'I do not do everything. Here is what I do: each line represents a project I have delivered at least twenty times.',
        cta: anchor('Request a quote', 'contact'),
        mode: 'auto',
        limit: 4,
      },
      {
        _type: 'testimonials',
        _key: 'one-pager-testimonials',
        eyebrow: 'Testimonials',
        heading: 'Three clients, three projects, one rule: deliver what was promised.',
        mode: 'featured'
      },
      {
        _type: 'faq',
        _key: 'one-pager-faq',
        eyebrow: 'FAQ',
        heading: 'The questions I get asked most often.',
        items: [
          { _key: 'faq-delai', _type: 'reference', _ref: 'faqItem-delai-en' },
          { _key: 'faq-zone', _type: 'reference', _ref: 'faqItem-zone-en' },
          { _key: 'faq-estimation', _type: 'reference', _ref: 'faqItem-estimation-en' },
          { _key: 'faq-essences', _type: 'reference', _ref: 'faqItem-essences-en' },
          { _key: 'faq-garantie', _type: 'reference', _ref: 'faqItem-garantie-en' }
        ]
      },
      contactBlock('one-pager-contact')
    ],
    seo: {
      _type: 'seo',
      title: 'Atelier Cormier | Custom Cabinetmaking in Chambly',
      description: 'Custom cabinetmaking in Chambly, Quebec. Established in 2014.'
    }
  }
]
