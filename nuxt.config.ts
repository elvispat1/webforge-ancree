// https://nuxt.com/docs/api/configuration/nuxt-config
//
// webforge-ancree — CANVAS BLANC (reset au scaffold du 19 juin 2026).
// Coquille Nuxt 4 minimale: les modules de la famille (i18n, Sanity, image,
// fonts, icon, seo, pinia) et l'identité Ancrée (project Sanity 5if00rwn,
// déploiement Cloudflare). AUCUN bloc, contenu, schéma ni preview: la
// reconstruction (design + architecture Sanity) repart d'ici.
import tailwindcss from '@tailwindcss/vite'
import { createClient } from '@sanity/client'
import type { CustomRoutePages } from '@nuxtjs/i18n'
// Route-map: source unique du mapping URL <-> contenu. Import RELATIF (jamais ~):
// la fermeture nuxt.config est typecheckee hors du contexte d'alias Nuxt. Plain TS.
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  localePrefix,
  routePath,
  staticPagePaths,
  buildI18nPages,
  DOC_ROUTES,
  type Locale
} from './app/config/route-map'
// Types du payload Sanity brut: RouteSlugs (resultat de ROUTE_SLUGS_QUERY) + SlugRef,
// importes par chemin RELATIF (la fermeture nuxt.config est typecheckee hors alias ~).
import type { RouteSlugs, SlugRef } from './app/types/sanity'
// Config + garde du blog (PUR TS, importable hors contexte d'alias Nuxt).
import { ARTICLES_PER_PAGE, assertBlogCollections } from './app/content/guards'
// Icônes de marque des réseaux sociaux: sous-ensemble simple-icons bundlé au build.
import { SOCIAL_ICON_NAMES } from './app/config/socials'
import simpleIconsData from '@iconify-json/simple-icons/icons.json'

// Connexion Sanity: constantes de code, override env OPTIONNEL (identité du
// site, invariante par environnement; un fork change ce bloc, pas l'env).
// Dataset 'production' (vidé au reset, l'architecture de contenu sera refaite).
const sanityProjectId = process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || '5if00rwn'
const sanityDataset = process.env.NUXT_PUBLIC_SANITY_DATASET || 'production'
const sanityApiVersion = process.env.NUXT_PUBLIC_SANITY_API_VERSION || '2026-06-01'

// Token de LECTURE au build/SSR seulement (jamais NUXT_PUBLIC_: reste cote serveur,
// jamais dans le bundle statique). Requis car le type translation.metadata du plugin
// document-internationalization n'est pas expose en lecture publique sur ce dataset:
// sans token, references() renvoie vide et les alternates hreflang des pages a slug
// traduit (services) cassent. Le site etant genere en statique, le token sert au
// build puis le HTML produit ne le contient pas. Absent = lecture publique (degrade).
const sanityReadToken = process.env.NUXT_SANITY_TOKEN || process.env.SANITY_API_READ_TOKEN || undefined

// URL canonique: partagée site.url (@nuxtjs/seo) et i18n.baseUrl (hreflang
// absolus). Posée par Worker sur Cloudflare (NUXT_PUBLIC_SITE_URL).
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://webforge-ancree.patoinestudio.ca'

// ── Slugs des routes dynamiques, fetches au BUILD (parade au seul crawl) ──────
// Client @sanity/client direct: le module @nuxtjs/sanity n'existe pas dans le
// contexte de la fermeture nuxt.config. Lecture publique, contenu PUBLIE, CDN.
// Une seule source pour DEUX consommateurs (zero divergence possible): les
// routes de prerendu explicites ET les URLs du sitemap (alternates hreflang).
const sanityBuildClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  // CDN public sans token; avec token (lecture build de translation.metadata), on
  // passe en lecture live authentifiee (le CDN ne sert que le public).
  useCdn: !sanityReadToken,
  token: sanityReadToken,
  perspective: 'published'
})

// i18n document-level: un doc par langue, SLUG PARTAGE fr/en. On fetch par langue
// (chaque arbre de routes a son jeu), puis l'alternate hreflang se deduit du meme
// slug sous l'autre prefixe de locale.
// La collection service (les nuisibles) a un slug RICHE en mots-cles et TRADUIT
// par langue (le doc EN porte SON propre slug, distinct du FR). On projette donc
// pour chaque service de la langue courante la carte de ses slugs par langue
// (translation.metadata du plugin @sanity/document-internationalization): le
// prerendu prend le slug de la langue, le sitemap pose l'alternate sur le slug
// TRADUIT de l'autre langue. Les serviceCity, eux, partagent leur slug fr/en.
const ROUTE_SLUGS_QUERY = `{
  "articles": *[_type == "article" && language == $lang && defined(slug.current)]{ "slug": slug.current, "category": category->slug.current },
  "categories": *[_type == "category" && language == $lang && defined(slug.current)]{ "slug": slug.current },
  "cities": *[_type == "serviceCity" && language == $lang && defined(slug.current)]{ "slug": slug.current },
  "services": *[_type == "service" && language == $lang && defined(slug.current)]{
    "slug": slug.current,
    "slugByLang": *[_type == "translation.metadata" && references(^._id)][0].translations[]{ "lang": _key, "slug": value->slug.current }
  }
}`

const EMPTY_SLUGS: RouteSlugs = { articles: [], categories: [], cities: [], services: [] }

// Fetch GRACIEUX: un reseau coupe ne casse pas le build (Ancree retombe partout
// sur ses fixtures). Sans slugs: sitemap dynamique reduit, prerendu rabattu sur
// le crawl. Le site reste noindex tant qu'il n'est pas en ligne; l'avertissement
// signale la degradation sans la masquer.
const slugsByLocale = {} as Record<Locale, RouteSlugs>
for (const locale of SUPPORTED_LOCALES) {
  try {
    slugsByLocale[locale] = await sanityBuildClient.fetch<RouteSlugs>(ROUTE_SLUGS_QUERY, { lang: locale })
  } catch (cause) {
    console.warn(
      `[webforge] Fetch Sanity des slugs (${locale}) echoue (project ${sanityProjectId}, `
      + `dataset ${sanityDataset}): sitemap dynamique et prerendu explicite rabattus sur le crawl.`,
      cause
    )
    slugsByLocale[locale] = EMPTY_SLUGS
  }
}

// Garde du blog (schema d'URL court + plafond d'archive + segment « page »
// reserve), par langue, sur les slugs Sanity injectes. Echec CLAIR du build
// plutot qu'une 404 silencieuse ou des liens de pagination morts. Sur un fetch
// echoue (slugs vides), la garde passe (rien a valider).
for (const locale of SUPPORTED_LOCALES) {
  try {
    assertBlogCollections({
      articlesPerPage: ARTICLES_PER_PAGE,
      articles: slugsByLocale[locale].articles,
      categories: slugsByLocale[locale].categories.map((c) => c.slug)
    })
  } catch (cause) {
    throw new Error(`[webforge] Garde du blog echouee pour la langue « ${locale} »`, { cause })
  }
}

// Nom de marque depuis Sanity (siteSettings.brandName, langue par defaut): alimente
// site.name -> gabarit de titre « %s | {marque} » du module @nuxtjs/seo ET l'identite
// du graphe Schema.org (Organization/WebSite via usePageSeo). Le seed porte le meme
// nom dans les deux langues. Repli gracieux sur le nom de famille si indisponible.
let siteBrandName = 'Ancrée'
try {
  const brand = await sanityBuildClient.fetch<string | null>(
    '*[_type == "siteSettings" && language == $lang][0].brandName',
    { lang: DEFAULT_LOCALE }
  )
  if (brand) siteBrandName = brand
} catch (cause) {
  console.warn(`[webforge] Fetch Sanity du nom de marque echoue: repli sur « ${siteBrandName} ».`, cause)
}

// ── URLs des documents dynamiques (prefixe de locale inclus) ──────────────────
// Definies une seule fois, consommees par le prerendu ET le sitemap.
const homeUrl = (locale: Locale): string => routePath('home', locale)
// Segment derive du route-map (source unique URL<->contenu): si l'URL EN de
// serviceCity se localise un jour, sitemap et prerendu suivent sans divergence.
const cityUrl = (locale: Locale, slug: string): string =>
  `${localePrefix(locale)}${DOC_ROUTES.serviceCity.urls[locale].replace('[slug]', slug)}`
const categoryUrl = (locale: Locale, slug: string): string => `${routePath('blog', locale)}/${slug}`
const articleUrl = (locale: Locale, slug: string, category: string | null): string => {
  const base = routePath('blog', locale)
  return category ? `${base}/${category}/${slug}` : `${base}/${slug}`
}
// Service (les nuisibles): le PATTERN /services/[slug] est partage fr/en, seul le
// slug est traduit par langue. Derive du route-map (DOC_ROUTES.service) pour suivre
// toute localisation future du segment parent sans divergence prerendu/sitemap.
const serviceUrl = (locale: Locale, slug: string): string =>
  `${localePrefix(locale)}${DOC_ROUTES.service.urls[locale].replace('[slug]', slug)}`
// Pages de pagination de la liste (n >= 2): /blog/page/N. Page 1 = /blog nu. Vide
// quand la liste tient sur une page (cas de la demo, 3 articles). Hors sitemap
// (noindex au niveau page), seulement prerendues.
const paginationUrls = (count: number, base: string): string[] =>
  Array.from(
    { length: Math.max(0, Math.ceil(count / ARTICLES_PER_PAGE) - 1) },
    (_, i) => `${base}/page/${i + 2}`
  )

// ── Sitemap: pages indexables, alternates hreflang (modele slug partage) ──────
// La source auto i18n:pages couvre les pages FIXES (route-map, alternates inclus).
// Restent a fournir: l'accueil (pageName null, hors i18n.pages) et TOUTES les
// pages dynamiques (serviceCity, articles, archives de categorie). Slug partage
// fr/en: l'alternate d'un doc = le meme chemin sous l'autre prefixe, emis
// seulement si la traduction existe vraiment (presence par langue ci-dessous).
const LOCALE_HREFLANG: Record<Locale, string> = { fr: 'fr-CA', en: 'en-CA' }

interface SitemapAlternative { hreflang: string; href: string }
interface SitemapUrlEntry { loc: string; _sitemap: string; alternatives: SitemapAlternative[] }

// Presence d'un slug par langue (le doc existe dans la langue ou son slug figure
// au fetch de cette langue): fonde les alternates sans supposer un appariement.
const presenceBySlug = (pick: (s: RouteSlugs) => SlugRef[]): Map<string, Set<Locale>> => {
  const map = new Map<string, Set<Locale>>()
  for (const locale of SUPPORTED_LOCALES) {
    for (const { slug } of pick(slugsByLocale[locale])) {
      if (!map.has(slug)) map.set(slug, new Set())
      map.get(slug)!.add(locale)
    }
  }
  return map
}
const articlePresence = presenceBySlug((s) => s.articles)
const categoryPresence = presenceBySlug((s) => s.categories)
const cityPresence = presenceBySlug((s) => s.cities)
const servicePresence = presenceBySlug((s) => s.services)
// Categorie d'un article (identique entre langues, modele partage): pour batir
// l'URL de l'alternate de l'autre langue.
const articleCategoryBySlug = new Map<string, string | null>()
for (const locale of SUPPORTED_LOCALES) {
  for (const a of slugsByLocale[locale].articles) {
    if (!articleCategoryBySlug.has(a.slug)) articleCategoryBySlug.set(a.slug, a.category ?? null)
  }
}

// Slug TRADUIT d'un service dans une langue cible, indexe par son slug dans la
// langue source. Le service porte un slug distinct par langue (cf. ROUTE_SLUGS_QUERY):
// pour l'alternate hreflang de l'autre langue, on suit translation.metadata (slugByLang).
// Cle = `${sourceLocale}:${slug}`; valeur = carte langue -> slug traduit. Repli sur le
// meme slug si la traduction manque (degradation gracieuse, jamais d'href casse).
const serviceSlugByLang = new Map<string, Partial<Record<Locale, string>>>()
for (const locale of SUPPORTED_LOCALES) {
  for (const svc of slugsByLocale[locale].services) {
    const byLang: Partial<Record<Locale, string>> = {}
    for (const tr of svc.slugByLang ?? []) {
      if (tr.slug) byLang[tr.lang] = tr.slug
    }
    serviceSlugByLang.set(`${locale}:${svc.slug}`, byLang)
  }
}
// Slug d'un service dans une langue cible, depuis (langue source, slug source).
// Repli sur le slug source quand la traduction est absente.
const serviceSlugIn = (sourceLocale: Locale, sourceSlug: string, target: Locale): string =>
  serviceSlugByLang.get(`${sourceLocale}:${sourceSlug}`)?.[target] ?? sourceSlug

// Alternates d'un doc dynamique: une entree par langue ou il existe + x-default
// sur la langue par defaut (si presente). hrefs relatifs, resolus en absolu par
// le module sitemap.
const alternativesFor = (presence: Set<Locale> | undefined, toUrl: (l: Locale) => string): SitemapAlternative[] => {
  const locales = SUPPORTED_LOCALES.filter((l) => presence?.has(l))
  const alternatives = locales.map((l) => ({ hreflang: LOCALE_HREFLANG[l], href: toUrl(l) }))
  // x-default: langue par defaut si presente, sinon la premiere langue disponible
  // (doc mono-langue, ex. EN seul): signale explicitement la page de repli
  // inter-langues plutot que de laisser le doc sans x-default.
  const fallback = locales.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : locales[0]
  if (fallback) alternatives.push({ hreflang: 'x-default', href: toUrl(fallback) })
  return alternatives
}

const SITEMAP_DYNAMIC_URLS: SitemapUrlEntry[] = [
  // Accueil des deux locales (jamais dans i18n.pages: pageName null).
  ...SUPPORTED_LOCALES.map((locale) => ({
    loc: homeUrl(locale),
    _sitemap: LOCALE_HREFLANG[locale],
    alternatives: [
      ...SUPPORTED_LOCALES.map((l) => ({ hreflang: LOCALE_HREFLANG[l], href: homeUrl(l) })),
      { hreflang: 'x-default', href: homeUrl(DEFAULT_LOCALE) }
    ]
  })),
  // Pages dynamiques de chaque locale. La pagination /blog/page/N reste absente
  // (noindex, point 2).
  ...SUPPORTED_LOCALES.flatMap((locale) => {
    const slugs = slugsByLocale[locale]
    return [
      ...slugs.cities.map((c) => ({
        loc: cityUrl(locale, c.slug),
        _sitemap: LOCALE_HREFLANG[locale],
        alternatives: alternativesFor(cityPresence.get(c.slug), (l) => cityUrl(l, c.slug))
      })),
      ...slugs.articles.map((a) => ({
        loc: articleUrl(locale, a.slug, a.category),
        _sitemap: LOCALE_HREFLANG[locale],
        alternatives: alternativesFor(articlePresence.get(a.slug), (l) => articleUrl(l, a.slug, articleCategoryBySlug.get(a.slug) ?? null))
      })),
      ...slugs.categories.map((c) => ({
        loc: categoryUrl(locale, c.slug),
        _sitemap: LOCALE_HREFLANG[locale],
        alternatives: alternativesFor(categoryPresence.get(c.slug), (l) => categoryUrl(l, c.slug))
      })),
      // Pages par nuisible (collection service Sanity). Slug TRADUIT par langue:
      // l'alternate pointe vers le slug de l'AUTRE langue (suivi via slugByLang),
      // pas un chemin partage. Presence par langue: alternate seulement la ou la
      // traduction existe vraiment (miroir des villes/articles).
      ...slugs.services.map((svc) => ({
        loc: serviceUrl(locale, svc.slug),
        _sitemap: LOCALE_HREFLANG[locale],
        alternatives: alternativesFor(
          servicePresence.get(svc.slug),
          (l) => serviceUrl(l, serviceSlugIn(locale, svc.slug, l))
        )
      }))
    ]
  })
]

// Routes de prerendu: pages statiques du route-map (segments EN localises par
// customRoutes) + pages dynamiques explicites depuis les slugs Sanity (plus le
// seul crawl). crawlLinks reste actif en complement (images _ipx, liens).
const DYNAMIC_PRERENDER_ROUTES = SUPPORTED_LOCALES.flatMap((locale) => {
  const slugs = slugsByLocale[locale]
  return [
    ...slugs.cities.map((c) => cityUrl(locale, c.slug)),
    // Pages par nuisible (collection service Sanity): slug traduit par langue.
    ...slugs.services.map((svc) => serviceUrl(locale, svc.slug)),
    ...slugs.articles.map((a) => articleUrl(locale, a.slug, a.category)),
    ...slugs.categories.map((c) => categoryUrl(locale, c.slug)),
    ...paginationUrls(slugs.articles.length, routePath('blog', locale))
  ]
})
const PRERENDER_ROUTES = [
  ...SUPPORTED_LOCALES.flatMap((locale) => staticPagePaths(locale)),
  ...DYNAMIC_PRERENDER_ROUTES
]

// ── Icônes de marque (réseaux sociaux), sous-ensemble bundlé ─────────────────
// On NE bundle PAS la collection simple-icons entière (des milliers d'icônes): on
// dérive une collection custom contenant SEULEMENT les plateformes de
// app/config/socials.ts. Les bodies SVG sont lus au BUILD depuis
// @iconify-json/simple-icons/icons.json (gros fichier, jamais expédié au client) et
// inlinés. Le nom reste canonique `simple-icons:<slug>`; le préfixe n'est PAS dans
// serverBundle.collections, donc la collection complète n'est jamais bundlée.
const socialBrandIcons: Record<string, { body: string }> = {}
for (const name of SOCIAL_ICON_NAMES) {
  const slug = name.replace('simple-icons:', '')
  const icon = (simpleIconsData.icons as Record<string, { body: string }>)[slug]
  if (icon) socialBrandIcons[slug] = { body: icon.body }
}
const socialBrandCollection = {
  prefix: 'simple-icons',
  icons: socialBrandIcons,
  width: simpleIconsData.width ?? 24,
  height: simpleIconsData.height ?? 24
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Le Studio Sanity vit dans studio/ (workspace yarn frère). Nuxt l'ignore.
  ignore: ['studio/**'],

  vite: {
    plugins: [tailwindcss()],
    // Constante de compilation: false en prod (le mode preview Sanity sera
    // recable avec l'architecture de contenu). Elle coupe le code de preview et
    // le bypass de mouvement dans la signature « s'ancre en montant ».
    define: { __WF_PREVIEW__: 'false' }
  },

  // Noms de composants plats (sans prefixe de dossier): <Hero>, <Button>,
  // <Header>, peu importe l'arborescence. Convention de la famille. On limite
  // le scan aux .vue: les block-map.ts ne sont pas des composants (importes
  // explicitement), sinon Nuxt les nomme tous deux « BlockMap » (collision).
  components: [{ path: '~/components', pathPrefix: false, extensions: ['vue'] }],

  app: {
    head: {
      htmlAttrs: { lang: 'fr-CA' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ]
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/sanity',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxtjs/seo'
  ],

  // Icônes: lucide bundlé en entier (UI), simple-icons réduit au sous-ensemble des
  // réseaux sociaux via customCollections (inliné au build, pas de fetch runtime).
  icon: {
    serverBundle: {
      collections: ['lucide']
    },
    customCollections: [socialBrandCollection]
  },

  // Client Sanity (lecture publique, sans token). useCdn: false — le site est
  // genere statiquement, donc toutes les lectures se font au BUILD: l'API directe
  // garantit du contenu frais (le CDN accuse un leger retard apres publication).
  // Aucune requete Sanity a l'execution (tout est prerendu).
  sanity: {
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    useCdn: false,
    // PAS de token ici: l'option token du module @nuxtjs/sanity atterrit dans la
    // config PUBLIQUE (embarquee dans chaque page). La lecture authentifiee de
    // translation.metadata se fait server-only via un client dedie dans le plugin
    // 01.content (token depuis runtimeConfig prive). Ici: lecture publique.
    perspective: 'published'
  },

  hooks: {
    // Statique pur (cette demo): le module @nuxtjs/sanity place une config `stega`
    // dans runtimeConfig.public.sanity (utile au visual editing en preview SSR).
    // Hors preview, elle n'a aucune utilite et fuit dans le HTML genere: on la
    // retire pour garder .output propre (aucun marqueur stega embarque).
    'nitro:config'(nitroConfig) {
      const runtimeConfig = nitroConfig.runtimeConfig as
        | { public?: { sanity?: Record<string, unknown> } }
        | undefined
      const sanityPublic = runtimeConfig?.public?.sanity
      if (sanityPublic) {
        delete sanityPublic.stega
      }
    }
  },

  // Pipeline image (@nuxt/image, IPX). Les images du contenu vivront sur le CDN
  // Sanity; les variantes sont prérendues au build (provider ipxStatic).
  image: {
    domains: ['cdn.sanity.io'],
    screens: { xs: 375, sm: 500, md: 640, lg: 1024, xl: 1440, xxl: 1920 }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  // 1. Tokens de la famille (Ancrée) — à rebâtir avec le design.
  // 2. Tokens de la marque (ce site) — surfaces, texte, accent.
  // 3. CSS de base — Tailwind + reset minimal.
  css: [
    '~/family/tokens.css',
    '~/brand/tokens.css',
    '~/assets/css/typography.css',
    '~/assets/css/grid.css',
    '~/assets/css/main.css'
  ],

  // Typographies de la famille Ancree (DESIGN.md). Poids declares explicitement,
  // sinon le navigateur synthetise des faux-gras incoherents. Aucune italique.
  fonts: {
    families: [
      { name: 'Bitter', provider: 'google', weights: [600, 700, 800], styles: ['normal'] },
      { name: 'Source Sans 3', provider: 'google', weights: [400, 600], styles: ['normal'] }
    ]
  },

  // Bilingue: FR à la racine, EN sous /en. Pas de détection navigateur (statique).
  i18n: {
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    baseUrl: siteUrl,
    locales: [
      { code: 'fr', language: 'fr-CA', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-CA', name: 'English', file: 'en.json' }
    ],
    // Segments EN traduits (about, terms-of-use...) depuis le route-map, source
    // unique. buildI18nPages -> Record<string, Record<Locale, string>>; cast a la
    // frontiere (route-map reste plain TS, importable du Studio).
    customRoutes: 'config',
    pages: buildI18nPages() as CustomRoutePages,
    detectBrowserLanguage: false
  },

  site: {
    url: siteUrl,
    // Nom de marque du DEMO (siteSettings.brandName depuis Sanity, fetch au build):
    // alimente le gabarit de titre « %s | {marque} » et l'identite Schema.org. Le
    // nom de famille « Ancrée » est le repli si Sanity est injoignable. Suit le
    // patron Minimaliste (site.name = suffixe de titres depuis le CMS).
    name: siteBrandName,
    defaultLocale: 'fr',
    // Og-image de marque par defaut (repli social quand une page ne fournit pas
    // son propre visuel): carte typographique Ancree/Rempart, fabriquee EXACTEMENT
    // en 1200x630 (public/og-rempart-extermination.png). Chemin relatif, resolu en
    // URL absolue par usePageSeo. Cle custom du site config, lue via useSiteConfig().
    defaultOgImage: '/og-rempart-extermination.png',
    // Gabarit non indexable tant qu'aucun vrai site n'est en ligne.
    indexable: false
  },

  // Pas de génération d'OG en runtime (aucune dépendance chromium en V1).
  // Les og:image sont servies en statique par usePageSeo: visuel propre a la
  // page (cover d'article) en URL absolue derivee de site.url, avec repli sur
  // l'og-image de marque (site.defaultOgImage ci-dessus) quand la page n'en
  // fournit pas. La carte de marque est un asset prerendu dans public/.
  ogImage: { enabled: false },

  // Sitemap: pages indexables, alternates hreflang. Pages FIXES couvertes par la
  // source auto i18n:pages (depuis i18n.pages, alternates inclus). Accueil
  // (pageName null) et pages DYNAMIQUES (serviceCity, articles, archives) par la
  // source webforge:dynamic (memes slugs que le prerendu). On exclut la source
  // auto nuxt:prerender: elle re-listerait les pages dynamiques SANS alternates,
  // en doublon. Showcase et one-pager: noindex au niveau page, hors sitemap.
  sitemap: {
    exclude: ['/showcase', '/en/showcase', '/one-pager/**', '/en/one-pager/**'],
    excludeAppSources: ['nuxt:prerender'],
    sources: [
      {
        context: {
          name: 'webforge:dynamic',
          description: 'Accueil + pages dynamiques (serviceCity, articles, archives) depuis les slugs Sanity. Split par locale + alternates hreflang.'
        },
        urls: SITEMAP_DYNAMIC_URLS
      }
    ]
  },

  // Graphe Schema.org: noeuds par defaut du module DESACTIVES. usePageSeo est la
  // source UNIQUE du graphe (Organization, WebSite, WebPage, BreadcrumbList, et
  // selon la page Article / LocalBusiness / FAQPage), emis sur chaque page qui
  // l'appelle. Les pages hors blog encore sur useSeoMeta direct n'ont pas de
  // graphe tant que le point 7 ne les migre pas (sans impact: site noindex).
  schemaOrg: {
    defaults: false
  },

  // nuxt-seo-utils: fallbackTitle desactive. Les pages posent leur titre via
  // usePageSeo / useSeoMeta; le repli reapplique sinon un titre « {code} -
  // {message} » reactif sur la page d'erreur, battant le titre localise.
  seo: {
    fallbackTitle: false
  },

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      // Pages statiques du route-map (segments EN localises) + pages dynamiques
      // explicites (serviceCity, articles, archives) depuis les slugs Sanity.
      // crawlLinks reste actif en complement (images _ipx, liens internes).
      routes: PRERENDER_ROUTES,
      // /en/sitemap.xml: page fantome du prerendu en mode multi-sitemaps (i18n).
      // Le /sitemap.xml FR aboutit sur la routeRule (redirect vers l'index); son
      // jumeau EN n'a ni routeRule ni page -> rendu de l'app. On l'ecarte.
      ignore: ['/en/sitemap.xml']
    }
  },

  // Plomberie backend du formulaire de contact (TERRAIN, niveau demo; pattern
  // adapte de webforge-minimaliste, voir server/api/contact.post.ts). Les cles
  // privees restent cote serveur; turnstileSiteKey est publique (le widget la
  // rend dans le navigateur). EN STATIQUE PUR (preset 'static', cas de la demo):
  // contactDemo: true -> useContactForm simule le succes cote client, AUCUN
  // backend appele, et la route /api/contact n'est meme pas bundlee. Un VRAI
  // site client met contactDemo a false, pose les cles (Resend + Turnstile) et
  // deploie en SSR (preset Workers): submit() poste alors vers /api/contact.
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
    contactToEmail: process.env.CONTACT_TO_EMAIL,
    contactFromEmail: process.env.CONTACT_FROM_EMAIL,
    // Token de lecture Sanity, SERVER-ONLY (jamais dans public): lecture
    // authentifiee de translation.metadata au build via le client dedie du plugin
    // 01.content. Override possible par NUXT_SANITY_READ_TOKEN.
    sanityReadToken,
    public: {
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
      contactDemo: true,
      // Couture de build pour app/router.options.ts: les slugs de categories du
      // blogue PAR LANGUE (deja fetches pour les routes de prerendu), injectes en
      // config publique. scrollBehavior les lit via useRuntimeConfig (locale
      // derivee du chemin), plus deterministe que lire le payload du plugin
      // 01.content (aucune dependance a l'ordre d'execution des plugins).
      wf: {
        categorySlugs: {
          fr: slugsByLocale.fr.categories.map((c) => c.slug),
          en: slugsByLocale.en.categories.map((c) => c.slug)
        }
      }
    }
  }
})
