// usePageSeo — point d'entrée SEO unique des pages.
//
// Chaque page appelle usePageSeo() au lieu d'empiler useSeoMeta / useHead /
// useSchemaOrg: titre (gabarit « %s | {site.name} » du module @nuxtjs/seo),
// description, OpenGraph (og:image en URL ABSOLUE), métas d'article, robots, et
// graphe Schema.org (Organization, WebSite, WebPage sous-typé, BreadcrumbList,
// Article, LocalBusiness, FAQPage). Bâti par-dessus les primitives du module
// @nuxtjs/seo (useSeoMeta, useSchemaOrg, define*).
//
// PORT de webforge-minimaliste (plomberie SEO éprouvée), adapté à Ancrée:
//   - Pas de dépendance usePayload: la pipeline de payload unique (plugin
//     01.content) est une étape ultérieure du roadmap. Les replis SEO globaux
//     du CMS (description et og:image par défaut, siteSettings.seo) s'y
//     brancheront au même point — la signature ci-dessous ne change pas.
//   - og:image émise UNIQUEMENT quand la page fournit un visuel: pas de repli
//     code en dur tant que l'og-image de marque n'existe pas (point 7 SEO).
//
// Agnostique de la famille: aucun contenu de site ici. La marque vient de la
// config de site (nuxt.config `site`) et des arguments.

import type { UseSeoMetaInput } from '@unhead/vue'
import { hasProtocol, joinURL } from 'ufo'
import type { Crumb } from '~/config/route-map'

/** Dimensions canoniques de l'og:image (ratio social standard): le crop CDN
 *  imposé ci-dessous sort en 1200x630. Émises en og:image:width/height pour
 *  fiabiliser l'aperçu social. */
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

/** Crop large 16:9 des ImageObject du graphe Schema.org (Article, LocalBusiness):
 *  borne le visuel servi aux moteurs au lieu de l'original CDN brut. */
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
  /** Visuel du billet (chemin relatif ou URL CDN), porté par le nœud Article. */
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
   * remplace. Absent: gabarit global du module.
   */
  titleTemplate?: string | null
  /** 'website' (défaut) ou 'article' (og:type + métas article:*). */
  type?: 'website' | 'article'
  /** Visuel OpenGraph (chemin relatif ou URL CDN), résolu en URL absolue. */
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

  /* OpenGraph exige des URL absolues: les chemins relatifs sont résolus contre
   * l'URL de site configurée (nuxt.config `site.url`). */
  const absoluteUrl = (path: string): string =>
    hasProtocol(path, { acceptRelative: false }) ? path : joinURL(siteUrl, path)

  /* Recadrage CDN Sanity: les visuels de contenu sortent en URL CDN de
   * l'ORIGINAL (souvent un portrait de plusieurs Mo). Pour l'og:image et les
   * ImageObject du graphe, on impose un crop dimensionné via les paramètres de
   * transformation du CDN, plutôt que de servir l'original brut. Sur une URL non
   * Sanity (image locale du démo), AUCUN recadrage: on sert le fichier tel quel
   * et `cropped` reste false (les dimensions ne sont alors pas garanties). */
  const resolveImage = (path: string, width: number, height: number): { url: string; cropped: boolean } => {
    const abs = absoluteUrl(path)
    const cropped = abs.includes('cdn.sanity.io')
    return {
      url: cropped ? `${abs}?w=${width}&h=${height}&fit=crop&auto=format` : abs,
      cropped
    }
  }

  // ── Gabarit de titre ────────────────────────────────────────────────────
  if (input.titleTemplate !== undefined) {
    useHead({ titleTemplate: input.titleTemplate })
  }

  // ── Métas: titre, description, OpenGraph, robots ────────────────────────
  const meta: UseSeoMetaInput = { title: input.title }
  // og:image servie UNIQUEMENT quand la page fournit un visuel. Le repli de
  // marque (og-image par défaut) et les replis CMS arrivent au point 7 SEO /
  // étape 5 pipeline, sans toucher cette signature.
  if (input.image) {
    const og = resolveImage(input.image, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT)
    meta.ogImage = og.url
    // Dimensions déclarées UNIQUEMENT quand le crop CDN les garantit (URL
    // Sanity). Sur une image locale non recadrée (fixtures démo), on les omet:
    // annoncer 1200x630 mentirait aux scrapers sociaux si le fichier a un autre
    // format (ex. un visuel portrait), qui rogneraient mal l'aperçu. Sans
    // dimensions, ils lisent les vraies du fichier.
    if (og.cropped) {
      meta.ogImageWidth = OG_IMAGE_WIDTH
      meta.ogImageHeight = OG_IMAGE_HEIGHT
    }
  }
  if (input.description !== undefined) {
    meta.description = input.description
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
  // schemaOrg.defaults: false): le composable est la source UNIQUE du graphe,
  // émis sur chaque page qui l'appelle. Les pages encore sur useSeoMeta direct
  // (hors blog) n'ont pas de graphe tant que le point 7 ne les migre pas; sans
  // impact tant que le site est noindex (site.indexable: false).
  const nodes: Record<string, unknown>[] = []

  /* Identité du site (#identity): Organization minimal, rattaché comme
   * publisher aux nœuds WebSite et Article par les résolveurs du module.
   * L'option localBusiness (accueil) fusionne le NAP complet dans ce nœud. */
  nodes.push(defineOrganization({
    name: String(site.name ?? '')
  }))

  /* Nœud WebSite: @id, url et inLanguage sont injectés par le résolveur
   * depuis la config de site. */
  nodes.push(defineWebSite({
    name: String(site.name ?? '')
  }))

  /* Nœud WebPage: name/description/url hérités des métas. Sous-type explicite
   * (option) ou FAQPage implicite quand des questions sont fournies; sinon le
   * résolveur infère depuis le chemin. */
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
   * l'identité du site par les résolveurs du module. */
  if (input.type === 'article' && input.article) {
    nodes.push(defineArticle({
      headline: input.title,
      ...(input.description !== undefined ? { description: input.description } : {}),
      datePublished: input.article.datePublished,
      dateModified: input.article.dateModified ?? input.article.datePublished,
      ...(input.article.author !== undefined ? { author: { name: input.article.author } } : {}),
      // Garde TRUTHY (pas !== undefined): un src vide ('' depuis un champ Sanity
      // optionnel) ne doit pas produire un ImageObject vide. Alignée sur l'og:image.
      ...(input.article.image ? { image: resolveImage(input.article.image, SCHEMA_IMAGE_WIDTH, SCHEMA_IMAGE_HEIGHT).url } : {})
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
      ...(business.image ? { image: resolveImage(business.image, SCHEMA_IMAGE_WIDTH, SCHEMA_IMAGE_HEIGHT).url } : {}),
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
