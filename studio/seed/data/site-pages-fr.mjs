// Seed FR: globales (siteSettings) et pages (accueil, services, projets,
// à propos, blogue, FAQ, contact, one-pager).
//
// Transcription fidèle de la copie V1 auditée: app/content/site.ts, hero.ts,
// home.ts, page-heroes.ts, highlights.ts, stats.ts, process.ts, logos.ts,
// about.ts, services.ts, testimonials.ts, faq.ts, contact.ts, services-page.ts,
// projects-page.ts, about-page.ts, blog-page.ts. La composition des pageBuilder
// reproduit usePageBlocks.ts et useOnePagerBlocks.ts via les modes des blocs
// intelligents (spec, sections 6.2 à 6.9); le bloc faq est en sélection
// manuelle pure, sans mode ni limit (spec 4.4), et la page FAQ se compose
// en sections par thème dans faqPage.sections (spec 6.7). La copie des pages
// de détail vit sur chaque service et projet (collections, spec 6.10 et 6.11),
// plus dans servicesPage ni projectsPage. Ids déterministes (spec, section 11).
// Les images sont des marqueurs { _imagePath } remplacés par le runner après
// upload des assets. Les jetons {year} (copyright) et {email} (bandeau d'échec
// du formulaire) restent tels quels: remplacés à la résolution.

// ── Fabriques locales (liens et figures récurrents) ──────────────────────────

/** Lien interne vers un document (id déterministe -fr). */
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
  alt: "Atelier d'ébénisterie, plan de travail avec planche de frêne, rabots et ciseaux à bois.",
  label: 'Atelier, plan de travail en frêne',
  caption,
  ratio
})

// ── Blocs partagés entre pages (copie identique, _key propre à chaque page) ──

/** Bloc highlights (HIGHLIGHTS_CONTENT, accueil + à propos). */
const highlightsBlock = (key) => ({
  _type: 'highlights',
  _key: key,
  heading: 'Ce que vous obtenez en travaillant avec moi.',
  lead: "Pas de promesse de marketing. Quatre engagements concrets que je tiens sur chaque pièce qui sort de l'atelier.",
  items: [
    {
      _type: 'highlightItem',
      _key: 'item-bois',
      icon: 'lucide:trees',
      title: "Bois d'ici",
      body: "Frêne, érable, merisier et noyer noir sourcés à moins de 200 km de Chambly. Je sais d'où vient chaque planche."
    },
    {
      _type: 'highlightItem',
      _key: 'item-mains',
      icon: 'lucide:hammer',
      title: 'Une seule paire de mains',
      body: 'Du premier croquis à la livraison, c\'est moi qui fais tout. Vous parlez toujours à la personne qui construit.'
    },
    {
      _type: 'highlightItem',
      _key: 'item-joinage',
      icon: 'lucide:ruler',
      title: 'Joinage traditionnel',
      body: 'Tenons, mortaises et queues d\'aronde taillés à la main. Aucune quincaillerie cachée pour masquer un raccourci.'
    },
    {
      _type: 'highlightItem',
      _key: 'item-garantie',
      icon: 'lucide:shield-check',
      title: 'Garantie à vie sur la structure',
      body: 'Si un assemblage lâche, je le reprends sans frais. Une pièce de bois massif se transmet, elle ne se jette pas.'
    }
  ]
})

/** Bloc stats (STATS_CONTENT, accueil + à propos). */
const statsBlock = (key) => ({
  _type: 'stats',
  _key: key,
  heading: 'Dix ans d’atelier, en quelques chiffres.',
  items: [
    { _type: 'statItem', _key: 'stat-fonde', value: '2014', label: 'Atelier fondé à Chambly' },
    { _type: 'statItem', _key: 'stat-pieces', value: '140+', label: 'Pièces livrées à la main' },
    { _type: 'statItem', _key: 'stat-rayon', value: '200 km', label: 'Rayon des bois sourcés' },
    { _type: 'statItem', _key: 'stat-garantie', value: 'À vie', label: 'Garantie sur la structure' }
  ]
})

/** Étapes du processus (PROCESS_CONTENT, sans le n: dérivé de la position). */
const processSteps = () => ([
  {
    _type: 'processStep',
    _key: 'step-1',
    title: 'La rencontre',
    body: "Une heure ensemble, à l'atelier ou chez vous, pour comprendre votre projet et votre espace. Gratuite et sans engagement."
  },
  {
    _type: 'processStep',
    _key: 'step-2',
    title: 'Le devis et le dessin',
    body: 'Un devis écrit et ferme dans la semaine: essences, dimensions, échéancier. On fige le dessin ensemble avant que je scie quoi que ce soit.'
  },
  {
    _type: 'processStep',
    _key: 'step-3',
    title: 'La fabrication',
    body: "Je débite, j'assemble et je finis à l'atelier de Chambly. Je vous tiens au courant aux étapes clés, parfois avec une photo."
  },
  {
    _type: 'processStep',
    _key: 'step-4',
    title: 'La livraison et la pose',
    body: "Je livre et j'installe moi-même. Ajustements et finitions sur place. Le solde n'est dû qu'une fois la pièce en place."
  }
])

/** Bloc/objet process complet (PROCESS_CONTENT). _key omis hors pageBuilder. */
const processContent = (key) => ({
  _type: 'process',
  ...(key ? { _key: key } : {}),
  eyebrow: 'Le déroulement',
  heading: 'Comment se déroule un mandat',
  lead: 'Du premier appel à la pose finale, un seul interlocuteur: moi.',
  cta: internal('Me contacter', 'contactPage-fr'),
  steps: processSteps()
})

/** Bloc about (ABOUT_CONTENT, à propos + one-pager). */
const aboutBlock = (key) => ({
  _type: 'about',
  _key: key,
  eyebrow: 'À propos',
  heading: 'Une seule personne, du dessin à la livraison.',
  body: [
    "J'ai appris le métier dans l'atelier de mon grand-père à Saint-Hyacinthe, puis passé cinq ans chez un maître ébéniste à Lévis. Depuis 2014, je travaille seul à Chambly. C'est moi qui dessine, qui scie, qui assemble, qui livre. Si vous m'appelez, c'est moi qui réponds.",
    'Mon parti pris est simple : moins de pièces, mieux faites. Si je ne suis pas la bonne personne pour votre projet, je vous le dirai directement.'
  ],
  photo: {
    _type: 'figure',
    image: { _imagePath: '/images/about.jpg' },
    alt: "Mains de l'ébéniste sculptant une pièce de noyer au ciseau à bois.",
    label: 'Atelier, mains au travail',
    caption: 'Photo atelier, 3:4',
    ratio: '3/4'
  },
  figcaption: 'Maxime Cormier, fondateur. Atelier Cormier, Chambly.',
  diffs: [
    {
      _type: 'aboutDiff',
      _key: 'diff-bois',
      title: 'Bois locaux.',
      body: "Frêne, érable, merisier, noyer noir, sourcés à moins de 200 km de l'atelier."
    },
    {
      _type: 'aboutDiff',
      _key: 'diff-solo',
      title: 'Atelier solo.',
      body: "Vous parlez à la personne qui construit votre pièce. Pas d'intermédiaire, pas de sous-traitance."
    },
    {
      _type: 'aboutDiff',
      _key: 'diff-joinage',
      title: 'Joinage traditionnel.',
      body: "Tenons, mortaises, queues d'aronde. Aucune quincaillerie cachée pour combler le travail."
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
  heading: 'Parlez-moi de votre projet.',
  lead: "Une rencontre d'une heure, à l'atelier ou chez vous, suffit pour savoir si on est faits pour travailler ensemble. Aucun engagement avant la signature du devis.",
  metaLabels: {
    phone: 'Téléphone',
    email: 'Courriel',
    address: 'Atelier',
    hours: 'Heures'
  },
  form: {
    labels: {
      name: 'Nom',
      email: 'Courriel',
      phone: 'Téléphone',
      message: 'Message'
    },
    errors: {
      nameRequired: 'Votre nom est requis.',
      emailInvalid: 'Courriel invalide.',
      privacyRequired: 'Veuillez accepter la politique de confidentialité pour envoyer votre demande.'
    },
    submit: { idle: 'Envoyer la demande', loading: 'Envoi en cours...' },
    errorBanner: {
      title: 'Envoi impossible.',
      body: 'Vérifiez votre connexion et réessayez, ou écrivez-moi directement à {email}.'
    },
    privacy: {
      text: "J'accepte que mes informations soient traitées selon la",
      link: internal('politique de confidentialité', 'legalPage-confidentialite-fr')
    }
  },
  success: {
    title: 'Message reçu.',
    body: 'Merci beaucoup. On vous répond dans les plus brefs délais.'
  }
})

// ── Documents ────────────────────────────────────────────────────────────────

export const docs = [
  // ── Globales (siteSettings) ────────────────────────────────────────────────
  {
    _id: 'siteSettings-fr',
    _type: 'siteSettings',
    language: 'fr',
    brand: {
      name: 'Atelier Cormier',
      logo: { _imagePath: '/seed-assets/logo-atelier-cormier.svg' },
      homeAriaLabel: "Atelier Cormier, retour à l'accueil",
      tagline: 'Ébénisterie sur mesure, Chambly QC. Établi en 2014.',
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
      areaServed: ['Chambly', 'Montérégie', 'Rive-Sud de Montréal', 'Montréal', 'Estrie'],
      hours: {
        weekdays: 'Lun à Ven, 8h à 17h',
        weekend: 'Sam sur rendez-vous'
      }
    },
    nav: {
      landing: {
        primary: [
          { _key: 'nav-about', ...anchor('À propos', 'about') },
          { _key: 'nav-services', ...anchor('Services', 'services') },
          { _key: 'nav-testimonials', ...anchor('Témoignages', 'testimonials') },
          { _key: 'nav-faq', ...anchor('FAQ', 'faq') }
        ],
        cta: anchor('Démarrer un projet', 'contact')
      },
      multipage: {
        primary: [
          { _key: 'nav-services', ...internal('Services', 'servicesPage-fr') },
          { _key: 'nav-projets', ...internal('Projets', 'projectsPage-fr') },
          { _key: 'nav-a-propos', ...internal('À propos', 'aboutPage-fr') },
          { _key: 'nav-blogue', ...internal('Blogue', 'blogPage-fr') },
          { _key: 'nav-contact', ...internal('Contact', 'contactPage-fr') }
        ],
        cta: internal('Démarrer un projet', 'contactPage-fr')
      }
    },
    footer: {
      primary: [
        { _key: 'footer-services', ...internal('Services', 'servicesPage-fr') },
        { _key: 'footer-projets', ...internal('Projets', 'projectsPage-fr') },
        { _key: 'footer-a-propos', ...internal('À propos', 'aboutPage-fr') },
        { _key: 'footer-blogue', ...internal('Blogue', 'blogPage-fr') },
        { _key: 'footer-contact', ...internal('Contact', 'contactPage-fr') }
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
        { _key: 'util-faq', ...internal('FAQ', 'faqPage-fr') }
      ],
      pageLinks: [
        { _key: 'legal-conditions', ...internal("Conditions d'utilisation", 'legalPage-conditions-fr') },
        { _key: 'legal-confidentialite', ...internal('Politique de confidentialité', 'legalPage-confidentialite-fr') }
      ],
      copyright: '© {year} Atelier Cormier. Tous droits réservés.',
      credit: {
        label: 'Création de',
        studio: 'Patoine Studio',
        product: 'WebForge, famille Minimaliste',
        studioUrl: 'https://patoinestudio.ca'
      }
    },
    seo: {
      titleSuffix: 'Atelier Cormier',
      defaultDescription: 'Ébénisterie sur mesure à Chambly, Québec. Cuisines, mobilier et restauration en bois massif local. Atelier indépendant établi en 2014.'
    }
  },

  // ── Accueil (homePage) ─────────────────────────────────────────────────────
  {
    _id: 'homePage-fr',
    _type: 'homePage',
    language: 'fr',
    hero: [{ _type: 'heroHome', _key: 'hero',
      title: 'Du bois massif local, façonné à la main, pour durer cent ans.',
      lead: 'Cuisines, mobilier et restauration, dans un atelier indépendant en Montérégie depuis 2014.',
      primaryCta: internal('Démarrer un projet', 'contactPage-fr'),
      secondaryCta: internal('Voir les services', 'servicesPage-fr'),
      meta: [
        { _type: 'heroMetaItem', _key: 'meta-etabli', label: 'Établi', value: '2014' },
        { _type: 'heroMetaItem', _key: 'meta-projets', label: 'Projets livrés', value: '140+' },
        { _type: 'heroMetaItem', _key: 'meta-rayon', label: 'Rayon', value: '200 km' }
      ],
      visual: heroFigure('4/5', 'Photo atelier, 4:5'),
      visualMobile: heroFigure('4/3', 'Photo atelier, 4:3')
    }],
    pageBuilder: [
      highlightsBlock('home-highlights'),
      {
        _type: 'projectsPreview',
        _key: 'home-projects',
        heading: "Des projets qui parlent d'eux-mêmes",
        lead: 'Quelques réalisations récentes, du croquis à la pose.',
        cta: internal('Tous les projets', 'projectsPage-fr'),
        mode: 'featured',
        limit: 3
      },
      {
        _type: 'services',
        _key: 'home-services',
        eyebrow: 'Services',
        heading: 'Ce que je fabrique',
        lead: 'Cinq familles de projets, livrées des dizaines de fois chacune.',
        cta: internal('Démarrer un projet', 'contactPage-fr'),
        mode: 'auto',
      },
      statsBlock('home-stats'),
      {
        _type: 'mediaText',
        _key: 'home-story',
        heading: 'Une seule personne, du dessin à la livraison',
        body: [
          "Je travaille seul à Chambly depuis 2014. C'est moi qui dessine, qui scie, qui assemble et qui livre. Si vous m'appelez, c'est moi qui réponds.",
          'Moins de pièces, mieux faites: si je ne suis pas la bonne personne pour votre projet, je vous le dirai directement.'
        ],
        mediaSide: 'right',
        image: {
          _type: 'figure',
          image: { _imagePath: '/images/about.jpg' },
          alt: "Mains de l'ébéniste sculptant une pièce de noyer au ciseau à bois.",
          label: 'Atelier, mains au travail',
          caption: 'Photo atelier, 3:4',
          ratio: '4/3'
        },
        cta: internal("À propos de l'atelier", 'aboutPage-fr')
      },
      {
        _type: 'testimonials',
        _key: 'home-testimonials',
        eyebrow: 'Témoignages',
        heading: 'Ce que mes clients en disent',
        mode: 'featured'
      },
      {
        _type: 'blogPreview',
        _key: 'home-blog',
        heading: 'Le blogue',
        lead: 'Le bois, les techniques, les coulisses des projets.',
        cta: internal('Tout le blogue', 'blogPage-fr'),
        limit: 3
      },
      {
        _type: 'ctaBand',
        _key: 'home-cta',
        title: 'Un projet en tête?',
        subtitle: 'La première rencontre est gratuite et sans engagement. Parlons-en.',
        primaryCta: internal('Démarrer un projet', 'contactPage-fr')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Atelier Cormier | Ébénisterie sur mesure à Chambly',
      description: 'Ébénisterie sur mesure à Chambly, Québec. Cuisines, mobilier et restauration en bois massif local. Atelier indépendant établi en 2014.'
    }
  },

  // ── Page Services (servicesPage) ───────────────────────────────────────────
  {
    _id: 'servicesPage-fr',
    _type: 'servicesPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'Ce que je fabrique, et comment',
      lead: "Cinq familles de projets, livrées des dizaines de fois chacune. Si ce n'est pas dans la liste, c'est probablement que je ne suis pas la bonne personne. Je vous le dirai franchement.",
      image: {
        _type: 'figure',
        image: { _imagePath: '/images/service-bibliotheques.jpg' },
        alt: 'Bibliothèque intégrée en merisier couvrant un mur complet de salon.',
        label: 'Atelier Cormier, réalisation sur mesure',
        caption: 'Réalisation, 2:1',
        ratio: '2/1'
      }
    }],
    pageBuilder: [
      {
        _type: 'services',
        _key: 'services-grid',
        eyebrow: 'Services',
        heading: 'Cinq familles de projets',
        lead: "Chaque carte mène au détail. Si votre besoin n'y est pas, écrivez-moi quand même: je vous orienterai.",
        cta: internal('Démarrer un projet', 'contactPage-fr'),
        mode: 'auto',
      },
      processContent('services-process'),
      {
        _type: 'testimonials',
        _key: 'services-testimonials',
        eyebrow: 'Témoignages',
        heading: 'Des clients satisfaits, projet après projet',
        mode: 'featured'
      },
      {
        _type: 'faq',
        _key: 'services-faq',
        eyebrow: 'FAQ',
        heading: 'Questions fréquentes sur les services',
        items: [
          { _key: 'faq-delai', _type: 'reference', _ref: 'faqItem-delai-fr' },
          { _key: 'faq-estimation', _type: 'reference', _ref: 'faqItem-estimation-fr' },
          { _key: 'faq-essences', _type: 'reference', _ref: 'faqItem-essences-fr' },
          { _key: 'faq-garantie', _type: 'reference', _ref: 'faqItem-garantie-fr' }
        ]
      },
      {
        _type: 'ctaBand',
        _key: 'services-cta',
        title: 'Prêt à lancer votre projet?',
        subtitle: 'Décrivez-moi ce que vous avez en tête. Je vous réponds en personne.',
        primaryCta: internal('Démarrer un projet', 'contactPage-fr')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Services',
      description: 'Cuisines sur mesure, mobilier, bibliothèques intégrées, restauration et agencements de commerce en bois massif local, atelier de Chambly.'
    }
  },

  // ── Page Projets (projectsPage) ────────────────────────────────────────────
  {
    _id: 'projectsPage-fr',
    _type: 'projectsPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'Des projets, pas des photos de catalogue',
      lead: 'Chaque pièce a été dessinée, taillée et posée pour une vraie maison et de vraies personnes. Voici quelques-unes des plus parlantes.',
      image: {
        _type: 'figure',
        image: { _imagePath: '/images/project-cafe-comptoir.jpg' },
        alt: 'Comptoir de café en bois massif avec tablettes murales assorties.',
        label: 'Café Le Moulin, Chambly',
        caption: 'Projet, 2:1',
        ratio: '2/1'
      }
    }],
    pageBuilder: [
      {
        _type: 'ctaBand',
        _key: 'projects-cta',
        title: 'Votre projet sera le prochain',
        subtitle: 'Racontez-moi ce que vous imaginez. Je vous dirai franchement ce qui est possible.',
        primaryCta: internal('Démarrer un projet', 'contactPage-fr')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Projets',
      description: 'Réalisations en ébénisterie sur mesure: cuisines, mobilier, bibliothèques et restauration en bois massif local, en Montérégie.'
    }
  },

  // ── À propos (aboutPage) ───────────────────────────────────────────────────
  {
    _id: 'aboutPage-fr',
    _type: 'aboutPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'Une seule personne, du dessin à la livraison',
      lead: "Je travaille seul à Chambly depuis 2014. C'est moi qui dessine, qui scie, qui assemble, qui livre. Et c'est moi qui réponds quand vous appelez.",
      image: {
        _type: 'figure',
        image: { _imagePath: '/images/hero.jpg' },
        alt: "Atelier d'ébénisterie, plan de travail avec planche de frêne, rabots et ciseaux à bois.",
        label: 'Atelier à Chambly',
        caption: 'Atelier, 2:1',
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
        eyebrow: 'Reconnaissances',
        heading: 'Des standards que je signe de mon nom.',
        items: [
          { _type: 'logoItem', _key: 'logo-guilde', label: 'Guilde des artisans ébénistes du Québec' },
          { _type: 'logoItem', _key: 'logo-fsc', label: 'Bois certifié FSC' },
          { _type: 'logoItem', _key: 'logo-fournisseurs', label: 'Fournisseurs de la Montérégie' },
          { _type: 'logoItem', _key: 'logo-finitions', label: 'Finitions à l\'huile sans COV' },
          { _type: 'logoItem', _key: 'logo-garantie', label: 'Garantie à vie sur la structure' }
        ]
      },
      {
        _type: 'testimonials',
        _key: 'about-testimonials',
        eyebrow: 'Témoignages',
        heading: 'La confiance de mes clients',
        mode: 'featured'
      },
      {
        _type: 'ctaBand',
        _key: 'about-cta',
        title: 'On se rencontre?',
        subtitle: "À l'atelier ou chez vous, la première rencontre est gratuite.",
        primaryCta: internal('Démarrer un projet', 'contactPage-fr')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'À propos',
      description: 'Un ébéniste solo à Chambly depuis 2014. Du dessin à la livraison, bois locaux et joinage traditionnel.'
    }
  },

  // ── Page Blogue (blogPage) ─────────────────────────────────────────────────
  {
    _id: 'blogPage-fr',
    _type: 'blogPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'Le blogue',
      lead: "Le bois, les techniques, les coulisses des projets. Ce que j'aurais aimé qu'on m'explique avant de commander une pièce sur mesure."
    }],
    listCta: {
      _type: 'ctaBand',
      title: 'Un projet inspiré par ces lectures?',
      subtitle: 'Parlons-en. La première rencontre est gratuite et sans engagement.',
      primaryCta: internal('Démarrer un projet', 'contactPage-fr')
    },
    categoryCta: {
      _type: 'ctaBand',
      title: 'Un projet en tête?',
      subtitle: 'La première rencontre est gratuite et sans engagement.',
      primaryCta: internal('Démarrer un projet', 'contactPage-fr')
    },
    articleCta: {
      _type: 'ctaBand',
      title: "Envie d'une pièce sur mesure?",
      subtitle: 'Décrivez-moi votre projet. La première rencontre est gratuite et sans engagement.',
      primaryCta: internal('Démarrer un projet', 'contactPage-fr')
    },
    related: { heading: 'À lire ensuite' },
    pageBuilder: [],
    seo: {
      _type: 'seo',
      title: 'Blogue',
      description: "Le blogue d'Atelier Cormier: le bois, les techniques et les coulisses des projets de l'atelier."
    }
  },

  // ── Page FAQ (faqPage) ─────────────────────────────────────────────────────
  {
    _id: 'faqPage-fr',
    _type: 'faqPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: "Les questions qu'on me pose",
      lead: 'Délais, prix, matériaux, garantie, entretien. Les réponses honnêtes, avant même qu\'on se parle.'
    }],
    // 8 sections en mode manuel, une par thème dans l'ordre de première
    // apparition V1; Prix et paiement porte prix puis acompte (spec 6.7):
    // reproduit la page V1 à l'identique.
    sections: [
      {
        _type: 'faqSection',
        _key: 'section-delais',
        theme: { _type: 'reference', _ref: 'faqTheme-delais-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-delai', _type: 'reference', _ref: 'faqItem-delai-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-zone-desservie',
        theme: { _type: 'reference', _ref: 'faqTheme-zone-desservie-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-zone', _type: 'reference', _ref: 'faqItem-zone-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-estimation-et-devis',
        theme: { _type: 'reference', _ref: 'faqTheme-estimation-et-devis-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-estimation', _type: 'reference', _ref: 'faqItem-estimation-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-materiaux',
        theme: { _type: 'reference', _ref: 'faqTheme-materiaux-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-essences', _type: 'reference', _ref: 'faqItem-essences-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-garantie',
        theme: { _type: 'reference', _ref: 'faqTheme-garantie-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-garantie', _type: 'reference', _ref: 'faqItem-garantie-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-prix-et-paiement',
        theme: { _type: 'reference', _ref: 'faqTheme-prix-et-paiement-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-prix', _type: 'reference', _ref: 'faqItem-prix-fr' },
          { _key: 'q-acompte', _type: 'reference', _ref: 'faqItem-acompte-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-entretien',
        theme: { _type: 'reference', _ref: 'faqTheme-entretien-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-entretien', _type: 'reference', _ref: 'faqItem-entretien-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-processus',
        theme: { _type: 'reference', _ref: 'faqTheme-processus-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-modifications', _type: 'reference', _ref: 'faqItem-modifications-fr' }
        ]
      }
    ],
    pageBuilder: [
      {
        _type: 'ctaBand',
        _key: 'faq-cta',
        title: 'Vous ne trouvez pas votre réponse?',
        subtitle: 'Écrivez-moi, je réponds en personne. La première rencontre est gratuite et sans engagement.',
        primaryCta: internal('Me contacter', 'contactPage-fr')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Foire aux questions',
      description: "Matériaux, délais, prix, entretien, garantie et processus: les réponses honnêtes aux questions fréquentes, avant même qu'on se parle."
    }
  },

  // ── Contact (contactPage) ──────────────────────────────────────────────────
  {
    _id: 'contactPage-fr',
    _type: 'contactPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'Démarrons votre projet',
      lead: "Une idée, un croquis sur une serviette de table ou juste une envie: écrivez-moi. La première rencontre est gratuite et sans engagement."
    }],
    pageBuilder: [
      contactBlock('contact-page')
    ],
    seo: {
      _type: 'seo',
      title: 'Contact',
      description: "Démarrer un projet d'ébénisterie sur mesure à Chambly. Écrivez-moi ou appelez l'atelier. Première rencontre gratuite et sans engagement."
    }
  },

  // ── One-Pager, palier 1 (onePager) ─────────────────────────────────────────
  {
    _id: 'onePager-fr',
    _type: 'onePager',
    language: 'fr',
    hero: [{ _type: 'heroHome', _key: 'hero',
      title: 'Du bois massif local, façonné à la main, pour durer cent ans.',
      lead: 'Cuisines, mobilier et restauration, dans un atelier indépendant en Montérégie depuis 2014.',
      primaryCta: anchor('Démarrer un projet', 'contact'),
      secondaryCta: anchor('Voir les services', 'services'),
      meta: [
        { _type: 'heroMetaItem', _key: 'meta-etabli', label: 'Établi', value: '2014' },
        { _type: 'heroMetaItem', _key: 'meta-projets', label: 'Projets livrés', value: '140+' },
        { _type: 'heroMetaItem', _key: 'meta-rayon', label: 'Rayon', value: '200 km' }
      ],
      visual: heroFigure('4/5', 'Photo atelier, 4:5'),
      visualMobile: heroFigure('4/3', 'Photo atelier, 4:3')
    }],
    pageBuilder: [
      aboutBlock('one-pager-about'),
      {
        _type: 'services',
        _key: 'one-pager-services',
        eyebrow: 'Services',
        heading: 'Quatre choses, faites correctement.',
        lead: "Je ne fais pas tout. Voilà ce que je fais : chaque ligne représente un projet que j'ai livré au moins vingt fois.",
        cta: anchor('Demander un devis', 'contact'),
        mode: 'auto',
        limit: 4,
      },
      {
        _type: 'testimonials',
        _key: 'one-pager-testimonials',
        eyebrow: 'Témoignages',
        heading: "Trois clients, trois projets, une seule règle : livrer ce qu'on a promis.",
        mode: 'featured'
      },
      {
        _type: 'faq',
        _key: 'one-pager-faq',
        eyebrow: 'FAQ',
        heading: "Les questions qu'on me pose le plus souvent.",
        items: [
          { _key: 'faq-delai', _type: 'reference', _ref: 'faqItem-delai-fr' },
          { _key: 'faq-zone', _type: 'reference', _ref: 'faqItem-zone-fr' },
          { _key: 'faq-estimation', _type: 'reference', _ref: 'faqItem-estimation-fr' },
          { _key: 'faq-essences', _type: 'reference', _ref: 'faqItem-essences-fr' },
          { _key: 'faq-garantie', _type: 'reference', _ref: 'faqItem-garantie-fr' }
        ]
      },
      contactBlock('one-pager-contact')
    ],
    seo: {
      _type: 'seo',
      title: 'Atelier Cormier | Ébénisterie sur mesure à Chambly',
      description: 'Ébénisterie sur mesure à Chambly, Québec. Établi en 2014.'
    }
  }
]
