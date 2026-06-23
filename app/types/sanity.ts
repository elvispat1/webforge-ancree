// Types du payload Sanity BRUT (cote requete): miroirs manuels des projections de
// app/queries/** (la forme EXACTE de ce que CONTENT_GRAPH_QUERY et ROUTE_SLUGS_QUERY
// ramenent). Pas de TypeGen: on modelise a la main pour que le transform reste
// type-safe sans `any`.
//
// Distincts des contrats de app/content/* (cote rendu), qui sont les types de
// SORTIE: la conversion brut -> contenu vit dans app/sanity/transform.ts (qui
// importe ces types). `Maybe<T>` = nullabilite GROQ (null) ou absence (undefined):
// champ requis au schema Studio -> type non nul; champ optionnel/conditionnel ->
// `Maybe<T>` (le transform normalise null -> undefined ou applique le defaut).
//
// Chargeable hors contexte d'alias Nuxt: nuxt.config.ts importe RouteSlugs par
// chemin RELATIF ('./app/types/sanity') et le typecheck du projet node n'a pas
// l'alias `~`. D'ou le seul import, RELATIF, du type Locale (route-map est du TS pur).

import type { Locale } from '../config/route-map'

// ── Nullabilite GROQ ──────────────────────────────────────────────────────────

/** Nullabilite GROQ (null) ou absence (undefined). */
export type Maybe<T> = T | null | undefined

// ── Objets partages ───────────────────────────────────────────────────────────

/** Lien (objet `link`, LINK_PROJECTION): ref interne dereferencee au minimum. */
export interface SanityLinkRef {
  _type:
    | 'homePage' | 'servicesPage' | 'villesPage' | 'aboutPage' | 'blogPage'
    | 'faqPage' | 'contactPage' | 'onePager'
    | 'service' | 'serviceCity' | 'article' | 'category' | 'legalPage'
  _id: string
  slug?: Maybe<string>
  catSlug?: Maybe<string>
}
export interface SanityLink {
  label: string
  // 'tel' = action d'appel: aucune URL saisie, le href tel: est derive en code
  // depuis siteSettings.contact.phone (source unique). Voir resolveLink.
  type: 'internal' | 'anchor' | 'external' | 'tel'
  externalUrl?: Maybe<string>
  anchor?: Maybe<string>
  internalRef?: Maybe<SanityLinkRef>
}

/** Figure (objet `figure`, FIGURE_PROJECTION): asset deja resolu en URL CDN. */
export interface SanityFigure {
  src?: Maybe<string>
  alt?: Maybe<string>
  label?: Maybe<string>
  caption?: Maybe<string>
  ratio?: Maybe<string>
}

/** SEO de page fixe (SEO_PROJECTION). */
export interface SanitySeo {
  title?: Maybe<string>
  description?: Maybe<string>
  ogImage?: Maybe<string>
}

/** Bandeau d'appel (CTA_BAND_PROJECTION). */
export interface SanityCtaBand {
  title: string
  subtitle?: Maybe<string>
  primaryCta: SanityLink
  secondaryCta?: Maybe<SanityLink>
}

/** Bloc processus modelise en place (PROCESS_PROJECTION). */
export interface SanityProcess {
  eyebrow?: Maybe<string>
  heading?: Maybe<string>
  lead?: Maybe<string>
  cta?: Maybe<SanityLink>
  steps?: Maybe<Array<{ title: string; body: string }>>
}

// ── Heros (HERO_BLOCK_PROJECTION, discrimines par `_type`) ────────────────────

/** Heros discrimine par `_type` (HERO_BLOCK_PROJECTION). */
export interface SanityHeroHome {
  _type: 'heroHome'
  _key: string
  kicker?: Maybe<string>
  title: string
  lead: string
  primaryCta: SanityLink
  secondaryCta: SanityLink
  meta?: Maybe<Array<{ icon?: Maybe<string>; value: string; label: string }>>
  visual: SanityFigure
}
export interface SanityPageHero {
  _type: 'pageHero'
  _key: string
  title: string
  lead?: Maybe<string>
  cta?: Maybe<SanityLink>
  image?: Maybe<SanityFigure>
}
export type SanityRawHeroBlock = SanityHeroHome | SanityPageHero

// ── Blocs du pageBuilder (PAGE_BUILDER_PROJECTION, discrimines par `_type`) ────

// Les 8 blocs du pageBuilder (PAGE_BUILDER_PROJECTION), discrimines par `_type`.
export interface SanityTrustBarBlock {
  _type: 'trustBar'
  _key: string
  items?: Maybe<Array<{ icon: string; value: string; label: string }>>
}
export interface SanityServicesBlock {
  _type: 'services'
  _key: string
  eyebrow: string
  heading: string
  lead?: Maybe<string>
  cta?: Maybe<SanityLink>
  mode?: Maybe<'auto' | 'manual'>
  refs?: Maybe<string[]>
  limit?: Maybe<number>
}
export interface SanityServiceCitiesBlock {
  _type: 'serviceCities'
  _key: string
  eyebrow: string
  heading: string
  lead?: Maybe<string>
  areaLabel: string
  areaName: string
  areaNote?: Maybe<string>
  mode?: Maybe<'auto' | 'manual'>
  refs?: Maybe<string[]>
  limit?: Maybe<number>
}
export interface SanityAboutBlock {
  _type: 'about'
  _key: string
  eyebrow?: Maybe<string>
  heading: string
  body?: Maybe<unknown[]>
  photo: SanityFigure
  stats?: Maybe<Array<{ value: string; label: string }>>
}
export interface SanityTestimonialsBlock {
  _type: 'testimonials'
  _key: string
  eyebrow: string
  heading: string
  mode?: Maybe<'featured' | 'service' | 'city' | 'manual'>
  service?: Maybe<string>
  city?: Maybe<string>
  refs?: Maybe<string[]>
  limit?: Maybe<number>
}
export interface SanityFaqBlock {
  _type: 'faq'
  _key: string
  eyebrow?: Maybe<string>
  heading: string
  refs?: Maybe<string[]>
}
export interface SanityCtaBandBlock extends SanityCtaBand {
  _type: 'ctaBand'
  _key: string
}
export interface SanityContactBlock {
  _type: 'contact'
  _key: string
  eyebrow: string
  heading: string
  lead: string
  metaLabels: { phone: string; email: string; address: string; hours: string }
  form: {
    labels: { name: string; email: string; phone: string; message: string }
    errors: { nameRequired: string; emailInvalid: string; privacyRequired: string }
    submit: { idle: string; loading: string }
    errorBanner: { title: string; body: string }
    privacy: { text: string; link: SanityLink }
  }
  success: { title: string; body: string }
}
export type SanityRawBlock =
  | SanityTrustBarBlock
  | SanityServicesBlock
  | SanityServiceCitiesBlock
  | SanityAboutBlock
  | SanityTestimonialsBlock
  | SanityFaqBlock
  | SanityCtaBandBlock
  | SanityContactBlock

// ── Blocs d'article (ARTICLE_BODY_PROJECTION, discrimines par `_type`) ─────────

// Corps d'article (ARTICLE_BODY_PROJECTION), 7 blocs discrimines par `_type`.
export interface SanityRawPortableSpan {
  _key: string
  text?: Maybe<string>
  marks?: Maybe<string[]>
}
export interface SanityRawPortableBlock {
  _key: string
  _type: string
  style?: Maybe<string>
  listItem?: Maybe<string>
  level?: Maybe<number>
  children?: Maybe<SanityRawPortableSpan[]>
  markDefs?: Maybe<Array<{ _key: string; _type: string; href?: Maybe<string> }>>
}
export type SanityRawArticleBlock =
  | { _type: 'articleLead'; _key: string; text: string }
  | { _type: 'articleRichText'; _key: string; body?: Maybe<SanityRawPortableBlock[]> }
  | { _type: 'articleImage'; _key: string; image: SanityFigure }
  | { _type: 'articleQuote'; _key: string; quote: string; attribution?: Maybe<string> }
  | { _type: 'articleGallery'; _key: string; images?: Maybe<SanityFigure[]> }
  | { _type: 'articleCallout'; _key: string; tone?: Maybe<string>; title?: Maybe<string>; text: string }
  | { _type: 'articleInlineCta'; _key: string; text: string; cta: SanityLink }

/** Traductions normalisees (TRANSLATIONS_PROJECTION). */
export interface SanityDocTranslation {
  lang: string
  slug?: Maybe<string>
  catSlug?: Maybe<string>
}

// ── Documents ──────────────────────────────────────────────────────────────────

/** siteSettings FULL (SITE_SETTINGS_PROJECTION). */
export interface SanitySiteSettings {
  brand: {
    name: string
    logo: { src?: Maybe<string> }
    tagline: string
    foundedYear: number
    homeAriaLabel: string
  }
  contact: {
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
    landing: { primary: SanityLink[] }
    multipage: { primary: SanityLink[] }
  }
  footer: {
    primary: SanityLink[]
    utility?: Maybe<SanityLink[]>
    pageLinks?: Maybe<SanityLink[]>
    copyright: string
    credit: { label: string; studio: string; studioUrl: string; product: string }
  }
  socials?: Maybe<Array<{ platform: string; url: string }>>
  seo: {
    titleSuffix: string
    defaultDescription?: Maybe<string>
    defaultOgImage?: Maybe<string>
  }
}

/** Page legale (LEGAL_PROJECTION). Bloc en union discriminee par `_type`:
 *  assertNever garantit l'exhaustivite au transform (fail-fast sur un type inconnu). */
export type SanityLegalBlock =
  | { _type: 'legalParagraph'; text: string }
  | { _type: 'legalList'; items: string[] }
  | { _type: 'legalTodo'; text: string }
export interface SanityLegalPage {
  _id: string
  title: string
  effective?: Maybe<string>
  updated?: Maybe<string>
  sections?: Maybe<Array<{ title: string; body?: Maybe<SanityLegalBlock[]> }>>
}

/** Copie de page de detail d'un service (SERVICE_DETAIL_PROJECTION). */
export interface SanityServiceDetail {
  benefits: { heading: string; cta: SanityLink }
  included: { heading: string }
  process: SanityProcess
  serviceCities: {
    eyebrow?: Maybe<string>
    heading: string
    lead?: Maybe<string>
    cta?: Maybe<SanityLink>
  }
  testimonials: { eyebrow: string; heading: string }
  cta: SanityCtaBand
}

/** Document service (collection `services`). */
export interface SanityService {
  _id: string
  slug: string
  icon?: Maybe<string>
  title: string
  summary?: Maybe<string>
  meta?: Maybe<string>
  image: SanityFigure
  intro?: Maybe<string[]>
  benefits?: Maybe<Array<{ title: string; body: string }>>
  detail?: Maybe<SanityServiceDetail>
  related?: Maybe<string[]>
  featured?: Maybe<boolean>
  order?: Maybe<number>
  translations?: Maybe<SanityDocTranslation[]>
}

/** Document serviceCity (collection `serviceCities`, remplace `projects`). */
export interface SanityServiceCity {
  _id: string
  slug: string
  city: string
  region?: Maybe<string>
  note?: Maybe<string>
  heading?: Maybe<string>
  lead?: Maybe<string>
  body?: Maybe<unknown[]>
  seo?: Maybe<SanitySeo>
  featured?: Maybe<boolean>
  order?: Maybe<number>
  translations?: Maybe<SanityDocTranslation[]>
}

/** Document article (collection `articles`). */
export interface SanityArticle {
  _id: string
  slug: string
  title: string
  excerpt: string
  cover: SanityFigure
  category?: Maybe<{ slug: string; title: string }>
  date: string
  author?: Maybe<string>
  readingTime?: Maybe<number>
  body?: Maybe<SanityRawArticleBlock[]>
  translations?: Maybe<SanityDocTranslation[]>
}

/** Document category (collection `categories`). */
export interface SanityCategory {
  title: string
  slug: string
  description?: Maybe<string>
  translations?: Maybe<SanityDocTranslation[]>
}

/** Document testimonial (collection `testimonials`). */
export interface SanityTestimonial {
  _id: string
  quote: string
  name: string
  context?: Maybe<string>
  service?: Maybe<string>
  city?: Maybe<string>
  featured?: Maybe<boolean>
}

/** Document faqItem (collection `faqItems`). */
export interface SanityFaqItem {
  _id: string
  question: string
  answer: string
  theme?: Maybe<string>
}

// ── Singletons de page ──────────────────────────────────────────────────────────

/** Singleton fixe (hero pageHero + pageBuilder + seo). */
export interface SanityFixedPage {
  hero?: Maybe<SanityRawHeroBlock>
  pageBuilder?: Maybe<SanityRawBlock[]>
  seo?: Maybe<SanitySeo>
}
/** Singleton d'accueil/one-pager (hero heroHome + pageBuilder + seo). */
export interface SanityHomeLikePage {
  hero?: Maybe<SanityRawHeroBlock>
  pageBuilder?: Maybe<SanityRawBlock[]>
  seo?: Maybe<SanitySeo>
}
/** Singleton blog (CTA dediees + related, en plus). */
export interface SanityBlogPage extends SanityFixedPage {
  listCta: SanityCtaBand
  categoryCta: SanityCtaBand
  articleCta: SanityCtaBand
  related: { heading: string }
}
/** Singleton FAQ (sections groupees, en plus). */
export interface SanityFaqPageSection {
  theme?: Maybe<{ title: string; slug: string }>
  mode?: Maybe<'auto' | 'manual'>
  refs?: Maybe<string[]>
}
export interface SanityFaqPage extends SanityFixedPage {
  sections?: Maybe<SanityFaqPageSection[]>
}

// ── Resultats des queries ────────────────────────────────────────────────────

/** Le graphe complet ramene par CONTENT_GRAPH_QUERY ($language). */
export interface SanityGraph {
  siteSettings: Maybe<SanitySiteSettings>
  homePage: Maybe<SanityHomeLikePage>
  servicesPage: Maybe<SanityFixedPage>
  villesPage: Maybe<SanityFixedPage>
  aboutPage: Maybe<SanityFixedPage>
  blogPage: Maybe<SanityBlogPage>
  faqPage: Maybe<SanityFaqPage>
  contactPage: Maybe<SanityFixedPage>
  onePager: Maybe<SanityHomeLikePage>
  legalPages: SanityLegalPage[]
  services: SanityService[]
  serviceCities: SanityServiceCity[]
  articles: SanityArticle[]
  categories: SanityCategory[]
  testimonials: SanityTestimonial[]
  faqItems: SanityFaqItem[]
}

// ── Slugs des routes dynamiques (ROUTE_SLUGS_QUERY, fermeture de nuxt.config.ts) ──
// Slug par langue: serviceCity partage son slug fr/en; service porte un slug TRADUIT
// par langue (slugByLang suit translation.metadata pour l'alternate hreflang).

export interface SlugRef { slug: string }
export interface ArticleSlugRef extends SlugRef { category: string | null }
export interface SlugByLang { lang: Locale; slug: string | null }
export interface ServiceSlugRef extends SlugRef { slugByLang: SlugByLang[] | null }
export interface RouteSlugs {
  articles: ArticleSlugRef[]
  categories: SlugRef[]
  cities: SlugRef[]
  services: ServiceSlugRef[]
}
