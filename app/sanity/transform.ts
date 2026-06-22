// Transformation du payload Sanity brut vers le modele de contenu d'Ancree.
//
// Couche PURE: aucun import Nuxt runtime, importable en test et depuis la
// fermeture de nuxt.config.ts (d'ou les imports RELATIFS partout). Les composants
// ne voient JAMAIS le brut: images en `src` string, `_type` Vue kebab-case, liens
// en `href` string.
//
// Architecture portee 1:1 de webforge-minimaliste (app/sanity/transform.ts); la
// LOGIQUE metier des 8 blocs vient de l'ancien app/sanity/content.ts (transformHome),
// reshapee dans cette architecture. La PEAU est intouchable: la sortie de
// resolveBlocks (cote composable) doit matcher app/types/blocks.ts AU CHAMP PRES.
//
// POSTURE FAIL-FAST (decision Charles, renverse la discipline 3 historique): le
// transform THROW si un singleton ou un hero manque (requireDoc / requireHero), et
// assertNever garantit l'exhaustivite des switchs de blocs. AUCUN repli fixtures
// runtime ici: un generate sans contenu doit echouer, jamais produire un site vide.
//
// Familly Ancree (vs Minimaliste): pas de doc-type project; serviceCity (les villes
// desservies) est le moteur SEO local et remplace projects. Le parametre GROQ est
// $language partout. La SEO d'une ville vient de l'objet `seo` (title/description/
// ogImage), pas de seoTitle/seoDescription. `article.category` est un objet
// {slug,title} dereference, `readingTime` le nom du champ.
//
// Blocs intelligents (services, serviceCities, testimonials, faq): le payload les
// garde SEMI-resolus (copie transformee SANS items + parametres de selection). La
// resolution des items vit dans resolveBlocks (couche composable), qui reutilise
// les collections du payload. Les 4 blocs autonomes (trustBar, about, cta-band,
// contact) sortent deja dans leur forme finale.

import { routePath, onePagerPath, serviceCityPath, legalRouteKeyForId } from '../config/route-map'
import { SOCIAL_PLATFORMS, type SocialPlatform } from '../config/socials'
import type { SiteContent } from '../content/site'
import type { LegalBlock, LegalDoc, LegalContent } from '../content/legal'
import type { HeroContent, HeroPageContent } from '../content/hero'
import type {
  TrustBarContent,
  ServicesContent,
  ServiceCitiesContent
} from '../content/blocks'
import type { AboutContent } from '../content/about'
import type { TestimonialsContent } from '../content/testimonials'
import type { FaqContent } from '../content/faq'
import type { CtaBandContent } from '../content/cta-band'
import type { ContactContent } from '../content/contact'
import type { ProcessContent } from '../content/process'
import type { CategoryContent } from '../content/blog'
import type { ArticleContent } from '../content/article'
import type {
  ArticleFigure,
  PortableTextBlock
} from '../content/article-blocks'
import type {
  BlockBase,
  TrustBarBlock,
  AboutBlock,
  CtaBandBlock,
  ContactBlock,
  HeroHomeBlock,
  HeroPageBlock,
  HeroBlock,
  ArticleBlock
} from '../types/blocks'

// ── Locale ───────────────────────────────────────────────────────────────────

export type WfLocale = 'fr' | 'en'

// ── Types du graphe Sanity brut (cale sur les projections deja ecrites) ──────
//
// app/queries/** definit la forme EXACTE de ce que CONTENT_GRAPH_QUERY ramene.
// On la modelise ici (Ancree n'a pas de app/types/sanity.ts) pour que le transform
// reste type-safe sans `any`. `Maybe<T>` = nullabilite GROQ (null) ou absence.

type Maybe<T> = T | null | undefined

/** Lien (objet `link`, LINK_PROJECTION): ref interne dereferencee au minimum. */
interface SanityLinkRef {
  _type:
    | 'homePage' | 'servicesPage' | 'villesPage' | 'aboutPage' | 'blogPage'
    | 'faqPage' | 'contactPage' | 'onePager'
    | 'service' | 'serviceCity' | 'article' | 'category' | 'legalPage'
  _id: string
  slug?: Maybe<string>
  catSlug?: Maybe<string>
}
interface SanityLink {
  label: string
  type: 'internal' | 'anchor' | 'external'
  externalUrl?: Maybe<string>
  anchor?: Maybe<string>
  internalRef?: Maybe<SanityLinkRef>
}

/** Figure (objet `figure`, FIGURE_PROJECTION): asset deja resolu en URL CDN. */
interface SanityFigure {
  src?: Maybe<string>
  alt?: Maybe<string>
  label?: Maybe<string>
  caption?: Maybe<string>
  ratio?: Maybe<string>
}

/** SEO de page fixe (SEO_PROJECTION). */
interface SanitySeo {
  title?: Maybe<string>
  description?: Maybe<string>
  ogImage?: Maybe<string>
}

/** Bandeau d'appel (CTA_BAND_PROJECTION). */
interface SanityCtaBand {
  title: string
  subtitle?: Maybe<string>
  primaryCta: SanityLink
  secondaryCta?: Maybe<SanityLink>
}

/** Bloc processus modelise en place (PROCESS_PROJECTION). */
interface SanityProcess {
  eyebrow?: Maybe<string>
  heading?: Maybe<string>
  lead?: Maybe<string>
  cta?: Maybe<SanityLink>
  steps?: Maybe<Array<{ title: string; body: string }>>
}

/** Heros discrimine par `_type` (HERO_BLOCK_PROJECTION). */
interface SanityHeroHome {
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
interface SanityPageHero {
  _type: 'pageHero'
  _key: string
  title: string
  lead?: Maybe<string>
  cta?: Maybe<SanityLink>
  image?: Maybe<SanityFigure>
}
type SanityRawHeroBlock = SanityHeroHome | SanityPageHero

// Les 8 blocs du pageBuilder (PAGE_BUILDER_PROJECTION), discrimines par `_type`.
interface SanityTrustBarBlock {
  _type: 'trustBar'
  _key: string
  items?: Maybe<Array<{ icon: string; value: string; label: string }>>
}
interface SanityServicesBlock {
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
interface SanityServiceCitiesBlock {
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
interface SanityAboutBlock {
  _type: 'about'
  _key: string
  eyebrow?: Maybe<string>
  heading: string
  body?: Maybe<unknown[]>
  photo: SanityFigure
  stats?: Maybe<Array<{ value: string; label: string }>>
}
interface SanityTestimonialsBlock {
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
interface SanityFaqBlock {
  _type: 'faq'
  _key: string
  eyebrow?: Maybe<string>
  heading: string
  refs?: Maybe<string[]>
}
interface SanityCtaBandBlock extends SanityCtaBand {
  _type: 'ctaBand'
  _key: string
}
interface SanityContactBlock {
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
type SanityRawBlock =
  | SanityTrustBarBlock
  | SanityServicesBlock
  | SanityServiceCitiesBlock
  | SanityAboutBlock
  | SanityTestimonialsBlock
  | SanityFaqBlock
  | SanityCtaBandBlock
  | SanityContactBlock

// Corps d'article (ARTICLE_BODY_PROJECTION), 7 blocs discrimines par `_type`.
interface SanityRawPortableSpan {
  _key: string
  text?: Maybe<string>
  marks?: Maybe<string[]>
}
interface SanityRawPortableBlock {
  _key: string
  _type: string
  style?: Maybe<string>
  listItem?: Maybe<string>
  level?: Maybe<number>
  children?: Maybe<SanityRawPortableSpan[]>
  markDefs?: Maybe<Array<{ _key: string; _type: string; href?: Maybe<string> }>>
}
type SanityRawArticleBlock =
  | { _type: 'articleLead'; _key: string; text: string }
  | { _type: 'articleRichText'; _key: string; body?: Maybe<SanityRawPortableBlock[]> }
  | { _type: 'articleImage'; _key: string; image: SanityFigure }
  | { _type: 'articleQuote'; _key: string; quote: string; attribution?: Maybe<string> }
  | { _type: 'articleGallery'; _key: string; images?: Maybe<SanityFigure[]> }
  | { _type: 'articleCallout'; _key: string; tone?: Maybe<string>; title?: Maybe<string>; text: string }
  | { _type: 'articleInlineCta'; _key: string; text: string; cta: SanityLink }

/** Traductions normalisees (TRANSLATIONS_PROJECTION). */
interface SanityDocTranslation {
  lang: string
  slug?: Maybe<string>
  catSlug?: Maybe<string>
}

/** siteSettings FULL (SITE_SETTINGS_PROJECTION). */
interface SanitySiteSettings {
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
    landing: { primary: SanityLink[]; cta: SanityLink }
    multipage: { primary: SanityLink[]; cta: SanityLink }
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
type SanityLegalBlock =
  | { _type: 'legalParagraph'; text: string }
  | { _type: 'legalList'; items: string[] }
  | { _type: 'legalTodo'; text: string }
interface SanityLegalPage {
  _id: string
  title: string
  effective?: Maybe<string>
  updated?: Maybe<string>
  sections?: Maybe<Array<{ title: string; body?: Maybe<SanityLegalBlock[]> }>>
}

/** Copie de page de detail d'un service (SERVICE_DETAIL_PROJECTION). */
interface SanityServiceDetail {
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
interface SanityService {
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
interface SanityServiceCity {
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
interface SanityArticle {
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
interface SanityCategory {
  title: string
  slug: string
  description?: Maybe<string>
  translations?: Maybe<SanityDocTranslation[]>
}

/** Document testimonial (collection `testimonials`). */
interface SanityTestimonial {
  _id: string
  quote: string
  name: string
  context?: Maybe<string>
  service?: Maybe<string>
  city?: Maybe<string>
  featured?: Maybe<boolean>
}

/** Document faqItem (collection `faqItems`). */
interface SanityFaqItem {
  _id: string
  question: string
  answer: string
  theme?: Maybe<string>
}

/** Singleton fixe (hero pageHero + pageBuilder + seo). */
interface SanityFixedPage {
  hero?: Maybe<SanityRawHeroBlock>
  pageBuilder?: Maybe<SanityRawBlock[]>
  seo?: Maybe<SanitySeo>
}
/** Singleton d'accueil/one-pager (hero heroHome + pageBuilder + seo). */
interface SanityHomeLikePage {
  hero?: Maybe<SanityRawHeroBlock>
  pageBuilder?: Maybe<SanityRawBlock[]>
  seo?: Maybe<SanitySeo>
}
/** Singleton blog (CTA dediees + related, en plus). */
interface SanityBlogPage extends SanityFixedPage {
  listCta: SanityCtaBand
  categoryCta: SanityCtaBand
  articleCta: SanityCtaBand
  related: { heading: string }
}
/** Singleton FAQ (sections groupees, en plus). */
interface SanityFaqPageSection {
  theme?: Maybe<{ title: string; slug: string }>
  mode?: Maybe<'auto' | 'manual'>
  refs?: Maybe<string[]>
}
interface SanityFaqPage extends SanityFixedPage {
  sections?: Maybe<SanityFaqPageSection[]>
}

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

// ── Modele du payload (sortie de transformGraph) ─────────────────────────────

/** SEO final d'une page fixe: replis (titre/lead du hero, defaut des globales)
 *  deja resolus. `image` = URL CDN de l'ogImage si fournie. */
export interface PageSeo {
  title: string
  description: string
  image?: string
}

// Parametres de selection des blocs intelligents, tels que stockes au Studio. La
// resolution des items (contre les collections) vit dans resolveBlocks.
export interface ServicesSelection {
  mode: 'auto' | 'manual'
  /** Slugs des services choisis (mode manual). */
  refs: string[]
  limit?: number
}
export interface ServiceCitiesSelection {
  mode: 'auto' | 'manual'
  /** Slugs des villes choisies (mode manual). */
  refs: string[]
  limit?: number
}
export interface TestimonialsSelection {
  // Mode `city` (ref serviceCity) remplace le `project` de Minimaliste.
  mode: 'featured' | 'service' | 'city' | 'manual'
  /** Slug du service (mode service). */
  service?: string
  /** Slug de la ville (mode city). */
  city?: string
  /** Ids (_id Sanity) des temoignages choisis (mode manual). */
  refs: string[]
  limit?: number
}
export interface FaqSelection {
  /** Ids (_id Sanity) des questions choisies: selection manuelle PURE, resolue
   *  dans l'ordre de l'array par resolveBlocks. */
  refs: string[]
}

// Blocs intelligents semi-resolus: copie transformee (SANS items/cities) +
// selection. resolveBlocks (couche composable) produit le PageBlock final
// (app/types/blocks.ts). Chaque `_type` n'apparait qu'une fois: discrimination sure.
export type PendingServicesBlock = BlockBase<'services'> &
  Omit<ServicesContent, 'items'> & { selection: ServicesSelection }
export type PendingServiceCitiesBlock = BlockBase<'service-cities'> &
  Omit<ServiceCitiesContent, 'cities'> & { selection: ServiceCitiesSelection }
export type PendingTestimonialsBlock = BlockBase<'testimonials'> &
  Omit<TestimonialsContent, 'items'> & { selection: TestimonialsSelection }
export type PendingFaqBlock = BlockBase<'faq'> &
  Omit<FaqContent, 'items'> & { selection: FaqSelection }

/**
 * Bloc du payload: union discriminee par `_type` Vue (kebab-case). Les 4 blocs
 * autonomes sortent deja dans leur forme finale (app/types/blocks.ts); les 4 blocs
 * intelligents sortent en forme « pending » (selection a resoudre).
 */
export type PayloadPageBlock =
  | TrustBarBlock
  | AboutBlock
  | CtaBandBlock
  | ContactBlock
  | PendingServicesBlock
  | PendingServiceCitiesBlock
  | PendingTestimonialsBlock
  | PendingFaqBlock

/** Traduction d'un doc de collection, normalisee (slug de l'autre langue;
 *  catSlug seulement sur les articles). Sert le switcher de langue et
 *  setI18nParams sur les pages detail. */
export interface DocTranslation {
  lang: WfLocale
  slug?: string
  catSlug?: string
}

/** Extension additive: les docs de collection portent leurs traductions. */
export type Translated<T> = T & { translations?: DocTranslation[] }

/** Bloc processus du payload (champ dedie service.detail.process). Etend
 *  ProcessContent (la numerotation des etapes reste derivee au rendu). */
export type ProcessPayload = ProcessContent

/** Copie de la page de detail d'un service, composee section par section. Reflete
 *  SERVICE_DETAIL_PROJECTION; portee par CHAQUE document service (12.16). */
export interface ServiceDetailPayload {
  benefits: { heading: string; cta: { label: string; href: string } }
  included: { heading: string }
  process: ProcessPayload
  serviceCities: {
    eyebrow?: string
    heading: string
    lead?: string
    ctaLabel?: string
    ctaHref?: string
  }
  testimonials: { eyebrow: string; heading: string }
  cta: CtaBandContent
}

/** Service du payload: identite + carte + copie de SA page de detail + traductions.
 *  `detail` optionnel: en preview scope, les services NON courants sortent en carte
 *  sans leur copie de page. En prod statique, detail est toujours fourni. */
export interface ServicePayload {
  _id: string
  slug: string
  icon?: string
  title: string
  summary?: string
  meta?: string
  /** Image en src string (contrat des blocs); figure sans image -> '' (placeholder). */
  image: string
  /** Meta de figure (alt/label/caption) pour serviceImage() cote composable. */
  imageMeta: { alt: string; label: string; caption: string }
  intro?: string[]
  benefits: Array<{ title: string; body: string }>
  detail?: ServiceDetailPayload
  related: string[]
  featured?: boolean
  order?: number
}
export type ServiceWithMeta = Translated<ServicePayload>

/** Ville desservie du payload: la page service-ville (remplace le projet). Le corps
 *  (`body`) et la `seo` ne sortent que pour l'item de detail courant en preview. */
export interface ServiceCityPayload {
  _id: string
  slug: string
  city: string
  region?: string
  note?: string
  heading?: string
  lead?: string
  body?: string[]
  seo?: PageSeo
  featured?: boolean
  order?: number
}
export type ServiceCityWithDetail = Translated<ServiceCityPayload>

export interface HomePagePayload {
  pageBuilder: PayloadPageBlock[]
  seo: PageSeo
}
export interface FixedPagePayload {
  hero: HeroPageBlock
  pageBuilder: PayloadPageBlock[]
  seo: PageSeo
}
/** Section de la page FAQ: un theme (titre + slug d'ancre) et sa selection de
 *  questions, SEMI-resolue (useFaqByTheme resout les items contre la banque). */
export interface FaqPageSection {
  /** Absent = cas Studio degrade (le schema exige le theme). */
  theme?: { title: string; slug: string }
  mode: 'auto' | 'manual'
  /** Ids (_id Sanity) des questions choisies (mode manual). */
  refs: string[]
}
export interface FaqPagePayload extends FixedPagePayload {
  sections: FaqPageSection[]
}
/** Page blog: les CTA reutilisables (liste/categorie/article) et le titre de la
 *  section « a lire aussi », en plus du squelette de page fixe. */
export interface BlogPagePayload extends FixedPagePayload {
  listCta: CtaBandContent
  categoryCta: CtaBandContent
  articleCta: CtaBandContent
  related: { heading: string }
}
export interface OnePagerPayload {
  pageBuilder: PayloadPageBlock[]
  seo: PageSeo
}

/** Contrats legaux (LegalBlock union, LegalDoc, LegalContent): relocalises dans
 *  app/content/legal.ts (avec la doctrine du gabarit reutilisable), importes ici. */

/** Le modele de contenu complet, fetche et transforme une fois par langue. */
export interface ContentPayload {
  /** Globales du site, forme monolithique SiteContent (miroir 1:1 de Minimaliste):
   *  brand, contact NAP imbriquee (phoneE164 derive), nav, footer, socials et seo.
   *  Source unique de l'En-tete, du Menu mobile, du Pied de page et de usePageSeo. */
  site: SiteContent
  legal: LegalContent
  heroes: {
    home: HeroHomeBlock
    onePager: HeroHomeBlock
  }
  pages: {
    home: HomePagePayload
    services: FixedPagePayload
    villes: FixedPagePayload
    about: FixedPagePayload
    blog: BlogPagePayload
    faq: FaqPagePayload
    contact: FixedPagePayload
    onePager: OnePagerPayload
  }
  collections: {
    services: ServiceWithMeta[]
    serviceCities: ServiceCityWithDetail[]
    articles: Translated<ArticleContent>[]
    categories: Translated<CategoryContent>[]
    testimonials: TestimonialPayload[]
    faqItems: FaqItemPayload[]
  }
}

/** Temoignage du payload: id = _id Sanity (les refs manuelles pointent ces _id).
 *  Cle `city` (ref serviceCity), PAS `project`. */
export interface TestimonialPayload {
  id: string
  quote: string
  name: string
  /** Mention de lieu lisible (« Propriétaire à Laval »), AFFICHÉE sous le nom.
   *  Distincte de `city` (slug serviceCity, sert au filtre des blocs). */
  context?: string
  service?: string
  city?: string
  featured?: boolean
}
/** Question FAQ du payload: id = _id Sanity, theme = slug du faqTheme reference. */
export interface FaqItemPayload {
  id: string
  q: string
  a: string
  theme?: string
}

// ── Helpers generiques ────────────────────────────────────────────────────────

/** Garde d'exhaustivite: un cas non couvert casse la compilation, jamais le rendu. */
function assertNever(value: never): never {
  throw new Error(`Cas non couvert par la transformation Sanity: ${JSON.stringify(value)}`)
}

/** Normalise la nullabilite GROQ (null) vers l'optionnalite (undefined). */
function opt<T>(value: Maybe<T>): T | undefined {
  return value ?? undefined
}

/**
 * Stega: en preview, le client Sanity encode des caracteres invisibles APRES
 * chaque chaine (overlays clic-pour-editer). Sans effet sur une valeur AFFICHEE;
 * sur une valeur de LOGIQUE (mode compare, slug servant de cle/filtre/href, code de
 * langue) ils cassent l'egalite stricte et les URLs. On les retire donc des chaines
 * NON affichees. No-op en prod (aucun stega) et hors preview.
 */
const STEGA_RE = /[\u200B\u200C\u200D\u2060\u2061\u2062\u2063\uFEFF\u{1D173}-\u{1D17A}]/gu

function cleanLogic<T extends string | null | undefined>(value: T): T {
  return (typeof value === 'string' ? value.replace(STEGA_RE, '') : value) as T
}

/** Coerce un tableau de contenu en paragraphes texte. Accepte des chaines ou des
 *  blocs Portable Text { children:[{text}] } / { text }. Repris de l'ancien
 *  content.ts (corps de about / serviceCity). */
function toParagraphs(arr: Maybe<unknown[]>): string[] {
  if (!Array.isArray(arr)) return []
  return arr
    .map((item): string => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        const o = item as { text?: unknown; children?: unknown }
        if (typeof o.text === 'string') return o.text
        if (Array.isArray(o.children)) {
          return o.children.map((c) => (c as { text?: string })?.text ?? '').join('')
        }
      }
      return ''
    })
    .filter((s) => s.length > 0)
}

function requireDoc<T>(doc: Maybe<T>, name: string): T {
  if (!doc) {
    throw new Error(
      `Document Sanity « ${name} » introuvable (seed incomplet ou langue manquante): generate interrompu.`
    )
  }
  return doc
}

// ── Mapping des _type (camelCase Sanity -> kebab Vue) ─────────────────────────

const PAGE_BLOCK_TYPE_MAP = {
  trustBar: 'trust-bar',
  services: 'services',
  serviceCities: 'service-cities',
  about: 'about',
  testimonials: 'testimonials',
  faq: 'faq',
  ctaBand: 'cta-band',
  contact: 'contact'
} as const

const ARTICLE_BLOCK_TYPE_MAP = {
  articleLead: 'lead',
  articleRichText: 'rich-text',
  articleImage: 'image',
  articleQuote: 'quote',
  articleGallery: 'gallery',
  articleCallout: 'callout',
  articleInlineCta: 'inline-cta'
} as const

const HERO_BLOCK_TYPE_MAP = { heroHome: 'hero-home', pageHero: 'hero-page' } as const

/** `_type` Sanity (camelCase) -> `_type` Vue (kebab-case). Restreint aux 8 blocs
 *  de page + 7 blocs d'article + 2 heros. Inconnu = erreur immediate (un nouveau
 *  bloc au Studio exige son pendant Vue). */
export function mapBlockType(sanityType: string): string {
  const maps: Record<string, string> = {
    ...PAGE_BLOCK_TYPE_MAP,
    ...ARTICLE_BLOCK_TYPE_MAP,
    ...HERO_BLOCK_TYPE_MAP
  }
  const mapped = maps[sanityType]
  if (!mapped) {
    throw new Error(`_type Sanity sans equivalent Vue: « ${sanityType} »`)
  }
  return mapped
}

/** Cle d'ancrage stable par type de bloc: les ancres de section (#services...
 *  #contact) doivent rester coherentes avec la nav. Sanity stocke des _key opaques;
 *  on les remappe pour que tout ancrage resolve. A PRESERVER. */
const ANCHOR_KEY: Record<SanityRawBlock['_type'], string> = {
  trustBar: 'trust',
  services: 'services',
  serviceCities: 'cities',
  about: 'about',
  testimonials: 'testimonials',
  faq: 'faq',
  ctaBand: 'cta-band',
  contact: 'contact'
}

// ── Liens, localises (prefixe /en inclus en EN via le route-map) ──────────────

/** Route d'un document reference. Jamais vers project (abandonne): serviceCity
 *  prend sa place. Exporte: les composables de resolution de lien s'appuient
 *  dessus, AUCUNE duplication du mapping _type -> route ailleurs. */
export function docPath(ref: SanityLinkRef, locale: WfLocale): string {
  const requireSlug = (): string => {
    if (!ref.slug) {
      throw new Error(`Reference ${ref._type} sans slug (id ${ref._id}): lien irresoluble`)
    }
    return cleanLogic(ref.slug)
  }
  switch (ref._type) {
    case 'homePage':
      return routePath('home', locale)
    case 'servicesPage':
      return routePath('services', locale)
    case 'villesPage':
      return routePath('villes', locale)
    case 'aboutPage':
      return routePath('about', locale)
    case 'blogPage':
      return routePath('blog', locale)
    case 'faqPage':
      return routePath('faq', locale)
    case 'contactPage':
      return routePath('contact', locale)
    case 'onePager':
      return onePagerPath('index', locale)
    case 'service':
      return `${routePath('services', locale)}/${requireSlug()}`
    case 'serviceCity':
      // Segment parent localise (/villes vs /service-areas), slug partage.
      return serviceCityPath(requireSlug(), locale)
    case 'article': {
      // La categorie determine le segment parent: /blog/<cat>/<slug> ou /blog/<slug>.
      const cat = cleanLogic(ref.catSlug)
      return cat
        ? `${routePath('blog', locale)}/${cat}/${requireSlug()}`
        : `${routePath('blog', locale)}/${requireSlug()}`
    }
    case 'category':
      return `${routePath('blog', locale)}/${requireSlug()}`
    case 'legalPage': {
      // Pas de slug sur legalPage: routage par _id deterministe du seed.
      const key = legalRouteKeyForId(ref._id)
      if (key) return routePath(key, locale)
      throw new Error(`Page legale inconnue (id ${ref._id}): lien irresoluble`)
    }
    default:
      return assertNever(ref._type)
  }
}

/**
 * `link` Sanity -> href string, localise. internal = route du doc; anchor =
 * `#ancre` (ou `/route#ancre` si une page est referencee); external = URL telle
 * quelle. Un lien irresoluble interrompt le build: jamais de lien mort silencieux.
 */
export function resolveLink(link: SanityLink, locale: WfLocale): string {
  switch (link.type) {
    case 'external': {
      if (!link.externalUrl) {
        throw new Error(`Lien externe sans URL: « ${link.label} »`)
      }
      return link.externalUrl
    }
    case 'anchor': {
      const hash = `#${cleanLogic(link.anchor) ?? ''}`
      return link.internalRef ? `${docPath(link.internalRef, locale)}${hash}` : hash
    }
    case 'internal': {
      if (!link.internalRef) {
        throw new Error(`Lien interne sans reference (publiee): « ${link.label} »`)
      }
      return docPath(link.internalRef, locale)
    }
    default:
      return assertNever(link.type)
  }
}

/** Couple { label, href } des CTA. */
function linkPair(link: SanityLink, locale: WfLocale): { label: string; href: string } {
  return { label: link.label, href: resolveLink(link, locale) }
}

// ── Figures ───────────────────────────────────────────────────────────────────

export interface ResolvedFigure {
  ratio: string
  src?: string
  alt: string
  label: string
  caption: string
}

// Ratios par defaut par usage, cales sur les valeurs dominantes d'Ancree. Le seed
// stocke toujours le ratio explicite: ces defauts servent le contenu cree ensuite
// au Studio (les interfaces front exigent un ratio string).
export const RATIOS = {
  heroVisual: '16/9',
  heroVisualMobile: '4/5',
  pageHero: '2/1',
  aboutPhoto: '3/4',
  serviceImage: '4/3',
  articleCover: '16/9',
  articleImage: '4/3',
  articleGalleryItem: '4/3'
} as const

/**
 * `figure` Sanity -> figure resolue. `src` absent (figure sans image) reste absent:
 * le fragment <Image> rend son placeholder soigne, jamais une 404. Le ratio devient
 * une valeur CSS: en preview le stega y colle des caracteres invisibles qui la
 * rendent invalide; on ne garde que chiffres, / et . (no-op en prod).
 */
export function resolveFigure(figure: Maybe<SanityFigure>, defaultRatio: string): ResolvedFigure {
  const f = figure ?? {}
  return {
    ratio: (f.ratio ?? defaultRatio).replace(/[^0-9/.]/g, '') || defaultRatio,
    src: opt(f.src),
    alt: f.alt ?? '',
    label: f.label ?? '',
    caption: f.caption ?? ''
  }
}

/** Figure d'article (ArticleFigure: src/alt/caption?). src absent -> '' (le bloc
 *  image/galerie rend son placeholder). */
function resolveArticleFigure(figure: Maybe<SanityFigure>): ArticleFigure {
  const f = figure ?? {}
  return {
    src: opt(f.src) ?? '',
    alt: f.alt ?? '',
    caption: opt(f.caption)
  }
}

// ── Portable Text (texte riche d'article) ─────────────────────────────────────

/**
 * Portable Text Sanity -> PortableTextBlock[] du contrat article-blocks. Ancree
 * garde la forme Portable Text RICHE (le bloc Vue rich-text serialise titres,
 * listes, gras/italique et liens), contrairement a Minimaliste qui aplatit en
 * RichTextEntry. On normalise simplement la nullabilite GROQ.
 */
export function ptToRichTextEntries(blocks: Maybe<SanityRawPortableBlock[]>): PortableTextBlock[] {
  return (blocks ?? []).map((b) => {
    const style = (b.style === 'h2' || b.style === 'h3' ? b.style : 'normal') as PortableTextBlock['style']
    const out: PortableTextBlock = {
      _type: 'block',
      _key: b._key,
      style,
      children: (b.children ?? []).map((c) => ({
        _type: 'span' as const,
        _key: c._key,
        text: c.text ?? '',
        marks: opt(c.marks)
      }))
    }
    if (b.listItem === 'bullet' || b.listItem === 'number') out.listItem = b.listItem
    if (typeof b.level === 'number') out.level = b.level
    if (b.markDefs && b.markDefs.length) {
      out.markDefs = b.markDefs.map((m) => ({
        _key: m._key,
        _type: 'link' as const,
        href: m.href ?? ''
      }))
    }
    return out
  })
}

// ── Dates legales ──────────────────────────────────────────────────────────────

/** Date ISO (YYYY-MM-DD) -> date longue localisee (« 1er janvier 2026 » en fr-CA).
 *  Champ vide -> jeton todo encadre par le gabarit legal-page. */
export function formatLegalDate(date: Maybe<string>, locale: WfLocale, emptyToken: string): string {
  if (!date) return emptyToken
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return emptyToken
  const formatted = new Intl.DateTimeFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(year, month - 1, day)))
  return locale === 'en' ? formatted : formatted.replace(/^1 /, '1er ')
}

const LEGAL_DATE_TODO: Record<WfLocale, { effective: string; updated: string }> = {
  fr: {
    effective: "[date d'entree en vigueur, ex. 1er janvier 2026]",
    updated: '[date de derniere mise a jour, ex. 1er janvier 2026]'
  },
  en: {
    effective: '[effective date, e.g. January 1, 2026]',
    updated: '[last updated date, e.g. January 1, 2026]'
  }
}

// ── Briques partagees ──────────────────────────────────────────────────────────

function transformCtaBand(raw: SanityCtaBand, locale: WfLocale): CtaBandContent {
  return {
    title: raw.title,
    subtitle: opt(raw.subtitle),
    primaryCta: linkPair(raw.primaryCta, locale),
    secondaryCta: raw.secondaryCta ? linkPair(raw.secondaryCta, locale) : undefined
  }
}

/** Bloc processus (champ dedie service.detail.process). eyebrow/heading exiges par
 *  ProcessContent: replis sur '' si absents du Studio (cas degrade). */
function transformProcess(raw: SanityProcess, locale: WfLocale): ProcessPayload {
  return {
    eyebrow: raw.eyebrow ?? '',
    heading: raw.heading ?? '',
    lead: opt(raw.lead),
    steps: (raw.steps ?? []).map((step) => ({
      // Icone d'etape non saisie au Studio (le schema processus n'a pas d'icone
      // par etape): le bloc Vue rend l'index de la ligne d'horizon. Repli vide.
      icon: '',
      title: step.title,
      body: step.body
    }))
  }
}

// ── Heros ───────────────────────────────────────────────────────────────────

function transformHeroHomeBody(raw: SanityHeroHome, locale: WfLocale): HeroContent {
  const visual = resolveFigure(raw.visual, RATIOS.heroVisual)
  return {
    kicker: opt(raw.kicker),
    title: raw.title,
    lead: raw.lead,
    primaryCta: linkPair(raw.primaryCta, locale),
    secondaryCta: linkPair(raw.secondaryCta, locale),
    meta: (raw.meta ?? []).map((m) => ({ value: m.value, label: m.label, icon: opt(m.icon) })),
    visual,
    // Cadrage mobile derive de la meme image (paysage 4/5); le seed n'a qu'un visuel.
    visualMobile: { ...visual, ratio: RATIOS.heroVisualMobile }
  }
}

function transformPageHeroBody(raw: SanityPageHero, locale: WfLocale): HeroPageContent {
  return {
    title: raw.title,
    lead: opt(raw.lead),
    cta: raw.cta ? linkPair(raw.cta, locale) : undefined
    // crumbs: composes par la page (route-map), jamais au CMS.
    // image: pageHero porte une image au schema, mais HeroPageContent n'en a pas
    // (les pages simples portent leur visuel dans le corps); on l'ignore ici.
  }
}

/** Bloc heros brut -> bloc heros Vue (corps transforme + _type kebab + _key). */
function transformHeroBlock(raw: SanityRawHeroBlock, locale: WfLocale): HeroBlock {
  switch (raw._type) {
    case 'heroHome':
      return { _type: 'hero-home', _key: raw._key, ...transformHeroHomeBody(raw, locale) }
    case 'pageHero':
      return { _type: 'hero-page', _key: raw._key, ...transformPageHeroBody(raw, locale) }
    default:
      return assertNever(raw)
  }
}

function requireHero(raw: Maybe<SanityRawHeroBlock>, name: string): SanityRawHeroBlock {
  if (!raw) throw new Error(`Document « ${name} » sans bloc heros (seed/contenu incomplet).`)
  return raw
}

function asHomeHero(raw: Maybe<SanityRawHeroBlock>, name: string, locale: WfLocale): HeroHomeBlock {
  const b = transformHeroBlock(requireHero(raw, name), locale)
  if (b._type !== 'hero-home') throw new Error(`Document « ${name} »: heros attendu de type accueil.`)
  return b
}
function asPageHero(raw: Maybe<SanityRawHeroBlock>, name: string, locale: WfLocale): HeroPageBlock {
  const b = transformHeroBlock(requireHero(raw, name), locale)
  if (b._type !== 'hero-page') throw new Error(`Document « ${name} »: heros attendu de type page.`)
  return b
}

/** Replis SEO: title vide -> titre du hero; description vide -> lead du hero, sinon
 *  defaultDescription des globales. L'og:image garde sa chaine de replis cote
 *  usePageSeo: `image` reste l'ogImage propre a la page. */
function resolveSeo(
  seo: Maybe<SanitySeo>,
  heroTitle: string,
  heroLead: Maybe<string>,
  defaults: SanitySiteSettings['seo']
): PageSeo {
  return {
    title: seo?.title ?? heroTitle,
    description: seo?.description ?? heroLead ?? defaults.defaultDescription ?? '',
    image: opt(seo?.ogImage)
  }
}

// ── Page builder (8 blocs) ────────────────────────────────────────────────────

function transformBlock(
  block: SanityRawBlock,
  site: SiteContent,
  locale: WfLocale
): PayloadPageBlock {
  const key = ANCHOR_KEY[block._type] ?? block._key
  switch (block._type) {
    case 'trustBar':
      return {
        _type: 'trust-bar',
        _key: key,
        items: (block.items ?? []).map((i) => ({ icon: i.icon, value: i.value, label: i.label }))
      }
    case 'services':
      return {
        _type: 'services',
        _key: key,
        eyebrow: block.eyebrow,
        heading: block.heading,
        lead: opt(block.lead),
        ctaLabel: block.cta ? block.cta.label : undefined,
        ctaHref: block.cta ? resolveLink(block.cta, locale) : undefined,
        selection: {
          mode: cleanLogic(block.mode) ?? 'auto',
          refs: (block.refs ?? []).map((r) => cleanLogic(r)),
          limit: opt(block.limit)
        }
      }
    case 'serviceCities':
      return {
        _type: 'service-cities',
        _key: key,
        eyebrow: block.eyebrow,
        heading: block.heading,
        lead: opt(block.lead),
        areaLabel: block.areaLabel,
        areaName: block.areaName,
        areaNote: opt(block.areaNote),
        selection: {
          mode: cleanLogic(block.mode) ?? 'auto',
          refs: (block.refs ?? []).map((r) => cleanLogic(r)),
          limit: opt(block.limit)
        }
      }
    case 'about':
      return {
        _type: 'about',
        _key: key,
        eyebrow: opt(block.eyebrow),
        heading: block.heading,
        body: toParagraphs(block.body),
        photo: ((): AboutBlock['photo'] => {
          const f = resolveFigure(block.photo, RATIOS.aboutPhoto)
          return { src: f.src ?? '', alt: f.alt }
        })(),
        stats: (block.stats ?? []).map((s) => ({ value: s.value, label: s.label }))
      }
    case 'testimonials':
      return {
        _type: 'testimonials',
        _key: key,
        eyebrow: block.eyebrow,
        heading: block.heading,
        selection: {
          mode: cleanLogic(block.mode) ?? 'featured',
          service: cleanLogic(opt(block.service)),
          city: cleanLogic(opt(block.city)),
          refs: (block.refs ?? []).map((r) => cleanLogic(r)),
          limit: opt(block.limit)
        }
      }
    case 'faq':
      return {
        _type: 'faq',
        _key: key,
        eyebrow: opt(block.eyebrow),
        heading: block.heading,
        // Selection manuelle pure: refs (_id) resolues dans l'ordre de l'array.
        selection: { refs: (block.refs ?? []).map((r) => cleanLogic(r)) }
      }
    case 'ctaBand':
      return { _type: 'cta-band', _key: key, ...transformCtaBand(block, locale) }
    case 'contact':
      return transformContactBlock(block, site, locale, key)
    default:
      return assertNever(block)
  }
}

/**
 * Compose le contact final. Le bloc Sanity porte les LIBELLES (etiquettes NAP,
 * champs du formulaire, bouton, banniere d'echec, consentement) ET le message de
 * succes, tous editables au Studio (parite 1:1 Minimaliste). La NAP (telephone,
 * courriel, adresse, heures) est JOINTE depuis siteSettings.contact: le format
 * machine tel:/mailto: est DERIVE en code (phoneE164), jamais saisi. Le jeton
 * {email} de la banniere d'echec est remplace par le courriel des Globales.
 */
function transformContactBlock(
  block: SanityContactBlock,
  site: SiteContent,
  locale: WfLocale,
  key: string
): ContactBlock {
  const c = site.contact
  const meta: ContactContent['meta'] = [
    { label: block.metaLabels.phone, value: c.phone, href: `tel:${c.phoneE164}` },
    { label: block.metaLabels.email, value: c.email, href: `mailto:${c.email}` },
    {
      label: block.metaLabels.address,
      lines: [c.address.line1, `${c.address.cityProv}, ${c.address.postal}`]
    },
    { label: block.metaLabels.hours, lines: [c.hours.weekdays, c.hours.weekend] }
  ]
  return {
    _type: 'contact',
    _key: key,
    eyebrow: block.eyebrow,
    heading: block.heading,
    lead: block.lead,
    meta,
    form: {
      // Les flags required restent du code (4.5), seuls les libelles viennent du Studio.
      fields: {
        name: { label: block.form.labels.name, required: true as const },
        email: { label: block.form.labels.email, required: true as const },
        phone: { label: block.form.labels.phone, required: false as const },
        message: { label: block.form.labels.message, required: false as const }
      },
      errors: {
        nameRequired: block.form.errors.nameRequired,
        emailInvalid: block.form.errors.emailInvalid,
        privacyRequired: block.form.errors.privacyRequired
      },
      submit: { idle: block.form.submit.idle, loading: block.form.submit.loading },
      errorBanner: {
        title: block.form.errorBanner.title,
        body: block.form.errorBanner.body.replace('{email}', c.email)
      },
      privacy: {
        text: block.form.privacy.text,
        linkText: block.form.privacy.link.label,
        href: resolveLink(block.form.privacy.link, locale)
      }
    },
    success: { title: block.success.title, body: block.success.body }
  }
}

export function transformPageBuilder(
  blocks: Maybe<SanityRawBlock[]>,
  site: SiteContent,
  locale: WfLocale
): PayloadPageBlock[] {
  return (blocks ?? []).map((block) => transformBlock(block, site, locale))
}

// ── Corps d'article (7 blocs) ─────────────────────────────────────────────────

function transformArticleBlock(block: SanityRawArticleBlock, locale: WfLocale): ArticleBlock {
  switch (block._type) {
    case 'articleLead':
      return { _type: 'lead', _key: block._key, text: block.text }
    case 'articleRichText':
      return { _type: 'rich-text', _key: block._key, value: ptToRichTextEntries(block.body) }
    case 'articleImage':
      return {
        _type: 'image',
        _key: block._key,
        image: resolveArticleFigure(block.image)
      }
    case 'articleQuote':
      return {
        _type: 'quote',
        _key: block._key,
        quote: block.quote,
        attribution: opt(block.attribution)
      }
    case 'articleGallery':
      return {
        _type: 'gallery',
        _key: block._key,
        images: (block.images ?? []).map((figure) => resolveArticleFigure(figure))
      }
    case 'articleCallout':
      return {
        _type: 'callout',
        _key: block._key,
        tone: block.tone === 'warning' ? 'warning' : 'note',
        title: opt(block.title),
        text: block.text
      }
    case 'articleInlineCta': {
      const pair = linkPair(block.cta, locale)
      return {
        _type: 'inline-cta',
        _key: block._key,
        text: block.text,
        ctaLabel: pair.label,
        ctaHref: pair.href
      }
    }
    default:
      return assertNever(block)
  }
}

export function transformArticleBody(blocks: Maybe<SanityRawArticleBlock[]>, locale: WfLocale): ArticleBlock[] {
  return (blocks ?? []).map((block) => transformArticleBlock(block, locale))
}

// ── Globales (siteSettings) ───────────────────────────────────────────────────

/**
 * Telephone affiche -> E.164 (12.13, jamais stocke): retirer tout caractere non
 * numerique, prefixer `+1` (10 chiffres, plan nord-americain) ou `+` (11 chiffres
 * commencant par 1). Autre forme: `+` + chiffres, au mieux.
 */
export function derivePhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

// ── Reseaux sociaux (top-level, pour le Footer) ───────────────────────────────

/** Reseau social resolu: icone + libelle derives de la plateforme (map code).
 *  Structurellement identique a SiteContent['socials'][number]. */
export interface SocialLink {
  platform: SocialPlatform
  url: string
  icon: string
  label: string
}

function transformSocials(raw: Maybe<Array<{ platform: string; url: string }>>): SocialLink[] {
  return (raw ?? []).flatMap((s) => {
    const platform = cleanLogic(s.platform) as SocialPlatform
    const url = cleanLogic(s.url)
    const meta = SOCIAL_PLATFORMS[platform]
    if (!meta || !url) return []
    return [{ platform, url, icon: meta.icon, label: meta.label }]
  })
}

// ── Navigation et pied de page (liens deja resolus) ───────────────────────────

/** Navigation FULL (siteSettings.nav): deux jeux. `landing` rend des ANCRES (#x)
 *  pour le one-pager, `multipage` des ROUTES reelles: cles distinctes (anchor vs
 *  route), miroir du contrat SiteContent. Source unique de l'En-tete et du Menu
 *  mobile; aucune nav codee en dur cote composant. */
function transformNav(raw: SanitySiteSettings['nav'], locale: WfLocale): SiteContent['nav'] {
  return {
    landing: {
      primary: raw.landing.primary.map((link) => ({ label: link.label, anchor: resolveLink(link, locale) })),
      cta: { label: raw.landing.cta.label, anchor: resolveLink(raw.landing.cta, locale) }
    },
    multipage: {
      primary: raw.multipage.primary.map((link) => ({ label: link.label, route: resolveLink(link, locale) })),
      cta: { label: raw.multipage.cta.label, route: resolveLink(raw.multipage.cta, locale) }
    }
  }
}

/** Pied de page FULL (siteSettings.footer): liens primaires (liste dediee, 6.1),
 *  utilitaires et raccourcis (resolus en href), texte de droits et credit du
 *  studio (4 champs label/studio/studioUrl/product). Optionnels normalises en []
 *  (12.12: interfaces front non optionnelles). */
function transformFooter(raw: SanitySiteSettings['footer'], locale: WfLocale): SiteContent['footer'] {
  return {
    primary: raw.primary.map((link) => linkPair(link, locale)),
    utility: (raw.utility ?? []).map((link) => ({ href: resolveLink(link, locale), label: link.label })),
    pageLinks: (raw.pageLinks ?? []).map((link) => ({ href: resolveLink(link, locale), label: link.label })),
    copyright: raw.copyright,
    credit: {
      label: raw.credit.label,
      studio: raw.credit.studio,
      studioUrl: raw.credit.studioUrl,
      product: raw.credit.product
    }
  }
}

/** siteSettings FULL -> SiteContent (monolithe, miroir 1:1 de Minimaliste). NAP
 *  imbriquee: phoneE164 + tel:/mailto: DERIVES en code (jamais saisis); adresse
 *  d'affichage (cityProv) + structuree (les cles Schema.org sont reconstruites au
 *  point de consommation, index.vue); zone desservie en array; heures
 *  {weekdays, weekend}. seo inclus (replis description/og + suffixe de titre). */
export function transformSiteSettings(raw: SanitySiteSettings, locale: WfLocale): SiteContent {
  return {
    brand: {
      name: raw.brand.name,
      // Logo resolu en src (12.14); alt vide: le lien porte homeAriaLabel.
      logo: { src: opt(raw.brand.logo.src) },
      tagline: raw.brand.tagline,
      foundedYear: raw.brand.foundedYear,
      homeAriaLabel: raw.brand.homeAriaLabel
    },
    contact: {
      phone: raw.contact.phone,
      phoneE164: derivePhoneE164(raw.contact.phone),
      email: raw.contact.email,
      address: {
        line1: raw.contact.address.line1,
        cityProv: raw.contact.address.cityProv,
        city: raw.contact.address.city,
        region: raw.contact.address.region,
        country: raw.contact.address.country,
        postal: raw.contact.address.postal
      },
      areaServed: raw.contact.areaServed,
      hours: { weekdays: raw.contact.hours.weekdays, weekend: raw.contact.hours.weekend }
    },
    nav: transformNav(raw.nav, locale),
    footer: transformFooter(raw.footer, locale),
    socials: transformSocials(raw.socials),
    seo: {
      titleSuffix: raw.seo.titleSuffix,
      defaultDescription: opt(raw.seo.defaultDescription),
      defaultOgImage: opt(raw.seo.defaultOgImage)
    }
  }
}

// ── Pages legales ──────────────────────────────────────────────────────────────

function transformLegalBlock(block: SanityLegalBlock): LegalBlock {
  switch (block._type) {
    case 'legalParagraph':
      return block.text
    case 'legalList':
      return { list: block.items }
    case 'legalTodo':
      return { todo: block.text }
    default:
      // Union exhaustive: un _type legal inconnu casse le build (fail-fast), jamais
      // un rendu silencieux. Le contenu reel vient du seed (types legalParagraph/
      // legalList/legalTodo uniquement).
      return assertNever(block)
  }
}

function transformLegalDoc(doc: SanityLegalPage, locale: WfLocale): LegalDoc {
  return {
    title: doc.title,
    effective: formatLegalDate(doc.effective, locale, LEGAL_DATE_TODO[locale].effective),
    updated: formatLegalDate(doc.updated, locale, LEGAL_DATE_TODO[locale].updated),
    sections: (doc.sections ?? []).map((section) => ({
      title: section.title,
      body: (section.body ?? []).map(transformLegalBlock)
    }))
  }
}

export function transformLegal(pages: SanityLegalPage[], locale: WfLocale): LegalContent {
  // Ids deterministes du seed: legalPage-<conditions|confidentialite>-<lang>.
  const findDoc = (key: 'conditions' | 'confidentialite'): SanityLegalPage => {
    const id = `legalPage-${key}-${locale}`
    const doc = pages.find((page) => page._id === id)
    return requireDoc(doc, id)
  }
  return {
    conditions: transformLegalDoc(findDoc('conditions'), locale),
    confidentialite: transformLegalDoc(findDoc('confidentialite'), locale)
  }
}

// ── Copies des pages de detail (portees par chaque doc de collection) ─────────

function transformServiceDetail(raw: SanityServiceDetail, locale: WfLocale): ServiceDetailPayload {
  return {
    benefits: { heading: raw.benefits.heading, cta: linkPair(raw.benefits.cta, locale) },
    included: { heading: raw.included.heading },
    process: transformProcess(raw.process, locale),
    serviceCities: {
      eyebrow: opt(raw.serviceCities.eyebrow),
      heading: raw.serviceCities.heading,
      lead: opt(raw.serviceCities.lead),
      ctaLabel: raw.serviceCities.cta ? raw.serviceCities.cta.label : undefined,
      ctaHref: raw.serviceCities.cta ? resolveLink(raw.serviceCities.cta, locale) : undefined
    },
    testimonials: { eyebrow: raw.testimonials.eyebrow, heading: raw.testimonials.heading },
    cta: transformCtaBand(raw.cta, locale)
  }
}

// ── Collections ────────────────────────────────────────────────────────────────

/** Traductions normalisees: entrees sans slug ou de langue inconnue ecartees. */
export function transformTranslations(raw: Maybe<SanityDocTranslation[]>): DocTranslation[] {
  return (raw ?? [])
    .filter((t): t is SanityDocTranslation => Boolean(t && (cleanLogic(t.lang) === 'fr' || cleanLogic(t.lang) === 'en') && t.slug))
    .map((t) => ({
      lang: cleanLogic(t.lang) as WfLocale,
      slug: cleanLogic(opt(t.slug)),
      catSlug: cleanLogic(opt(t.catSlug))
    }))
}

function transformService(raw: SanityService, locale: WfLocale): ServiceWithMeta {
  const figure = resolveFigure(raw.image, RATIOS.serviceImage)
  return {
    _id: raw._id,
    slug: cleanLogic(raw.slug),
    icon: opt(raw.icon),
    title: raw.title,
    summary: opt(raw.summary),
    meta: opt(raw.meta),
    image: figure.src ?? '',
    imageMeta: { alt: figure.alt, label: figure.label, caption: figure.caption },
    intro: opt(raw.intro),
    benefits: (raw.benefits ?? []).map((b) => ({ title: b.title, body: b.body })),
    detail: raw.detail ? transformServiceDetail(raw.detail, locale) : undefined,
    related: (raw.related ?? []).map((r) => cleanLogic(r)),
    featured: opt(raw.featured),
    order: opt(raw.order),
    translations: transformTranslations(raw.translations)
  }
}

function transformServiceCity(raw: SanityServiceCity, locale: WfLocale): ServiceCityWithDetail {
  return {
    _id: raw._id,
    slug: cleanLogic(raw.slug),
    city: raw.city,
    region: opt(raw.region),
    note: opt(raw.note),
    heading: opt(raw.heading),
    lead: opt(raw.lead),
    // Corps absent pour les villes NON courantes en preview scope -> undefined.
    body: raw.body ? toParagraphs(raw.body) : undefined,
    // La SEO de ville vient de l'objet `seo` (title/description/ogImage), PAS de
    // seoTitle/seoDescription comme l'ancien content.ts. Absente -> undefined (la
    // page derive ses replis). Pas de repli hero ici: une ville n'a pas de hero.
    seo: raw.seo
      ? { title: raw.seo.title ?? '', description: raw.seo.description ?? '', image: opt(raw.seo.ogImage) }
      : undefined,
    featured: opt(raw.featured),
    order: opt(raw.order),
    translations: transformTranslations(raw.translations)
  }
}

function transformArticle(raw: SanityArticle, locale: WfLocale): Translated<ArticleContent> {
  return {
    slug: cleanLogic(raw.slug),
    title: raw.title,
    excerpt: raw.excerpt,
    cover: resolveArticleFigure(raw.cover),
    date: raw.date,
    author: raw.author ?? '',
    readingTime: raw.readingTime ?? 0,
    // category deja un objet { slug, title } dereference (jamais le slug brut).
    category: raw.category ? { title: raw.category.title, slug: cleanLogic(raw.category.slug) } : undefined,
    body: transformArticleBody(raw.body, locale),
    translations: transformTranslations(raw.translations)
  }
}

function transformCategory(raw: SanityCategory): Translated<CategoryContent> {
  return {
    title: raw.title,
    slug: cleanLogic(raw.slug),
    description: opt(raw.description),
    translations: transformTranslations(raw.translations)
  }
}

function transformTestimonial(raw: SanityTestimonial): TestimonialPayload {
  return {
    // id = _id Sanity: les refs des blocs manuels pointent les memes _id.
    id: raw._id,
    quote: raw.quote,
    name: raw.name,
    context: opt(raw.context),
    service: cleanLogic(opt(raw.service)),
    // Cle `city` (ref serviceCity), PAS `project`.
    city: cleanLogic(opt(raw.city)),
    featured: opt(raw.featured)
  }
}

function transformFaqItem(raw: SanityFaqItem): FaqItemPayload {
  return {
    id: raw._id,
    q: raw.question,
    a: raw.answer,
    theme: cleanLogic(opt(raw.theme))
  }
}

// ── Graphe complet ─────────────────────────────────────────────────────────────

/**
 * Payload brut d'une langue -> modele de contenu d'Ancree. FAIL-FAST: toute donnee
 * manquante qui rendrait le site incomplet (singleton absent, hero manquant, page
 * legale manquante, lien brise) interrompt la transformation avec un message clair.
 * Un generate sans contenu doit echouer, jamais produire un site vide.
 */
export function transformGraph(raw: SanityGraph, locale: WfLocale): ContentPayload {
  const siteSettings = requireDoc(raw.siteSettings, 'siteSettings')
  const homePage = requireDoc(raw.homePage, 'homePage')
  const servicesPage = requireDoc(raw.servicesPage, 'servicesPage')
  const villesPage = requireDoc(raw.villesPage, 'villesPage')
  const aboutPage = requireDoc(raw.aboutPage, 'aboutPage')
  const blogPage = requireDoc(raw.blogPage, 'blogPage')
  const faqPage = requireDoc(raw.faqPage, 'faqPage')
  const contactPage = requireDoc(raw.contactPage, 'contactPage')
  const onePager = requireDoc(raw.onePager, 'onePager')

  // Globales monolithiques (SiteContent): un seul objet `site` du payload, source
  // unique de l'En-tete/Menu mobile/Pied de page ET de usePageSeo (site.seo,
  // site.contact pour le LocalBusiness). Le contact joint site.contact.
  const site = transformSiteSettings(siteSettings, locale)
  const seoDefaults = site.seo
  const builder = (blocks: Maybe<SanityRawBlock[]>): PayloadPageBlock[] =>
    transformPageBuilder(blocks, site, locale)

  const heroes = {
    home: asHomeHero(homePage.hero, 'homePage', locale),
    onePager: asHomeHero(onePager.hero, 'onePager', locale)
  }

  const servicesHero = asPageHero(servicesPage.hero, 'servicesPage', locale)
  const villesHero = asPageHero(villesPage.hero, 'villesPage', locale)
  const aboutHero = asPageHero(aboutPage.hero, 'aboutPage', locale)
  const blogHero = asPageHero(blogPage.hero, 'blogPage', locale)
  const faqHero = asPageHero(faqPage.hero, 'faqPage', locale)
  const contactHero = asPageHero(contactPage.hero, 'contactPage', locale)

  return {
    site,
    legal: transformLegal(raw.legalPages, locale),
    heroes,
    pages: {
      home: {
        pageBuilder: builder(homePage.pageBuilder),
        seo: resolveSeo(homePage.seo, heroes.home.title, heroes.home.lead, seoDefaults)
      },
      services: {
        hero: servicesHero,
        pageBuilder: builder(servicesPage.pageBuilder),
        seo: resolveSeo(servicesPage.seo, servicesHero.title, servicesHero.lead, seoDefaults)
      },
      villes: {
        hero: villesHero,
        pageBuilder: builder(villesPage.pageBuilder),
        seo: resolveSeo(villesPage.seo, villesHero.title, villesHero.lead, seoDefaults)
      },
      about: {
        hero: aboutHero,
        pageBuilder: builder(aboutPage.pageBuilder),
        seo: resolveSeo(aboutPage.seo, aboutHero.title, aboutHero.lead, seoDefaults)
      },
      blog: {
        hero: blogHero,
        listCta: transformCtaBand(blogPage.listCta, locale),
        categoryCta: transformCtaBand(blogPage.categoryCta, locale),
        articleCta: transformCtaBand(blogPage.articleCta, locale),
        related: { heading: blogPage.related.heading },
        pageBuilder: builder(blogPage.pageBuilder),
        seo: resolveSeo(blogPage.seo, blogHero.title, blogHero.lead, seoDefaults)
      },
      faq: {
        hero: faqHero,
        // Composition du listing de la page FAQ: une section par theme, dans l'ordre
        // des sections; selection SEMI-resolue (useFaqByTheme resout les items).
        sections: (faqPage.sections ?? []).map((section) => ({
          theme: section.theme
            ? { title: section.theme.title, slug: cleanLogic(section.theme.slug) }
            : undefined,
          mode: cleanLogic(section.mode) ?? 'auto',
          refs: (section.refs ?? []).map((r) => cleanLogic(r))
        })),
        pageBuilder: builder(faqPage.pageBuilder),
        seo: resolveSeo(faqPage.seo, faqHero.title, faqHero.lead, seoDefaults)
      },
      contact: {
        hero: contactHero,
        pageBuilder: builder(contactPage.pageBuilder),
        seo: resolveSeo(contactPage.seo, contactHero.title, contactHero.lead, seoDefaults)
      },
      onePager: {
        pageBuilder: builder(onePager.pageBuilder),
        seo: resolveSeo(onePager.seo, heroes.onePager.title, heroes.onePager.lead, seoDefaults)
      }
    },
    collections: {
      services: raw.services.map((service) => transformService(service, locale)),
      serviceCities: raw.serviceCities.map((city) => transformServiceCity(city, locale)),
      articles: raw.articles.map((article) => transformArticle(article, locale)),
      categories: raw.categories.map((category) => transformCategory(category)),
      testimonials: raw.testimonials.map(transformTestimonial),
      faqItems: raw.faqItems.map(transformFaqItem)
    }
  }
}
