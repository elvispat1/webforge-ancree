// https://nuxt.com/docs/api/configuration/nuxt-config
//
// webforge-ancree — CANVAS BLANC (reset au scaffold du 19 juin 2026).
// Coquille Nuxt 4 minimale: les modules de la famille (i18n, Sanity, image,
// fonts, icon, seo, pinia) et l'identité Ancrée (project Sanity 5if00rwn,
// déploiement Cloudflare). AUCUN bloc, contenu, schéma ni preview: la
// reconstruction (design + architecture Sanity) repart d'ici.
import tailwindcss from '@tailwindcss/vite'

// Connexion Sanity: constantes de code, override env OPTIONNEL (identité du
// site, invariante par environnement; un fork change ce bloc, pas l'env).
// Dataset 'production' (vidé au reset, l'architecture de contenu sera refaite).
const sanityProjectId = process.env.NUXT_PUBLIC_SANITY_PROJECT_ID || '5if00rwn'
const sanityDataset = process.env.NUXT_PUBLIC_SANITY_DATASET || 'production'
const sanityApiVersion = process.env.NUXT_PUBLIC_SANITY_API_VERSION || '2026-06-01'

// URL canonique: partagée site.url (@nuxtjs/seo) et i18n.baseUrl (hreflang
// absolus). Posée par Worker sur Cloudflare (NUXT_PUBLIC_SITE_URL).
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://webforge-ancree.patoinestudio.ca'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Le Studio Sanity vit dans studio/ (workspace yarn frère). Nuxt l'ignore.
  ignore: ['studio/**'],

  vite: {
    plugins: [tailwindcss()]
  },

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

  // Client Sanity (lecture publique CDN, sans token). Le visual editing / preview
  // sera recâblé avec la nouvelle architecture de contenu.
  sanity: {
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    useCdn: true
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
    '~/assets/css/main.css'
  ],

  // Bilingue: FR à la racine, EN sous /en. Pas de détection navigateur (statique).
  i18n: {
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    baseUrl: siteUrl,
    locales: [
      { code: 'fr', language: 'fr-CA', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-CA', name: 'English', file: 'en.json' }
    ],
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
      // Coquille bilingue: accueil FR + EN. La reconstruction étendra cette liste.
      routes: ['/', '/en']
    }
  }
})
