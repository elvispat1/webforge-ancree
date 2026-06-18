// usePageSeo — point d'entrée SEO unique des pages.
//
// Chaque page appelle usePageSeo() au lieu d'empiler useSeoMeta / useHead /
// useSchemaOrg: titre (gabarit « %s | {site.name} » du module @nuxtjs/seo),
// description, OpenGraph (og:image en URL ABSOLUE avec repli de marque),
// métas d'article, robots, et graphe Schema.org (WebSite assaini, WebPage
// sous-typé, BreadcrumbList, Article, LocalBusiness, FAQPage). Bâti par-dessus
// les primitives du module @nuxtjs/seo (useSeoMeta, useSchemaOrg, define*).
//
// Agnostique de la famille: aucun import Minimaliste ni contenu de site. La
// marque vient de la config de site (nuxt.config `site`) et des arguments;
// les replis globaux (description et og:image par défaut, spec 12.10) viennent
// du payload (siteSettings.seo), lus par usePayload sans toucher la signature.
// Pattern transversal: destination webforge-core au deuxième consommateur.

import type { UseSeoMetaInput } from '@unhead/vue'
import { hasProtocol, joinURL } from 'ufo'
import type { Crumb } from '~/config/route-map'

/** Visuel OpenGraph de repli CODE, dernier recours de la chaîne (12.10):
 *  image de la page -> defaultOgImage des globales -> ce fichier de marque. */
export const OG_FALLBACK_IMAGE = '/og/og-default.jpg'

/** Dimensions canoniques de l'og:image (ratio social standard, MAJ-01): le crop
 *  CDN imposé ci-dessous ET le repli code `/og/og-default.jpg` sortent tous deux
 *  en 1200x630. Émises en og:image:width/height pour fiabiliser l'aperçu social. */
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

/** Crop large 16:9 des ImageObject du graphe Schema.org (Article, LocalBusiness):
 *  borne le visuel servi aux moteurs au lieu de l'original CDN brut (MAJ-01/A4). */
const SCHEMA_IMAGE_WIDTH = 1200
const SCHEMA_IMAGE_HEIGHT = 675

/** Sous-types Schema.org permis pour le nœud WebPage de la page. */
export type PageSeoWebPageType =
  | 'AboutPage'
  | 'CollectionPage'
  | 'ContactPage'
  | 'FAQPage'
  | 'ItemPage'
  | 'ProfilePage'
  | 'SearchResultsPage'

/** Métadonnées d'article (pages de billet, avec `type: 'article'`). */
export interface PageSeoArticle {
  /** Date de publication ISO (YYYY-MM-DD). */
  datePublished: string
  /** Date de mise à jour ISO; défaut: datePublished. */
  dateModified?: string
  /** Nom de l'auteur (nœud Person). */
  author?: string
  /** Visuel du billet (chemin relatif), porté par le nœud Article. */
  image?: string
}

/** Identité locale (une page par site, l'accueil): nœud LocalBusiness complet. */
export interface PageSeoLocalBusiness {
  name: string
  /** Téléphone au format E.164 (+1...). */
  telephone?: string
  email?: string
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  /** Zone desservie (noms de lieux). */
  areaServed?: string[]
  /** Visuel de l'entreprise (chemin relatif ou URL absolue). */
  image?: string
  /** Année (ou date ISO) de fondation. */
  foundingDate?: string
}

export interface PageSeoFaqItem {
  question: string
  answer: string
}

export interface PageSeoInput {
  /** Titre SANS nom de site: le gabarit du module ajoute « | {site.name} ». */
  title: string
  description?: string
  /**
   * Gabarit de titre local: `null` neutralise le gabarit global (accueil et
   * one-pager livrent un titre complet tel quel); une chaîne `%s ...` le
   * remplace (pages dev). Absent: gabarit global du module.
   */
  titleTemplate?: string | null
  /** 'website' (défaut) ou 'article' (og:type + métas article:*). */
  type?: 'website' | 'article'
  /** Visuel OpenGraph (chemin relatif), résolu en URL absolue. Repli: OG_FALLBACK_IMAGE. */
  image?: string
  /** Robots noindex, nofollow (pages internes, sous-arbres hors index). */
  noindex?: boolean
  /** Sous-type Schema.org du nœud WebPage (ex. 'AboutPage' pour /a-propos). */
  webPageType?: PageSeoWebPageType
  /** Fil d'Ariane: BreadcrumbList du graphe, même source route-map que le composant Breadcrumbs. */
  breadcrumbs?: Crumb[]
  /** Renseigné quand `type: 'article'`: nœud Article du graphe. */
  article?: PageSeoArticle
  /** Identité locale complète (l'accueil seulement). */
  localBusiness?: PageSeoLocalBusiness
  /** Paires question-réponse: la page devient FAQPage, questions en mainEntity. */
  faq?: PageSeoFaqItem[]
}

export function usePageSeo(input: PageSeoInput): void {
  const site = useSiteConfig()
  const siteUrl = String(site.url ?? '')
  // Replis SEO globaux du CMS (siteSettings.seo, spec 12.10), servis quand la
  // page n'apporte ni description ni visuel. Le payload est garanti chargé sur
  // toute route rendue (plugin 01.content, échec fatal sinon).
  const seoDefaults = usePayload().site.seo

  /* OpenGraph exige des URL absolues: les chemins relatifs sont résolus contre
   * l'URL de site configurée (nuxt.config `site.url`). */
  const absoluteUrl = (path: string): string =>
    hasProtocol(path, { acceptRelative: false }) ? path : joinURL(siteUrl, path)

  /* Recadrage CDN Sanity (MAJ-01): les visuels de contenu sortent en URL CDN de
   * l'ORIGINAL (souvent un portrait de plusieurs Mo). Pour l'og:image et les
   * ImageObject du graphe, on impose un crop dimensionné via les paramètres de
   * transformation du CDN, plutôt que de servir l'original brut. No-op sur une
   * URL non Sanity (repli code /og/og-default.jpg, déjà au bon format). */
  const sanityCrop = (path: string, width: number, height: number): string => {
    const abs = absoluteUrl(path)
    return abs.includes('cdn.sanity.io')
      ? `${abs}?w=${width}&h=${height}&fit=crop&auto=format`
      : abs
  }

  // ── Gabarit de titre ────────────────────────────────────────────────────
  if (input.titleTemplate !== undefined) {
    useHead({ titleTemplate: input.titleTemplate })
  }

  // ── Métas: titre, description, OpenGraph, robots ────────────────────────
  // Chaîne og:image (12.10): visuel de la page -> defaultOgImage du CMS ->
  // repli code OG_FALLBACK_IMAGE.
  const meta: UseSeoMetaInput = {
    title: input.title,
    // Chaîne de repli (12.10) préservée: image propre de la page -> defaultOgImage
    // des globales CMS -> repli code. Le crop CDN normalise l'original Sanity à
    // 1200x630; les dimensions émises fiabilisent l'aperçu des réseaux (MAJ-01).
    ogImage: sanityCrop(input.image ?? seoDefaults.defaultOgImage ?? OG_FALLBACK_IMAGE, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT),
    ogImageWidth: OG_IMAGE_WIDTH,
    ogImageHeight: OG_IMAGE_HEIGHT
  }
  // Description: repli sur la description par défaut du CMS quand la page n'en
  // fournit pas (les pages fixes arrivent déjà résolues par le transform).
  const description = input.description ?? seoDefaults.defaultDescription
  if (description !== undefined) {
    meta.description = description
  }
  if (input.noindex) {
    meta.robots = 'noindex, nofollow'
  }
  if (input.type === 'article' && input.article) {
    meta.ogType = 'article'
    meta.articlePublishedTime = input.article.datePublished
    meta.articleModifiedTime = input.article.dateModified ?? input.article.datePublished
    if (input.article.author !== undefined) {
      meta.articleAuthor = [input.article.author]
    }
  }
  useSeoMeta(meta)

  // ── Graphe Schema.org ───────────────────────────────────────────────────
  // Les nœuds par défaut du module sont désactivés (nuxt.config
  // schemaOrg.defaults: false; son plugin i18n émettait un WebSite avec
  // workTranslation dégénéré en strategy no_prefix). Le composable émet donc
  // lui-même le socle du graphe sur chaque page.
  const nodes: Record<string, unknown>[] = []

  /* Identité du site (#identity): Organization minimal, rattaché comme
   * publisher aux nœuds WebSite et Article par les résolveurs du module.
   * L'option localBusiness (accueil) fusionne le NAP complet dans ce nœud. */
  nodes.push(defineOrganization({
    name: String(site.name ?? '')
  }))

  /* Nœud WebSite: @id, url et inLanguage sont injectés par le résolveur
   * depuis la config de site. Aucun workTranslation. */
  const webSite: Record<string, unknown> = {
    name: String(site.name ?? '')
  }
  // Description du nœud #website depuis Sanity (siteSettings.seo.defaultDescription),
  // jamais une valeur en dur dans nuxt.config (MAJ-04, discipline 3): une source.
  if (seoDefaults.defaultDescription) {
    webSite.description = seoDefaults.defaultDescription
  }
  nodes.push(defineWebSite(webSite))

  /* Nœud WebPage: name/description/url hérités des métas. Sous-type explicite
   * (option) ou FAQPage implicite quand des questions sont fournies; sinon le
   * résolveur infère depuis le chemin (contact, faq...). */
  const webPageType = input.webPageType ?? (input.faq?.length ? 'FAQPage' as const : undefined)
  nodes.push(defineWebPage(webPageType ? { '@type': webPageType } : {}))

  /* BreadcrumbList: dérivé des mêmes crumbs (route-map) que le composant
   * Breadcrumbs visible, qui reste purement présentationnel. Le dernier
   * maillon (page courante, sans `to`) sort sans `item`, conforme Google. */
  if (input.breadcrumbs?.length) {
    nodes.push(defineBreadcrumb({
      itemListElement: input.breadcrumbs.map((crumb) => ({
        name: crumb.label,
        ...(crumb.to ? { item: crumb.to } : {})
      }))
    }))
  }

  /* Article: mainEntityOfPage lié au WebPage et publisher rattaché à
   * l'identité du site (schemaOrg.identity) par les résolveurs du module. */
  if (input.type === 'article' && input.article) {
    nodes.push(defineArticle({
      headline: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      datePublished: input.article.datePublished,
      dateModified: input.article.dateModified ?? input.article.datePublished,
      ...(input.article.author !== undefined ? { author: { name: input.article.author } } : {}),
      ...(input.article.image !== undefined ? { image: sanityCrop(input.article.image, SCHEMA_IMAGE_WIDTH, SCHEMA_IMAGE_HEIGHT) } : {})
    }))
  }

  /* LocalBusiness: fusionne avec le nœud d'identité du site (même @id
   * #identity), qui devient Organization + LocalBusiness avec NAP complet. */
  if (input.localBusiness) {
    const business = input.localBusiness
    nodes.push(defineLocalBusiness({
      name: business.name,
      ...(business.telephone !== undefined ? { telephone: business.telephone } : {}),
      ...(business.email !== undefined ? { email: business.email } : {}),
      ...(business.address !== undefined ? { address: business.address } : {}),
      ...(business.areaServed !== undefined ? { areaServed: business.areaServed } : {}),
      ...(business.image !== undefined ? { image: sanityCrop(business.image, SCHEMA_IMAGE_WIDTH, SCHEMA_IMAGE_HEIGHT) } : {}),
      ...(business.foundingDate !== undefined ? { foundingDate: business.foundingDate } : {})
    }))
  }

  /* FAQ: une question par nœud; le résolveur les attache en mainEntity du
   * WebPage typé FAQPage. Une seule page du site doit porter ce balisage. */
  if (input.faq?.length) {
    for (const item of input.faq) {
      nodes.push(defineQuestion({ question: item.question, answer: item.answer }))
    }
  }

  useSchemaOrg(nodes)
}
