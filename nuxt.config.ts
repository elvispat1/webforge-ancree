// https://nuxt.com/docs/api/configuration/nuxt-config
//
// webforge-ancree — CANVAS BLANC (reset au scaffold du 19 juin 2026).
// Coquille Nuxt 4 minimale: les modules de la famille (i18n, Sanity, image,
// fonts, icon, seo, pinia) et l'identité Ancrée (project Sanity 5if00rwn,
// déploiement Cloudflare). AUCUN bloc, contenu, schéma ni preview: la
// reconstruction (design + architecture Sanity) repart d'ici.
import tailwindcss from '@tailwindcss/vite'
import type { CustomRoutePages } from '@nuxtjs/i18n'
// Route-map: source unique du mapping URL <-> contenu. Import RELATIF (jamais ~):
// la fermeture nuxt.config est typecheckee hors du contexte d'alias Nuxt. Plain TS.
import { SUPPORTED_LOCALES, staticPagePaths, buildI18nPages } from './app/config/route-map'

// Connexion Sanity: constantes de code, override env OPTIONNEL (identité du
// site, invariante par environnement; un fork change ce bloc, pas l'env).
// Dataset 'production' (vidé au reset, l'architecture de contenu sera refaite).
const sanityProjectId = process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || '5if00rwn'
const sanityDataset = process.env.NUXT_PUBLIC_SANITY_DATASET || 'production'
const sanityApiVersion = process.env.NUXT_PUBLIC_SANITY_API_VERSION || '2026-06-01'

// URL canonique: partagée site.url (@nuxtjs/seo) et i18n.baseUrl (hreflang
// absolus). Posée par Worker sur Cloudflare (NUXT_PUBLIC_SITE_URL).
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://webforge-ancree.patoinestudio.ca'

// Routes de prerendu: toutes les pages statiques du route-map (segments EN
// localises par customRoutes), blog inclus. Les pages dynamiques (serviceCity
// /extermination/[slug], articles et archives de categorie /blog/...) sont
// decouvertes par crawlLinks depuis les liens rendus (accueil + liste du blog).
// Quand le contenu blog vivra dans Sanity, ajouter ici un fetch des slugs
// d'articles (comme la reference Minimaliste) pour ne pas dependre du seul crawl.
const PRERENDER_ROUTES = SUPPORTED_LOCALES.flatMap((locale) => staticPagePaths(locale))

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

  // Client Sanity (lecture publique, sans token). useCdn: false — le site est
  // genere statiquement, donc toutes les lectures se font au BUILD: l'API directe
  // garantit du contenu frais (le CDN accuse un leger retard apres publication).
  // Aucune requete Sanity a l'execution (tout est prerendu).
  sanity: {
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    useCdn: false,
    // Lecture publique: perspective 'published' (le defaut 'raw' du client exige un
    // token et renvoie 403 sur le dataset public). Aucune requete a l'execution: la
    // lecture se fait au build (useSanityBuildQuery), jamais depuis le navigateur.
    perspective: 'published'
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
    name: 'Ancrée',
    defaultLocale: 'fr',
    // Gabarit non indexable tant qu'aucun vrai site n'est en ligne.
    indexable: false
  },

  // Pas de génération d'OG en runtime (aucune dépendance chromium en V1).
  ogImage: { enabled: false },

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      // Pages statiques calculees depuis le route-map (segments EN localises).
      // Le reste (serviceCity) est decouvert par crawlLinks.
      routes: PRERENDER_ROUTES
    }
  }
})
