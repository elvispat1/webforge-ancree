// Seed FR: globales (siteSettings) et pages (accueil, services, interventions,
// à propos, blogue, FAQ, contact, one-pager).
//
// Transcription fidèle de la copie Rempart Extermination (bible de contenu,
// docs/CONTENU-DEMO-REMPART.md, sections 1 et 5). La composition des pageBuilder
// reproduit le gabarit de la famille Minimaliste via les modes des blocs
// intelligents; le bloc faq est en sélection manuelle pure, sans mode ni limit,
// et la page FAQ se compose en sections par thème dans faqPage.sections. La copie
// des pages de détail vit sur chaque service et projet (collections), plus dans
// servicesPage ni projectsPage. Ids déterministes (bible, section 4).
// Politique d'images (bible, section 3): les figures portent alt, label, caption,
// ratio mais PAS de champ image; brand.logo est OMIS (repli wordmark texte).
// Les jetons {year} (copyright) et {email} (bandeau d'échec du formulaire)
// restent tels quels: remplacés à la résolution.

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

/** Lien externe (ex: appel téléphonique). Le champ du schéma `link` est
 *  `externalUrl` (validé scheme http/https/mailto/tel), pas `href`. */
const external = (label, url) => ({
  _type: 'link',
  label,
  type: 'external',
  externalUrl: url
})

/** Figure du héros d'accueil (même cadrage, deux ratios). */
const heroFigure = (ratio, caption) => ({
  _type: 'figure',
  image: { _imagePath: '/images/hero.jpg' },
  alt: 'Technicien de Rempart Extermination, planchette à la main, devant le camion de service dans une entrée résidentielle de la Rive-Sud de Québec.',
  label: 'Notre équipe, sur le terrain',
  caption,
  ratio
})

// ── Blocs partagés entre pages (copie identique, _key propre à chaque page) ──

/** Bloc highlights (accueil + à propos): quatre engagements concrets. */
const highlightsBlock = (key) => ({
  _type: 'highlights',
  _key: key,
  heading: 'Ce que vous obtenez en nous appelant.',
  lead: "Pas de promesse vague. Quatre engagements clairs qu'on tient sur chaque intervention, à la maison comme au commerce.",
  items: [
    {
      _type: 'highlightItem',
      _key: 'item-permis',
      icon: 'lucide:shield-check',
      title: 'Licencié et assuré',
      body: "Certification provinciale en application de pesticides (MELCCFP) et assurance complète. Vous savez exactement qui entre chez vous."
    },
    {
      _type: 'highlightItem',
      _key: 'item-garantie',
      icon: 'lucide:badge-check',
      title: 'Garantie de résultat',
      body: "Si le problème revient pendant la période couverte, on revient sans frais. On règle la situation pour de bon, pas juste pour aujourd'hui."
    },
    {
      _type: 'highlightItem',
      _key: 'item-securite',
      icon: 'lucide:heart-handshake',
      title: 'Sûr pour la famille',
      body: "Produits homologués par Santé Canada, appliqués par des techniciens formés et certifiés. On vous explique quoi faire avant et après chaque traitement."
    },
    {
      _type: 'highlightItem',
      _key: 'item-urgence',
      icon: 'lucide:clock',
      title: "Service d'urgence 24/7",
      body: 'Un nid de guêpes au-dessus de la porte un dimanche soir? On répond. Les soirs et les fins de semaine, on reste joignables pour les urgences.'
    }
  ]
})

/** Bloc stats (accueil + à propos): repères de confiance. */
const statsBlock = (key) => ({
  _type: 'stats',
  _key: key,
  heading: 'Quinze ans à protéger la Rive-Sud, en quelques chiffres.',
  items: [
    { _type: 'statItem', _key: 'stat-fonde', value: '2011', label: 'Au service de la région de Québec' },
    { _type: 'statItem', _key: 'stat-experience', value: '15 ans', label: "D'expérience sur le terrain" },
    { _type: 'statItem', _key: 'stat-google', value: '4,9', label: 'Note Google sur 312 avis' },
    { _type: 'statItem', _key: 'stat-urgence', value: '24/7', label: "Service d'urgence, soirs et fins de semaine" }
  ]
})

/** Étapes du processus (sans le n: dérivé de la position). */
const processSteps = () => ([
  {
    _type: 'processStep',
    _key: 'step-1',
    title: "L'inspection",
    body: "On identifie le nuisible, on trouve par où il entre et on évalue l'ampleur du problème. Vous recevez un diagnostic clair, sans jargon, avant qu'on traite quoi que ce soit."
  },
  {
    _type: 'processStep',
    _key: 'step-2',
    title: 'Le traitement',
    body: "On applique la bonne méthode pour votre situation: appâts ciblés, traitement localisé ou traitement thermique. Toujours avec des produits homologués et un plan adapté à votre bâtiment."
  },
  {
    _type: 'processStep',
    _key: 'step-3',
    title: 'La prévention',
    body: "On scelle les points d'entrée et on vous donne les bons réflexes pour que le problème ne revienne pas. La moitié du travail, c'est d'empêcher la prochaine visite."
  },
  {
    _type: 'processStep',
    _key: 'step-4',
    title: 'La garantie',
    body: "On fait un suivi et on reste disponibles. Si le nuisible revient pendant la période couverte, on revient sans frais. C'est ça, régler le problème pour de bon."
  }
])

/** Bloc/objet process complet. _key omis hors pageBuilder. */
const processContent = (key) => ({
  _type: 'process',
  ...(key ? { _key: key } : {}),
  eyebrow: 'Le déroulement',
  heading: 'Comment se déroule une intervention',
  lead: "Du premier appel au suivi, une méthode éprouvée et un seul objectif: que le nuisible parte et ne revienne pas.",
  cta: external('418 555 0147', 'tel:+14185550147'),
  steps: processSteps()
})

/** Bloc about (à propos + one-pager). */
const aboutBlock = (key) => ({
  _type: 'about',
  _key: key,
  eyebrow: 'À propos',
  heading: 'Une équipe locale qui répond, et qui revient si besoin.',
  body: [
    "Rempart Extermination, c'est Mathieu Bouchard et son équipe de six techniciens, basés à Lévis depuis 2011. Mathieu a démarré seul, un camion et sa certification en poche. Quinze ans plus tard, on dessert toute la Rive-Sud de Québec et la Chaudière-Appalaches, mais l'approche n'a pas changé: vous parlez à du vrai monde de la région, pas à un centre d'appels.",
    "Karine, David, Jean-Philippe, Stéphanie et Olivier complètent l'équipe. Tous certifiés, tous formés à expliquer clairement ce qu'ils font et pourquoi. Notre métier, ce n'est pas juste de chasser des insectes: c'est de vous redonner la tranquillité d'esprit chez vous."
  ],
  photo: {
    _type: 'figure',
    image: { _imagePath: '/images/hero.jpg' },
    alt: "Mathieu Bouchard, fondateur de Rempart Extermination, devant le camion de service à Lévis.",
    label: 'Mathieu Bouchard, fondateur',
    caption: 'Portrait, 3:4',
    ratio: '3/4'
  },
  figcaption: 'Mathieu Bouchard, fondateur et technicien certifié. Rempart Extermination, Lévis.',
  diffs: [
    {
      _type: 'aboutDiff',
      _key: 'diff-local',
      title: 'Locaux.',
      body: "Basés à Lévis, on connaît les bâtiments et les nuisibles de la région. On se déplace vite sur toute la Rive-Sud."
    },
    {
      _type: 'aboutDiff',
      _key: 'diff-certifie',
      title: 'Certifiés.',
      body: "Licenciés MELCCFP et assurés. Chaque technicien est formé à l'application sécuritaire des produits."
    },
    {
      _type: 'aboutDiff',
      _key: 'diff-garantie',
      title: 'Garantie de résultat.',
      body: "On ne disparaît pas après le traitement. Si le problème revient pendant la période couverte, on revient sans frais."
    }
  ]
})

/** Bloc contact complet (page Contact + one-pager). Les valeurs des coordonnées
 *  vivent dans siteSettings (join à la résolution); seuls les libellés et la
 *  copie du formulaire sont stockés ici. */
const contactBlock = (key) => ({
  _type: 'contact',
  _key: key,
  eyebrow: 'Contact',
  heading: 'Parlez-nous de votre problème.',
  lead: "Décrivez-nous ce que vous voyez ou entendez, et où. On vous revient rapidement avec un plan d'action. Pour une urgence, le téléphone reste le plus rapide.",
  metaLabels: {
    phone: 'Téléphone',
    email: 'Courriel',
    address: 'Adresse',
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
      body: 'Vérifiez votre connexion et réessayez, ou écrivez-nous directement à {email}.'
    },
    privacy: {
      text: "J'accepte que mes informations soient traitées selon la",
      link: internal('politique de confidentialité', 'legalPage-confidentialite-fr')
    }
  },
  success: {
    title: 'Message reçu.',
    body: 'Merci. On vous revient dans les plus brefs délais. Pour une urgence, appelez-nous au 418 555 0147.'
  }
})

// ── Blocs de conversion propres à la famille Ancrée ──────────────────────────

/** Chips de réassurance (même jour, 24/7, estimation gratuite, prix ferme). */
const reassuranceBlock = (key) => ({
  _type: 'reassurance',
  _key: key,
  items: [
    { _type: 'reassuranceItem', _key: 'r-jour', icon: 'lucide:calendar-check', label: 'Intervention le jour même' },
    { _type: 'reassuranceItem', _key: 'r-urgence', icon: 'lucide:clock', label: 'Urgence 24/7' },
    { _type: 'reassuranceItem', _key: 'r-estimation', icon: 'lucide:badge-check', label: 'Estimation gratuite' },
    { _type: 'reassuranceItem', _key: 'r-prix', icon: 'lucide:coins', label: "Prix ferme à l'avance" }
  ]
})

/** Bloc zone de service (Rive-Sud de Québec). */
const serviceAreaBlock = (key) => ({
  _type: 'serviceArea',
  _key: key,
  eyebrow: 'Zone desservie',
  heading: 'On dessert toute la Rive-Sud de Québec',
  lead: "Basés à Lévis, on se déplace vite. Du même jour au lendemain selon l'urgence et votre secteur.",
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
  note: "Vous n'êtes pas certain qu'on couvre votre secteur? Appelez-nous, on vous le dit en deux minutes."
})

/** Galerie avant/après (figures sans image: placeholders soignés). */
const beforeAfterBlock = (key) => ({
  _type: 'beforeAfter',
  _key: key,
  eyebrow: 'Avant / après',
  heading: "Des résultats qu'on montre, pas juste qu'on promet",
  lead: 'Quelques interventions récentes, du problème réglé à la prévention qui tient.',
  items: [
    {
      _type: 'beforeAfterItem',
      _key: 'ba-restaurant',
      before: { _type: 'figure', alt: 'Cuisine de restaurant avant le traitement contre les coquerelles.', label: 'Avant le traitement', caption: 'Restaurant du Vieux-Lévis', ratio: '4/3' },
      after: { _type: 'figure', alt: 'Même cuisine de restaurant, propre et scellée, après traitement.', label: 'Après le traitement', caption: 'Restaurant du Vieux-Lévis', ratio: '4/3' },
      caption: 'Restaurant du Vieux-Lévis: coquerelles éradiquées, points d\'entrée scellés, suivi mensuel.'
    },
    {
      _type: 'beforeAfterItem',
      _key: 'ba-duplex',
      before: { _type: 'figure', alt: 'Chambre de duplex avant le traitement thermique contre les punaises de lit.', label: 'Avant le traitement', caption: 'Duplex à Charny', ratio: '4/3' },
      after: { _type: 'figure', alt: 'Même chambre après traitement thermique, prête à réoccuper.', label: 'Après le traitement', caption: 'Duplex à Charny', ratio: '4/3' },
      caption: 'Duplex à Charny: punaises de lit éliminées en une visite de traitement thermique.'
    },
    {
      _type: 'beforeAfterItem',
      _key: 'ba-fourmis',
      before: { _type: 'figure', alt: 'Solive de sous-sol grugée par les fourmis charpentières.', label: 'Avant le traitement', caption: 'Maison à Saint-Nicolas', ratio: '4/3' },
      after: { _type: 'figure', alt: 'Structure traitée et protégée, fourmis charpentières arrêtées.', label: 'Après le traitement', caption: 'Maison à Saint-Nicolas', ratio: '4/3' },
      caption: 'Maison à Saint-Nicolas: colonie de fourmis charpentières arrêtée avant les dégâts.'
    }
  ]
})

/** Formulaire de soumission à 3 champs (simulé côté client, comme le contact). */
const quoteFormBlock = (key) => ({
  _type: 'quoteForm',
  _key: key,
  eyebrow: 'Soumission gratuite',
  heading: 'Obtenez votre soumission gratuite',
  lead: "Trois infos, on vous rappelle aujourd'hui même. Pour une urgence, appelez directement.",
  nameLabel: 'Votre nom',
  phoneLabel: 'Téléphone',
  serviceLabel: 'Type de problème',
  serviceOptions: [
    { _type: 'quoteServiceOption', _key: 'opt-souris', label: 'Souris ou rats' },
    { _type: 'quoteServiceOption', _key: 'opt-fourmis', label: 'Fourmis' },
    { _type: 'quoteServiceOption', _key: 'opt-guepes', label: 'Guêpes ou frelons' },
    { _type: 'quoteServiceOption', _key: 'opt-punaises', label: 'Punaises de lit' },
    { _type: 'quoteServiceOption', _key: 'opt-coquerelles', label: 'Coquerelles' },
    { _type: 'quoteServiceOption', _key: 'opt-autre', label: 'Autre nuisible' }
  ],
  submitLabel: 'Demander ma soumission',
  successTitle: 'Demande reçue.',
  successBody: "Merci. On vous rappelle aujourd'hui même. Pour une urgence, appelez le 418 555 0147.",
  privacyNote: "En envoyant, vous acceptez d'être contacté au sujet de votre demande."
})

// ── Documents ────────────────────────────────────────────────────────────────

export const docs = [
  // ── Globales (siteSettings) ────────────────────────────────────────────────
  {
    _id: 'siteSettings-fr',
    _type: 'siteSettings',
    language: 'fr',
    brand: {
      name: 'Rempart Extermination',
      homeAriaLabel: "Rempart Extermination, retour à l'accueil",
      tagline: 'Gestion parasitaire pour la maison et le commerce. On reprend le contrôle, pour de bon.',
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
        'Québec',
        'Saint-Romuald',
        'Saint-Nicolas',
        'Charny',
        'Chaudière-Appalaches',
        'Bellechasse',
        'Lotbinière',
        'Beauce',
        'Portneuf',
        'Rive-Sud de Québec'
      ],
      hours: {
        weekdays: 'Lun au Ven, 7h à 19h',
        weekend: 'Sam et Dim, urgences 24/7'
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
        cta: anchor('Soumission gratuite', 'contact')
      },
      multipage: {
        primary: [
          { _key: 'nav-services', ...internal('Services', 'servicesPage-fr') },
          { _key: 'nav-projets', ...internal('Interventions', 'projectsPage-fr') },
          { _key: 'nav-a-propos', ...internal('À propos', 'aboutPage-fr') },
          { _key: 'nav-blogue', ...internal('Blogue', 'blogPage-fr') },
          { _key: 'nav-contact', ...internal('Contact', 'contactPage-fr') }
        ],
        cta: internal('Soumission gratuite', 'contactPage-fr')
      }
    },
    footer: {
      primary: [
        { _key: 'footer-services', ...internal('Services', 'servicesPage-fr') },
        { _key: 'footer-projets', ...internal('Interventions', 'projectsPage-fr') },
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
      copyright: '© {year} Rempart Extermination. Tous droits réservés.',
      credit: {
        label: 'Création de',
        studio: 'Patoine Studio',
        product: 'WebForge, famille Ancrée',
        studioUrl: 'https://patoinestudio.ca'
      }
    },
    seo: {
      titleSuffix: 'Rempart Extermination',
      defaultDescription: "Gestion parasitaire et extermination à Lévis et dans la région de Québec. Fourmis, souris, guêpes, punaises de lit, coquerelles. Licencié, assuré, garantie de résultat. Service d'urgence 24/7."
    }
  },

  // ── Accueil (homePage) ─────────────────────────────────────────────────────
  {
    _id: 'homePage-fr',
    _type: 'homePage',
    language: 'fr',
    hero: [{ _type: 'heroHome', _key: 'hero',
      title: 'On reprend le contrôle de chez vous. Pour de bon.',
      lead: 'Fourmis, souris, guêpes, punaises de lit, coquerelles: gestion parasitaire pour la maison et le commerce à Lévis et dans la région de Québec. Urgences 24/7.',
      primaryCta: external('418 555 0147', 'tel:+14185550147'),
      secondaryCta: internal('Soumission gratuite', 'contactPage-fr'),
      meta: [
        { _type: 'heroMetaItem', _key: 'meta-google', icon: 'lucide:star', label: 'Google', value: '4,9' },
        { _type: 'heroMetaItem', _key: 'meta-permis', icon: 'lucide:shield-check', label: 'Permis', value: 'Licencié et assuré' },
        { _type: 'heroMetaItem', _key: 'meta-depuis', icon: 'lucide:award', label: 'Depuis', value: '2011' }
      ],
      visual: heroFigure('4/5', 'Intervention, 4:5'),
      visualMobile: heroFigure('4/3', 'Intervention, 4:3')
    }],
    pageBuilder: [
      reassuranceBlock('home-reassurance'),
      highlightsBlock('home-highlights'),
      {
        _type: 'projectsPreview',
        _key: 'home-projects',
        heading: "Des interventions qui parlent d'elles-mêmes",
        lead: "Quelques situations qu'on a réglées récemment, de la première visite au résultat final.",
        cta: internal('Toutes les interventions', 'projectsPage-fr'),
        mode: 'featured',
        limit: 3
      },
      {
        _type: 'services',
        _key: 'home-services',
        eyebrow: 'Services',
        heading: 'Ce qu\'on règle pour vous',
        lead: 'Cinq nuisibles qu\'on traite tous les jours, à la maison comme au commerce.',
        cta: internal('Soumission gratuite', 'contactPage-fr'),
        mode: 'auto',
      },
      beforeAfterBlock('home-before-after'),
      statsBlock('home-stats'),
      serviceAreaBlock('home-service-area'),
      {
        _type: 'mediaText',
        _key: 'home-story',
        heading: 'Une équipe locale qui répond, et qui revient si besoin',
        body: [
          "On est basés à Lévis depuis 2011. Quand vous appelez, c'est du vrai monde de la région qui répond, pas un centre d'appels. On connaît les bâtiments et les nuisibles d'ici.",
          "Notre objectif n'est pas juste de traiter une fois: c'est de régler la situation pour de bon. On scelle les points d'entrée, on vous explique quoi surveiller, et on garantit notre travail."
        ],
        mediaSide: 'right',
        image: {
          _type: 'figure',
          image: { _imagePath: '/images/inspection.jpg' },
          alt: "Technicien de Rempart Extermination inspectant le pourtour d'une maison sur la Rive-Sud.",
          label: 'Inspection à domicile',
          caption: 'Sur le terrain, 4:3',
          ratio: '4/3'
        },
        cta: internal("À propos de l'équipe", 'aboutPage-fr')
      },
      {
        _type: 'testimonials',
        _key: 'home-testimonials',
        eyebrow: 'Témoignages',
        heading: 'Ce que nos clients en disent',
        mode: 'featured'
      },
      quoteFormBlock('home-quote'),
      {
        _type: 'blogPreview',
        _key: 'home-blog',
        heading: 'Le blogue',
        lead: 'Prévention, identification des nuisibles et conseils pour une maison saine.',
        cta: internal('Tout le blogue', 'blogPage-fr'),
        limit: 3
      },
      {
        _type: 'ctaBand',
        _key: 'home-cta',
        title: 'Un nuisible chez vous?',
        subtitle: "L'estimation est gratuite. Appelez-nous, on vous dit quoi faire.",
        primaryCta: external('418 555 0147', 'tel:+14185550147')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Rempart Extermination | Extermination à Lévis et dans la région de Québec',
      description: "Gestion parasitaire et extermination à Lévis et dans la région de Québec. Fourmis, souris, guêpes, punaises de lit, coquerelles. Licencié, assuré, garantie de résultat. Service d'urgence 24/7."
    }
  },

  // ── Page Services (servicesPage) ───────────────────────────────────────────
  {
    _id: 'servicesPage-fr',
    _type: 'servicesPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: "Ce qu'on règle, et comment on le règle",
      lead: "Cinq nuisibles qu'on traite tous les jours sur la Rive-Sud. Si votre situation n'est pas dans la liste, appelez-nous quand même: on vous oriente vers la bonne solution, franchement.",
      image: {
        _type: 'figure',
        alt: "Technicien appliquant un traitement ciblé le long d'une fondation de maison.",
        label: 'Rempart Extermination, traitement ciblé',
        caption: 'Intervention, 2:1',
        ratio: '2/1'
      }
    }],
    pageBuilder: [
      reassuranceBlock('services-reassurance'),
      {
        _type: 'services',
        _key: 'services-grid',
        eyebrow: 'Services',
        heading: 'Cinq nuisibles, une méthode éprouvée',
        lead: "Chaque carte mène au détail du traitement. Votre situation n'y est pas? Appelez-nous, on a probablement déjà vu votre cas.",
        cta: internal('Soumission gratuite', 'contactPage-fr'),
        mode: 'auto',
      },
      processContent('services-process'),
      serviceAreaBlock('services-area'),
      {
        _type: 'testimonials',
        _key: 'services-testimonials',
        eyebrow: 'Témoignages',
        heading: 'Des clients tranquilles, intervention après intervention',
        mode: 'featured'
      },
      {
        _type: 'faq',
        _key: 'services-faq',
        eyebrow: 'FAQ',
        heading: 'Questions fréquentes sur nos services',
        items: [
          { _key: 'faq-delai', _type: 'reference', _ref: 'faqItem-delai-fr' },
          { _key: 'faq-soumission', _type: 'reference', _ref: 'faqItem-soumission-fr' },
          { _key: 'faq-produits', _type: 'reference', _ref: 'faqItem-produits-fr' },
          { _key: 'faq-garantie', _type: 'reference', _ref: 'faqItem-garantie-fr' }
        ]
      },
      {
        _type: 'ctaBand',
        _key: 'services-cta',
        title: 'Prêt à régler la situation?',
        subtitle: 'Décrivez-nous ce que vous voyez. On vous répond avec un plan clair.',
        primaryCta: external('418 555 0147', 'tel:+14185550147')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Services',
      description: 'Extermination de fourmis, souris et rats, guêpes et frelons, punaises de lit et coquerelles à Lévis et dans la région de Québec. Licencié, assuré, garantie de résultat.'
    }
  },

  // ── Page Interventions (projectsPage) ──────────────────────────────────────
  {
    _id: 'projectsPage-fr',
    _type: 'projectsPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'Des vraies situations, réglées pour de bon',
      lead: "Chaque intervention répond à un problème concret, dans une vraie maison ou un vrai commerce de la région. Voici quelques-unes des plus parlantes.",
      image: {
        _type: 'figure',
        alt: "Cuisine de restaurant assainie après une intervention contre les coquerelles.",
        label: 'Restaurant du Vieux-Lévis, intervention',
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
        title: 'Votre situation sera la prochaine réglée',
        subtitle: "Racontez-nous ce qui se passe chez vous. On vous dit franchement quoi faire.",
        primaryCta: external('418 555 0147', 'tel:+14185550147')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Interventions',
      description: 'Études de cas en gestion parasitaire: coquerelles, punaises de lit, rongeurs, fourmis charpentières et guêpes, réglées sur la Rive-Sud de Québec.'
    }
  },

  // ── À propos (aboutPage) ───────────────────────────────────────────────────
  {
    _id: 'aboutPage-fr',
    _type: 'aboutPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'Une équipe locale, certifiée, qui répond',
      lead: "Rempart Extermination protège les maisons et les commerces de la Rive-Sud depuis 2011. Mathieu Bouchard et son équipe de six techniciens connaissent la région, et restent disponibles bien après le traitement.",
      image: {
        _type: 'figure',
        image: { _imagePath: '/images/equipe.jpg' },
        alt: "L'équipe de Rempart Extermination devant le camion de service à Lévis.",
        label: 'Équipe Rempart Extermination, Lévis',
        caption: 'Équipe, 2:1',
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
        heading: "Des standards qu'on assume, par écrit.",
        items: [
          { _type: 'logoItem', _key: 'logo-acgp', label: 'Membre ACGP' },
          { _type: 'logoItem', _key: 'logo-melccfp', label: 'Licencié MELCCFP' },
          { _type: 'logoItem', _key: 'logo-assure', label: 'Assuré' },
          { _type: 'logoItem', _key: 'logo-garantie', label: 'Garantie de résultat' },
          { _type: 'logoItem', _key: 'logo-sante-canada', label: 'Produits homologués Santé Canada' }
        ]
      },
      {
        _type: 'testimonials',
        _key: 'about-testimonials',
        eyebrow: 'Témoignages',
        heading: 'La confiance de nos clients',
        mode: 'featured'
      },
      {
        _type: 'ctaBand',
        _key: 'about-cta',
        title: "On s'occupe de votre problème?",
        subtitle: "L'estimation est gratuite, à la maison comme au commerce.",
        primaryCta: external('418 555 0147', 'tel:+14185550147')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'À propos',
      description: "Une équipe d'extermination locale à Lévis depuis 2011. Licenciée MELCCFP, assurée et engagée par une garantie de résultat sur la Rive-Sud de Québec."
    }
  },

  // ── Page Blogue (blogPage) ─────────────────────────────────────────────────
  {
    _id: 'blogPage-fr',
    _type: 'blogPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: 'Le blogue',
      lead: "Prévention, identification des nuisibles, maison saine. Les conseils concrets qu'on donne tous les jours à nos clients, avant même qu'un problème s'installe."
    }],
    listCta: {
      _type: 'ctaBand',
      title: 'Une situation qui ne peut pas attendre?',
      subtitle: "Appelez-nous. L'estimation est gratuite et on répond aux urgences 24/7.",
      primaryCta: external('418 555 0147', 'tel:+14185550147')
    },
    categoryCta: {
      _type: 'ctaBand',
      title: 'Un nuisible chez vous?',
      subtitle: "L'estimation est gratuite. Appelez-nous, on vous dit quoi faire.",
      primaryCta: external('418 555 0147', 'tel:+14185550147')
    },
    articleCta: {
      _type: 'ctaBand',
      title: "Besoin d'une intervention?",
      subtitle: "Décrivez-nous votre situation. L'estimation est gratuite et sans engagement.",
      primaryCta: internal('Soumission gratuite', 'contactPage-fr')
    },
    related: { heading: 'À lire ensuite' },
    pageBuilder: [],
    seo: {
      _type: 'seo',
      title: 'Blogue',
      description: 'Le blogue de Rempart Extermination: prévention, identification des nuisibles et conseils pour garder une maison saine sur la Rive-Sud de Québec.'
    }
  },

  // ── Page FAQ (faqPage) ─────────────────────────────────────────────────────
  {
    _id: 'faqPage-fr',
    _type: 'faqPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: "Les questions qu'on nous pose",
      lead: "Délais, zone, estimation, sécurité, garantie, prix, suivi et déroulement. Les réponses honnêtes, avant même qu'on se parle."
    }],
    // 8 sections en mode manuel, une par thème; Prix et paiement porte prix
    // puis acompte. Reproduit la composition du gabarit à l'identique.
    sections: [
      {
        _type: 'faqSection',
        _key: 'section-urgence',
        theme: { _type: 'reference', _ref: 'faqTheme-urgence-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-delai', _type: 'reference', _ref: 'faqItem-delai-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-zone',
        theme: { _type: 'reference', _ref: 'faqTheme-zone-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-zone', _type: 'reference', _ref: 'faqItem-zone-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-soumission',
        theme: { _type: 'reference', _ref: 'faqTheme-soumission-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-soumission', _type: 'reference', _ref: 'faqItem-soumission-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-securite',
        theme: { _type: 'reference', _ref: 'faqTheme-securite-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-produits', _type: 'reference', _ref: 'faqItem-produits-fr' }
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
        _key: 'section-prix',
        theme: { _type: 'reference', _ref: 'faqTheme-prix-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-prix', _type: 'reference', _ref: 'faqItem-prix-fr' },
          { _key: 'q-acompte', _type: 'reference', _ref: 'faqItem-acompte-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-suivi',
        theme: { _type: 'reference', _ref: 'faqTheme-suivi-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-suivi', _type: 'reference', _ref: 'faqItem-suivi-fr' }
        ]
      },
      {
        _type: 'faqSection',
        _key: 'section-processus',
        theme: { _type: 'reference', _ref: 'faqTheme-processus-fr' },
        mode: 'manual',
        items: [
          { _key: 'q-processus', _type: 'reference', _ref: 'faqItem-processus-fr' }
        ]
      }
    ],
    pageBuilder: [
      {
        _type: 'ctaBand',
        _key: 'faq-cta',
        title: 'Vous ne trouvez pas votre réponse?',
        subtitle: "Appelez-nous, on répond en personne. L'estimation est gratuite et sans engagement.",
        primaryCta: external('418 555 0147', 'tel:+14185550147')
      }
    ],
    seo: {
      _type: 'seo',
      title: 'Foire aux questions',
      description: "Délais, zone desservie, estimation, sécurité des produits, garantie, prix et suivi: les réponses honnêtes aux questions fréquentes, avant même qu'on se parle."
    }
  },

  // ── Contact (contactPage) ──────────────────────────────────────────────────
  {
    _id: 'contactPage-fr',
    _type: 'contactPage',
    language: 'fr',
    hero: [{ _type: 'pageHero', _key: 'hero',
      title: "On s'occupe de votre problème",
      lead: "Un nid, des traces, des bruits dans les murs ou juste un doute: écrivez-nous ce que vous observez. On vous revient avec un plan clair. Pour une urgence, appelez-nous, c'est plus rapide."
    }],
    pageBuilder: [
      contactBlock('contact-page')
    ],
    seo: {
      _type: 'seo',
      title: 'Contact',
      description: "Obtenir une soumission gratuite pour une intervention d'extermination à Lévis et dans la région de Québec. Écrivez-nous ou appelez-nous. Urgences 24/7."
    }
  },

  // ── One-Pager, palier 1 (onePager) ─────────────────────────────────────────
  {
    _id: 'onePager-fr',
    _type: 'onePager',
    language: 'fr',
    hero: [{ _type: 'heroHome', _key: 'hero',
      title: 'On reprend le contrôle de chez vous. Pour de bon.',
      lead: 'Fourmis, souris, guêpes, punaises de lit, coquerelles: gestion parasitaire pour la maison et le commerce à Lévis et dans la région de Québec. Urgences 24/7.',
      primaryCta: external('418 555 0147', 'tel:+14185550147'),
      secondaryCta: anchor('Soumission gratuite', 'contact'),
      meta: [
        { _type: 'heroMetaItem', _key: 'meta-google', icon: 'lucide:star', label: 'Google', value: '4,9' },
        { _type: 'heroMetaItem', _key: 'meta-permis', icon: 'lucide:shield-check', label: 'Permis', value: 'Licencié et assuré' },
        { _type: 'heroMetaItem', _key: 'meta-depuis', icon: 'lucide:award', label: 'Depuis', value: '2011' }
      ],
      visual: heroFigure('4/5', 'Intervention, 4:5'),
      visualMobile: heroFigure('4/3', 'Intervention, 4:3')
    }],
    pageBuilder: [
      reassuranceBlock('one-pager-reassurance'),
      aboutBlock('one-pager-about'),
      {
        _type: 'services',
        _key: 'one-pager-services',
        eyebrow: 'Services',
        heading: "Les nuisibles qu'on règle le plus souvent.",
        lead: "On ne fait pas semblant de tout faire. Voilà ce qu'on traite tous les jours, à la maison comme au commerce, sur toute la Rive-Sud.",
        cta: anchor('Soumission gratuite', 'contact'),
        mode: 'auto',
        limit: 4,
      },
      {
        _type: 'testimonials',
        _key: 'one-pager-testimonials',
        eyebrow: 'Témoignages',
        heading: 'Trois clients, trois situations, une même tranquillité retrouvée.',
        mode: 'featured'
      },
      {
        _type: 'faq',
        _key: 'one-pager-faq',
        eyebrow: 'FAQ',
        heading: "Les questions qu'on nous pose le plus souvent.",
        items: [
          { _key: 'faq-delai', _type: 'reference', _ref: 'faqItem-delai-fr' },
          { _key: 'faq-zone', _type: 'reference', _ref: 'faqItem-zone-fr' },
          { _key: 'faq-soumission', _type: 'reference', _ref: 'faqItem-soumission-fr' },
          { _key: 'faq-produits', _type: 'reference', _ref: 'faqItem-produits-fr' },
          { _key: 'faq-garantie', _type: 'reference', _ref: 'faqItem-garantie-fr' }
        ]
      },
      quoteFormBlock('one-pager-quote'),
      contactBlock('one-pager-contact')
    ],
    seo: {
      _type: 'seo',
      title: 'Rempart Extermination | Extermination à Lévis et dans la région de Québec',
      description: "Gestion parasitaire et extermination à Lévis et dans la région de Québec. Licencié, assuré, garantie de résultat. Service d'urgence 24/7."
    }
  }
]
