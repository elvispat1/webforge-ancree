// Carte des routes du site, source unique du mapping URL <-> contenu, bilingue.
//
// Trois consommateurs, un seul endroit où changer un segment d'URL:
//   1. Les pages et composables Nuxt (breadcrumbs, chemins localisés).
//   2. La fermeture de nuxt.config.ts (customRoutes i18n via buildI18nPages,
//      routes de prérendu via staticPagePaths): imports RELATIFS only.
//   3. Le Studio Sanity en T2c (Presentation tool: buildStudioMainDocuments,
//      buildStudioLocationHref), qui importe ce fichier depuis studio/.
// D'où la règle dure: plain TS, AUCUN import (ni Nuxt, ni alias ~).
//
// Régime bilingue (plan T2b): strategy prefix_except_default, FR à la racine
// (URLs INCHANGÉES depuis V1), arbre EN sous /en avec segments traduits. Les
// chemins de ROUTES et DOC_ROUTES sont stockés SANS préfixe de locale;
// localePrefix / routePath appliquent le /en.
//
// Les pages détail (service, projet, article, archive de catégorie) ne sont pas
// des entrées statiques: elles fournissent leur propre feuille (slug + titre) au
// constructeur de breadcrumb, posée sur le parent statique correspondant. La nav
// du Header vit dans le contenu Sanity (siteSettings.nav), pas ici.

// ── Locales ──────────────────────────────────────────────────────────────────

// Type dupliqué volontairement (même valeurs que WfLocale de app/sanity/
// transform.ts): ce fichier ne peut rien importer (consommé par le Studio).
export type Locale = 'fr' | 'en'

export const SUPPORTED_LOCALES: readonly Locale[] = ['fr', 'en']
export const DEFAULT_LOCALE: Locale = 'fr'

/** Préfixe d'URL d'une locale: FR (défaut) -> '', EN -> '/en'. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`
}

// ── Routes statiques du multipage (ossature des breadcrumbs) ─────────────────

export interface RouteNode {
  /** Chemin par locale, SANS préfixe /en (appliqué par routePath). */
  path: Record<Locale, string>
  /** Libellé court par locale (fil d'Ariane). */
  label: Record<Locale, string>
  /** Clé du parent, pour remonter la chaîne du fil d'Ariane. */
  parent?: string
  /** Nom de page Nuxt (fichier sans extension) pour customRoutes i18n.
   *  null = la home, gérée par la strategy prefix_except_default. */
  pageName: string | null
}

export const ROUTES = {
  home: {
    path: { fr: '/', en: '/' },
    label: { fr: 'Accueil', en: 'Home' },
    pageName: null
  },
  services: {
    path: { fr: '/services', en: '/services' },
    label: { fr: 'Services', en: 'Services' },
    parent: 'home',
    pageName: 'services/index'
  },
  projects: {
    path: { fr: '/projets', en: '/projects' },
    label: { fr: 'Projets', en: 'Projects' },
    parent: 'home',
    pageName: 'projets/index'
  },
  about: {
    path: { fr: '/a-propos', en: '/about' },
    label: { fr: 'À propos', en: 'About' },
    parent: 'home',
    pageName: 'a-propos'
  },
  // « Blogue » est le nom de la section face à l'usager FR, partout (nav, fil
  // d'Ariane, titres SEO, CTA, H1 du héros); l'URL /blog reste inchangée et
  // identique dans les deux langues (décision R1: seuls les slugs de contenu
  // changent sous /blog).
  blog: {
    path: { fr: '/blog', en: '/blog' },
    label: { fr: 'Blogue', en: 'Blog' },
    parent: 'home',
    pageName: 'blog/index'
  },
  faq: {
    path: { fr: '/faq', en: '/faq' },
    label: { fr: 'FAQ', en: 'FAQ' },
    parent: 'home',
    pageName: 'faq'
  },
  contact: {
    path: { fr: '/contact', en: '/contact' },
    label: { fr: 'Contact', en: 'Contact' },
    parent: 'home',
    pageName: 'contact'
  },
  terms: {
    path: { fr: '/conditions-utilisation', en: '/terms-of-use' },
    label: { fr: 'Conditions d\'utilisation', en: 'Terms of Use' },
    parent: 'home',
    pageName: 'conditions-utilisation'
  },
  privacy: {
    path: { fr: '/politique-confidentialite', en: '/privacy-policy' },
    label: { fr: 'Politique de confidentialité', en: 'Privacy Policy' },
    parent: 'home',
    pageName: 'politique-confidentialite'
  },
  // Page Showcase (chantier B): vraie route client-facing, noindex, hors nav
  // principale (la nav vit dans siteSettings.nav, pas ici). Présente dans ROUTES
  // pour câbler automatiquement les customRoutes i18n (buildI18nPages) et le
  // prérendu des deux locales (staticPagePaths -> PRERENDER_ROUTES). URL
  // identique fr/en (/showcase et /en/showcase). Pas de parent: aucun fil
  // d'Ariane n'est rendu pour elle (label vestigial, requis par le type).
  showcase: {
    path: { fr: '/showcase', en: '/showcase' },
    label: { fr: 'Showcase', en: 'Showcase' },
    pageName: 'showcase/index'
  }
} as const satisfies Record<string, RouteNode>

export type RouteKey = keyof typeof ROUTES

/** Chemin COMPLET (préfixe de locale inclus) d'une route statique. */
export function routePath(key: RouteKey, locale: Locale): string {
  const path = ROUTES[key].path[locale]
  const prefix = localePrefix(locale)
  return path === '/' ? (prefix || '/') : `${prefix}${path}`
}

/** Libellé localisé d'une route statique (fil d'Ariane). */
export function routeLabel(key: RouteKey, locale: Locale): string {
  return ROUTES[key].label[locale]
}

// ── Pages du one-pager (palier 1, hors breadcrumbs: layout landing) ──────────

// Le one-pager n'est pas dans ROUTES (route autonome, pas de fil d'Ariane),
// mais ses trois pages ont besoin de leurs entrées customRoutes (segments
// légaux EN traduits) et de leurs routes de prérendu.
export const ONE_PAGER_PAGES = {
  index: {
    pageName: 'one-pager/index',
    path: { fr: '/one-pager', en: '/one-pager' }
  },
  terms: {
    pageName: 'one-pager/conditions-utilisation',
    path: { fr: '/one-pager/conditions-utilisation', en: '/one-pager/terms-of-use' }
  },
  privacy: {
    pageName: 'one-pager/politique-confidentialite',
    path: { fr: '/one-pager/politique-confidentialite', en: '/one-pager/privacy-policy' }
  }
} as const satisfies Record<string, { pageName: string; path: Record<Locale, string> }>

/** Chemin COMPLET (préfixe inclus) d'une page du one-pager. */
export function onePagerPath(key: keyof typeof ONE_PAGER_PAGES, locale: Locale): string {
  return `${localePrefix(locale)}${ONE_PAGER_PAGES[key].path[locale]}`
}

// ── Routes des documents Sanity (résolution de liens + Studio T2c) ───────────

export type WfDocType =
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

export interface DocRouteSpec {
  /** Nom de page Nuxt pour customRoutes; null = couvert ailleurs (home par la
   *  strategy, article/category par le catch-all blog/[...slug] au chemin
   *  identique dans les deux langues, legalPage par les entrées de ROUTES). */
  pageName: string | null
  /** Pattern d'URL par locale, sans préfixe, segments dynamiques en notation
   *  Nuxt ([param]); nuxtToStudioPattern les convertit pour le Studio. */
  urls: Record<Locale, string>
  /** Paramètres dynamiques du pattern (ordre des segments). */
  params: readonly ('slug' | 'category')[]
}

export const DOC_ROUTES: Record<WfDocType, DocRouteSpec> = {
  homePage: { pageName: null, urls: ROUTES.home.path, params: [] },
  servicesPage: { pageName: ROUTES.services.pageName, urls: ROUTES.services.path, params: [] },
  projectsPage: { pageName: ROUTES.projects.pageName, urls: ROUTES.projects.path, params: [] },
  aboutPage: { pageName: ROUTES.about.pageName, urls: ROUTES.about.path, params: [] },
  blogPage: { pageName: ROUTES.blog.pageName, urls: ROUTES.blog.path, params: [] },
  faqPage: { pageName: ROUTES.faq.pageName, urls: ROUTES.faq.path, params: [] },
  contactPage: { pageName: ROUTES.contact.pageName, urls: ROUTES.contact.path, params: [] },
  onePager: { pageName: ONE_PAGER_PAGES.index.pageName, urls: ONE_PAGER_PAGES.index.path, params: [] },
  service: {
    pageName: 'services/[slug]',
    urls: { fr: '/services/[slug]', en: '/services/[slug]' },
    params: ['slug']
  },
  project: {
    pageName: 'projets/[slug]',
    urls: { fr: '/projets/[slug]', en: '/projects/[slug]' },
    params: ['slug']
  },
  // Article AVEC catégorie (2 segments). Le cas sans catégorie (1 segment,
  // /blog/[slug]) est géré explicitement par buildStudioLocationHref et par
  // une entrée mainDocuments dédiée: pas de pattern double ici.
  article: {
    pageName: null,
    urls: { fr: '/blog/[category]/[slug]', en: '/blog/[category]/[slug]' },
    params: ['category', 'slug']
  },
  category: {
    pageName: null,
    urls: { fr: '/blog/[slug]', en: '/blog/[slug]' },
    params: ['slug']
  },
  // Pas de slug sur legalPage: routage par _id déterministe du seed
  // (legalPage-<conditions|confidentialite>-<lang>), voir legalRouteKeyForId.
  // urls = celles des conditions, jamais consommées telles quelles (les deux
  // documents passent par legalRouteKeyForId + ROUTES).
  legalPage: { pageName: null, urls: ROUTES.terms.path, params: [] }
}

/** Clé de ROUTES d'une page légale, déduite de son _id déterministe du seed
 *  (legalPage-<conditions|confidentialite>-<lang>). null = id inconnu. */
export function legalRouteKeyForId(id: string): Extract<RouteKey, 'terms' | 'privacy'> | null {
  if (id.includes('confidentialite')) return 'privacy'
  if (id.includes('conditions')) return 'terms'
  return null
}

// ── Builders i18n (customRoutes de @nuxtjs/i18n, consommé par nuxt.config) ───

/**
 * Mapping `pages` pour customRoutes: 'config'. Une entrée par page Nuxt dont
 * la route est localisable: pages statiques de ROUTES, pages du one-pager,
 * pages détail dynamiques (service, project). Les entrées au chemin identique
 * dans les deux langues sont émises aussi: la table reste le contrat explicite
 * (la strategy ne fait alors que préfixer /en, sans surprise).
 */
export function buildI18nPages(): Record<string, Record<Locale, string>> {
  const result: Record<string, Record<Locale, string>> = {}
  for (const node of Object.values(ROUTES) as RouteNode[]) {
    if (node.pageName === null) continue
    result[node.pageName] = node.path
  }
  for (const page of Object.values(ONE_PAGER_PAGES)) {
    result[page.pageName] = page.path
  }
  for (const spec of [DOC_ROUTES.service, DOC_ROUTES.project]) {
    if (spec.pageName === null) continue
    result[spec.pageName] = spec.urls
  }
  return result
}

/** Chemins COMPLETS (préfixe inclus) de toutes les pages statiques d'une
 *  locale: routes de ROUTES + pages du one-pager. Sert PRERENDER_ROUTES. */
export function staticPagePaths(locale: Locale): string[] {
  return [
    ...(Object.keys(ROUTES) as RouteKey[]).map((key) => routePath(key, locale)),
    ...(Object.keys(ONE_PAGER_PAGES) as Array<keyof typeof ONE_PAGER_PAGES>).map(
      (key) => onePagerPath(key, locale)
    )
  ]
}

// ── Builders Studio (Presentation tool, consommés en T2c) ────────────────────

/** Pattern Nuxt (/services/[slug]) -> pattern Studio (/services/:slug). */
export function nuxtToStudioPattern(pattern: string): string {
  return pattern.replace(/\[(\w+)\]/g, ':$1')
}

/** Chemin complet (préfixe + pattern de locale) d'un DocRouteSpec, en notation
 *  Studio. La home rend '/' (FR) ou '/en'. */
function studioRoute(spec: DocRouteSpec, locale: Locale): string {
  const pattern = nuxtToStudioPattern(spec.urls[locale])
  const prefix = localePrefix(locale)
  return pattern === '/' ? (prefix || '/') : `${prefix}${pattern}`
}

/**
 * Entrées `mainDocuments` du Presentation tool: pour chaque doc-type et chaque
 * langue, le pattern d'URL Studio + le filter GROQ qui retrouve le document.
 * Ordre: singletons et patterns spécifiques d'abord, /blog/:slug en dernier
 * (catégorie avant article sans catégorie, miroir du résolveur front qui
 * priorise la catégorie).
 */
export function buildStudioMainDocuments(): Array<{ route: string; filter: string }> {
  const result: Array<{ route: string; filter: string }> = []

  const singletons: WfDocType[] = [
    'homePage',
    'servicesPage',
    'projectsPage',
    'aboutPage',
    'blogPage',
    'faqPage',
    'contactPage',
    'onePager'
  ]
  for (const docType of singletons) {
    for (const lang of SUPPORTED_LOCALES) {
      result.push({
        route: studioRoute(DOC_ROUTES[docType], lang),
        filter: `_type == "${docType}" && language == "${lang}"`
      })
    }
  }

  // Pages légales: routage par _id déterministe du seed, une entrée par
  // document par langue (multipage; les vues one-pager des mêmes documents
  // relèvent des locations, pas des mainDocuments).
  const legalKeys: Array<{ route: Extract<RouteKey, 'terms' | 'privacy'>; idKernel: string }> = [
    { route: 'terms', idKernel: 'conditions' },
    { route: 'privacy', idKernel: 'confidentialite' }
  ]
  for (const { route, idKernel } of legalKeys) {
    for (const lang of SUPPORTED_LOCALES) {
      result.push({
        route: routePath(route, lang),
        filter: `_id == "legalPage-${idKernel}-${lang}"`
      })
    }
  }

  // Détails à slug.
  for (const docType of ['service', 'project'] as const) {
    for (const lang of SUPPORTED_LOCALES) {
      result.push({
        route: studioRoute(DOC_ROUTES[docType], lang),
        filter: `_type == "${docType}" && language == "${lang}" && slug.current == $slug`
      })
    }
  }

  // Article avec catégorie (2 segments, pattern spécifique avant /blog/:slug).
  for (const lang of SUPPORTED_LOCALES) {
    result.push({
      route: studioRoute(DOC_ROUTES.article, lang),
      filter: `_type == "article" && language == "${lang}" && category->slug.current == $category && slug.current == $slug`
    })
  }

  // /blog/:slug, ambigu: catégorie d'abord, billet sans catégorie ensuite.
  for (const lang of SUPPORTED_LOCALES) {
    result.push({
      route: studioRoute(DOC_ROUTES.category, lang),
      filter: `_type == "category" && language == "${lang}" && slug.current == $slug`
    })
  }
  for (const lang of SUPPORTED_LOCALES) {
    result.push({
      route: studioRoute(DOC_ROUTES.category, lang),
      filter: `_type == "article" && language == "${lang}" && !defined(category) && slug.current == $slug`
    })
  }

  return result
}

/**
 * URL canonique d'un document pour `defineLocations` du Studio. Retourne null
 * si les paramètres requis manquent (doc sans slug, page légale d'id inconnu).
 * Article sans catégorie: repli sur /blog/<slug> (1 segment, miroir du front).
 */
export function buildStudioLocationHref(
  docType: WfDocType,
  doc: { _id?: string; language?: Locale; slug?: string; catSlug?: string }
): string | null {
  const lang = doc.language ?? DEFAULT_LOCALE

  if (docType === 'legalPage') {
    if (!doc._id) return null
    const key = legalRouteKeyForId(doc._id)
    return key ? routePath(key, lang) : null
  }

  if (docType === 'article' && !doc.catSlug) {
    if (!doc.slug) return null
    return `${routePath('blog', lang)}/${doc.slug}`
  }

  const spec = DOC_ROUTES[docType]
  let path = spec.urls[lang]
  if (spec.params.includes('slug')) {
    if (!doc.slug) return null
    path = path.replace('[slug]', doc.slug)
  }
  if (spec.params.includes('category')) {
    if (!doc.catSlug) return null
    path = path.replace('[category]', doc.catSlug)
  }

  const prefix = localePrefix(lang)
  return path === '/' ? (prefix || '/') : `${prefix}${path}`
}

// ── Fils d'Ariane ────────────────────────────────────────────────────────────

export interface Crumb {
  label: string
  /** Lien; absent = page courante (dernier maillon, non cliquable). */
  to?: string
}

const BY_KEY = new Map<string, RouteNode>(Object.entries(ROUTES))

/** Remonte la chaîne des parents d'une route statique (ancêtres + self), en
 *  liens localisés (préfixe de locale inclus). */
function ancestorChain(key: RouteKey, locale: Locale): Crumb[] {
  const chain: Crumb[] = []
  let currentKey: string | undefined = key
  while (currentKey) {
    const node: RouteNode | undefined = BY_KEY.get(currentKey)
    if (!node) break
    chain.unshift({
      label: node.label[locale],
      to: routePath(currentKey as RouteKey, locale)
    })
    currentKey = node.parent
  }
  return chain
}

/**
 * Fil d'Ariane d'une page, localisé.
 *  - Sans `leaf`: la route `key` EST la page courante; son dernier maillon perd
 *    son lien (page courante non cliquable).
 *  - Avec `leaf`: la route `key` est le parent (reste un lien), `leaf` est la
 *    page courante (ex. un projet sous /projets). `leaf.to` reste optionnel.
 * Extension T2b par paramètre optionnel (défaut FR): les pages passent
 * `locale.value`.
 */
export function breadcrumbsFor(key: RouteKey, leaf?: Crumb, locale: Locale = DEFAULT_LOCALE): Crumb[] {
  const chain = ancestorChain(key, locale)
  if (leaf) {
    return [...chain, { label: leaf.label, to: leaf.to }]
  }
  const head = chain.slice(0, -1)
  const current = chain[chain.length - 1]!
  return [...head, { label: current.label }]
}

/**
 * Construit un fil d'Ariane localisé à partir de maillons explicites posés sur
 * l'accueil. Utile pour les chemins dynamiques hors route-map (archives de
 * catégorie de blog, articles avec catégorie): Accueil / Blogue / {catégorie}
 * / {article}. Le dernier maillon est la page courante (`to` ignoré au rendu).
 */
export function breadcrumbsFromTrail(locale: Locale, ...trail: Crumb[]): Crumb[] {
  return [{ label: routeLabel('home', locale), to: routePath('home', locale) }, ...trail]
}
