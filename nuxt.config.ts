// https://nuxt.com/docs/api/configuration/nuxt-config
//
// webforge-demo, famille Ancrée.
// Sanity V2 branchée (contrat §17): le contenu vit dans le project
// « WebForge - Ancrée Demo » (org Patoine Studio, id 5if00rwn) et le site
// reste en STATIQUE PUR. La config elle-même consomme Sanity au chargement
// (top-level await ci-dessous) pour générer les routes de prérendu et valider
// le blogue; le contenu des pages est fetché par app/plugins/01.content.ts.
//
// Règle de la fermeture: tout fichier importé ici l'est en chemin RELATIF
// (jamais l'alias ~), sans auto-import Nuxt: le projet TS node les typechecke.
import tailwindcss from '@tailwindcss/vite'
import { createClient } from '@sanity/client'
import type { CustomRoutePages } from '@nuxtjs/i18n'
import { ROUTE_SLUGS_QUERY, SITE_TITLE_SUFFIX_QUERY } from './app/queries/documents'
import { ARTICLES_PER_PAGE } from './app/content/articles'
import { assertBlogCollections } from './app/content/guards'
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  routePath,
  staticPagePaths,
  buildI18nPages,
  type Locale
} from './app/config/route-map'
import type { RouteSlugs, SanityDocTranslation } from './app/types/sanity'

// ── Connexion Sanity (plan T2, V1 et R5) ─────────────────────────────────────
// Les trois valeurs de connexion au project Sanity de CE site. CONSTANTES DE
// CODE: chacune a un défaut et un override env OPTIONNEL, aucune n'est requise.
// Raison: elles ne varient pas selon la branche ou l'environnement d'un même
// site, seulement d'un site à l'autre. Un client qui forke le gabarit change
// projectId ici, dans un seul bloc, plutôt que dans des variables d'env.
//   - projectId: quel project Sanity (org Patoine Studio). Identité du site.
//   - dataset: un seul dataset pour l'instant ('production'), toutes branches
//     confondues. Point d'extension: le jour où un dataset de préprod existe,
//     brancher la branche staging ici via process.env.WORKERS_CI_BRANCH
//     (ex: `=== 'staging' ? 'staging' : 'production'`), prod et preview restant
//     sur 'production'. Pas activé tant qu'un seul dataset existe (sinon le
//     fetch ci-dessous échouerait sur un dataset inexistant).
//   - apiVersion: contrat d'API que CE code cible; se bump avec le code, jamais
//     selon l'environnement.
const sanityProjectId = process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || '5if00rwn'
const sanityDataset = process.env.NUXT_PUBLIC_SANITY_DATASET || 'production'
const sanityApiVersion = process.env.NUXT_PUBLIC_SANITY_API_VERSION || '2026-06-01'

// URL canonique du site: partagée entre site.url (@nuxtjs/seo) et i18n.baseUrl
// (liens alternate hreflang absolus, correctif SEO T2c).
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://rempartextermination.ca'

// ── Interrupteurs du mode preview (plan T2c, décision tranchée #4, amendée le
// 15 juin) ───────────────────────────────────────────────────────────────────
// Le preview (Presentation tool, stega, drafts, SSR) s'active UNIQUEMENT quand
// DEUX conditions sont réunies:
//   1. la branche de build est `preview` (WORKERS_CI_BRANCH, injecté au build par
//      Cloudflare Workers Builds; undefined en dev local, alors permissif);
//   2. les DEUX variables sont posées: SANITY_API_READ_TOKEN (token Viewer,
//      server-only) et NUXT_PUBLIC_STUDIO_URL.
// Le gating par branche (1) est une couche de sécurité explicite (décision
// Charles, 15 juin): un token Viewer égaré sur le Worker prod ou staging
// n'allumerait PAS le preview. Hors preview, les variables vides suffisent déjà à
// ce que @nuxtjs/sanity désactive tout le visual editing (vérifié dans
// module.mjs: token et studioUrl requis, sinon `options.visualEditing = undefined`),
// donc ni stega, ni routes /preview/*, ni React dans le build. previewEnabled
// pilote AUSSI le preset Nitro (SSR sur le Worker preview, statique ailleurs).
const studioUrl = process.env.NUXT_PUBLIC_STUDIO_URL
const ciBranch = process.env.WORKERS_CI_BRANCH
const onPreviewBranch = ciBranch === 'preview' || ciBranch === undefined
const previewEnabled = onPreviewBranch && !!process.env.SANITY_API_READ_TOKEN && !!studioUrl

// Plus de garde « variables manquantes »: les trois valeurs ont un défaut de
// code, donc rien n'est requis en env. La config exige seulement un ACCÈS
// RÉSEAU à Sanity (le top-level await ci-dessous fetch les slugs des routes).
// Une mauvaise config (projectId/dataset erroné) ou un réseau coupé échoue de
// façon explicite dans le try/catch du fetch, jamais en silence.

// Slugs des routes dynamiques, fetchés une fois au chargement de la config via
// @sanity/client direct (le module @nuxtjs/sanity n'existe pas dans ce
// contexte). Contenu publié, lecture sans token, CDN.
const sanityBuildClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  useCdn: true
})

// Un fetch par locale (T2b): les slugs FR et EN servent chacun leur arbre de
// routes (FR à la racine, EN sous /en avec segments traduits du route-map).
const slugsByLocale = {} as Record<Locale, RouteSlugs>
for (const locale of SUPPORTED_LOCALES) {
  try {
    slugsByLocale[locale] = await sanityBuildClient.fetch<RouteSlugs>(
      ROUTE_SLUGS_QUERY,
      { language: locale }
    )
  } catch (cause) {
    throw new Error(
      `[webforge] Fetch Sanity des slugs de routes (${locale}) échoué (project ${sanityProjectId}, `
      + `dataset ${sanityDataset}, apiVersion ${sanityApiVersion}). Vérifier l'accès `
      + 'réseau (apicdn.sanity.io) et les ids du project dans .env. Sans ces slugs, '
      + 'les routes de prérendu et la garde du blogue ne peuvent pas être construites: '
      + 'on échoue ici plutôt que de générer un site incomplet.',
      { cause }
    )
  }
}

// Suffixe des titres (siteSettings.seo.titleSuffix, spec 12.10): alimente le
// gabarit de titre du module @nuxtjs/seo (« %s | {site.name} ») via site.name,
// dans le même top-level await que les slugs. Une seule valeur pour le gabarit
// global: celle de la locale par défaut (le seed porte le même suffixe, le nom
// de marque, dans les deux langues). L'accueil et le one-pager neutralisent le
// gabarit en page (titleTemplate: null) et gardent leur titre complet.
let siteTitleSuffix: string | null = null
try {
  siteTitleSuffix = await sanityBuildClient.fetch<string | null>(
    SITE_TITLE_SUFFIX_QUERY,
    { language: DEFAULT_LOCALE }
  )
} catch (cause) {
  throw new Error(
    `[webforge] Fetch Sanity du suffixe de titres (siteSettings.seo.titleSuffix, ${DEFAULT_LOCALE}) `
    + `échoué (project ${sanityProjectId}, dataset ${sanityDataset}). Vérifier l'accès réseau et les `
    + 'ids du project dans .env.',
    { cause }
  )
}
if (!siteTitleSuffix) {
  throw new Error(
    '[webforge] siteSettings.seo.titleSuffix introuvable (langue par défaut): le gabarit de titre '
    + 'ne peut pas être construit. Seed ou migration du dataset incomplet: on échoue ici plutôt '
    + 'que de générer des titres sans marque.'
  )
}

// Routes de prérendu générées depuis les slugs Sanity, PAR LANGUE. Garantit
// que TOUTES les pages détail, articles (URL à 1 ou 2 segments), pages de
// catégorie et paginations sont générées en statique dans les deux langues,
// sans dépendre du crawl (parade au piège des 404 silencieuses).
// ARTICLES_PER_PAGE reste dans app/content/articles.ts (source unique,
// partagée avec paginate() de useArticles.ts).

// Garde de build du blog (schéma d'URL court): collisions de slugs et plafond
// d'archive, validés PAR LANGUE sur les données Sanity injectées (le segment
// de pagination « page » reste réservé sous /blog dans les deux langues).
// Échec clair de `nuxt dev`/`build`/`generate` plutôt qu'une 404 silencieuse.
// Voir app/content/guards.ts.
for (const locale of SUPPORTED_LOCALES) {
  try {
    assertBlogCollections({
      articlesPerPage: ARTICLES_PER_PAGE,
      articles: slugsByLocale[locale].articles,
      categories: slugsByLocale[locale].categories.map((c) => c.slug)
    })
  } catch (cause) {
    throw new Error(`[webforge] Garde du blogue échouée pour la langue « ${locale} »`, { cause })
  }
}

const paginationUrls = (count: number, base: string) =>
  Array.from(
    { length: Math.max(0, Math.ceil(count / ARTICLES_PER_PAGE) - 1) },
    (_, i) => `${base}/page/${i + 2}`
  )

// URL COMPLÈTE (préfixe de locale inclus) d'un doc dynamique. Définies une seule
// fois et consommées À LA FOIS par le prérendu (localeRoutes) et par le sitemap
// (SITEMAP_DYNAMIC_URLS): impossible que les deux divergent.
const serviceUrl = (locale: Locale, slug: string): string => `${routePath('services', locale)}/${slug}`
const projectUrl = (locale: Locale, slug: string): string => `${routePath('projects', locale)}/${slug}`
const articleUrl = (locale: Locale, slug: string, category: string | null): string => {
  const base = routePath('blog', locale)
  return category ? `${base}/${category}/${slug}` : `${base}/${slug}`
}
// Archive de catégorie: /blog/<slug> (1 segment), même base que le route-map.
const categoryUrl = (locale: Locale, slug: string): string => `${routePath('blog', locale)}/${slug}`

// Arbre complet d'une locale: pages statiques (route-map, préfixe inclus) +
// pages dynamiques depuis les slugs de la langue. FR reproduit la liste T2a à
// l'identique (URLs inchangées), EN vit sous /en.
const localeRoutes = (locale: Locale): string[] => {
  const slugs = slugsByLocale[locale]
  const blogBase = routePath('blog', locale)
  return [
    ...staticPagePaths(locale),
    ...slugs.services.map((s) => serviceUrl(locale, s.slug)),
    ...slugs.projects.map((p) => projectUrl(locale, p.slug)),
    ...slugs.articles.map((a) => articleUrl(locale, a.slug, a.category)),
    ...slugs.categories.map((c) => categoryUrl(locale, c.slug)),
    ...paginationUrls(slugs.articles.length, blogBase)
  ]
}

const PRERENDER_ROUTES = SUPPORTED_LOCALES.flatMap(localeRoutes)

// ── Sitemap: pages INDEXABLES depuis la même source que le prérendu (MAJ-02) ──
// Le module @nuxtjs/sitemap couvre déjà les pages FIXES via i18n.pages (source
// auto i18n:pages, alternatives incluses), mais OMET l'accueil (hors i18n.pages,
// pageName null) et TOUTES les pages dynamiques (il saute les chemins i18n
// contenant « [ »). On les fournit explicitement, depuis slugsByLocale (même
// source que PRERENDER_ROUTES, zéro divergence), avec le split par locale
// (_sitemap = nom du sitemap enfant auto fr-CA/en-CA) et les alternatives
// hreflang (slugs traduits de translation.metadata). Les archives de catégorie
// sont indexables (politique blog, décision Charles) et donc incluses; seule la
// pagination /blog/page/N reste noindex au niveau page et hors sitemap.
const LOCALE_HREFLANG: Record<Locale, string> = { fr: 'fr-CA', en: 'en-CA' }

interface SitemapAltSource { lang: Locale; slug: string; category: string | null }
interface SitemapAlternative { hreflang: string; href: string }
interface SitemapUrlEntry {
  loc: string
  _sitemap: string
  alternatives: SitemapAlternative[]
}

// Alternatives hreflang d'un doc dynamique, depuis ses traductions (toutes
// langues présentes dans translation.metadata). Repli sur la seule locale
// courante si le doc n'a aucune traduction (alternate dégradé, cohérent avec le
// setI18nParams des pages détail). x-default = locale par défaut si présente.
const dynamicAlternatives = (
  toUrl: (locale: Locale, slug: string, category: string | null) => string,
  self: SitemapAltSource,
  translations: SanityDocTranslation[] | null
): SitemapAlternative[] => {
  const valid = (translations ?? []).filter(
    (t): t is SanityDocTranslation & { lang: Locale; slug: string } =>
      (t.lang === 'fr' || t.lang === 'en') && typeof t.slug === 'string' && t.slug.length > 0
  )
  const entries: SitemapAltSource[] = valid.length
    ? valid.map((t) => ({ lang: t.lang, slug: t.slug, category: t.catSlug ?? null }))
    : [self]
  const alternatives = entries.map((e) => ({ hreflang: LOCALE_HREFLANG[e.lang], href: toUrl(e.lang, e.slug, e.category) }))
  const def = entries.find((e) => e.lang === DEFAULT_LOCALE)
  if (def) alternatives.push({ hreflang: 'x-default', href: toUrl(def.lang, def.slug, def.category) })
  return alternatives
}

const SITEMAP_DYNAMIC_URLS: SitemapUrlEntry[] = [
  // Accueil des deux locales (jamais dans i18n.pages: pageName null).
  ...SUPPORTED_LOCALES.map((locale) => ({
    loc: routePath('home', locale),
    _sitemap: LOCALE_HREFLANG[locale],
    alternatives: [
      ...SUPPORTED_LOCALES.map((l) => ({ hreflang: LOCALE_HREFLANG[l], href: routePath('home', l) })),
      { hreflang: 'x-default', href: routePath('home', DEFAULT_LOCALE) }
    ]
  })),
  // Pages dynamiques de chaque locale (services, projets, articles, archives de
  // catégorie). La pagination /blog/page/N est volontairement absente (noindex).
  ...SUPPORTED_LOCALES.flatMap((locale) => {
    const slugs = slugsByLocale[locale]
    return [
      ...slugs.services.map((s) => ({
        loc: serviceUrl(locale, s.slug),
        _sitemap: LOCALE_HREFLANG[locale],
        alternatives: dynamicAlternatives(serviceUrl, { lang: locale, slug: s.slug, category: null }, s.translations)
      })),
      ...slugs.projects.map((p) => ({
        loc: projectUrl(locale, p.slug),
        _sitemap: LOCALE_HREFLANG[locale],
        alternatives: dynamicAlternatives(projectUrl, { lang: locale, slug: p.slug, category: null }, p.translations)
      })),
      ...slugs.articles.map((a) => ({
        loc: articleUrl(locale, a.slug, a.category),
        _sitemap: LOCALE_HREFLANG[locale],
        alternatives: dynamicAlternatives(articleUrl, { lang: locale, slug: a.slug, category: a.category }, a.translations)
      })),
      ...slugs.categories.map((c) => ({
        loc: categoryUrl(locale, c.slug),
        _sitemap: LOCALE_HREFLANG[locale],
        alternatives: dynamicAlternatives(categoryUrl, { lang: locale, slug: c.slug, category: null }, c.translations)
      }))
    ]
  })
]

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Le Studio Sanity vit dans studio/ (workspace yarn frère de l'app, contrat
  // §17). Nuxt ne doit ni le scanner ni le watcher: il a son propre tooling.
  ignore: ['studio/**'],

  // Tailwind v4 fournit le système de grille 12 colonnes (utilitaires section-grid
  // + col-span-*) et l'échelle d'espacement fluide (--spacing à 0.5rem accordée
  // au clamp html font-size 9px→10px). @theme et html clamp vivent dans global.css.
  //
  // optimizeDeps (preview seulement): pré-bundle de la stack React transitive de
  // @sanity/visual-editing (liste copiée de la référence nuxt-sanity-test, moins
  // @portabletext/vue qui n'est pas une dépendance de cette app). Sans ce
  // pré-bundle, Vite découvre ces deps CJS à la volée au premier run du dev
  // preview et déclenche des full-reloads. Le module en injecte la majorité
  // lui-même quand visualEditing est actif; on ajoute les extras (@vue/devtools-*,
  // @sanity/image-url). À régénérer au bump de @nuxtjs/sanity.
  vite: {
    plugins: [tailwindcss()],
    // __WF_PREVIEW__: constante de COMPILATION dérivée des interrupteurs d'env
    // (même code sur toutes les branches, l'env tranche, décision tranchée #4).
    // Hors preview elle vaut false: les branches preview de l'app (plugin
    // 01.content, montage du PreviewBanner dans les layouts) deviennent du code
    // mort que Rollup élimine, donc AUCUN chunk preview ni visual editing dans
    // .output/public (gate T2c, pureté statique). Déclaration TS:
    // app/types/globals.d.ts.
    define: { __WF_PREVIEW__: previewEnabled },
    ...(previewEnabled
      ? {
          optimizeDeps: {
            include: [
              '@nuxtjs/sanity > @sanity/visual-editing > @sanity/insert-menu',
              '@nuxtjs/sanity > @sanity/visual-editing > @sanity/mutate > lodash/groupBy.js',
              '@nuxtjs/sanity > @sanity/visual-editing > @sanity/ui > styled-components',
              '@nuxtjs/sanity > @sanity/visual-editing > @sanity/visual-editing > react-is',
              '@nuxtjs/sanity > @sanity/visual-editing > react',
              '@nuxtjs/sanity > @sanity/visual-editing > react/jsx-runtime',
              '@nuxtjs/sanity > @sanity/visual-editing > react-dom',
              '@nuxtjs/sanity > @sanity/visual-editing > react-dom/client',
              '@nuxtjs/sanity > @sanity/visual-editing > react-compiler-runtime',
              '@sanity/client',
              '@nuxtjs/sanity > @sanity/client > @sanity/visual-editing',
              '@vue/devtools-core',
              '@vue/devtools-kit',
              '@sanity/image-url'
            ]
          }
        }
      : {})
  },

  // Pureté statique du HTML (gate T2c): même sans visualEditing, le module
  // @nuxtjs/sanity pose une clé `stega: {}` par défaut dans sa config runtime
  // publique (module.mjs, publicRuntimeConfig), que Nitro sérialise ensuite
  // dans le HTML de CHAQUE page prérendue. Hors preview, on retire la clé au
  // moment où la config nitro est figée (avant le build du serveur de
  // prerender): aucune occurrence de « stega » dans .output/public. Les
  // lectures runtime du module tolèrent l'absence: resolveFetchOptions fait
  // `clientConfig?.stega?.enabled` et createClient traite stega comme
  // optionnelle (défaut désactivé, équivalent à `{}`). En preview, la clé est
  // conservée telle quelle: le visual editing s'en sert.
  hooks: {
    'nitro:config'(nitroConfig) {
      if (previewEnabled) {
        // SSR preview: AUCUN prérendu (le contenu draft est rendu à la requête;
        // prérendre figerait le contenu PUBLIÉ). On neutralise la config héritée
        // de nitro.prerender (routes explicites + crawlLinks).
        if (nitroConfig.prerender) {
          nitroConfig.prerender.routes = []
          nitroConfig.prerender.crawlLinks = false
        }
        return
      }
      const runtimeConfig = nitroConfig.runtimeConfig as
        | { public?: { sanity?: Record<string, unknown> } }
        | undefined
      const sanityPublic = runtimeConfig?.public?.sanity
      if (sanityPublic) {
        delete sanityPublic.stega
      }
    }
  },

  // Icônes de marque (monogramme « A » centré, public/). Assets statiques générés
  // depuis les tokens de marque: fond --accent-1 #2D4A3E, lettre --white
  // #FAFAF7 (les valeurs en dur vivent dans les fichiers d'icônes et ici, pas
  // dans un composant: la config ne peut pas lire les variables CSS). Le SVG
  // sert les navigateurs modernes, le PNG 32 et le favicon.ico (legacy, requêté
  // par convention sans balise) servent le reste, l'apple-touch-icon est
  // plein-bord (iOS applique son propre arrondi). theme-color = --accent-1.
  app: {
    head: {
      // htmlAttrs de repli STATIQUE (G2/DEC-08): la coquille SPA d'erreur
      // (404.html / 200.html) n'a pas de route appariée, donc ni le <html lang>
      // ni le <title> que les vraies pages posent (lang via nuxt-seo-utils,
      // titre via usePageSeo). On grave ici, dans le head de base du gabarit (la
      // priorité la plus basse, écrasée par chaque page réelle), un lang de la
      // locale par défaut (fr-CA) et un titre = la marque (siteTitleSuffix, depuis
      // Sanity, jamais en dur). error.vue fixe ensuite le titre exact au montage.
      // Marqueur preview: <html class="wf-no-motion"> en preview SEULEMENT (gaté au
      // build). global.css désactive le masque anti-flash .wf-hero sous cette classe,
      // pour garder le contenu visible quand les animations sont coupées en preview
      // (apparition/reveal/parallaxe off, cf. motion.ts motionDisabled).
      htmlAttrs: {
        lang: 'fr-CA',
        ...(previewEnabled ? { class: 'wf-no-motion' } : {})
      },
      title: siteTitleSuffix,
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ],
      meta: [
        { name: 'theme-color', content: '#1E6FB0' }
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

  // Client Sanity du module @nuxtjs/sanity, consommé par useSanity() dans
  // app/plugins/01.content.ts (LE fetch du contenu, une fois par langue).
  // Lecture du contenu PUBLIÉ via CDN, sans token.
  //
  // visualEditing (T2c): bloc CONDITIONNEL, activé seulement quand les deux
  // interrupteurs d'environnement sont posés (cf. previewEnabled en tête).
  // Mode live-visual-editing: le module installe les routes /preview/enable et
  // /preview/disable, le proxy /_sanity/visual-editing/fetch (le token ne sort
  // JAMAIS du serveur: copie publique vidée par le module), les plugins
  // overlays + live mode, et le stega encoding pointé sur studioUrl. useCdn
  // true reste correct: en preview, le module force token + API directe.
  // Generate de production SANS token: aucun stega, aucune route preview, pas
  // de React client (décision tranchée #4 du contrat §17).
  sanity: {
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    useCdn: true,
    ...(previewEnabled
      ? {
          visualEditing: {
            // Mode 'live-visual-editing': édition IN-PLACE, sans rechargement. Le
            // module abonne useSanityQuery au queryStore (@sanity/core-loader); dans
            // le Presentation tool, une mutation arrive par Comlink et ré-évalue la
            // requête CÔTÉ CLIENT (zéro fetch serveur). Notre moteur (plugin
            // app/plugins/02.preview-live.client.ts) garde cette requête vivante par
            // route et re-dérive transformGraph dans un état réactif livePayload, lu
            // par usePayload(). Les composables réactifs (Phase 2) re-rendent in-place.
            // Le fix CPU 1102 reste intact: le SSR fetch toujours la requête SCOPÉE
            // par route; l'édition live est 100% client (aucun CPU Worker par frappe).
            mode: 'live-visual-editing' as const,
            token: process.env.SANITY_API_READ_TOKEN,
            studioUrl,
            stega: true
          }
        }
      : {})
  },

  // Bundle la collection lucide pour qu'elle soit disponible sans fetch async.
  // Évite les icônes invisibles au premier rendu (le default css-mask mode rend
  // un carré 0×0 tant que le SVG n'est pas chargé).
  icon: {
    serverBundle: {
      collections: ['lucide']
    }
  },

  // Pipeline image global (@nuxt/image, provider IPX). Toute image du site passe
  // par le fragment <Image>, qui rend un <NuxtImg> webp responsive (srcset + sizes).
  // L'optimisation se fait au BUILD (sharp côté Node): les variantes /_ipx/ sont
  // prérendues en fichiers statiques. Aucun runtime n'est requis sur Cloudflare
  // Pages (sharp ne tourne pas dans le worker). Voir nitro.prerender plus bas.
  //
  // Les `screens` sont alignés sur le système WebForge (mobile 4 cols, bascule
  // 12 cols à 1024, container cap 1920). Ils servent À LA FOIS d'alias aux `sizes`
  // (sm:, md:, lg:, xl:, xxl:) ET de largeurs candidates du srcset.
  image: {
    // Hors preview: PAS de `provider` explicite. Sur le preset 'static',
    // @nuxt/image résout 'ipxStatic' au BUILD (génère les /_ipx/ en fichiers
    // statiques optimisés) ET 'ipx' en DEV (serveur d'images du dev qui sert les
    // /_ipx/ à la volée). Forcer 'ipxStatic' cassait le dev: pas de handler
    // d'images en dev → les /_ipx/... renvoyaient 404, aucune image au front.
    //
    // En preview SSR (Worker, previewEnabled): sharp ne tourne pas sur workerd,
    // donc pas d'IPX runtime. Provider `none`: <NuxtImg> sert le `src` tel quel,
    // l'URL cdn.sanity.io du contenu (zéro transform runtime). Images réelles mais
    // non optimisées, suffisant pour l'édition interne. Suivi possible: un provider
    // custom apposant les transforms du CDN Sanity (?w=&q=&auto=format).
    ...(previewEnabled ? { provider: 'none' } : {}),
    quality: 72,
    // Hosts distants autorisés (plan T2, V3): les images du contenu vivent sur
    // le CDN Sanity (`"src": image.asset->url` projeté en GROQ). Au generate,
    // ipxStatic fetch l'original sur cdn.sanity.io et écrit les variantes
    // /_ipx/ en fichiers statiques: le site déployé reste auto-suffisant,
    // aucune dépendance runtime au CDN Sanity. En dev, le provider ipx sert
    // les mêmes URL à la volée.
    domains: ['cdn.sanity.io'],
    // Pas de `densities`: avec une prop `sizes` responsive, @nuxt/image dérive
    // déjà une échelle de largeurs propre depuis `screens` (375..1920). Les
    // densités produisaient des entrées dégénérées 1w/2w inutiles dans le srcset.
    screens: {
      xs: 375,
      sm: 500,
      md: 640,
      lg: 1024,
      xl: 1440,
      xxl: 1920
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  // Auto-import des composants par NOM DE FICHIER (pathPrefix:false): le nom est
  // celui du fichier, jamais du chemin. Le regroupement en dossiers de niveau 1
  // (ui/, fragments/, hero/, page-builder/, layout/, domain/, showcase/) est donc
  // sans effet sur les noms auto-importés. Exclusions de l'entrée générale:
  //   - les blocs page-builder/** (importés explicitement par l'orchestrateur);
  //   - ui/link/** (entrée dédiée ci-dessous): primitives de lien
  //     Anchor/External/Internal, enregistrées une seule fois (l'exclusion évite
  //     un double enregistrement via l'entrée générale);
  //   - showcase/styleguide/** (importé explicitement par pages/showcase/index.vue,
  //     noms génériques Nav/Forms/Tokens/Atoms): exclu pour ne pas polluer le
  //     namespace global. showcase/dev/ (DevGrid), lui, RESTE auto-importé, car
  //     monté par nom dans app.vue (LazyDevGrid). C'est la règle exacte du
  //     dev-only: styleguide exclu, DevGrid auto-importé.
  components: [
    {
      path: '~/components/ui/link',
      pathPrefix: true
    },
    {
      path: '~/components',
      pathPrefix: false,
      ignore: ['**/page-builder/**', '**/link/**', '**/styleguide/**']
    }
  ],

  // Ordre des imports:
  //   1. Tokens de la famille active (Ancrée) — fonts, géométrie, spacing.
  //   2. Tokens de la marque (spécifiques à ce site) — surfaces, texte, accents.
  //   3. Système typographique — classes wf-h1→h6, wf-body-1/2/3, wf-caption-1/2.
  //   4. Système de grille — 12 colonnes via .section-grid + col-span-N (Tailwind).
  //   5. CSS global commun — Tailwind, reset, blocs stylés via tokens.
  // Pour basculer vers une autre famille, remplacer la première ligne.
  // Pour rebrander (autre client Ancrée), remplacer la deuxième.
  css: [
    '~/family/tokens.css',
    '~/brand/tokens.css',
    '~/assets/css/typography.css',
    '~/assets/css/grid.css',
    '~/assets/css/global.css'
  ],

  // Bilingue (T2b): FR à la racine (URLs inchangées), EN sous /en. Les chemins
  // EN traduits (about, projects, terms-of-use...) viennent du route-map via
  // customRoutes: 'config' (source unique, partagée avec le Studio en T2c).
  // Pas de détection navigateur: site statique, pas de redirection automatique
  // (le visiteur change de langue par le switcher, en plein chargement).
  i18n: {
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    // Requis pour des liens alternate hreflang ABSOLUS (correctif SEO T2c).
    // Sans baseUrl, le runtime i18n loggue « baseUrl is required to generate
    // valid SEO tag links » et émettrait des href relatifs. L'émission des
    // alternates elle-même est activée par useLocaleHead dans app.vue
    // (vérifié dans node_modules/@nuxtjs/i18n/dist/runtime: seoSettings.seo
    // est false par défaut hors strictSeo, rien ne sort sans cet appel).
    baseUrl: siteUrl,
    locales: [
      { code: 'fr', language: 'fr-CA', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-CA', name: 'English', file: 'en.json' }
    ],
    customRoutes: 'config',
    // buildI18nPages retourne Record<string, Record<Locale, string>>; les URLs
    // commencent toutes par '/' mais TS ne le dérive pas: cast à la frontière
    // pour garder route-map.ts plain TS (importable du Studio).
    pages: buildI18nPages() as CustomRoutePages,
    detectBrowserLanguage: false
  },

  // Graisses réellement consommées par le CSS (typography.css + global.css):
  // Archivo 400 (corps), 500 (wf-h1..h3, wf-caption), 600 (wf-h4..h5, boutons,
  // nav, accordéon). Sans `weights`, @nuxt/fonts ne résout que la 400 et le
  // navigateur synthétise les 500/600 (faux-gras incohérent entre navigateurs).
  // Pas d'italique dans l'app (grep font-style/em vide): styles normal seulement.
  fonts: {
    families: [
      { name: 'Archivo', provider: 'google', weights: [400, 500, 600], styles: ['normal'] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400], styles: ['normal'] }
    ]
  },

  site: {
    url: siteUrl,
    // Suffixe des titres depuis Sanity (siteSettings.seo.titleSuffix, fetch en
    // tête de fichier): site.name alimente le gabarit « %s | {site.name} » du
    // module @nuxtjs/seo et l'identité du graphe Schema.org (usePageSeo).
    name: siteTitleSuffix,
    // Pas de `description` ici (MAJ-04): la description du nœud Schema.org
    // #website vient de Sanity (siteSettings.seo.defaultDescription), lue par
    // usePageSeo. Une valeur en dur ici fuirait dans le balisage de chaque page.
    defaultLocale: 'fr',
    // Le démo ENTIER est un gabarit non indexable (la marque de démonstration est
    // fictive, ce n'est pas ce qui va aller en ligne): robots noindex global + robots.txt
    // bloquant, gérés par @nuxtjs/seo. Les vrais sites clients basculent à true
    // (ou retirent la ligne, true est le défaut) à la mise en ligne. Les
    // exclusions sitemap et les noindex de pages ci-dessous restent en place:
    // c'est le pattern du gabarit pour le jour où un site est indexable.
    indexable: false
  },

  // Sous-arbres hors sitemap public, même quand le site est indexable:
  //   - /showcase: vraie page client-facing (vitrine des blocs de la famille),
  //     noindex au niveau page (usePageSeo) + exclusion ici. Pas de disallow
  //     robots.txt sur /showcase: un disallow bloquerait le crawl et le crawler
  //     ne verrait jamais le noindex. Reste prérendue (PRERENDER_ROUTES).
  //   - /one-pager/**: vitrine interne du palier 1. Duplique le contenu du
  //     multipage (qui est LE site du démo), y compris les deux pages légales:
  //     noindex au niveau page (usePageSeo) + exclusion ici. Pas de disallow
  //     robots.txt sur /one-pager: un disallow bloquerait le crawl et le
  //     crawler ne verrait jamais le noindex.
  sitemap: {
    exclude: ['/showcase', '/en/showcase', '/one-pager/**', '/en/one-pager/**'],
    // La source auto « nuxt:prerender » est désactivée: dès que site.indexable
    // passe à true, elle re-listerait toutes les pages dynamiques (avec des
    // alternatives i18n incomplètes pour les slugs traduits), en DOUBLON de la
    // source webforge:dynamic. Les pages fixes restent couvertes par la source
    // auto i18n:pages (depuis i18n.pages); l'accueil et les pages dynamiques
    // passent uniquement par webforge:dynamic (mêmes slugs que le prérendu).
    excludeAppSources: ['nuxt:prerender'],
    sources: [
      {
        context: {
          name: 'webforge:dynamic',
          description:
            'Accueil + pages dynamiques (services, projets, articles) depuis les slugs Sanity '
            + '(slugsByLocale, source du prérendu). Split par locale + alternatives hreflang.'
        },
        urls: SITEMAP_DYNAMIC_URLS
      }
    ]
  },
  // Plus de bloc robots: /dev supprimé; /showcase et /one-pager sont noindex au
  // niveau page (usePageSeo) + exclus du sitemap, sans disallow (pour que le
  // crawler voie le noindex). Le démo entier reste non indexable via
  // site.indexable:false.

  // OG Image generation désactivé en runtime (pas de dépendance chromium en V1).
  // Les og:image sont servies en statique par usePageSeo: visuel propre à la
  // page (cover de projet/article, image de service, héros) avec repli de
  // marque public/og/og-default.jpg, en URL absolue dérivée de site.url.
  ogImage: {
    enabled: false
  },

  // Graphe Schema.org: les nœuds par défaut du module (WebSite, WebPage,
  // identité) sont désactivés (historiquement: en strategy no_prefix, son
  // plugin i18n émettait un WebSite avec workTranslation dégénéré, le site
  // déclaré traduction de lui-même; le graphe maison reste la source unique
  // depuis). C'est usePageSeo qui émet le graphe complet sur chaque page:
  // Organization (#identity, publisher), WebSite, WebPage, BreadcrumbList, et
  // selon la page Article, LocalBusiness ou FAQPage.
  schemaOrg: {
    defaults: false
  },

  // nuxt-seo-utils: fallbackTitle désactivé. Toutes les pages posent leur titre
  // explicitement via usePageSeo (couverture 100%), le repli est donc redondant.
  // Surtout: sur une page d'erreur, son useFallbackTitle impose un titre
  // « {code} - {message} » (anglais, fuite du chemin) qui se réapplique de façon
  // RÉACTIVE sur useError(), battant le titre de error.vue quelle que soit la
  // tagPriority posée (le dernier patch réactif gagne le <title> dédupliqué).
  // Désactivé, error.vue (et chaque page) garde son propre titre localisé.
  seo: {
    fallbackTitle: false
  },

  nitro: {
    // SSR sur le Worker preview (previewEnabled, build `nuxt build`); statique
    // partout ailleurs (prod/staging, build `nuxt generate`). Le prérendu hérité
    // ci-dessous est neutralisé en preview par le hook nitro:config plus haut.
    // À VALIDER au 1er build preview: nom exact du preset Workers + nodejs_compat
    // + config wrangler SSR (main + binding assets).
    preset: previewEnabled ? 'cloudflare-module' : 'static',
    prerender: {
      crawlLinks: true,
      // Routes explicites générées depuis les collections (cf. PRERENDER_ROUTES en
      // tête de fichier): racine, one-pager, toutes les pages statiques, et toutes
      // les pages dynamiques (détails, articles, archives, paginations). crawlLinks
      // reste actif en complément (images _ipx, liens internes).
      routes: PRERENDER_ROUTES,
      // /en/sitemap.xml: page fantôme du prérendu (correctif SEO T2c). Chaîne
      // causale vérifiée dans les node_modules: (1) @nuxtjs/sitemap en mode
      // multi-sitemaps pose la routeRule nitro `/sitemap.xml -> redirect
      // /sitemap_index.xml`; (2) Nuxt core (hook pages:extend) convertit toute
      // routeRule redirect sans page correspondante en route stub du routeur
      // (pour honorer le redirect en navigation client); (3) @nuxtjs/i18n en
      // prefix_except_default localise TOUTES les pages, stub inclus ->
      // /en/sitemap.xml; (4) le plugin prerender de Nuxt met en file chaque
      // route statique du routeur quand crawlLinks est actif. Le /sitemap.xml
      // FR aboutit sur la routeRule (redirect HTML voulu, c'est l'entrée
      // canonique du sitemap sur l'hôte statique); le /en/sitemap.xml n'a NI
      // routeRule NI page -> rendu de l'app = page fantôme HTML + payload.
      // Aucune poignée propre côté i18n pour exclure un stub sans nom de page:
      // on l'écarte du prérendu ici (le stub résiduel du routeur client est
      // inerte, rien ne pointe vers lui).
      ignore: ['/en/sitemap.xml']
    }
  },

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
    contactToEmail: process.env.CONTACT_TO_EMAIL,
    contactFromEmail: process.env.CONTACT_FROM_EMAIL,
    public: {
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
      // URL du Studio pour les liens « Ouvrir le Studio » éventuels du chrome
      // preview (T2c). Vide en production statique: aucun lien rendu.
      studioUrl: studioUrl || '',
      // Démo en statique pur: pas de backend, useContactForm simule le succès côté
      // client. Un vrai site client met ce flag à false et garde la route serveur
      // (server/api/contact.post.ts) + Resend + Turnstile.
      contactDemo: true,
      // Couture de build pour app/router.options.ts (plan T2, V4): les slugs de
      // catégories du blogue PAR LANGUE, déjà fetchés pour les routes de
      // prérendu, injectés dans la config publique. scrollBehavior les lit via
      // useRuntimeConfig (locale dérivée du chemin): plus déterministe que lire
      // le payload du plugin 01.content (aucune dépendance à l'ordre
      // d'exécution des plugins).
      wf: {
        categorySlugs: {
          fr: slugsByLocale.fr.categories.map((c) => c.slug),
          en: slugsByLocale.en.categories.map((c) => c.slug)
        }
      }
    }
  }
})
