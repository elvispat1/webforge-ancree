<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Page À propos (multipage). Masthead hero-page (porte son propre fil d'Ariane,
 * du payload) puis le pageBuilder du document aboutPage (bloc about en zigzag,
 * bandeau d'appel de cloture). La copie et le SEO viennent du document Sanity
 * (payload), composes par la couche composable. Posture fail-fast: aucune
 * fixture en direct, le transform throw si le document manque. */
import { breadcrumbsFor } from '~/config/route-map'

const { locale } = useI18n()
const wfLocale = locale.value as 'fr' | 'en'

const hero = usePageHero('about')
const breadcrumbs = breadcrumbsFor('about', undefined, wfLocale)
// SEO du document aboutPage (payload, par locale; replis tranches au transform).
const seo = useFixedPage('about').seo

// AboutPage explicite: l'inference du module ne reconnait pas le chemin francais
// (/a-propos). Fil d'Ariane = meme source route-map que le masthead visible.
usePageSeo({
  title: seo.title,
  description: seo.description,
  webPageType: 'AboutPage',
  breadcrumbs
})

const blocks = useAboutBlocks()
</script>

<template>
  <div>
    <Hero :hero="hero" />
    <PageBuilder :blocks="blocks" reveal />
  </div>
</template>
