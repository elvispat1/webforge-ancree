// Seed EN des collections: services (5), projets (6), catégories (3).
//
// Miroir structurel exact de collections-fr.mjs: mêmes documents, mêmes _key,
// mêmes marqueurs { _imagePath }, mêmes dates et order. Ids déterministes
// (spec §11): <type>-<cleFR>-en (la clé reste celle du slug FR canonique,
// seul slug.current est anglais). Les figures de service reprennent la
// dérivation serviceImage(): ratio 4/3, alt « <titre>, crafted by Atelier
// Cormier. », label et caption au titre.
//
// Chaque service et chaque projet porte son objet detail (la copie de sa page
// /services/<slug> ou /projets/<slug>, ex-servicesPage.serviceDetail et
// ex-projectsPage.projectDetail, spec 6.10 et 6.11): gabarit V1 identique d'un
// document à l'autre, la personnalisation viendra du Studio.

// ── Fabriques locales (gabarits de page de détail partagés) ──────────────────

/** Lien interne vers un document (id déterministe -en). */
const internal = (label, ref) => ({
  _type: 'link',
  label,
  type: 'internal',
  internalRef: { _type: 'reference', _ref: ref }
})

/** Page de détail d'un service (gabarit V1, ex-servicesPage.serviceDetail). */
const serviceDetail = () => ({
  benefits: {
    heading: 'What you get',
    cta: internal('Request a quote', 'contactPage-en')
  },
  included: { heading: 'Included in every project' },
  process: {
    _type: 'process',
    eyebrow: 'How it works',
    heading: 'How a project unfolds',
    lead: 'From the first call to the final installation, a single point of contact: me.',
    cta: internal('Contact me', 'contactPage-en'),
    steps: [
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
    ]
  },
  projects: {
    heading: 'Recent work in this service',
    lead: 'Recent pieces delivered in this service, from sketch to installation.',
    cta: internal('All projects', 'projectsPage-en')
  },
  testimonials: {
    eyebrow: 'Testimonials',
    heading: 'What my clients have to say'
  },
  cta: {
    _type: 'ctaBand',
    title: "Let's discuss your project",
    subtitle: 'A detailed, honest quote, with no obligation.',
    primaryCta: internal('Start a project', 'contactPage-en')
  }
})

/** Page de détail d'un projet (gabarit V1, ex-projectsPage.projectDetail). */
const projectDetail = () => ({
  gallery: { heading: 'In pictures' },
  caseStudy: {
    eyebrow: 'The case study',
    heading: 'The challenge, the solution, the result',
    challengeLabel: 'The challenge',
    solutionLabel: 'The solution',
    resultLabel: 'The result'
  },
  testimonial: {
    eyebrow: 'Testimonials',
    heading: 'A word from the client'
  },
  similar: {
    heading: 'Similar projects',
    cta: internal('All projects', 'projectsPage-en')
  },
  cta: {
    _type: 'ctaBand',
    title: 'A project like this one?',
    subtitle: "Every piece is unique. Let's talk about yours.",
    primaryCta: internal('Start a project', 'contactPage-en')
  }
})

export const docs = [
  // ── Catégories de blogue ──────────────────────────────────────────────────
  {
    _id: 'category-le-bois-en',
    _type: 'category',
    language: 'en',
    title: 'Wood',
    slug: { _type: 'slug', current: 'wood' },
    description: 'Local species, sourcing, drying and how wood holds up over time. What I choose, and why.',
    order: 1
  },
  {
    _id: 'category-atelier-en',
    _type: 'category',
    language: 'en',
    title: 'In the workshop',
    slug: { _type: 'slug', current: 'workshop' },
    description: 'Behind the scenes of the projects, joinery techniques and build decisions, told from the workbench.',
    order: 2
  },
  {
    _id: 'category-entretien-en',
    _type: 'category',
    language: 'en',
    title: 'Care',
    slug: { _type: 'slug', current: 'care' },
    description: 'Keeping a solid wood piece beautiful for decades: finishing, routine care and small repairs.',
    order: 3
  },

  // ── Services ──────────────────────────────────────────────────────────────
  {
    _id: 'service-cuisines-en',
    _type: 'service',
    language: 'en',
    title: 'Complete kitchens',
    slug: { _type: 'slug', current: 'custom-kitchens' },
    summary: 'Cabinet boxes, fronts and countertops in solid wood. From the first sketch to the final installation, appliance fitting included along the way.',
    meta: '8 to 12 weeks',
    image: {
      _type: 'figure',
      image: { _imagePath: '/images/service-cuisines.jpg' },
      alt: 'Complete kitchens, crafted by Atelier Cormier.',
      label: 'Complete kitchens',
      caption: 'Complete kitchens',
      ratio: '4/3'
    },
    intro: [
      'A kitchen is the hardest-working room in the house. I build it for exactly that: birch plywood boxes, solid wood fronts, hinges and slides you will not be replacing in ten years.',
      'I take the measurements myself, design around the way you actually cook, and handle the installation at the end. You deal with one person, from the first sketch to the last handle.'
    ],
    benefits: [
      {
        _key: 'benefit-1',
        _type: 'serviceBenefit',
        title: 'Solid wood where you see it',
        body: 'Fronts, shelves and countertops in ash, maple or walnut. No veneer that blisters, no melamine that swells.'
      },
      {
        _key: 'benefit-2',
        _type: 'serviceBenefit',
        title: 'Fitted to your walls',
        body: 'Laser measurements taken on site, built to the inch. Crooked walls and odd angles are my problem, not yours.'
      },
      {
        _key: 'benefit-3',
        _type: 'serviceBenefit',
        title: 'Installation included',
        body: 'I deliver and I install. Door adjustments, levelling, joint finishing: everything is done before I leave.'
      }
    ],
    detail: serviceDetail(),
    related: [
      { _key: 'cuisine-frene-saint-mathias', _type: 'reference', _ref: 'project-cuisine-frene-saint-mathias-en' }
    ],
    order: 1
  },
  {
    _id: 'service-mobilier-en',
    _type: 'service',
    language: 'en',
    title: 'Dining room furniture',
    slug: { _type: 'slug', current: 'dining-furniture' },
    summary: 'Tables, benches, sideboards and chairs. Designed for everyday life, built to be handed down to your children.',
    meta: '6 to 10 weeks',
    image: {
      _type: 'figure',
      image: { _imagePath: '/images/service-mobilier.jpg' },
      alt: 'Dining room furniture, crafted by Atelier Cormier.',
      label: 'Dining room furniture',
      caption: 'Dining room furniture',
      ratio: '4/3'
    },
    intro: [
      'A dining table takes daily meals and gets handed down once a generation. I build it with traditional joinery that can take both.',
      'Tables, benches, sideboards, consoles: I work local species into pieces that age well and can be repaired when needed, instead of being thrown out.'
    ],
    benefits: [
      {
        _key: 'benefit-1',
        _type: 'serviceBenefit',
        title: 'Traditional joinery',
        body: 'Pegged mortise and tenon joints, no screws hidden under a plug. The structure holds through the wood, not the hardware.'
      },
      {
        _key: 'benefit-2',
        _type: 'serviceBenefit',
        title: 'Solid wood tops',
        body: 'Milled and glued up in the workshop, finished with penetrating hardwax oil: a mark buffs out, and the top can be sanded and refinished.'
      },
      {
        _key: 'benefit-3',
        _type: 'serviceBenefit',
        title: 'Made-to-measure dimensions',
        body: 'Length, height and number of seats tailored to your room and to the people who gather around it.'
      }
    ],
    detail: serviceDetail(),
    related: [
      { _key: 'table-noyer-chambly', _type: 'reference', _ref: 'project-table-noyer-chambly-en' },
      { _key: 'buffet-erable-saint-bruno', _type: 'reference', _ref: 'project-buffet-erable-saint-bruno-en' }
    ],
    order: 2
  },
  {
    _id: 'service-bibliotheques-en',
    _type: 'service',
    language: 'en',
    title: 'Built-in bookcases',
    slug: { _type: 'slug', current: 'built-in-bookcases' },
    summary: 'Custom wall storage, fitted to your wall to the inch. Baseboards, mouldings and corners included.',
    meta: '6 to 8 weeks',
    image: {
      _type: 'figure',
      image: { _imagePath: '/images/service-bibliotheques.jpg' },
      alt: 'Built-in bookcases, crafted by Atelier Cormier.',
      label: 'Built-in bookcases',
      caption: 'Built-in bookcases',
      ratio: '4/3'
    },
    intro: [
      'A well-made built-in bookcase disappears into the wall: the baseboards follow those of the room, the mouldings meet the ceiling, and nothing gives away that it was added.',
      'I design the storage around what you put in it, from books to keepsakes to the TV, and fit it exactly to the geometry of your wall.'
    ],
    benefits: [
      {
        _key: 'benefit-1',
        _type: 'serviceBenefit',
        title: 'Blends into the architecture',
        body: 'Baseboards, picture rails and mouldings tied into the existing trim. The bookcase looks like it has always been there.'
      },
      {
        _key: 'benefit-2',
        _type: 'serviceBenefit',
        title: 'Shelves that never sag',
        body: 'Thickness and span calculated for the actual load. A shelf full of books stays straight, year after year.'
      },
      {
        _key: 'benefit-3',
        _type: 'serviceBenefit',
        title: 'Lighting planned in',
        body: 'Wire runs and LED strip integration planned at the drawing stage, not improvised after the fact.'
      }
    ],
    detail: serviceDetail(),
    related: [
      { _key: 'bibliotheque-merisier-longueuil', _type: 'reference', _ref: 'project-bibliotheque-merisier-longueuil-en' }
    ],
    order: 3
  },
  {
    _id: 'service-restauration-en',
    _type: 'service',
    language: 'en',
    title: 'Antique furniture restoration',
    slug: { _type: 'slug', current: 'antique-restoration' },
    summary: 'Bringing inherited furniture back into service while respecting the original. Honest quotes, and sometimes I will tell you not to touch a thing.',
    meta: '4 to 8 weeks',
    image: {
      _type: 'figure',
      image: { _imagePath: '/images/service-restauration.jpg' },
      alt: 'Antique furniture restoration, crafted by Atelier Cormier.',
      label: 'Antique furniture restoration',
      caption: 'Antique furniture restoration',
      ratio: '4/3'
    },
    intro: [
      'A piece of furniture that has crossed two generations deserves better than aggressive stripping and three coats of glossy varnish. I restore with respect for the age of the piece.',
      'Regluing joints, replacing missing parts with period wood, reviving the original finish: I put pieces back into service without erasing their history.'
    ],
    benefits: [
      {
        _key: 'benefit-1',
        _type: 'serviceBenefit',
        title: 'An honest diagnosis',
        body: 'Sometimes the right answer is to do almost nothing. I will tell you so before taking your money.'
      },
      {
        _key: 'benefit-2',
        _type: 'serviceBenefit',
        title: 'Reversible repairs',
        body: 'Glues and techniques chosen so that future work remains possible, as good practice demands.'
      },
      {
        _key: 'benefit-3',
        _type: 'serviceBenefit',
        title: 'Period finishes',
        body: 'Shellac, traditional oils and waxes rather than modern varnishes, to preserve the patina and the feel of the piece.'
      }
    ],
    detail: serviceDetail(),
    related: [
      { _key: 'commode-restauration-carignan', _type: 'reference', _ref: 'project-commode-restauration-carignan-en' }
    ],
    order: 4
  },
  {
    _id: 'service-commerces-en',
    _type: 'service',
    language: 'en',
    title: 'Commercial millwork',
    slug: { _type: 'slug', current: 'commercial-millwork' },
    summary: 'Counters, display units and fixed furniture for cafés, shops and offices. Wood that keeps up with a commercial pace.',
    meta: '8 to 14 weeks',
    image: {
      _type: 'figure',
      image: { _imagePath: '/images/service-mobilier.jpg' },
      alt: 'Commercial millwork, crafted by Atelier Cormier.',
      label: 'Commercial millwork',
      caption: 'Commercial millwork',
      ratio: '4/3'
    },
    intro: [
      'A café counter takes a thousand hands a day. A shop display gets knocked, restocked and moved around. For that kind of use, I build even tougher than I do for homes.',
      'I work with small businesses on the South Shore to create fixtures with real character, without the price tag of disposable imported furniture.'
    ],
    benefits: [
      {
        _key: 'benefit-1',
        _type: 'serviceBenefit',
        title: 'Built for wear',
        body: 'Reinforced edges, finishes that stand up to commercial cleaners, and a structure designed for years of heavy service.'
      },
      {
        _key: 'benefit-2',
        _type: 'serviceBenefit',
        title: 'Your brand, in wood',
        body: 'A fixture in local solid wood tells your customers something a laminate counter never will.'
      },
      {
        _key: 'benefit-3',
        _type: 'serviceBenefit',
        title: 'Site coordination',
        body: 'I work around your opening schedule and the other trades, with installation done outside peak hours.'
      }
    ],
    detail: serviceDetail(),
    related: [
      { _key: 'cafe-amenagement-chambly', _type: 'reference', _ref: 'project-cafe-amenagement-chambly-en' }
    ],
    order: 5
  },

  // ── Projets ───────────────────────────────────────────────────────────────
  {
    _id: 'project-cuisine-frene-saint-mathias-en',
    _type: 'project',
    language: 'en',
    title: 'Ash kitchen in a 1910 house',
    slug: { _type: 'slug', current: 'ash-kitchen-saint-mathias' },
    excerpt: 'A complete solid ash kitchen for a renovated farmhouse, fitted to walls that were never square.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/service-cuisines.jpg' },
      alt: 'Light solid ash kitchen with a centre island and custom cabinets.',
      label: 'Ash kitchen, Saint-Mathias',
      caption: 'Complete kitchen, 4:3',
      ratio: '4/3'
    },
    gallery: [
      {
        _key: 'facades',
        _type: 'figure',
        image: { _imagePath: '/images/project-cuisine-facades.jpg' },
        alt: 'Detail of the ash fronts and concealed hinges.',
        label: 'Ash fronts',
        caption: 'Front detail, 4:5',
        ratio: '4/5'
      },
      {
        _key: 'ilot',
        _type: 'figure',
        image: { _imagePath: '/images/project-cuisine-ilot.jpg' },
        alt: 'Centre island with an oiled solid wood countertop.',
        label: 'Centre island',
        caption: 'Island, 4:5',
        ratio: '4/5'
      },
      {
        _key: 'raccord',
        _type: 'figure',
        image: { _imagePath: '/images/project-cuisine-raccord.jpg' },
        alt: 'Junction between the kitchen and an original out-of-square wall.',
        label: 'Meeting the old wall',
        caption: 'Fitting, 4:3',
        ratio: '4/3'
      }
    ],
    location: 'Saint-Mathias-sur-Richelieu',
    year: '2022',
    challenge: 'The 1910 house did not have a single straight wall or a single square corner. A standard kitchen would have left gaping seams everywhere.',
    solution: 'A full laser survey, fabrication that accounted for every deviation, and solid ash fronts milled in the workshop to blend with the original woodwork.',
    result: 'A kitchen that hugs the house so closely you would swear it was original. Three years later, not a single door has shifted.',
    stats: [
      { _key: 'duree', _type: 'projectStat', label: 'Duration', value: '11 weeks' },
      { _key: 'essence', _type: 'projectStat', label: 'Species', value: 'Local ash' },
      { _key: 'armoires', _type: 'projectStat', label: 'Cabinets', value: '24 boxes' }
    ],
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-cuisines-en' },
    testimonial: { _type: 'reference', _ref: 'testimonial-catherine-dufresne-en' },
    featured: true,
    order: 1
  },
  {
    _id: 'project-table-noyer-chambly-en',
    _type: 'project',
    language: 'en',
    title: 'Black walnut table for eight',
    slug: { _type: 'slug', current: 'walnut-table-chambly' },
    excerpt: 'A large walnut dining table made to gather three generations, delivered in time for a birthday.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/service-mobilier.jpg' },
      alt: 'Large black walnut dining table with a solid base.',
      label: 'Walnut table, Chambly',
      caption: 'Dining table, 4:3',
      ratio: '4/3'
    },
    gallery: [
      {
        _key: 'pietement',
        _type: 'figure',
        image: { _imagePath: '/images/project-table-noyer-pietement.jpg' },
        alt: 'Detail of the mortise and tenon joinery in the base.',
        label: 'Base joinery',
        caption: 'Joinery, 4:5',
        ratio: '4/5'
      },
      {
        _key: 'plateau',
        _type: 'figure',
        image: { _imagePath: '/images/project-table-noyer-plateau.jpg' },
        alt: 'Black walnut tabletop with bold grain, finished in oil.',
        label: 'Walnut tabletop',
        caption: 'Tabletop, 16:9',
        ratio: '16/9'
      }
    ],
    location: 'Chambly',
    year: '2023',
    challenge: 'Seating eight guests without a centre pedestal getting in the way of anyone\'s legs, on a top stable enough to never warp.',
    solution: 'A pegged H-shaped base, concealed extension leaves, and a solid walnut top glued up with alternating grain to lock down wood movement.',
    result: "Delivered three months after the first sketch, right on time for the family patriarch's seventieth birthday. A piece designed to pass down to the grandchildren.",
    stats: [
      { _key: 'places', _type: 'projectStat', label: 'Seats', value: '8 to 10' },
      { _key: 'essence', _type: 'projectStat', label: 'Species', value: 'Black walnut' },
      { _key: 'delai', _type: 'projectStat', label: 'Lead time', value: '12 weeks' }
    ],
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-mobilier-en' },
    testimonial: { _type: 'reference', _ref: 'testimonial-jean-philippe-rousseau-en' },
    featured: true,
    order: 2
  },
  {
    _id: 'project-bibliotheque-merisier-longueuil-en',
    _type: 'project',
    language: 'en',
    title: 'Yellow birch wall bookcase',
    slug: { _type: 'slug', current: 'yellow-birch-bookcase-longueuil' },
    excerpt: 'A floor-to-ceiling built-in storage wall in an old living room, fitted to all of its quirks.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/service-bibliotheques.jpg' },
      alt: 'Built-in yellow birch bookcase covering an entire living room wall.',
      label: 'Yellow birch bookcase, Longueuil',
      caption: 'Built-in bookcase, 4:3',
      ratio: '4/3'
    },
    gallery: [
      {
        _key: 'moulures',
        _type: 'figure',
        image: { _imagePath: '/images/project-biblio-moulures.jpg' },
        alt: 'Bookcase mouldings tied into those of the room.',
        label: 'Joining the mouldings',
        caption: 'Mouldings, 4:5',
        ratio: '4/5'
      },
      {
        _key: 'tablettes',
        _type: 'figure',
        image: { _imagePath: '/images/project-biblio-tablettes.jpg' },
        alt: 'Fitted shelves with integrated lighting.',
        label: 'Shelves and lighting',
        caption: 'Detail, 4:5',
        ratio: '4/5'
      }
    ],
    location: 'Longueuil',
    year: '2023',
    challenge: 'A 1910 living room with wavy walls and a ceiling that was never the same height twice.',
    solution: 'Cabinet boxes built slightly shy of the wall, then fitted on site with yellow birch cover strips scribed to every undulation of the wall and ceiling.',
    result: 'A storage wall that looks like it was built with the house. The client swears you cannot spot a single seam.',
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-bibliotheques-en' },
    testimonial: { _type: 'reference', _ref: 'testimonial-sophie-tremblay-en' },
    featured: false,
    order: 3
  },
  {
    _id: 'project-buffet-erable-saint-bruno-en',
    _type: 'project',
    language: 'en',
    title: 'Curly maple sideboard',
    slug: { _type: 'slug', current: 'curly-maple-sideboard-saint-bruno' },
    excerpt: 'A maple dining room sideboard, everyday storage and statement piece at once.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/service-mobilier.jpg' },
      alt: 'Low curly maple sideboard with panelled doors and brass hardware.',
      label: 'Maple sideboard, Saint-Bruno',
      caption: 'Custom sideboard, 4:3',
      ratio: '4/3'
    },
    gallery: [
      {
        _key: 'erable-onde',
        _type: 'figure',
        image: { _imagePath: '/images/project-buffet-erable-onde.jpg' },
        alt: 'Detail of the curly maple figure on a door.',
        label: 'Curly maple',
        caption: 'Detail, 4:5',
        ratio: '4/5'
      }
    ],
    location: 'Saint-Bruno-de-Montarville',
    year: '2024',
    challenge: 'A piece that had to be beautiful without becoming precious, able to take years of family dinners.',
    solution: 'Curly maple selected for its figure, floating panel doors to absorb wood movement, and a hardwax oil finish that touches up in two minutes.',
    result: 'Three years of daily service later, the sideboard has no mark worth worrying about. Sturdy, as requested.',
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-mobilier-en' },
    testimonial: { _type: 'reference', _ref: 'testimonial-marc-andre-gagnon-en' },
    featured: false,
    order: 4
  },
  {
    _id: 'project-commode-restauration-carignan-en',
    _type: 'project',
    language: 'en',
    title: 'Restoring a family dresser',
    slug: { _type: 'slug', current: 'family-dresser-restoration-carignan' },
    excerpt: "A dresser inherited from grandmother, put back into service without erasing a century of patina.",
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/service-restauration.jpg' },
      alt: 'Restored antique dresser with refitted drawers and the original patina preserved.',
      label: 'Restored dresser, Carignan',
      caption: 'Restoration, 4:3',
      ratio: '4/3'
    },
    gallery: [
      {
        _key: 'recollage',
        _type: 'figure',
        image: { _imagePath: '/images/project-commode-recollage.jpg' },
        alt: 'Disassembled drawer showing the dovetail joints being reglued.',
        label: 'Regluing the drawers',
        caption: 'Workshop, 4:5',
        ratio: '4/5'
      }
    ],
    location: 'Carignan',
    year: '2022',
    challenge: 'The joints were coming apart and two drawers no longer closed, but the client insisted on keeping the soul of the piece intact.',
    solution: 'Complete disassembly, regluing with reversible hide glue, worn runners replaced with period wood, and the shellac revived without stripping.',
    result: 'A dresser working again for another hundred years, with its patina and its whole history intact.',
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-restauration-en' },
    testimonial: { _type: 'reference', _ref: 'testimonial-marie-helene-belanger-en' },
    featured: false,
    order: 5
  },
  {
    _id: 'project-cafe-amenagement-chambly-en',
    _type: 'project',
    language: 'en',
    title: 'Fitting out a neighbourhood café',
    slug: { _type: 'slug', current: 'cafe-millwork-chambly' },
    excerpt: 'A counter, shelving and fixed furniture for an independent café, built for a commercial pace.',
    cover: {
      _type: 'figure',
      image: { _imagePath: '/images/project-cafe-comptoir.jpg' },
      alt: 'Solid wood café counter with matching wall shelves.',
      label: 'Café Le Moulin, Chambly',
      caption: 'Commercial millwork, 16:9',
      ratio: '16/9'
    },
    gallery: [
      {
        _key: 'comptoir-detail',
        _type: 'figure',
        image: { _imagePath: '/images/project-cafe-comptoir-detail.jpg' },
        alt: 'Service counter seen from the side, with a reinforced edge.',
        label: 'Service counter',
        caption: 'Detail, 4:5',
        ratio: '4/5'
      },
      {
        _key: 'tablettes',
        _type: 'figure',
        image: { _imagePath: '/images/project-cafe-tablettes.jpg' },
        alt: 'Wall shelves loaded with mugs and bags of coffee.',
        label: 'Wall shelves',
        caption: 'Detail, 4:5',
        ratio: '4/5'
      }
    ],
    location: 'Chambly',
    year: '2024',
    challenge: 'A counter that had to take hundreds of coffees a day, stand up to commercial cleaners, and set the tone for the whole room.',
    solution: 'An oversized structure, reinforced hardwood edges and a commercial-grade finish, all installed outside opening hours so the launch would not be delayed.',
    result: 'The counter has kept pace since opening day and gives the café a local solid wood signature that customers notice.',
    stats: [
      { _key: 'service', _type: 'projectStat', label: 'Service', value: '300+ coffees a day' },
      { _key: 'pose', _type: 'projectStat', label: 'Install', value: 'Off-peak hours' },
      { _key: 'bois', _type: 'projectStat', label: 'Wood', value: 'Local maple' }
    ],
    detail: projectDetail(),
    service: { _type: 'reference', _ref: 'service-commerces-en' },
    testimonial: { _type: 'reference', _ref: 'testimonial-le-moulin-cafe-en' },
    featured: true,
    order: 6
  }
]
