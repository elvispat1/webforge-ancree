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
import type { EditorialContent, EditorialMediaSide } from '../content/editorial'
import type { Category } from '../content/categories'
import type { Article } from '../content/articles'
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
  ArticleBlock,
  EditorialBlock,
  ProcessBlock,
  HighlightsBlock
} from '../types/blocks'
import type {
  Maybe,
  SanityDocTranslation,
  SanityFigure,
  SanityLink,
  SanityLinkRef,
  SanitySeo,
  SanityHeroHome,
  SanityPageHero,
  SanityDetailHero,
  SanityRawHeroBlock,
  SanityCtaBand,
  SanityProcess,
  SanityContactBlock,
  SanityRawBlock,
  SanityRawArticleBlock,
  SanityRawPortableBlock,
  SanityRawLinkedPortableBlock,
  SanityEditorialFields,
  SanitySiteSettings,
  SanityLegalPage,
  SanityLegalBlock,
  SanityService,
  SanityServiceCity,
  SanityArticle,
  SanityCategory,
  SanityTestimonial,
  SanityFaqItem,
  SanityGraph
} from '../types/sanity'

// ── Locale ───────────────────────────────────────────────────────────────────

export type WfLocale = 'fr' | 'en'

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
  | EditorialBlock
  | ProcessBlock
  | HighlightsBlock

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

/** Service du payload: identite de carte + masthead (hero) + pageBuilder + seo +
 *  traductions, composé comme un singleton. `hero`/`pageBuilder`/`seo` optionnels:
 *  en preview scope, les services NON courants sortent en carte; en prod statique,
 *  ils sont toujours fournis (page de detail prerendue). */
export interface ServicePayload {
  _id: string
  slug: string
  icon?: string
  title: string
  summary?: string
  /** Image en src string (contrat des blocs); figure sans image -> '' (placeholder). */
  image: string
  /** Meta de figure (alt/label/caption) pour serviceImage() cote composable. */
  imageMeta: { alt: string; label: string; caption: string }
  hero?: HeroPageBlock
  pageBuilder?: PayloadPageBlock[]
  seo?: PageSeo
  featured?: boolean
  order?: number
}
export type ServiceWithMeta = Translated<ServicePayload>

/** Ville desservie du payload: meme forme composee que le service (masthead +
 *  pageBuilder + seo). hero/pageBuilder/seo ne sortent pleinement que pour l'item
 *  de detail (en preview), toujours en prod statique. */
export interface ServiceCityPayload {
  _id: string
  slug: string
  city: string
  region?: string
  note?: string
  hero?: HeroPageBlock
  pageBuilder?: PayloadPageBlock[]
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
    articles: Translated<Article>[]
    categories: Translated<Category>[]
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

/** Slug d'ancre: stega retiree, minuscules, accents -> ascii, tout caractere non
 *  alphanumerique -> tiret, tirets de bord retires. Applique IDENTIQUEMENT a l'id
 *  de section (cle de bloc) ET a l'ancre d'un lien, pour qu'ils se correspondent
 *  meme si l'editeur y colle un titre (« Nos services » -> « nos-services »).
 *  Chaine vide ou absente -> chaine vide (le caller decide du repli). */
function slugifyAnchor(value: Maybe<string>): string {
  const raw = cleanLogic(value)
  if (!raw) return ''
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // diacritiques combinants
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
  contact: 'contact',
  editorial: 'editorial',
  process: 'process',
  highlights: 'highlights'
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

const HERO_BLOCK_TYPE_MAP = {
  heroHome: 'hero-home',
  pageHero: 'hero-page',
  detailHero: 'hero-page'
} as const

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
  contact: 'contact',
  editorial: 'editorial',
  process: 'process',
  highlights: 'highlights'
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
export function resolveLink(link: SanityLink, locale: WfLocale, phoneE164: string): string {
  switch (link.type) {
    case 'external': {
      if (!link.externalUrl) {
        throw new Error(`Lien externe sans URL: « ${link.label} »`)
      }
      return link.externalUrl
    }
    case 'anchor': {
      // Slugifie comme l'id de section (slugifyAnchor des deux cotes): l'editeur
      // peut coller un titre, « Nos services » et « nos-services » se correspondent.
      const hash = `#${slugifyAnchor(link.anchor)}`
      return link.internalRef ? `${docPath(link.internalRef, locale)}${hash}` : hash
    }
    case 'internal': {
      if (!link.internalRef) {
        throw new Error(`Lien interne sans reference (publiee): « ${link.label} »`)
      }
      return docPath(link.internalRef, locale)
    }
    // Action d'appel: le href tel: est DERIVE de la source unique (phoneE164),
    // jamais saisi. Fail-fast si le numero manque (jamais un tel: vide).
    case 'tel': {
      if (!phoneE164) {
        throw new Error(`Lien d'appel sans numero (siteSettings.contact.phone vide): « ${link.label} »`)
      }
      return `tel:${phoneE164}`
    }
    default:
      return assertNever(link.type)
  }
}

/** Couple { label, href } des CTA. */
function linkPair(link: SanityLink, locale: WfLocale, phoneE164: string): { label: string; href: string } {
  return { label: link.label, href: resolveLink(link, locale, phoneE164) }
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

/**
 * Portable Text du bloc editorial -> PortableTextBlock[]. Comme ptToRichTextEntries,
 * mais l'annotation `link` des markDefs est RESOLUE en href string localise
 * (resolveLink: interne via docPath, externe, ancre). Le serialiseur PortableText.vue
 * rend ensuite interne -> NuxtLink, externe -> <a> sur. Un lien interne irresoluble
 * (ref non publiee) interrompt le build (fail-fast), jamais un lien mort silencieux.
 */
export function ptToLinkedEntries(
  blocks: Maybe<SanityRawLinkedPortableBlock[]>,
  locale: WfLocale,
  phoneE164: string
): PortableTextBlock[] {
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
        href: resolveLink(
          {
            label: '',
            type: (cleanLogic(m.type) ?? 'internal') as SanityLink['type'],
            internalRef: m.internalRef,
            externalUrl: m.externalUrl,
            anchor: m.anchor
          },
          locale,
          phoneE164
        )
      }))
    }
    return out
  })
}

/** Bloc editorial Sanity -> EditorialContent. Texte riche des segments resolu avec
 *  liens inline (ptToLinkedEntries); images en figures (src/alt/caption); cote
 *  d'image normalise (auto/left/right). Reutilise par le page-builder ET par la
 *  page de detail d'un service (champ service.detail.editorial). */
function transformEditorial(
  raw: SanityEditorialFields,
  locale: WfLocale,
  phoneE164: string
): EditorialContent {
  return {
    eyebrow: opt(raw.eyebrow),
    heading: opt(raw.heading),
    lead: opt(raw.lead),
    segments: (raw.segments ?? []).map((s) => ({
      body: ptToLinkedEntries(s.body, locale, phoneE164),
      media: (s.media ?? []).map((f) => resolveArticleFigure(f)),
      mediaSide: ((): EditorialMediaSide => {
        const side = cleanLogic(s.mediaSide)
        return side === 'left' || side === 'right' ? side : 'auto'
      })()
    }))
  }
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

function transformCtaBand(raw: SanityCtaBand, locale: WfLocale, phoneE164: string): CtaBandContent {
  return {
    title: raw.title,
    subtitle: opt(raw.subtitle),
    primaryCta: linkPair(raw.primaryCta, locale, phoneE164),
    secondaryCta: raw.secondaryCta ? linkPair(raw.secondaryCta, locale, phoneE164) : undefined
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

function transformHeroHomeBody(raw: SanityHeroHome, locale: WfLocale, phoneE164: string): HeroContent {
  // Visuel minimal: src + alt (alt sur l'asset). Cadrage en code (object-fit cover),
  // pas de ratio. Image mobile optionnelle: absente -> le desktop sert partout.
  const v = raw.visual
  return {
    kicker: opt(raw.kicker),
    title: raw.title,
    lead: raw.lead,
    primaryCta: linkPair(raw.primaryCta, locale, phoneE164),
    secondaryCta: linkPair(raw.secondaryCta, locale, phoneE164),
    meta: (raw.meta ?? []).map((m) => ({ value: m.value, label: m.label, icon: opt(m.icon) })),
    visual: { src: opt(v.src), alt: opt(v.alt) },
    visualMobile: v.mobileSrc ? { src: v.mobileSrc, alt: opt(v.mobileAlt) ?? opt(v.alt) } : undefined
  }
}

function transformPageHeroBody(raw: SanityPageHero, locale: WfLocale, phoneE164: string): HeroPageContent {
  const rf = resolveFigure(raw.image, RATIOS.pageHero)
  return {
    title: raw.title,
    lead: opt(raw.lead),
    cta: raw.cta ? linkPair(raw.cta, locale, phoneE164) : undefined,
    // crumbs: composes par la page (route-map), jamais au CMS.
    image: rf.src ? { src: rf.src, alt: rf.alt } : undefined
  }
}

/** Masthead des collections (detailHero) -> meme corps que pageHero, avec surtitre.
 *  Mappe vers le _type kebab 'hero-page': les pages de detail rendent le meme
 *  masthead solide que les pages internes. Le fil d'Ariane est ajoute par la page. */
function transformDetailHeroBody(raw: SanityDetailHero, locale: WfLocale, phoneE164: string): HeroPageContent {
  const rf = resolveFigure(raw.image, RATIOS.pageHero)
  return {
    eyebrow: opt(raw.eyebrow),
    title: raw.title,
    lead: opt(raw.lead),
    cta: raw.cta ? linkPair(raw.cta, locale, phoneE164) : undefined,
    image: rf.src ? { src: rf.src, alt: rf.alt } : undefined
  }
}

/** Bloc heros brut -> bloc heros Vue (corps transforme + _type kebab + _key). */
function transformHeroBlock(raw: SanityRawHeroBlock, locale: WfLocale, phoneE164: string): HeroBlock {
  switch (raw._type) {
    case 'heroHome':
      return { _type: 'hero-home', _key: raw._key, ...transformHeroHomeBody(raw, locale, phoneE164) }
    case 'pageHero':
      return { _type: 'hero-page', _key: raw._key, ...transformPageHeroBody(raw, locale, phoneE164) }
    case 'detailHero':
      return { _type: 'hero-page', _key: raw._key, ...transformDetailHeroBody(raw, locale, phoneE164) }
    default:
      return assertNever(raw)
  }
}

function requireHero(raw: Maybe<SanityRawHeroBlock>, name: string): SanityRawHeroBlock {
  if (!raw) throw new Error(`Document « ${name} » sans bloc heros (seed/contenu incomplet).`)
  return raw
}

function asHomeHero(raw: Maybe<SanityRawHeroBlock>, name: string, locale: WfLocale, phoneE164: string): HeroHomeBlock {
  const b = transformHeroBlock(requireHero(raw, name), locale, phoneE164)
  if (b._type !== 'hero-home') throw new Error(`Document « ${name} »: heros attendu de type accueil.`)
  return b
}
function asPageHero(raw: Maybe<SanityRawHeroBlock>, name: string, locale: WfLocale, phoneE164: string): HeroPageBlock {
  const b = transformHeroBlock(requireHero(raw, name), locale, phoneE164)
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
  // Id d'ancre de la section: ancre explicite du bloc (slugifiee) si l'editeur en a
  // pose une, sinon cle semantique par type (ANCHOR_KEY), sinon le _key opaque.
  const key = slugifyAnchor(block.anchor) || ANCHOR_KEY[block._type] || block._key
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
        ctaHref: block.cta ? resolveLink(block.cta, locale, site.contact.phoneE164) : undefined,
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
      return { _type: 'cta-band', _key: key, ...transformCtaBand(block, locale, site.contact.phoneE164) }
    case 'contact':
      return transformContactBlock(block, site, locale, key)
    case 'editorial':
      return { _type: 'editorial', _key: key, ...transformEditorial(block, locale, site.contact.phoneE164) }
    case 'process':
      return { _type: 'process', _key: key, ...transformProcess(block, locale) }
    case 'highlights':
      return {
        _type: 'highlights',
        _key: key,
        eyebrow: opt(block.eyebrow),
        heading: opt(block.heading),
        items: (block.items ?? []).map((i) => ({ title: i.title, body: i.body }))
      }
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
        href: resolveLink(block.form.privacy.link, locale, site.contact.phoneE164)
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

function transformArticleBlock(block: SanityRawArticleBlock, locale: WfLocale, phoneE164: string): ArticleBlock {
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
      const pair = linkPair(block.cta, locale, phoneE164)
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

export function transformArticleBody(blocks: Maybe<SanityRawArticleBlock[]>, locale: WfLocale, phoneE164: string): ArticleBlock[] {
  return (blocks ?? []).map((block) => transformArticleBlock(block, locale, phoneE164))
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
function transformNav(raw: SanitySiteSettings['nav'], locale: WfLocale, phoneE164: string): SiteContent['nav'] {
  return {
    landing: {
      primary: raw.landing.primary.map((link) => ({ label: link.label, anchor: resolveLink(link, locale, phoneE164) }))
    },
    multipage: {
      primary: raw.multipage.primary.map((link) => ({ label: link.label, route: resolveLink(link, locale, phoneE164) }))
    }
  }
}

/** Pied de page FULL (siteSettings.footer): liens primaires (liste dediee, 6.1),
 *  utilitaires et raccourcis (resolus en href), texte de droits et credit du
 *  studio (4 champs label/studio/studioUrl/product). Optionnels normalises en []
 *  (12.12: interfaces front non optionnelles). */
function transformFooter(raw: SanitySiteSettings['footer'], locale: WfLocale, phoneE164: string): SiteContent['footer'] {
  return {
    primary: raw.primary.map((link) => linkPair(link, locale, phoneE164)),
    utility: (raw.utility ?? []).map((link) => ({ href: resolveLink(link, locale, phoneE164), label: link.label })),
    pageLinks: (raw.pageLinks ?? []).map((link) => ({ href: resolveLink(link, locale, phoneE164), label: link.label })),
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
  const phoneE164 = derivePhoneE164(raw.contact.phone)
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
      phoneE164,
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
    nav: transformNav(raw.nav, locale, phoneE164),
    footer: transformFooter(raw.footer, locale, phoneE164),
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

function transformService(raw: SanityService, site: SiteContent, locale: WfLocale): ServiceWithMeta {
  const phoneE164 = site.contact.phoneE164
  const figure = resolveFigure(raw.image, RATIOS.serviceImage)
  // hero/pageBuilder/seo presents pour l'item de detail (toujours en prod statique;
  // l'item courant en preview). Absents pour une carte du preview scope.
  const hero = raw.hero ? asPageHero(raw.hero, raw._id, locale, phoneE164) : undefined
  return {
    _id: raw._id,
    slug: cleanLogic(raw.slug),
    icon: opt(raw.icon),
    title: raw.title,
    summary: opt(raw.summary),
    image: figure.src ?? '',
    imageMeta: { alt: figure.alt, label: figure.label, caption: figure.caption },
    hero,
    pageBuilder: raw.pageBuilder ? transformPageBuilder(raw.pageBuilder, site, locale) : undefined,
    seo: hero ? resolveSeo(raw.seo, hero.title, hero.lead, site.seo) : undefined,
    featured: opt(raw.featured),
    order: opt(raw.order),
    translations: transformTranslations(raw.translations)
  }
}

function transformServiceCity(raw: SanityServiceCity, site: SiteContent, locale: WfLocale): ServiceCityWithDetail {
  const phoneE164 = site.contact.phoneE164
  const hero = raw.hero ? asPageHero(raw.hero, raw._id, locale, phoneE164) : undefined
  return {
    _id: raw._id,
    slug: cleanLogic(raw.slug),
    city: raw.city,
    region: opt(raw.region),
    note: opt(raw.note),
    hero,
    pageBuilder: raw.pageBuilder ? transformPageBuilder(raw.pageBuilder, site, locale) : undefined,
    // SEO derive de l'objet seo (title/description/ogImage), repli sur le titre/lead
    // du masthead puis le defaut des globales. Absent pour une carte du preview scope.
    seo: hero ? resolveSeo(raw.seo, hero.title, hero.lead, site.seo) : undefined,
    featured: opt(raw.featured),
    order: opt(raw.order),
    translations: transformTranslations(raw.translations)
  }
}

function transformArticle(raw: SanityArticle, locale: WfLocale, phoneE164: string): Translated<Article> {
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
    body: transformArticleBody(raw.body, locale, phoneE164),
    translations: transformTranslations(raw.translations)
  }
}

function transformCategory(raw: SanityCategory): Translated<Category> {
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
  // Source unique du numero d'appel, derivee de site.contact.phone. Threadee dans
  // toutes les resolutions de lien pour que les liens de type 'tel' fabriquent leur href.
  const phoneE164 = site.contact.phoneE164
  const seoDefaults = site.seo
  const builder = (blocks: Maybe<SanityRawBlock[]>): PayloadPageBlock[] =>
    transformPageBuilder(blocks, site, locale)

  const heroes = {
    home: asHomeHero(homePage.hero, 'homePage', locale, phoneE164),
    onePager: asHomeHero(onePager.hero, 'onePager', locale, phoneE164)
  }

  const servicesHero = asPageHero(servicesPage.hero, 'servicesPage', locale, phoneE164)
  const villesHero = asPageHero(villesPage.hero, 'villesPage', locale, phoneE164)
  const aboutHero = asPageHero(aboutPage.hero, 'aboutPage', locale, phoneE164)
  const blogHero = asPageHero(blogPage.hero, 'blogPage', locale, phoneE164)
  const faqHero = asPageHero(faqPage.hero, 'faqPage', locale, phoneE164)
  const contactHero = asPageHero(contactPage.hero, 'contactPage', locale, phoneE164)

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
        listCta: transformCtaBand(blogPage.listCta, locale, phoneE164),
        categoryCta: transformCtaBand(blogPage.categoryCta, locale, phoneE164),
        articleCta: transformCtaBand(blogPage.articleCta, locale, phoneE164),
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
      services: raw.services.map((service) => transformService(service, site, locale)),
      serviceCities: raw.serviceCities.map((city) => transformServiceCity(city, site, locale)),
      articles: raw.articles.map((article) => transformArticle(article, locale, phoneE164)),
      categories: raw.categories.map((category) => transformCategory(category)),
      testimonials: raw.testimonials.map(transformTestimonial),
      faqItems: raw.faqItems.map(transformFaqItem)
    }
  }
}
