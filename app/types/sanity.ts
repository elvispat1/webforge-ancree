// Types du payload Sanity BRUT (côté requête), miroirs manuels des projections
// de app/queries/*.ts (pattern référence nuxt-sanity-test, pas de TypeGen).
//
// Distincts des interfaces V1 de app/content/* (côté rendu), qui restent les
// types de SORTIE: la conversion brut -> V1 vit dans app/sanity/transform.ts.
//
// Convention de nullabilité: GROQ retourne `null` pour un champ absent.
//   - Champ requis par le schéma Studio (validation bloquante au publish):
//     typé non nul.
//   - Champ optionnel ou conditionnel: typé `Maybe<T>` (le transform normalise
//     null -> undefined ou applique le défaut).
//
// Aucun import: ce fichier doit rester chargeable par le projet TS node
// (nuxt.config.ts importera RouteSlugs en phase suivante).

/** Champ optionnel côté GROQ: absent (undefined côté TS) ou null (côté wire). */
export type Maybe<T> = T | null | undefined

/** Entrée de traduction d'un doc de collection (translation.metadata du plugin
 *  document-internationalization, projetée par TRANSLATIONS_PROJECTION).
 *  catSlug ne résout que sur les articles (null ailleurs). */
export interface SanityDocTranslation {
  lang: string
  slug: Maybe<string>
  catSlug: Maybe<string>
}

// ── Objets partagés ──────────────────────────────────────────────────────────

/** Figure projetée: asset déjà résolu en URL CDN (`"src": image.asset->url`). */
export interface SanityFigure {
  src: Maybe<string>
  alt: Maybe<string>
  label: string
  caption: string
  ratio: Maybe<string>
}

/** Ref interne d'un link, déréférencée au strict nécessaire du route-map. */
export interface SanityLinkRef {
  _type:
    | 'homePage'
    | 'servicesPage'
    | 'projectsPage'
    | 'aboutPage'
    | 'blogPage'
    | 'faqPage'
    | 'contactPage'
    | 'onePager'
    | 'service'
    | 'project'
    | 'article'
    | 'category'
    | 'legalPage'
  _id: string
  /** Présent sur service, project, article, category; null ailleurs. */
  slug: Maybe<string>
  /** Slug de la catégorie parente; présent seulement sur article avec catégorie. */
  catSlug: Maybe<string>
}

export interface SanityLink {
  label: string
  type: 'internal' | 'external' | 'anchor'
  externalUrl: Maybe<string>
  /** Sans le `#` (convention du schéma link). */
  anchor: Maybe<string>
  /** Requis si type internal; optionnel si anchor (vide = page courante). */
  internalRef: Maybe<SanityLinkRef>
}

export interface SanitySeo {
  title: Maybe<string>
  description: Maybe<string>
  /** URL CDN de l'image de partage (projetée `ogImage.asset->url`). */
  ogImage: Maybe<string>
}

export interface SanityHeroHome {
  kicker: Maybe<string>
  title: string
  lead: string
  primaryCta: SanityLink
  secondaryCta: SanityLink
  meta: Array<{ label: string; value: string }>
  visual: SanityFigure
  visualMobile: SanityFigure
}

export interface SanityPageHero {
  title: string
  lead: Maybe<string>
  cta: Maybe<SanityLink>
  image: Maybe<SanityFigure>
}

/** Bloc héros projeté (HERO_BLOCK_PROJECTION): objet portant `_type`/`_key`,
 *  discriminé par `_type` (le transform mappe vers le `_type` Vue kebab). La
 *  lecture GROQ tolérante (`coalesce(hero[0], hero)`) renvoie UN bloc, jamais un
 *  tableau: l'objet héros actuel, ou le 1er élément du tableau migré. */
export type SanityRawHeroBlock =
  | (SanityBlockBase<'heroHome'> & SanityHeroHome)
  | (SanityBlockBase<'pageHero'> & SanityPageHero)

/** Bandeau CTA: bloc du pageBuilder ET champs dédiés (blogPage, gabarits détail). */
export interface SanityCtaBand {
  title: string
  subtitle: Maybe<string>
  primaryCta: SanityLink
  secondaryCta: Maybe<SanityLink>
}

/** Bloc processus: pageBuilder ET service.detail.process (même type réutilisé). */
export interface SanityProcess {
  eyebrow: Maybe<string>
  heading: Maybe<string>
  lead: Maybe<string>
  cta: Maybe<SanityLink>
  steps: Array<{ title: string; body: string }>
}

// ── Blocs réguliers du pageBuilder (13, union discriminée par _type) ─────────

interface SanityBlockBase<T extends string> {
  _type: T
  _key: string
}

export type SanityAboutBlock = SanityBlockBase<'about'> & {
  eyebrow: string
  heading: string
  body: string[]
  photo: SanityFigure
  figcaption: string
  diffs: Array<{ title: string; body: string }>
}

export type SanityServicesBlock = SanityBlockBase<'services'> & {
  eyebrow: string
  heading: string
  lead: string
  cta: SanityLink
  mode: 'auto' | 'manual'
  /** Slugs des services choisis (mode manual). */
  refs: Maybe<string[]>
  limit: Maybe<number>
}

export type SanityTestimonialsBlock = SanityBlockBase<'testimonials'> & {
  eyebrow: string
  heading: string
  mode: 'featured' | 'service' | 'project' | 'manual'
  /** Slug du service (mode service). */
  service: Maybe<string>
  /** Slug du projet (mode project). */
  project: Maybe<string>
  /** _id des témoignages choisis (mode manual). */
  refs: Maybe<string[]>
  limit: Maybe<number>
}

export type SanityFaqBlock = SanityBlockBase<'faq'> & {
  eyebrow: string
  heading: string
  /** _id des questions choisies: sélection manuelle PURE (spec 4.4), résolue
   *  dans l'ordre de l'array (12.8). Plus de mode ni de limit. */
  refs: Maybe<string[]>
}

export type SanityContactBlock = SanityBlockBase<'contact'> & {
  eyebrow: string
  heading: string
  lead: string
  /** Libellés seulement: les valeurs viennent de siteSettings.contact (join au transform). */
  metaLabels: { phone: string; email: string; address: string; hours: string }
  form: {
    labels: { name: string; email: string; phone: string; message: string }
    errors: { nameRequired: string; emailInvalid: string; privacyRequired: string }
    submit: { idle: string; loading: string }
    /** `body` porte le jeton {email}, remplacé au transform. */
    errorBanner: { title: string; body: string }
    privacy: { text: string; link: SanityLink }
  }
  success: { title: string; body: string }
}

export type SanityMediaTextBlock = SanityBlockBase<'mediaText'> & {
  eyebrow: Maybe<string>
  heading: string
  body: string[]
  mediaSide: 'left' | 'right'
  image: SanityFigure
  cta: Maybe<SanityLink>
}

export type SanityCtaBandBlock = SanityBlockBase<'ctaBand'> & SanityCtaBand

export type SanityProcessBlock = SanityBlockBase<'process'> & SanityProcess

export type SanityStatsBlock = SanityBlockBase<'stats'> & {
  eyebrow: Maybe<string>
  heading: Maybe<string>
  items: Array<{ value: string; label: string }>
}

export type SanityHighlightsBlock = SanityBlockBase<'highlights'> & {
  eyebrow: Maybe<string>
  heading: Maybe<string>
  lead: Maybe<string>
  items: Array<{ icon: Maybe<string>; title: string; body: string }>
}

export type SanityLogosBlock = SanityBlockBase<'logos'> & {
  eyebrow: Maybe<string>
  heading: Maybe<string>
  items: Array<{ label: string }>
}

export type SanityProjectsPreviewBlock = SanityBlockBase<'projectsPreview'> & {
  eyebrow: Maybe<string>
  heading: string
  lead: Maybe<string>
  cta: Maybe<SanityLink>
  mode: 'featured' | 'service' | 'manual'
  /** Slug du service (mode service). */
  service: Maybe<string>
  /** Slugs des projets choisis (mode manual). */
  refs: Maybe<string[]>
  limit: Maybe<number>
}

export type SanityBlogPreviewBlock = SanityBlockBase<'blogPreview'> & {
  eyebrow: Maybe<string>
  heading: string
  lead: Maybe<string>
  cta: Maybe<SanityLink>
  limit: number
}

export type SanityIframeBlock = SanityBlockBase<'iframe'> & {
  url: string
  title: string
  ratio: Maybe<string>
  caption: Maybe<string>
}

export type SanityVideoYoutubeBlock = SanityBlockBase<'videoYoutube'> & {
  /** URL YouTube ou identifiant brut; l'ID 11 car. est extrait au transform. */
  source: string
  posterMode: 'youtube' | 'custom'
  /** Affiche personnalisée (mode 'custom'); null en mode 'youtube'. */
  poster: Maybe<SanityFigure>
  title: Maybe<string>
}

export type SanityRawBlock =
  | SanityAboutBlock
  | SanityServicesBlock
  | SanityTestimonialsBlock
  | SanityFaqBlock
  | SanityContactBlock
  | SanityMediaTextBlock
  | SanityCtaBandBlock
  | SanityProcessBlock
  | SanityStatsBlock
  | SanityHighlightsBlock
  | SanityLogosBlock
  | SanityProjectsPreviewBlock
  | SanityBlogPreviewBlock
  | SanityIframeBlock
  | SanityVideoYoutubeBlock

// ── Blocs d'article (7, union discriminée par _type) ─────────────────────────

/** Block Portable Text projeté au minimum utile (marks aplaties au transform). */
export interface SanityPortableTextBlock {
  _key: string
  /** 'normal' | 'h2' | 'h3' (styles du schéma articlePortableText). */
  style: Maybe<string>
  /** 'bullet' | 'number' quand le block est un item de liste. */
  listItem: Maybe<string>
  children: Maybe<Array<{ text: Maybe<string> }>>
}

export type SanityArticleLeadBlock = SanityBlockBase<'articleLead'> & {
  text: string
}

export type SanityArticleRichTextBlock = SanityBlockBase<'articleRichText'> & {
  body: SanityPortableTextBlock[]
}

export type SanityArticleImageBlock = SanityBlockBase<'articleImage'> & {
  image: SanityFigure
}

export type SanityArticleQuoteBlock = SanityBlockBase<'articleQuote'> & {
  quote: string
  attribution: Maybe<string>
}

export type SanityArticleGalleryBlock = SanityBlockBase<'articleGallery'> & {
  images: SanityFigure[]
}

export type SanityArticleCalloutBlock = SanityBlockBase<'articleCallout'> & {
  tone: Maybe<'note' | 'warning'>
  title: Maybe<string>
  text: string
}

export type SanityArticleInlineCtaBlock = SanityBlockBase<'articleInlineCta'> & {
  text: string
  cta: SanityLink
}

export type SanityRawArticleBlock =
  | SanityArticleLeadBlock
  | SanityArticleRichTextBlock
  | SanityArticleImageBlock
  | SanityArticleQuoteBlock
  | SanityArticleGalleryBlock
  | SanityArticleCalloutBlock
  | SanityArticleInlineCtaBlock

// ── Documents ────────────────────────────────────────────────────────────────

export interface SanitySiteSettings {
  brand: {
    name: string
    /** Asset logo résolu en URL CDN (sans hotspot ni recadrage, spec 12.14). */
    logo: { src: Maybe<string> }
    tagline: string
    foundedYear: number
    homeAriaLabel: string
  }
  contact: {
    /** Téléphone affiché; le format E.164 n'est PAS stocké (dérivé, 12.13). */
    phone: string
    email: string
    address: {
      line1: string
      cityProv: string
      city: string
      region: string
      country: string
      postal: string
    }
    areaServed: string[]
    hours: { weekdays: string; weekend: string }
  }
  nav: {
    /** Liens de type anchor (scrollspy du one-pager). */
    landing: { primary: SanityLink[]; cta: SanityLink }
    /** Liens de type internal (routes). */
    multipage: { primary: SanityLink[]; cta: SanityLink }
  }
  footer: {
    /** Liens principaux du pied (le Footer ne lit plus nav.multipage.primary). */
    primary: SanityLink[]
    socials: Array<{ label: string; href: string; icon: string }>
    /** Optionnels: normalisés en [] au transform (spec section 12.12). */
    utility: Maybe<SanityLink[]>
    pageLinks: Maybe<SanityLink[]>
    /** Garde son jeton {year} (remplacé par Footer.vue, inchangé). */
    copyright: string
    credit: { label: string; studio: string; studioUrl: string; product: string }
  }
  /** SEO globaux (spec 6.1): suffixe de titre + replis description / og:image. */
  seo: {
    titleSuffix: string
    defaultDescription: Maybe<string>
    /** URL CDN de l'image de partage par défaut (projetée asset->url). */
    defaultOgImage: Maybe<string>
  }
}

export interface SanityHomePage {
  hero: SanityRawHeroBlock
  pageBuilder: Maybe<SanityRawBlock[]>
  seo: Maybe<SanitySeo>
}

export interface SanityFixedPage {
  hero: SanityRawHeroBlock
  pageBuilder: Maybe<SanityRawBlock[]>
  seo: Maybe<SanitySeo>
}

/** Copie de la page de détail d'un service (champ `service.detail`, spec 6.10):
 *  chaque document de la collection porte sa propre copie (12.16), plus de
 *  gabarit partagé sur servicesPage. */
export interface SanityServiceDetail {
  benefits: { heading: string; cta: SanityLink }
  included: { heading: string }
  process: SanityProcess
  projects: {
    eyebrow: Maybe<string>
    heading: string
    lead: Maybe<string>
    cta: Maybe<SanityLink>
  }
  testimonials: { eyebrow: string; heading: string }
  cta: SanityCtaBand
}

/** Copie de la page de détail d'un projet (champ `project.detail`, spec 6.11):
 *  même principe que SanityServiceDetail. */
export interface SanityProjectDetail {
  gallery: { heading: string }
  caseStudy: {
    eyebrow: string
    heading: string
    challengeLabel: string
    solutionLabel: string
    resultLabel: string
  }
  testimonial: { eyebrow: string; heading: string }
  similar: {
    eyebrow: Maybe<string>
    heading: string
    lead: Maybe<string>
    cta: Maybe<SanityLink>
  }
  cta: SanityCtaBand
}

export interface SanityBlogPage extends SanityFixedPage {
  listCta: SanityCtaBand
  categoryCta: SanityCtaBand
  articleCta: SanityCtaBand
  related: { heading: string }
}

export interface SanityOnePager {
  hero: SanityRawHeroBlock
  pageBuilder: Maybe<SanityRawBlock[]>
  seo: Maybe<SanitySeo>
}

/** Section de la page FAQ (membre de faqPage.sections, spec 6.7): un thème
 *  déréférencé en titre + slug d'ancre (spec 6.17) et sa sélection de
 *  questions (auto = toutes celles du thème; manual = refs ordonnées). */
export interface SanityFaqPageSection {
  theme: Maybe<{ title: string; slug: string }>
  mode: 'auto' | 'manual'
  /** _id des questions choisies (mode manual), résolues dans l'ordre de
   *  l'array (12.15). Caché (et absent) en mode auto. */
  items: Maybe<string[]>
}

export interface SanityFaqPage extends SanityFixedPage {
  /** Composition du listing groupé de la page FAQ, une section par thème,
   *  dans l'ordre des sections (spec 6.7, 12.15). */
  sections: SanityFaqPageSection[]
}

/** Élément du corps d'une section légale (projection plate _type/text/items). */
export type SanityLegalBlock =
  | { _type: 'legalParagraph'; text: string; items: null }
  | { _type: 'legalList'; text: null; items: string[] }
  | { _type: 'legalTodo'; text: string; items: null }

export interface SanityLegalPage {
  /** Id déterministe du seed: legalPage-<conditions|confidentialite>-<lang>. */
  _id: string
  title: string
  /** Date ISO (YYYY-MM-DD); vide = zone à compléter par le client. */
  effective: Maybe<string>
  updated: Maybe<string>
  sections: Array<{ title: string; body: SanityLegalBlock[] }>
}

// ── Collections ──────────────────────────────────────────────────────────────

export interface SanityService {
  _id: string
  title: string
  slug: string
  summary: string
  meta: string
  image: SanityFigure
  intro: string[]
  benefits: Array<{ title: string; body: string }>
  /** Copie de la page /services/<slug> de CE service (spec 6.10, 12.16).
   *  Maybe: absente en projection carte (preview scopé), présente au build. */
  detail: Maybe<SanityServiceDetail>
  /** Slugs des projets reliés. */
  related: Maybe<string[]>
  translations: Maybe<SanityDocTranslation[]>
}

export interface SanityProject {
  _id: string
  title: string
  slug: string
  excerpt: string
  cover: SanityFigure
  /** Maybe: absente en projection carte (preview scopé), présente au build. */
  gallery: Maybe<SanityFigure[]>
  location: string
  year: string
  challenge: string
  solution: string
  result: string
  stats: Maybe<Array<{ label: string; value: string }>>
  /** Copie de la page /projets/<slug> de CE projet (spec 6.11, 12.16).
   *  Maybe: absente en projection carte (preview scopé), présente au build. */
  detail: Maybe<SanityProjectDetail>
  /** Slug du service rattaché. */
  service: string
  /** _id du témoignage associé. */
  testimonial: Maybe<string>
  featured: Maybe<boolean>
  translations: Maybe<SanityDocTranslation[]>
}

export interface SanityArticle {
  _id: string
  title: string
  slug: string
  excerpt: string
  cover: SanityFigure
  /** Slug de la catégorie (0 ou 1). */
  category: Maybe<string>
  /** Date ISO (YYYY-MM-DD). */
  date: string
  author: string
  readingTime: number
  /** Maybe: absent en projection carte (preview scopé), présent au build.
   *  transformArticleBody tolère déjà null (`?? []`). */
  body: Maybe<SanityRawArticleBlock[]>
  translations: Maybe<SanityDocTranslation[]>
}

export interface SanityCategory {
  title: string
  slug: string
  description: string
  translations: Maybe<SanityDocTranslation[]>
}

export interface SanityTestimonial {
  _id: string
  quote: string
  name: string
  context: string
  /** Slug du service rattaché. */
  service: Maybe<string>
  /** Slug du projet rattaché. */
  project: Maybe<string>
  featured: Maybe<boolean>
}

export interface SanityFaqItem {
  _id: string
  question: string
  answer: string
  /** Slug du faqTheme référencé (projeté theme->slug.current); null sans thème. */
  theme: Maybe<string>
}

// ── Résultats des queries ────────────────────────────────────────────────────

/** Résultat brut de CONTENT_GRAPH_QUERY. Singletons null = seed incomplet
 *  (le transform échoue avec un message clair, jamais un site vide). */
export interface SanityGraph {
  siteSettings: SanitySiteSettings | null
  homePage: SanityHomePage | null
  servicesPage: SanityFixedPage | null
  projectsPage: SanityFixedPage | null
  aboutPage: SanityFixedPage | null
  blogPage: SanityBlogPage | null
  faqPage: SanityFaqPage | null
  contactPage: SanityFixedPage | null
  onePager: SanityOnePager | null
  legalPages: SanityLegalPage[]
  services: SanityService[]
  projects: SanityProject[]
  articles: SanityArticle[]
  categories: SanityCategory[]
  testimonials: SanityTestimonial[]
  faqItems: SanityFaqItem[]
}

/** Entrée de route dynamique (ROUTE_SLUGS_QUERY): slug + traductions, ces
 *  dernières alimentant les alternatives hreflang du sitemap (MAJ-02). */
export interface RouteSlugEntry {
  slug: string
  translations: SanityDocTranslation[] | null
}

/** Résultat brut de ROUTE_SLUGS_QUERY (fermeture de nuxt.config.ts). */
export interface RouteSlugs {
  services: RouteSlugEntry[]
  projects: RouteSlugEntry[]
  articles: Array<RouteSlugEntry & { category: string | null }>
  categories: RouteSlugEntry[]
}
