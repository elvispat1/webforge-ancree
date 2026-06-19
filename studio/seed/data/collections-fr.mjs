// Seed FR des collections: services (5), projets (6), catégories (3).
//
// Transposition fidèle de app/content/services.ts, projects.ts et categories.ts.
// Ids déterministes (spec §11): <type>-<cleFR>-fr. Les images sont des marqueurs
// { _imagePath } remplacés par le runner après upload des assets. Les figures de
// service reprennent la dérivation serviceImage(): ratio 4/3, alt « <titre>,
// réalisation d'Atelier Cormier. », label et caption au titre.
//
// Chaque service et chaque projet porte son objet detail (la copie de sa page
// /services/<slug> ou /projets/<slug>, ex-servicesPage.serviceDetail et
// ex-projectsPage.projectDetail, spec 6.10 et 6.11): gabarit V1 identique d'un
// document à l'autre, la personnalisation viendra du Studio.

// ── Fabriques locales (gabarits de page de détail partagés) ──────────────────

/** Lien interne vers un document (id déterministe -fr). */
const internal = (label, ref) => ({
  _type: 'link',
  label,
  type: 'internal',
  internalRef: { _type: 'reference', _ref: ref }
})

/** Page de détail d'un service (gabarit V1, ex-servicesPage.serviceDetail). */
const serviceDetail = () => ({
  benefits: {
    heading: 'Ce que vous obtenez',
    cta: internal('Demander un devis', 'contactPage-fr')
  },
  included: { heading: 'Inclus dans chaque mandat' },
  process: {
    _type: 'process',
    eyebrow: 'Le déroulement',
    heading: 'Comment se déroule un mandat',
    lead: 'Du premier appel à la pose finale, un seul interlocuteur: moi.',
    cta: internal('Me contacter', 'contactPage-fr'),
    steps: [
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
    ]
  },
  projects: {
    heading: 'Réalisations dans ce service',
    lead: 'Des pièces récentes livrées dans ce service, du croquis à la pose.',
    cta: internal('Tous les projets', 'projectsPage-fr')
  },
  testimonials: {
    eyebrow: 'Témoignages',
    heading: "Ce qu'en disent mes clients"
  },
  cta: {
    _type: 'ctaBand',
    title: 'Discutons de votre projet',
    subtitle: 'Un devis détaillé et honnête, sans engagement.',
    primaryCta: internal('Démarrer un projet', 'contactPage-fr')
  }
})

/** Page de détail d'un projet (gabarit V1, ex-projectsPage.projectDetail). */
const projectDetail = () => ({
  gallery: { heading: 'En images' },
  caseStudy: {
    eyebrow: "L'étude de cas",
    heading: 'Le défi, la solution, le résultat',
    challengeLabel: 'Le défi',
    solutionLabel: 'La solution',
    resultLabel: 'Le résultat'
  },
  testimonial: {
    eyebrow: 'Témoignages',
    heading: 'Le mot du client'
  },
  similar: {
    heading: 'Projets similaires',
    cta: internal('Tous les projets', 'projectsPage-fr')
  },
  cta: {
    _type: 'ctaBand',
    title: 'Un projet comme celui-ci?',
    subtitle: 'Chaque pièce est unique. Parlons de la vôtre.',
    primaryCta: internal('Démarrer un projet', 'contactPage-fr')
  }
})

export const docs = [
  // ── Catégories de blogue ──────────────────────────────────────────────────
  {
    _id: 'category-le-bois-fr',
    _type: 'category',
    language: 'fr',
    title: 'Le bois',
    slug: { _type: 'slug', current: 'le-bois' },
    description: 'Essences locales, approvisionnement, séchage et tenue dans le temps. Ce que je choisis, et pourquoi.',
    order: 1
  },
  {
    _id: 'category-atelier-fr',
    _type: 'category',
    language: 'fr',
    title: "À l'atelier",
    slug: { _type: 'slug', current: 'atelier' },
    description: "Coulisses des projets, techniques de joinage et décisions de fabrication, racontées de l'établi.",
    order: 2
  },
  {
    _id: 'category-entretien-fr',
    _type: 'category',
    language: 'fr',
    title: 'Entretien',
    slug: { _type: 'slug', current: 'entretien' },
    description: 'Garder une pièce de bois massif belle pendant des décennies: finition, soin courant et petites réparations.',
    order: 3
  },

  // ── Services ──────────────────────────────────────────────────────────────
  {
    _id: 'service-cuisines-fr',
    _type: 'service',
    language: 'fr',
    title: 'Cuisines complètes',
    slug: { _type: 'slug', current: 'cuisines' },
    summary: 'Caissons, façades et plans de travail en bois massif. Du croquis initial à la pose finale, en passant par les électros.',
    meta: '8 à 12 semaines',
    image: {
      _type: 'figure',
      image: { _imagePath: '/images/service-cuisines.jpg' },
      alt: "Cuisines complètes, réalisation d'Atelier Cormier.",
      label: 'Cuisines complètes',
      caption: 'Cuisines complètes',
      ratio: '4/3'
    },
    intro: [
      "Une cuisine, c'est la pièce qui travaille le plus fort de la maison. Je la construis pour ça: des caissons en contreplaqué de bouleau, des façades en bois massif, des charnières et coulisses que vous ne remplacerez pas dans dix ans.",
      "Je prends les mesures moi-même, je dessine en fonction de votre façon de cuisiner, et je pose moi-même à la fin. Vous n'avez qu'un seul interlocuteur, du premier croquis à la dernière poignée."
    ],
    benefits: [
      {
        _key: 'benefit-1',
        _type: 'serviceBenefit',
        title: 'Bois massif visible',
        body: 'Façades, tablettes et plans en frêne, érable ou noyer. Pas de placage qui cloque, pas de mélamine qui gonfle.'
      },
      {
        _key: 'benefit-2',
        _type: 'serviceBenefit',
        title: 'Ajusté à votre mur',
        body: 'Relevé au laser sur place, fabrication au pouce près. Les angles et les murs croches sont mon problème, pas le vôtre.'
      },
      {
        _key: 'benefit-3',
        _type: 'serviceBenefit',
        title: 'Pose comprise',
        body: "Je livre et j'installe. Ajustement des portes, calage de niveau, finitions de jonction: tout est fait avant que je reparte."
      }
    ],
    detail: serviceDetail(),
    related: [
      { _key: 'cuisine-frene-saint-mathias', _type: 'reference', _ref: 'project-cuisine-frene-saint-mathias-fr' }
    ],
    order: 1
  },
  {
    _id: 'service-mobilier-fr',
    _type: 'service',
    language: 'fr',
    title: 'Mobilier de salle à manger',
    slug: { _type: 'slug', current: 'mobilier' },
    summary: 'Tables, bancs, buffets et chaises. Conçus pour le quotidien, taillés pour passer aux enfants.',
    meta: '6 à 10 semaines',
    image: {
      _type: 'figure',
      image: { _imagePath: '/images/service-mobilier.jpg' },
      alt: "Mobilier de salle à manger, réalisation d'Atelier Cormier.",
      label: 'Mobilier de salle à manger',
      caption: 'Mobilier de salle à manger',
      ratio: '4/3'
    },
    intro: [
      'Une table de salle à manger, ça se mange dessus tous les jours et ça se transmet une fois par génération. Je la construis avec des assemblages traditionnels qui encaissent les deux.',
      'Tables, bancs, buffets, consoles: je travaille les essences locales en pièces qui vieillissent bien et se réparent au besoin, plutôt que de se jeter.'
    ],
    benefits: [
      {
        _key: 'benefit-1',
        _type: 'serviceBenefit',
        title: 'Joinage traditionnel',
        body: 'Tenons-mortaises chevillés, pas de vis cachées sous un bouchon. La structure tient par le bois, pas par la quincaillerie.'
      },
      {
        _key: 'benefit-2',
        _type: 'serviceBenefit',
        title: 'Plateaux en bois massif',
        body: "Débités et collés à l'atelier, finis à l'huile-cire pénétrante: une marque s'efface, le plateau se ponce et se refinit."
      },
      {
        _key: 'benefit-3',
        _type: 'serviceBenefit',
        title: 'Dimensions sur mesure',
        body: "Longueur, hauteur et nombre de places ajustés à votre pièce et au monde qui s'assoit autour."
      }
    ],
    detail: serviceDetail(),
    related: [
      { _key: 'table-noyer-chambly', _type: 'reference', _ref: 'project-table-noyer-chambly-fr' },
      { _key: 'buffet-erable-saint-bruno', _type: 'reference', _ref: 'project-buffet-erable-saint-bruno-fr' }
    ],
    order: 2
  },
  {
    _id: 'service-bibliotheques-fr',
    _type: 'service',
    language: 'fr',
    title: 'Bibliothèques intégrées',
    slug: { _type: 'slug', current: 'bibliotheques' },
    summary: 'Rangements muraux sur mesure, ajustés au pouce près à votre mur. Plinthes, moulures et angles compris.',
    meta: '6 à 8 semaines',
    image: {
      _type: 'figure',
      image: { _imagePath: '/images/service-bibliotheques.jpg' },
      alt: "Bibliothèques intégrées, réalisation d'Atelier Cormier.",
      label: 'Bibliothèques intégrées',
      caption: 'Bibliothèques intégrées',
      ratio: '4/3'
    },
    intro: [
      "Une bibliothèque intégrée, bien faite, disparaît dans le mur: les plinthes suivent celles de la pièce, les moulures rejoignent le plafond, rien ne trahit qu'on l'a ajoutée.",
      "Je conçois le rangement autour de ce que vous y mettez, des livres aux objets en passant par la télé, et je l'ajuste exactement à la géométrie de votre mur."
    ],
    benefits: [
      {
        _key: 'benefit-1',
        _type: 'serviceBenefit',
        title: 'Intégration au bâti',
        body: "Plinthes, cimaises et moulures raccordées à l'existant. La bibliothèque a l'air d'avoir toujours été là."
      },
      {
        _key: 'benefit-2',
        _type: 'serviceBenefit',
        title: 'Tablettes qui ne ploient pas',
        body: 'Épaisseur et portée calculées selon la charge réelle. Une tablette de livres reste droite, année après année.'
      },
      {
        _key: 'benefit-3',
        _type: 'serviceBenefit',
        title: 'Éclairage prévu',
        body: 'Passage de fils et intégration de réglettes DEL planifiés au dessin, pas bricolés après coup.'
      }
    ],
    detail: serviceDetail(),
    related: [
      { _key: 'bibliotheque-merisier-longueuil', _type: 'reference', _ref: 'project-bibliotheque-merisier-longueuil-fr' }
    ],
    order: 3
  },
  {
    _id: 'service-restauration-fr',
    _type: 'service',
    language: 'fr',
    title: 'Restauration de pièces anciennes',
    slug: { _type: 'slug', current: 'restauration' },
    summary: "Remise en état de meubles hérités, dans le respect de l'original. Devis honnête, parfois je vous dirai de ne rien toucher.",
    meta: '4 à 8 semaines',
    image: {
      _type: 'figure',
      image: { _imagePath: '/images/service-restauration.jpg' },
      alt: "Restauration de pièces anciennes, réalisation d'Atelier Cormier.",
      label: 'Restauration de pièces anciennes',
      caption: 'Restauration de pièces anciennes',
      ratio: '4/3'
    },
    intro: [
      "Un meuble qui a traversé deux générations mérite mieux qu'un décapage agressif et trois couches de vernis brillant. Je restaure dans le respect de l'âge de la pièce.",
      "Recollage d'assemblages, remplacement de pièces manquantes en bois d'époque, ravivage de la finition d'origine: je remets en service sans effacer l'histoire."
    ],
    benefits: [
      {
        _key: 'benefit-1',
        _type: 'serviceBenefit',
        title: 'Diagnostic honnête',
        body: 'Parfois la bonne réponse est de ne presque rien faire. Je vous le dirai avant de prendre votre argent.'
      },
      {
        _key: 'benefit-2',
        _type: 'serviceBenefit',
        title: 'Réparations réversibles',
        body: "Colles et techniques choisies pour qu'une intervention future reste possible, comme le veut la bonne pratique."
      },
      {
        _key: 'benefit-3',
        _type: 'serviceBenefit',
        title: "Finition d'époque",
        body: "Gomme-laque, huiles et cires d'origine plutôt que vernis modernes, pour garder la patine et la main du meuble."
      }
    ],
    detail: serviceDetail(),
    related: [
      { _key: 'commode-restauration-carignan', _type: 'reference', _ref: 'project-commode-restauration-carignan-fr' }
    ],
    order: 4
  },
  {
    _id: 'service-commerces-fr',
    _type: 'service',
    language: 'fr',
    title: 'Agencements pour commerces',
    slug: { _type: 'slug', current: 'commerces' },
    summary: 'Comptoirs, présentoirs et mobilier fixe pour cafés, boutiques et bureaux. Du bois qui tient le rythme commercial.',
    meta: '8 à 14 semaines',
    image: {
      _type: 'figure',
      image: { _imagePath: '/images/service-mobilier.jpg' },
      alt: "Agencements pour commerces, réalisation d'Atelier Cormier.",
      label: 'Agencements pour commerces',
      caption: 'Agencements pour commerces',
      ratio: '4/3'
    },
    intro: [
      'Un comptoir de café encaisse mille mains par jour. Un présentoir de boutique se fait cogner, recharger, déplacer. Pour ces usages, je construis plus robuste encore que pour la maison.',
      "Je travaille avec les petits commerces de la Rive-Sud pour des agencements qui ont du caractère sans coûter le prix d'un mobilier importé jetable."
    ],
    benefits: [
      {
        _key: 'benefit-1',
        _type: 'serviceBenefit',
        title: "Conçu pour l'usure",
        body: 'Chants renforcés, finitions résistantes aux nettoyants commerciaux, structure pensée pour des années de service intensif.'
      },
      {
        _key: 'benefit-2',
        _type: 'serviceBenefit',
        title: 'Image de marque en bois',
        body: 'Un agencement en bois massif local raconte quelque chose à vos clients qu\'un comptoir stratifié ne dira jamais.'
      },
      {
        _key: 'benefit-3',
        _type: 'serviceBenefit',
        title: 'Coordination de chantier',
        body: "Je m'arrime à votre échéancier d'ouverture et aux autres corps de métier, pose comprise hors heures d'affluence."
      }
    ],
    detail: serviceDetail(),
    related: [
      { _key: 'cafe-amenagement-chambly', _type: 'reference', _ref: 'project-cafe-amenagement-chambly-fr' }
    ],
    order: 5
  },

  // ── Projets ───────────────────────────────────────────────────────────────
  {
    _id: 'project-cuisine-frene-saint-mathias-fr',
    _type: 'project',
    language: 'fr',
    title: 'Cuisine en frêne, maison de 1910',
    slug: { _type: 'slug', current: 'cuisine-frene-saint-mathias' },
    excerpt: "Une cuisine complète en frêne massif pour une maison de ferme rénovée, mariée à des murs jamais d'équerre.",
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/service-cuisines.jpg' },
      alt: 'Cuisine en frêne massif clair, îlot central et armoires sur mesure.',
      label: 'Cuisine en frêne, Saint-Mathias',
      caption: 'Cuisine complète, 4:3',
      ratio: '4/3'
    },
    gallery: [
      {
        _key: 'facades',
        _type: 'figure',
        image: { _imagePath: '/images/project-cuisine-facades.jpg' },
        alt: 'Détail des façades en frêne et des charnières dissimulées.',
        label: 'Façades en frêne',
        caption: 'Détail façades, 4:5',
        ratio: '4/5'
      },
      {
        _key: 'ilot',
        _type: 'figure',
        image: { _imagePath: '/images/project-cuisine-ilot.jpg' },
        alt: 'Îlot central avec plan de travail en bois massif huilé.',
        label: 'Îlot central',
        caption: 'Îlot, 4:5',
        ratio: '4/5'
      },
      {
        _key: 'raccord',
        _type: 'figure',
        image: { _imagePath: '/images/project-cuisine-raccord.jpg' },
        alt: "Raccord de la cuisine avec un mur d'origine non d'équerre.",
        label: 'Raccord au mur ancien',
        caption: 'Ajustement, 4:3',
        ratio: '4/3'
      }
    ],
    location: 'Saint-Mathias-sur-Richelieu',
    year: '2022',
    challenge: "La maison de 1910 n'avait pas un seul mur droit ni un seul angle à 90 degrés. Une cuisine standard aurait laissé des jours béants partout.",
    solution: "Relevé complet au laser, fabrication en tenant compte de chaque déviation, et façades en frêne massif débité à l'atelier pour s'harmoniser aux boiseries d'origine.",
    result: "Une cuisine qui épouse la maison au point qu'on la croirait d'époque. Trois ans plus tard, aucune porte n'a bougé.",
    stats: [
      { _key: 'duree', _type: 'projectStat', label: 'Durée', value: '11 semaines' },
      { _key: 'essence', _type: 'projectStat', label: 'Essence', value: 'Frêne local' },
      { _key: 'armoires', _type: 'projectStat', label: 'Armoires', value: '24 caissons' }
    ],
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-cuisines-fr' },
    testimonial: { _type: 'reference', _ref: 'testimonial-catherine-dufresne-fr' },
    featured: true,
    order: 1
  },
  {
    _id: 'project-table-noyer-chambly-fr',
    _type: 'project',
    language: 'fr',
    title: 'Table de huit en noyer noir',
    slug: { _type: 'slug', current: 'table-noyer-chambly' },
    excerpt: 'Une grande table de salle à manger en noyer pour réunir trois générations, livrée pour un anniversaire.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/service-mobilier.jpg' },
      alt: 'Grande table de salle à manger en noyer noir, piètement massif.',
      label: 'Table en noyer, Chambly',
      caption: 'Table de salle à manger, 4:3',
      ratio: '4/3'
    },
    gallery: [
      {
        _key: 'pietement',
        _type: 'figure',
        image: { _imagePath: '/images/project-table-noyer-pietement.jpg' },
        alt: "Détail de l'assemblage tenon-mortaise du piètement.",
        label: 'Assemblage du piètement',
        caption: 'Joinage, 4:5',
        ratio: '4/5'
      },
      {
        _key: 'plateau',
        _type: 'figure',
        image: { _imagePath: '/images/project-table-noyer-plateau.jpg' },
        alt: "Plateau en noyer noir aux veines marquées, fini à l'huile.",
        label: 'Plateau en noyer',
        caption: 'Plateau, 16:9',
        ratio: '16/9'
      }
    ],
    location: 'Chambly',
    year: '2023',
    challenge: 'Réunir huit convives sans piètement central qui gêne les jambes, sur un plateau assez stable pour ne jamais gauchir.',
    solution: 'Un piètement en H chevillé, des allonges à rallonge dissimulées, et un plateau en noyer massif contre-fibré pour bloquer le mouvement du bois.',
    result: 'Livrée trois mois après le premier croquis, pile pour les soixante-dix ans du père de famille. Une pièce conçue pour passer aux petits-enfants.',
    stats: [
      { _key: 'places', _type: 'projectStat', label: 'Places', value: '8 à 10' },
      { _key: 'essence', _type: 'projectStat', label: 'Essence', value: 'Noyer noir' },
      { _key: 'delai', _type: 'projectStat', label: 'Délai', value: '12 semaines' }
    ],
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-mobilier-fr' },
    testimonial: { _type: 'reference', _ref: 'testimonial-jean-philippe-rousseau-fr' },
    featured: true,
    order: 2
  },
  {
    _id: 'project-bibliotheque-merisier-longueuil-fr',
    _type: 'project',
    language: 'fr',
    title: 'Bibliothèque murale en merisier',
    slug: { _type: 'slug', current: 'bibliotheque-merisier-longueuil' },
    excerpt: 'Un mur de rangement intégré du plancher au plafond dans un salon ancien, ajusté à ses irrégularités.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/service-bibliotheques.jpg' },
      alt: 'Bibliothèque intégrée en merisier couvrant un mur complet de salon.',
      label: 'Bibliothèque en merisier, Longueuil',
      caption: 'Bibliothèque intégrée, 4:3',
      ratio: '4/3'
    },
    gallery: [
      {
        _key: 'moulures',
        _type: 'figure',
        image: { _imagePath: '/images/project-biblio-moulures.jpg' },
        alt: 'Moulures de la bibliothèque raccordées à celles de la pièce.',
        label: 'Raccord des moulures',
        caption: 'Moulures, 4:5',
        ratio: '4/5'
      },
      {
        _key: 'tablettes',
        _type: 'figure',
        image: { _imagePath: '/images/project-biblio-tablettes.jpg' },
        alt: 'Tablettes ajustées et éclairage intégré.',
        label: 'Tablettes et éclairage',
        caption: 'Détail, 4:5',
        ratio: '4/5'
      }
    ],
    location: 'Longueuil',
    year: '2023',
    challenge: "Un salon de 1910 aux murs gondolés et au plafond qui n'était nulle part à la même hauteur.",
    solution: 'Caissons fabriqués légèrement en retrait, puis ajustés sur place avec des couvre-joints en merisier suivant chaque ondulation du mur et du plafond.',
    result: "Un mur de rangement qui semble avoir été bâti avec la maison. La cliente jure qu'on ne devine aucun joint.",
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-bibliotheques-fr' },
    testimonial: { _type: 'reference', _ref: 'testimonial-sophie-tremblay-fr' },
    featured: false,
    order: 3
  },
  {
    _id: 'project-buffet-erable-saint-bruno-fr',
    _type: 'project',
    language: 'fr',
    title: 'Buffet en érable ondé',
    slug: { _type: 'slug', current: 'buffet-erable-saint-bruno' },
    excerpt: 'Un buffet de salle à manger en érable, à la fois rangement de tous les jours et pièce de caractère.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/service-mobilier.jpg' },
      alt: 'Buffet bas en érable ondé, portes à panneaux et quincaillerie en laiton.',
      label: 'Buffet en érable, Saint-Bruno',
      caption: 'Buffet sur mesure, 4:3',
      ratio: '4/3'
    },
    gallery: [
      {
        _key: 'erable-onde',
        _type: 'figure',
        image: { _imagePath: '/images/project-buffet-erable-onde.jpg' },
        alt: "Détail des veines ondées de l'érable sur une porte.",
        label: 'Érable ondé',
        caption: 'Détail, 4:5',
        ratio: '4/5'
      }
    ],
    location: 'Saint-Bruno-de-Montarville',
    year: '2024',
    challenge: "Un meuble qui devait être beau sans devenir précieux, capable d'encaisser des années de soupers de famille.",
    solution: 'Érable ondé sélectionné pour son veinage, portes à panneaux flottants pour absorber le mouvement, finition huile-cire qui se retouche en deux minutes.',
    result: "Trois ans de service quotidien plus tard, le buffet n'a aucune marque qui dérange. Robuste, comme demandé.",
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-mobilier-fr' },
    testimonial: { _type: 'reference', _ref: 'testimonial-marc-andre-gagnon-fr' },
    featured: false,
    order: 4
  },
  {
    _id: 'project-commode-restauration-carignan-fr',
    _type: 'project',
    language: 'fr',
    title: "Restauration d'une commode familiale",
    slug: { _type: 'slug', current: 'commode-restauration-carignan' },
    excerpt: 'Une commode héritée de grand-mère, remise en service sans effacer un siècle de patine.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/service-restauration.jpg' },
      alt: "Commode ancienne restaurée, tiroirs réajustés, patine d'origine conservée.",
      label: 'Commode restaurée, Carignan',
      caption: 'Restauration, 4:3',
      ratio: '4/3'
    },
    gallery: [
      {
        _key: 'recollage',
        _type: 'figure',
        image: { _imagePath: '/images/project-commode-recollage.jpg' },
        alt: "Tiroir démonté montrant le recollage des assemblages à queue d'aronde.",
        label: 'Recollage des tiroirs',
        caption: 'Atelier, 4:5',
        ratio: '4/5'
      }
    ],
    location: 'Carignan',
    year: '2022',
    challenge: "Les assemblages se défaisaient, deux tiroirs ne fermaient plus, mais la cliente tenait à garder l'âme du meuble intacte.",
    solution: "Démontage complet, recollage à la colle de peau réversible, remplacement des coulisses usées en bois d'époque, ravivage de la gomme-laque sans décapage.",
    result: 'Une commode qui refonctionne pour cent ans de plus, avec sa patine et son histoire au complet.',
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-restauration-fr' },
    testimonial: { _type: 'reference', _ref: 'testimonial-marie-helene-belanger-fr' },
    featured: false,
    order: 5
  },
  {
    _id: 'project-cafe-amenagement-chambly-fr',
    _type: 'project',
    language: 'fr',
    title: "Agencement d'un café de quartier",
    slug: { _type: 'slug', current: 'cafe-amenagement-chambly' },
    excerpt: 'Comptoir, tablettes et mobilier fixe pour un café indépendant, conçus pour le rythme commercial.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/project-cafe-comptoir.jpg' },
      alt: 'Comptoir de café en bois massif avec tablettes murales assorties.',
      label: 'Café Le Moulin, Chambly',
      caption: 'Agencement de commerce, 16:9',
      ratio: '16/9'
    },
    gallery: [
      {
        _key: 'comptoir-detail',
        _type: 'figure',
        image: { _imagePath: '/images/project-cafe-comptoir-detail.jpg' },
        alt: 'Comptoir de service vu de côté, chant renforcé.',
        label: 'Comptoir de service',
        caption: 'Détail, 4:5',
        ratio: '4/5'
      },
      {
        _key: 'tablettes',
        _type: 'figure',
        image: { _imagePath: '/images/project-cafe-tablettes.jpg' },
        alt: 'Tablettes murales chargées de tasses et de sacs de café.',
        label: 'Tablettes murales',
        caption: 'Détail, 4:5',
        ratio: '4/5'
      }
    ],
    location: 'Chambly',
    year: '2024',
    challenge: 'Un comptoir qui devait encaisser des centaines de cafés par jour, résister aux nettoyants commerciaux, et donner le ton à toute la place.',
    solution: "Structure surdimensionnée, chants en bois dur renforcés, finition de qualité commerciale, le tout posé hors des heures d'ouverture pour ne pas retarder le démarrage.",
    result: 'Le comptoir tient le rythme depuis l\'ouverture et donne au café une signature en bois massif local que les clients remarquent.',
    stats: [
      { _key: 'service', _type: 'projectStat', label: 'Service', value: '300+ cafés/jour' },
      { _key: 'pose', _type: 'projectStat', label: 'Pose', value: 'Hors affluence' },
      { _key: 'bois', _type: 'projectStat', label: 'Bois', value: 'Érable local' }
    ],
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-commerces-fr' },
    testimonial: { _type: 'reference', _ref: 'testimonial-le-moulin-cafe-fr' },
    featured: true,
    order: 6
  }
]
