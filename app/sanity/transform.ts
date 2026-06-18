// Transformation du payload Sanity brut vers le modèle de données V1 EXACT.
//
// Couche PURE: aucun import Nuxt runtime, importable en test et, au besoin,
// depuis la fermeture de nuxt.config.ts (d'où les imports RELATIFS partout).
// Les composants ne voient JAMAIS le brut: images en `src` string, `_type` Vue
// kebab-case, liens en `href` string, Portable Text aplati en RichTextEntry[].
//
// Règles appliquées (spec SANITY-SCHEMA-SPEC.md, section 12):
//   - mapping `_type` camelCase -> kebab-case (tables 2.1 et 2.2);
//   - figure -> { ratio, src?, alt, label, caption }, ratio par défaut par usage (12.6);
//   - link -> href string via le route-map (12.5);
//   - Portable Text -> RichTextEntry[], marks aplaties (12.1, parité V1, R3);
//   - numérotations synthétisées S/01, 01, étapes (12.2);
//   - join contact sur siteSettings + jeton {email} (12.4);
//   - replis SEO des pages fixes (12.10);
//   - dates légales fr-CA / en-CA, jeton todo localisé si vide (12.11);
//   - normalisation du footer (12.12).
//
// Blocs intelligents (services, testimonials, faq, projectsPreview, blogPreview):
// le payload les garde SEMI-résolus (copie transformée + paramètres de sélection).
// La résolution des items vit dans resolveBlocks (couche composable, phase
// suivante), qui réutilise les requêtes existantes sur les collections.

import { routePath, onePagerPath, legalRouteKeyForId } from '../config/route-map'
import type { SiteContent } from '../content/site'
import type { HeroContent } from '../content/hero'
import type { PageHero } from '../content/page-heroes'
import type { LegalBlock, LegalContent, LegalDoc } from '../content/legal'
import type { Service, ServicesContent } from '../content/services'
import type { Project } from '../content/projects'
import type { Article } from '../content/articles'
import type { Category } from '../content/categories'
import type { Testimonial, TestimonialsContent } from '../content/testimonials'
import type { FaqItem, FaqContent } from '../content/faq'
import type { ProcessContent } from '../content/process'
import type { CtaBandContent } from '../content/cta-band'
import type { ProjectsPreviewContent } from '../content/projects-preview'
import type { BlogPreviewContent } from '../content/blog-preview'
import type { VideoYoutubeContent } from '../content/video-youtube'
import type { BlogPageContent } from '../content/blog-page'
import type { ServiceDetailContent } from '../content/services-page'
import type { ProjectDetailContent } from '../content/projects-page'
import type { RichTextEntry } from '../content/article-blocks'
import type {
  BlockBase,
  AboutBlock,
  ContactBlock,
  MediaTextBlock,
  CtaBandBlock,
  ProcessBlock,
  StatsBlock,
  HighlightsBlock,
  LogosBlock,
  IframeBlock,
  VideoYoutubeBlock,
  ArticleBlock,
  HeroBlock,
  HeroHomeBlock,
  HeroPageBlock
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
  SanityRawHeroBlock,
  SanityCtaBand,
  SanityProcess,
  SanityVideoYoutubeBlock,
  SanityRawBlock,
  SanityRawArticleBlock,
  SanityPortableTextBlock,
  SanitySiteSettings,
  SanityServiceDetail,
  SanityProjectDetail,
  SanityLegalPage,
  SanityLegalBlock,
  SanityService,
  SanityProject,
  SanityArticle,
  SanityTestimonial,
  SanityFaqItem,
  SanityGraph
} from '../types/sanity'

// ── Modèle du payload (sortie de transformGraph) ─────────────────────────────

export type WfLocale = 'fr' | 'en'

/** SEO final d'une page fixe: replis (12.10) déjà résolus. `image` = URL CDN
 *  de l'ogImage Sanity si fournie (le repli /og/og-default.jpg reste du code). */
export interface PageSeo {
  title: string
  description: string
  image?: string
}

// Paramètres de sélection des blocs intelligents, tels que stockés au Studio.
// `pad` et l'exclusion contextuelle restent des paramètres code des pages de
// détail (décision tranchée #2), jamais stockés.
export interface ServicesSelection {
  mode: 'auto' | 'manual'
  /** Slugs des services choisis (mode manual). */
  refs: string[]
  limit?: number
}

export interface TestimonialsSelection {
  mode: 'featured' | 'service' | 'project' | 'manual'
  /** Slug du service (mode service). */
  service?: string
  /** Slug du projet (mode project). */
  project?: string
  /** Ids (_id Sanity) des témoignages choisis (mode manual). */
  refs: string[]
  limit?: number
}

export interface FaqSelection {
  /** Ids (_id Sanity) des questions choisies: sélection manuelle PURE
   *  (spec 4.4), résolue dans l'ordre de l'array (12.8). */
  refs: string[]
}

export interface ProjectsPreviewSelection {
  mode: 'featured' | 'service' | 'manual'
  /** Slug du service (mode service). */
  service?: string
  /** Slugs des projets choisis (mode manual). */
  refs: string[]
  limit?: number
}

export interface BlogPreviewSelection {
  limit: number
}

// Blocs intelligents semi-résolus: copie V1 transformée (sans items) +
// sélection. resolveBlocks (phase suivante) produit le PageBlock final.
export type PendingServicesBlock = BlockBase<'services'> &
  Omit<ServicesContent, 'items'> & { selection: ServicesSelection }
export type PendingTestimonialsBlock = BlockBase<'testimonials'> &
  Omit<TestimonialsContent, 'items'> & { selection: TestimonialsSelection }
export type PendingFaqBlock = BlockBase<'faq'> &
  Omit<FaqContent, 'items'> & { selection: FaqSelection }
export type PendingProjectsPreviewBlock = BlockBase<'projects-preview'> &
  Omit<ProjectsPreviewContent, 'items'> & { selection: ProjectsPreviewSelection }
export type PendingBlogPreviewBlock = BlockBase<'blog-preview'> &
  Omit<BlogPreviewContent, 'items'> & { selection: BlogPreviewSelection }

/**
 * Bloc du payload: union discriminée par `_type` Vue (kebab-case). Les 10 blocs
 * autonomes sortent déjà dans leur forme V1 finale; les 5 blocs intelligents
 * sortent en forme « pending » (chaque `_type` n'apparaît qu'une fois: la
 * discrimination reste sûre).
 */
export type PayloadPageBlock =
  | AboutBlock
  | ContactBlock
  | MediaTextBlock
  | CtaBandBlock
  | ProcessBlock
  | StatsBlock
  | HighlightsBlock
  | LogosBlock
  | IframeBlock
  | VideoYoutubeBlock
  | PendingServicesBlock
  | PendingTestimonialsBlock
  | PendingFaqBlock
  | PendingProjectsPreviewBlock
  | PendingBlogPreviewBlock

/** Méta d'image dérivée de la figure d'un service (sert serviceImage() en
 *  phase suivante; additif, Service.image reste une URL string). */
export interface ServiceImageMeta {
  alt: string
  label: string
  caption: string
}

/** Traduction d'un doc de collection, normalisée (slugs de l'autre langue;
 *  catSlug seulement sur les articles). Sert le switcher de langue et
 *  setI18nParams sur les pages détail (T2b). */
export interface DocTranslation {
  lang: WfLocale
  slug?: string
  catSlug?: string
}

/** Extension additive: les docs de collection portent leurs traductions. */
export type Translated<T> = T & { translations?: DocTranslation[] }

/** Copie de la page de détail d'un service: la forme V1 + le bloc processus
 *  (champ dédié service.detail.process). Portée par CHAQUE document de la
 *  collection (spec 6.10, 12.16), plus de gabarit partagé sur servicesPage. */
export interface ServiceDetailPayload extends ServiceDetailContent {
  process: ProcessContent
}

export type ServiceWithMeta = Translated<
  // `detail` optionnel: en preview scopé, les services NON courants sortent en
  // carte sans leur copie de page (seul l'item de la route détail porte detail).
  // En prod statique, detail est toujours fourni (forme inchangée).
  Service & { imageMeta?: ServiceImageMeta; detail?: ServiceDetailPayload }
>

/** Projet du payload: la forme V1 + la copie de SA page de détail
 *  (spec 6.11, 12.16) et ses traductions. Extension additive de Project. */
export type ProjectWithDetail = Translated<Project & { detail?: ProjectDetailContent }>

export interface HomePagePayload {
  pageBuilder: PayloadPageBlock[]
  seo: PageSeo
}

export interface FixedPagePayload {
  hero: HeroPageBlock
  pageBuilder: PayloadPageBlock[]
  seo: PageSeo
}

/** Section de la page FAQ: un thème (titre affiché + slug d'ancre du document
 *  faqTheme, spec 6.17) et sa sélection de questions, SEMI-résolue comme les
 *  blocs intelligents: useFaqByTheme résout les items contre la banque
 *  (auto = toutes les questions du thème, tri alphabétique localisé;
 *  manual = ordre des refs, 12.15). */
export interface FaqPageSection {
  /** Absent = cas Studio dégradé (le schéma exige le thème). */
  theme?: { title: string; slug: string }
  mode: 'auto' | 'manual'
  /** Ids (_id Sanity) des questions choisies (mode manual). */
  refs: string[]
}

/** Page FAQ: la composition du listing groupé vit sur le document, une
 *  section par thème, dans l'ordre des sections (faqPage.sections, spec 6.7). */
export interface FaqPagePayload extends FixedPagePayload {
  sections: FaqPageSection[]
}

export interface BlogPagePayload extends FixedPagePayload, BlogPageContent {}

export interface OnePagerPayload {
  pageBuilder: PayloadPageBlock[]
  seo: PageSeo
}

/** Le modèle V1 complet, fetché et transformé une fois par langue. */
export interface ContentPayload {
  site: SiteContent
  legal: LegalContent
  heroes: {
    home: HeroHomeBlock
    onePager: HeroHomeBlock
  }
  pages: {
    home: HomePagePayload
    services: FixedPagePayload
    projects: FixedPagePayload
    about: FixedPagePayload
    blog: BlogPagePayload
    faq: FaqPagePayload
    contact: FixedPagePayload
    onePager: OnePagerPayload
  }
  collections: {
    services: ServiceWithMeta[]
    projects: ProjectWithDetail[]
    articles: Translated<Article>[]
    categories: Translated<Category>[]
    testimonials: Testimonial[]
    faqItems: FaqItem[]
  }
}

// ── Helpers génériques ────────────────────────────────────────────────────────

/** Garde d'exhaustivité: un cas non couvert casse la compilation, jamais le rendu. */
function assertNever(value: never): never {
  throw new Error(`Cas non couvert par la transformation Sanity: ${JSON.stringify(value)}`)
}

/** Normalise la nullabilité GROQ (null) vers l'optionnalité V1 (undefined). */
function opt<T>(value: Maybe<T>): T | undefined {
  return value ?? undefined
}

/**
 * Stega: en preview, le client Sanity encode des caractères invisibles APRÈS
 * chaque chaîne (ils alimentent les overlays clic-pour-éditer du Studio). Sans
 * effet sur une valeur AFFICHÉE; sur une valeur de LOGIQUE (mode comparé, slug
 * servant de clé/filtre/href, code de langue) ils cassent l'égalité stricte,
 * l'inclusion et les URLs. On les retire donc des chaînes NON affichées (le
 * texte affiché garde son stega: overlays préservés). No-op en prod (aucun
 * stega) et hors preview. Même classe de bug que le ratio nettoyé dans
 * resolveFigure; le jeu de code points est l'alphabet d'encodage de
 * @sanity/client (cf. stegaClean).
 */
const STEGA_RE = /[\u200B\u200C\u200D\u2060\u2061\u2062\u2063\uFEFF\u{1D173}-\u{1D17A}]/gu

function cleanLogic<T extends string | null | undefined>(value: T): T {
  return (typeof value === 'string' ? value.replace(STEGA_RE, '') : value) as T
}

/** Compteur affiché dérivé de l'index: 0 -> '01' (12.2, jamais stocké). */
function counter(index: number): string {
  return String(index + 1).padStart(2, '0')
}

function requireDoc<T>(doc: T | null, name: string): T {
  if (!doc) {
    throw new Error(
      `Document Sanity « ${name} » introuvable (seed incomplet ou langue manquante): generate interrompu.`
    )
  }
  return doc
}

// ── Mapping des _type (tables 2.1 et 2.2 de la spec) ─────────────────────────

const PAGE_BLOCK_TYPE_MAP = {
  about: 'about',
  services: 'services',
  testimonials: 'testimonials',
  faq: 'faq',
  contact: 'contact',
  mediaText: 'media-text',
  ctaBand: 'cta-band',
  process: 'process',
  stats: 'stats',
  highlights: 'highlights',
  logos: 'logos',
  projectsPreview: 'projects-preview',
  blogPreview: 'blog-preview',
  iframe: 'iframe',
  videoYoutube: 'video-youtube'
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

/** `_type` Sanity (camelCase) -> `_type` Vue (kebab-case). Inconnu = erreur
 *  immédiate (un nouveau bloc au Studio exige son pendant Vue). */
export function mapBlockType(sanityType: string): string {
  const maps: Record<string, string> = { ...PAGE_BLOCK_TYPE_MAP, ...ARTICLE_BLOCK_TYPE_MAP }
  const mapped = maps[sanityType]
  if (!mapped) {
    throw new Error(`_type Sanity sans équivalent Vue: « ${sanityType} » (tables 2.1 et 2.2 de la spec)`)
  }
  return mapped
}

// ── Liens (12.5), localisés (T2b) ────────────────────────────────────────────

// Chemins COMPLETS (préfixe /en inclus pour EN) via le route-map: routePath /
// onePagerPath appliquent localePrefix. Les liens du payload EN pointent donc
// l'arbre /en, ceux du payload FR restent identiques à V1.

/** Route d'un document référencé (exporté: useLinkResolver s'appuie dessus,
 *  AUCUNE duplication du mapping _type -> route hors de cette fonction et du
 *  route-map qu'elle consomme). */
export function docPath(ref: SanityLinkRef, locale: WfLocale): string {
  const requireSlug = (): string => {
    if (!ref.slug) {
      throw new Error(`Référence ${ref._type} sans slug (id ${ref._id}): lien irrésoluble`)
    }
    return cleanLogic(ref.slug)
  }
  switch (ref._type) {
    case 'homePage':
      return routePath('home', locale)
    case 'servicesPage':
      return routePath('services', locale)
    case 'projectsPage':
      return routePath('projects', locale)
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
    case 'project':
      return `${routePath('projects', locale)}/${requireSlug()}`
    case 'article': {
      // La catégorie détermine le segment parent: /blog/<cat>/<slug> ou /blog/<slug>.
      const cat = cleanLogic(ref.catSlug)
      return cat
        ? `${routePath('blog', locale)}/${cat}/${requireSlug()}`
        : `${routePath('blog', locale)}/${requireSlug()}`
    }
    case 'category':
      return `${routePath('blog', locale)}/${requireSlug()}`
    case 'legalPage': {
      // Pas de slug sur legalPage: routage par _id déterministe du seed.
      const key = legalRouteKeyForId(ref._id)
      if (key) return routePath(key, locale)
      throw new Error(`Page légale inconnue (id ${ref._id}): lien irrésoluble`)
    }
    default:
      return assertNever(ref._type)
  }
}

/**
 * `link` Sanity -> href string, localisé. internal = route du doc référencé;
 * anchor = `#ancre` (ou `/route#ancre` si une page est référencée); external =
 * URL telle quelle. Un lien irrésoluble (ref brisée, URL manquante) interrompt
 * le build: jamais un site avec des liens morts silencieux.
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
        throw new Error(`Lien interne sans référence (publiée): « ${link.label} »`)
      }
      return docPath(link.internalRef, locale)
    }
    default:
      return assertNever(link.type)
  }
}

/** Couple { label, href } des CTA V1. */
function linkPair(link: SanityLink, locale: WfLocale): { label: string; href: string } {
  return { label: link.label, href: resolveLink(link, locale) }
}

// ── Figures (12.6) ───────────────────────────────────────────────────────────

/** Shape commune des images V1 (alt normalisé en string, vide si absent). */
export interface ResolvedFigure {
  ratio: string
  src?: string
  alt: string
  label: string
  caption: string
}

// Ratios par défaut par usage (12.6), calés sur les valeurs V1 dominantes. Le
// seed stocke toujours le ratio explicite: ces défauts servent le contenu créé
// ensuite au Studio (les interfaces front exigent un ratio string).
const RATIOS = {
  heroVisual: '4/5',
  heroVisualMobile: '4/3',
  pageHero: '2/1',
  aboutPhoto: '3/4',
  mediaText: '4/5',
  serviceImage: '4/3',
  projectCover: '4/3',
  projectGalleryItem: '4/5',
  articleCover: '16/9',
  articleImage: '4/3',
  articleGalleryItem: '4/3',
  video: '16/9'
} as const

/**
 * `figure` Sanity -> image V1. `src` absent (figure sans image) reste absent:
 * le fragment <Image> rend son placeholder soigné, jamais une 404.
 */
export function resolveFigure(figure: SanityFigure, defaultRatio: string): ResolvedFigure {
  return {
    // Le ratio devient une valeur CSS (aspect-ratio / --wf-hero-ratio). En preview,
    // le stega encode des caractères invisibles dans les chaînes; collés à « 4/5 »
    // ils rendent la valeur CSS INVALIDE (cadre effondré, image à hauteur 0). On ne
    // garde que les caractères valides d'un ratio (chiffres, /, .). No-op en prod
    // (ratio déjà propre) et hors stega.
    ratio: (figure.ratio ?? defaultRatio).replace(/[^0-9/.]/g, '') || defaultRatio,
    src: opt(figure.src),
    alt: figure.alt ?? '',
    label: figure.label,
    caption: figure.caption
  }
}

// ── Portable Text (12.1) ─────────────────────────────────────────────────────

/**
 * Portable Text -> RichTextEntry[]. `normal` -> paragraph, `h2`/`h3` -> heading,
 * items de liste CONSÉCUTIFS regroupés en une entrée { kind: 'list', items }.
 * Les marks (strong, em, link) sont APLATIES en texte brut: le bloc Vue
 * rich-text rend `{{ block.text }}` sans interpréter de HTML (parité V1, R3).
 */
export function ptToRichTextEntries(blocks: Maybe<SanityPortableTextBlock[]>): RichTextEntry[] {
  const entries: RichTextEntry[] = []
  for (const block of blocks ?? []) {
    const text = (block.children ?? []).map((child) => child.text ?? '').join('')
    if (block.listItem) {
      const last = entries[entries.length - 1]
      if (last && last.kind === 'list' && last.items) {
        last.items.push(text)
      } else {
        entries.push({ kind: 'list', items: [text] })
      }
    } else if (block.style === 'h2' || block.style === 'h3') {
      entries.push({ kind: 'heading', text })
    } else {
      entries.push({ kind: 'paragraph', text })
    }
  }
  return entries
}

// ── Dates légales (12.11) ────────────────────────────────────────────────────

/**
 * Date ISO (YYYY-MM-DD) -> date longue localisée (« 1er janvier 2026 » en
 * fr-CA). Champ vide -> jeton todo `[...]` que le gabarit legal-page rend
 * encadré via sa mécanique inlineParts (inchangée).
 */
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
  // fr-CA: « 1 janvier 2026 » -> « 1er janvier 2026 » (usage typographique).
  return locale === 'en' ? formatted : formatted.replace(/^1 /, '1er ')
}

// Jetons todo des dates légales, PAR LANGUE de rendu (T2b, étape 8). FR reste
// identique aux placeholders V1 (parité de texte du gate T2a); EN porte ses
// propres jetons (les seeds EN portent leurs propres textes, ces jetons sont
// le repli d'un champ de date vide).
const LEGAL_DATE_TODO: Record<WfLocale, { effective: string; updated: string }> = {
  fr: {
    effective: "[date d'entrée en vigueur, ex. 1er janvier 2026]",
    updated: '[date de dernière mise à jour, ex. 1er janvier 2026]'
  },
  en: {
    effective: '[effective date, e.g. January 1, 2026]',
    updated: '[last updated date, e.g. January 1, 2026]'
  }
}

// ── Briques partagées ────────────────────────────────────────────────────────

function transformCtaBand(raw: SanityCtaBand, locale: WfLocale): CtaBandContent {
  return {
    title: raw.title,
    subtitle: opt(raw.subtitle),
    primaryCta: linkPair(raw.primaryCta, locale),
    secondaryCta: raw.secondaryCta ? linkPair(raw.secondaryCta, locale) : undefined
  }
}

function transformProcess(raw: SanityProcess, locale: WfLocale): ProcessContent {
  return {
    eyebrow: opt(raw.eyebrow),
    heading: opt(raw.heading),
    lead: opt(raw.lead),
    cta: raw.cta ? linkPair(raw.cta, locale) : undefined,
    steps: raw.steps.map((step, index) => ({
      n: counter(index),
      title: step.title,
      body: step.body
    }))
  }
}

// ── Vidéo YouTube (façade: l'ID alimente vignette + URL d'intégration) ───────

const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/

/**
 * URL YouTube (ou identifiant brut) -> identifiant de vidéo (11 caractères).
 * Couvre watch?v=, youtu.be/, /embed/, /shorts/, /v/, /live/ et l'ID seul.
 * Retourne undefined si rien d'exploitable: le transform interrompt alors le
 * build avec un message clair, jamais une vidéo morte silencieuse.
 */
export function youtubeId(raw: string): string | undefined {
  const value = (raw ?? '').trim()
  if (!value) return undefined
  if (YT_ID_RE.test(value)) return value
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '')
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0] ?? ''
      return YT_ID_RE.test(id) ? id : undefined
    }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const v = url.searchParams.get('v')
      if (v && YT_ID_RE.test(v)) return v
      const m = url.pathname.match(/\/(?:embed|shorts|v|live)\/([A-Za-z0-9_-]{11})/)
      return m ? m[1] : undefined
    }
    return undefined
  } catch {
    // Pas une URL absolue: tenter un fragment watch?v= ou un segment connu.
    const byParam = value.match(/[?&]v=([A-Za-z0-9_-]{11})/)
    if (byParam) return byParam[1]
    const bySlash = value.match(/(?:embed|shorts|v|live)\/([A-Za-z0-9_-]{11})/)
    return bySlash ? bySlash[1] : undefined
  }
}

function transformVideoYoutube(raw: SanityVideoYoutubeBlock, defaultPosterRatio: string): VideoYoutubeContent {
  const videoId = youtubeId(cleanLogic(raw.source))
  if (!videoId) {
    throw new Error(`Bloc vidéo YouTube: source « ${raw.source} » sans identifiant de vidéo reconnaissable.`)
  }
  const posterMode = cleanLogic(raw.posterMode)
  return {
    videoId,
    posterMode,
    poster:
      posterMode === 'custom' && raw.poster
        ? resolveFigure(raw.poster, defaultPosterRatio)
        : undefined,
    title: opt(raw.title)
  }
}

function transformHeroHomeBody(raw: SanityHeroHome, locale: WfLocale): HeroContent {
  return {
    kicker: opt(raw.kicker),
    title: raw.title,
    lead: raw.lead,
    primaryCta: linkPair(raw.primaryCta, locale),
    secondaryCta: linkPair(raw.secondaryCta, locale),
    meta: raw.meta.map((m) => ({ label: m.label, value: m.value })),
    visual: resolveFigure(raw.visual, RATIOS.heroVisual),
    visualMobile: resolveFigure(raw.visualMobile, RATIOS.heroVisualMobile)
  }
}

function transformPageHeroBody(raw: SanityPageHero, locale: WfLocale): PageHero {
  return {
    title: raw.title,
    lead: opt(raw.lead),
    cta: raw.cta ? linkPair(raw.cta, locale) : undefined,
    image: raw.image ? resolveFigure(raw.image, RATIOS.pageHero) : undefined
  }
}

// ── Bloc héros (le héros devient un bloc discriminé par _type) ────────────────

// `_type` Sanity (camelCase) -> `_type` Vue (kebab-case) des blocs héros.
const HERO_BLOCK_TYPE_MAP = { heroHome: 'hero-home', pageHero: 'hero-page' } as const

/** Bloc héros brut -> bloc héros V1 (corps transformé + _type Vue + _key). */
function transformHeroBlock(raw: SanityRawHeroBlock, locale: WfLocale): HeroBlock {
  switch (raw._type) {
    case 'heroHome':
      return { _type: HERO_BLOCK_TYPE_MAP.heroHome, _key: raw._key, ...transformHeroHomeBody(raw, locale) }
    case 'pageHero':
      return { _type: HERO_BLOCK_TYPE_MAP.pageHero, _key: raw._key, ...transformPageHeroBody(raw, locale) }
    default:
      return assertNever(raw)
  }
}

function requireHero(raw: Maybe<SanityRawHeroBlock>, name: string): SanityRawHeroBlock {
  if (!raw) throw new Error(`Document « ${name} » sans bloc héros (seed/contenu incomplet).`)
  return raw
}

// Gardes de rétrécissement: les pages d'accueil portent toujours un heroHome,
// les pages fixes un pageHero. On garde des types précis dans le payload (pour
// que .lead etc. restent accessibles), tout en passant par le transform commun.
function asHomeHero(raw: Maybe<SanityRawHeroBlock>, name: string, locale: WfLocale): HeroHomeBlock {
  const b = transformHeroBlock(requireHero(raw, name), locale)
  if (b._type !== 'hero-home') throw new Error(`Document « ${name} »: héros attendu de type accueil.`)
  return b
}
function asPageHero(raw: Maybe<SanityRawHeroBlock>, name: string, locale: WfLocale): HeroPageBlock {
  const b = transformHeroBlock(requireHero(raw, name), locale)
  if (b._type !== 'hero-page') throw new Error(`Document « ${name} »: héros attendu de type page.`)
  return b
}

/** Replis SEO (12.10): title vide -> titre du héros; description vide -> lead
 *  du héros, sinon defaultDescription des globales. L'og:image garde sa chaîne
 *  de replis côté usePageSeo (defaultOgImage du payload puis /og/og-default.jpg):
 *  `image` reste l'ogImage propre à la page, jamais le repli copié. */
function resolveSeo(
  seo: Maybe<SanitySeo>,
  heroTitle: string,
  heroLead: Maybe<string>,
  defaults: SiteContent['seo']
): PageSeo {
  return {
    title: seo?.title ?? heroTitle,
    description: seo?.description ?? heroLead ?? defaults.defaultDescription ?? '',
    image: opt(seo?.ogImage)
  }
}

// ── Page builder (15 blocs) ──────────────────────────────────────────────────

function transformBlock(block: SanityRawBlock, site: SiteContent, locale: WfLocale): PayloadPageBlock {
  switch (block._type) {
    case 'about':
      return {
        _type: 'about',
        _key: block._key,
        eyebrow: block.eyebrow,
        heading: block.heading,
        body: block.body,
        photo: resolveFigure(block.photo, RATIOS.aboutPhoto),
        figcaption: block.figcaption,
        diffs: block.diffs.map((diff, index) => ({
          n: counter(index),
          title: diff.title,
          body: diff.body
        }))
      }
    case 'services':
      return {
        _type: 'services',
        _key: block._key,
        eyebrow: block.eyebrow,
        heading: block.heading,
        lead: block.lead,
        ctaLabel: block.cta.label,
        ctaHref: resolveLink(block.cta, locale),
        selection: {
          mode: cleanLogic(block.mode),
          refs: (block.refs ?? []).map((r) => cleanLogic(r)),
          limit: opt(block.limit)
        }
      }
    case 'testimonials':
      return {
        _type: 'testimonials',
        _key: block._key,
        eyebrow: block.eyebrow,
        heading: block.heading,
        selection: {
          mode: cleanLogic(block.mode),
          service: cleanLogic(opt(block.service)),
          project: cleanLogic(opt(block.project)),
          refs: (block.refs ?? []).map((r) => cleanLogic(r)),
          limit: opt(block.limit)
        }
      }
    case 'faq':
      return {
        _type: 'faq',
        _key: block._key,
        eyebrow: block.eyebrow,
        heading: block.heading,
        // Sélection manuelle pure (spec 4.4): refs résolues dans l'ordre de
        // l'array par resolveBlocks (12.8).
        selection: { refs: (block.refs ?? []).map((r) => cleanLogic(r)) }
      }
    case 'contact': {
      // Join sur siteSettings.contact (12.4): le bloc stocke les libellés, les
      // valeurs (numéro, courriel, adresse, heures) ont un seul point d'édition.
      const contact = site.contact
      return {
        _type: 'contact',
        _key: block._key,
        eyebrow: block.eyebrow,
        heading: block.heading,
        lead: block.lead,
        meta: [
          { label: block.metaLabels.phone, value: contact.phone, href: `tel:${contact.phoneE164}` },
          { label: block.metaLabels.email, value: contact.email, href: `mailto:${contact.email}` },
          {
            label: block.metaLabels.address,
            lines: [contact.address.line1, `${contact.address.cityProv}, ${contact.address.postal}`]
          },
          { label: block.metaLabels.hours, lines: [contact.hours.weekdays, contact.hours.weekend] }
        ],
        form: {
          // Les flags required restent du code (spec 4.5), seuls les libellés
          // viennent du Studio.
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
            body: block.form.errorBanner.body.replace('{email}', contact.email)
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
    case 'mediaText':
      return {
        _type: 'media-text',
        _key: block._key,
        eyebrow: opt(block.eyebrow),
        heading: block.heading,
        body: block.body,
        mediaSide: block.mediaSide,
        image: resolveFigure(block.image, RATIOS.mediaText),
        cta: block.cta ? linkPair(block.cta, locale) : undefined
      }
    case 'ctaBand':
      return { _type: 'cta-band', _key: block._key, ...transformCtaBand(block, locale) }
    case 'process':
      return { _type: 'process', _key: block._key, ...transformProcess(block, locale) }
    case 'stats':
      return {
        _type: 'stats',
        _key: block._key,
        eyebrow: opt(block.eyebrow),
        heading: opt(block.heading),
        items: block.items.map((item) => ({ value: item.value, label: item.label }))
      }
    case 'highlights':
      return {
        _type: 'highlights',
        _key: block._key,
        eyebrow: opt(block.eyebrow),
        heading: opt(block.heading),
        lead: opt(block.lead),
        items: block.items.map((item) => ({
          icon: opt(item.icon),
          title: item.title,
          body: item.body
        }))
      }
    case 'logos':
      return {
        _type: 'logos',
        _key: block._key,
        eyebrow: opt(block.eyebrow),
        heading: opt(block.heading),
        items: block.items.map((item) => ({ label: item.label }))
      }
    case 'projectsPreview':
      return {
        _type: 'projects-preview',
        _key: block._key,
        eyebrow: opt(block.eyebrow),
        heading: block.heading,
        lead: opt(block.lead),
        ctaLabel: block.cta ? block.cta.label : undefined,
        ctaHref: block.cta ? resolveLink(block.cta, locale) : undefined,
        selection: {
          mode: cleanLogic(block.mode),
          service: cleanLogic(opt(block.service)),
          refs: (block.refs ?? []).map((r) => cleanLogic(r)),
          limit: opt(block.limit)
        }
      }
    case 'blogPreview':
      return {
        _type: 'blog-preview',
        _key: block._key,
        eyebrow: opt(block.eyebrow),
        heading: block.heading,
        lead: opt(block.lead),
        ctaLabel: block.cta ? block.cta.label : undefined,
        ctaHref: block.cta ? resolveLink(block.cta, locale) : undefined,
        selection: { limit: block.limit ?? 3 }
      }
    case 'iframe':
      return {
        _type: 'iframe',
        _key: block._key,
        // url devient le src de l'iframe (valeur de logique): stega nettoyé.
        url: cleanLogic(block.url),
        title: block.title,
        // Même piège que le ratio des figures: valeur CSS aspect-ratio, on ne
        // garde que chiffres, / et . (no-op en prod, défaut 16/9 si vide/pollué).
        ratio: (block.ratio ?? '16/9').replace(/[^0-9/.]/g, '') || '16/9',
        caption: opt(block.caption)
      }
    case 'videoYoutube':
      return { _type: 'video-youtube', _key: block._key, ...transformVideoYoutube(block, RATIOS.video) }
    default:
      return assertNever(block)
  }
}

export function transformPageBuilder(blocks: Maybe<SanityRawBlock[]>, site: SiteContent, locale: WfLocale): PayloadPageBlock[] {
  return (blocks ?? []).map((block) => transformBlock(block, site, locale))
}

// ── Corps d'article (7 blocs) ────────────────────────────────────────────────

function transformArticleBlock(block: SanityRawArticleBlock, locale: WfLocale): ArticleBlock {
  switch (block._type) {
    case 'articleLead':
      return { _type: 'lead', _key: block._key, text: block.text }
    case 'articleRichText':
      return { _type: 'rich-text', _key: block._key, blocks: ptToRichTextEntries(block.body) }
    case 'articleImage':
      return {
        _type: 'image',
        _key: block._key,
        image: resolveFigure(block.image, RATIOS.articleImage)
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
        images: block.images.map((figure) => resolveFigure(figure, RATIOS.articleGalleryItem))
      }
    case 'articleCallout':
      return {
        _type: 'callout',
        _key: block._key,
        tone: opt(block.tone),
        title: opt(block.title),
        text: block.text
      }
    case 'articleInlineCta':
      return {
        _type: 'inline-cta',
        _key: block._key,
        text: block.text,
        ctaLabel: block.cta.label,
        ctaHref: resolveLink(block.cta, locale)
      }
    default:
      return assertNever(block)
  }
}

export function transformArticleBody(blocks: Maybe<SanityRawArticleBlock[]>, locale: WfLocale): ArticleBlock[] {
  return (blocks ?? []).map((block) => transformArticleBlock(block, locale))
}

// ── Globales (siteSettings) ──────────────────────────────────────────────────

/**
 * Téléphone affiché -> E.164 (12.13, jamais stocké): retirer tout caractère
 * non numérique, préfixer `+1` (10 chiffres, plan nord-américain) ou `+`
 * (11 chiffres commençant par 1). Autre forme: `+` + chiffres, au mieux.
 */
export function derivePhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

function transformSiteSettings(raw: SanitySiteSettings, locale: WfLocale): SiteContent {
  return {
    brand: {
      name: raw.brand.name,
      // Logo résolu en src (12.14); alt vide: le lien porte homeAriaLabel.
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
    nav: {
      // Liens de type anchor: resolveLink rend '#x' (nav du one-pager).
      landing: {
        primary: raw.nav.landing.primary.map((link) => ({
          label: link.label,
          anchor: resolveLink(link, locale)
        })),
        cta: { label: raw.nav.landing.cta.label, anchor: resolveLink(raw.nav.landing.cta, locale) }
      },
      // Liens de type internal: resolveLink rend la route du doc référencé.
      multipage: {
        primary: raw.nav.multipage.primary.map((link) => ({
          label: link.label,
          route: resolveLink(link, locale)
        })),
        cta: { label: raw.nav.multipage.cta.label, route: resolveLink(raw.nav.multipage.cta, locale) }
      }
    },
    footer: {
      // Liens principaux du pied: liste dédiée (spec 6.1), le Footer ne lit
      // plus nav.multipage.primary.
      primary: raw.footer.primary.map((link) => linkPair(link, locale)),
      socials: raw.footer.socials.map((s) => ({ label: s.label, href: s.href, icon: s.icon })),
      // Normalisation (12.12): absents -> [] (interfaces front non optionnelles).
      utility: (raw.footer.utility ?? []).map((link) => ({
        href: resolveLink(link, locale),
        label: link.label
      })),
      pageLinks: (raw.footer.pageLinks ?? []).map((link) => ({
        href: resolveLink(link, locale),
        label: link.label
      })),
      // Le jeton {year} reste tel quel (Footer.vue le remplace, inchangé).
      copyright: raw.footer.copyright,
      credit: {
        label: raw.footer.credit.label,
        studio: raw.footer.credit.studio,
        studioUrl: raw.footer.credit.studioUrl,
        product: raw.footer.credit.product
      }
    },
    // SEO globaux (12.10): suffixe du gabarit de titre (consommé par la
    // fermeture de nuxt.config) + replis description / og:image (usePageSeo).
    seo: {
      titleSuffix: raw.seo.titleSuffix,
      defaultDescription: opt(raw.seo.defaultDescription),
      defaultOgImage: opt(raw.seo.defaultOgImage)
    }
  }
}

// ── Pages légales ────────────────────────────────────────────────────────────

function transformLegalBlock(block: SanityLegalBlock): LegalBlock {
  switch (block._type) {
    case 'legalParagraph':
      return block.text
    case 'legalList':
      return { list: block.items }
    case 'legalTodo':
      return { todo: block.text }
    default:
      return assertNever(block)
  }
}

function transformLegalDoc(doc: SanityLegalPage, locale: WfLocale): LegalDoc {
  return {
    title: doc.title,
    effective: formatLegalDate(doc.effective, locale, LEGAL_DATE_TODO[locale].effective),
    updated: formatLegalDate(doc.updated, locale, LEGAL_DATE_TODO[locale].updated),
    sections: doc.sections.map((section) => ({
      title: section.title,
      body: section.body.map(transformLegalBlock)
    }))
  }
}

function transformLegal(pages: SanityLegalPage[], locale: WfLocale): LegalContent {
  // Ids déterministes du seed (spec section 11): legalPage-<doc>-<lang>.
  const findDoc = (key: 'conditions' | 'confidentialite'): SanityLegalPage => {
    const id = `legalPage-${key}-${locale}`
    const doc = pages.find((page) => page._id === id)
    if (!doc) {
      throw new Error(`Document Sanity « ${id} » introuvable: generate interrompu.`)
    }
    return doc
  }
  return {
    conditions: transformLegalDoc(findDoc('conditions'), locale),
    confidentialite: transformLegalDoc(findDoc('confidentialite'), locale)
  }
}

// ── Copies des pages de détail (portées par chaque doc de collection, 12.16) ─

function transformServiceDetail(raw: SanityServiceDetail, locale: WfLocale): ServiceDetailPayload {
  return {
    benefits: { heading: raw.benefits.heading, cta: linkPair(raw.benefits.cta, locale) },
    included: { heading: raw.included.heading },
    process: transformProcess(raw.process, locale),
    projects: {
      eyebrow: opt(raw.projects.eyebrow),
      heading: raw.projects.heading,
      lead: opt(raw.projects.lead),
      ctaLabel: raw.projects.cta ? raw.projects.cta.label : undefined,
      ctaHref: raw.projects.cta ? resolveLink(raw.projects.cta, locale) : undefined
    },
    testimonials: { eyebrow: raw.testimonials.eyebrow, heading: raw.testimonials.heading },
    cta: transformCtaBand(raw.cta, locale)
  }
}

function transformProjectDetail(raw: SanityProjectDetail, locale: WfLocale): ProjectDetailContent {
  return {
    gallery: { heading: raw.gallery.heading },
    caseStudy: {
      eyebrow: raw.caseStudy.eyebrow,
      heading: raw.caseStudy.heading,
      challengeLabel: raw.caseStudy.challengeLabel,
      solutionLabel: raw.caseStudy.solutionLabel,
      resultLabel: raw.caseStudy.resultLabel
    },
    testimonial: { eyebrow: raw.testimonial.eyebrow, heading: raw.testimonial.heading },
    similar: {
      eyebrow: opt(raw.similar.eyebrow),
      heading: raw.similar.heading,
      lead: opt(raw.similar.lead),
      ctaLabel: raw.similar.cta ? raw.similar.cta.label : undefined,
      ctaHref: raw.similar.cta ? resolveLink(raw.similar.cta, locale) : undefined
    },
    cta: transformCtaBand(raw.cta, locale)
  }
}

// ── Collections ──────────────────────────────────────────────────────────────

/** Traductions normalisées d'un doc de collection: entrées sans slug ou de
 *  langue inconnue écartées (doc orphelin = tableau vide, repli du switcher). */
function transformTranslations(raw: Maybe<SanityDocTranslation[]>): DocTranslation[] {
  return (raw ?? [])
    .filter((t): t is SanityDocTranslation => Boolean(t && (cleanLogic(t.lang) === 'fr' || cleanLogic(t.lang) === 'en') && t.slug))
    .map((t) => ({
      lang: cleanLogic(t.lang) as WfLocale,
      slug: cleanLogic(opt(t.slug)),
      catSlug: cleanLogic(opt(t.catSlug))
    }))
}

function transformService(raw: SanityService, index: number, locale: WfLocale): ServiceWithMeta {
  const figure = resolveFigure(raw.image, RATIOS.serviceImage)
  return {
    slug: cleanLogic(raw.slug),
    // Compteur S/01 dérivé de la position order asc (12.2).
    n: `S/${counter(index)}`,
    title: raw.title,
    summary: raw.summary,
    meta: raw.meta,
    // Contrat des blocs: image en src string. Figure sans image -> '' (le seed
    // fournit toutes les images de service; cas Studio dégradé, jamais une 404).
    image: figure.src ?? '',
    intro: raw.intro,
    benefits: raw.benefits.map((b) => ({ title: b.title, body: b.body })),
    // Copie de la page /services/<slug> de CE service (6.10, 12.16). En preview
    // scopé, absente pour les services NON courants (carte): garde par présence.
    detail: raw.detail ? transformServiceDetail(raw.detail, locale) : undefined,
    related: (raw.related ?? []).map((r) => cleanLogic(r)),
    imageMeta: { alt: figure.alt, label: figure.label, caption: figure.caption },
    translations: transformTranslations(raw.translations)
  }
}

function transformProject(raw: SanityProject, locale: WfLocale): ProjectWithDetail {
  return {
    slug: cleanLogic(raw.slug),
    title: raw.title,
    excerpt: raw.excerpt,
    service: cleanLogic(raw.service),
    location: raw.location,
    year: raw.year,
    cover: resolveFigure(raw.cover, RATIOS.projectCover),
    // Galerie absente pour les projets NON courants en preview scopé -> [].
    gallery: (raw.gallery ?? []).map((figure) => resolveFigure(figure, RATIOS.projectGalleryItem)),
    challenge: raw.challenge,
    solution: raw.solution,
    result: raw.result,
    stats: opt(raw.stats),
    // Copie de la page /projets/<slug> de CE projet (6.11, 12.16). Absente pour
    // les projets NON courants en preview scopé: garde par présence.
    detail: raw.detail ? transformProjectDetail(raw.detail, locale) : undefined,
    // _id Sanity du témoignage: cohérent avec testimonial.id (= _id) plus bas.
    testimonial: opt(raw.testimonial),
    featured: opt(raw.featured),
    translations: transformTranslations(raw.translations)
  }
}

function transformArticle(raw: SanityArticle, locale: WfLocale): Translated<Article> {
  return {
    slug: cleanLogic(raw.slug),
    title: raw.title,
    excerpt: raw.excerpt,
    cover: resolveFigure(raw.cover, RATIOS.articleCover),
    date: raw.date,
    author: raw.author,
    category: cleanLogic(opt(raw.category)),
    readingTime: raw.readingTime,
    body: transformArticleBody(raw.body, locale),
    translations: transformTranslations(raw.translations)
  }
}

function transformTestimonial(raw: SanityTestimonial): Testimonial {
  return {
    // id = _id Sanity: les refs des blocs manuels pointent les mêmes _id,
    // cohérence garantie y compris pour des documents créés au Studio.
    id: raw._id,
    quote: raw.quote,
    name: raw.name,
    context: raw.context,
    service: cleanLogic(opt(raw.service)),
    project: cleanLogic(opt(raw.project)),
    featured: opt(raw.featured)
  }
}

function transformFaqItem(raw: SanityFaqItem): FaqItem {
  return {
    id: raw._id,
    q: raw.question,
    a: raw.answer,
    // Slug du faqTheme référencé (plus le libellé): clé de filtre de useFaq.
    theme: cleanLogic(opt(raw.theme))
  }
}

// ── Graphe complet ───────────────────────────────────────────────────────────

/**
 * Payload brut d'une langue -> modèle V1 exact. Toute donnée manquante qui
 * rendrait le site incomplet (singleton absent, page légale manquante, lien
 * brisé) interrompt la transformation avec un message clair: un generate sans
 * contenu doit échouer, jamais produire un site vide.
 */
export function transformGraph(raw: SanityGraph, locale: WfLocale): ContentPayload {
  const siteSettings = requireDoc(raw.siteSettings, 'siteSettings')
  const homePage = requireDoc(raw.homePage, 'homePage')
  const servicesPage = requireDoc(raw.servicesPage, 'servicesPage')
  const projectsPage = requireDoc(raw.projectsPage, 'projectsPage')
  const aboutPage = requireDoc(raw.aboutPage, 'aboutPage')
  const blogPage = requireDoc(raw.blogPage, 'blogPage')
  const faqPage = requireDoc(raw.faqPage, 'faqPage')
  const contactPage = requireDoc(raw.contactPage, 'contactPage')
  const onePager = requireDoc(raw.onePager, 'onePager')

  const site = transformSiteSettings(siteSettings, locale)
  const seoDefaults = site.seo
  const builder = (blocks: Maybe<SanityRawBlock[]>): PayloadPageBlock[] =>
    transformPageBuilder(blocks, site, locale)

  const heroes = {
    home: asHomeHero(homePage.hero, 'homePage', locale),
    onePager: asHomeHero(onePager.hero, 'onePager', locale)
  }

  const servicesHero = asPageHero(servicesPage.hero, 'servicesPage', locale)
  const projectsHero = asPageHero(projectsPage.hero, 'projectsPage', locale)
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
      projects: {
        hero: projectsHero,
        pageBuilder: builder(projectsPage.pageBuilder),
        seo: resolveSeo(projectsPage.seo, projectsHero.title, projectsHero.lead, seoDefaults)
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
        // Composition du listing de la page FAQ (6.7): une section par thème,
        // dans l'ordre des sections; sélection SEMI-résolue (useFaqByTheme
        // résout les items contre la banque, 12.15).
        sections: faqPage.sections.map((section) => ({
          theme: section.theme
            ? { title: section.theme.title, slug: cleanLogic(section.theme.slug) }
            : undefined,
          mode: cleanLogic(section.mode),
          refs: (section.items ?? []).map((r) => cleanLogic(r))
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
      services: raw.services.map((service, index) => transformService(service, index, locale)),
      projects: raw.projects.map((project) => transformProject(project, locale)),
      articles: raw.articles.map((article) => transformArticle(article, locale)),
      categories: raw.categories.map((category) => ({
        slug: cleanLogic(category.slug),
        title: category.title,
        description: category.description,
        translations: transformTranslations(category.translations)
      })),
      testimonials: raw.testimonials.map(transformTestimonial),
      faqItems: raw.faqItems.map(transformFaqItem)
    }
  }
}
