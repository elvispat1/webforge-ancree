<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Page Contact (multipage). Masthead hero-page (porte son propre fil d'Ariane,
 * du payload) puis le bloc contact (coordonnees, zone de service, formulaire).
 * Pas de bandeau d'appel: la page EST le point de conversion. La copie et le SEO
 * viennent du document contactPage (payload); le transform COMPOSE le bloc
 * contact en joignant la NAP de siteSettings et les libelles d'interface (i18n).
 * Posture fail-fast: aucune fixture en direct. */
import { breadcrumbsFor } from '~/config/route-map'

const { locale } = useI18n()
const wfLocale = locale.value as 'fr' | 'en'

const hero = usePageHero('contact')
const breadcrumbs = breadcrumbsFor('contact', undefined, wfLocale)
const seo = useFixedPage('contact').seo

// ContactPage infere du chemin /contact par le module. Fil d'Ariane = route-map.
usePageSeo({
  title: seo.title,
  description: seo.description,
  breadcrumbs
})

const blocks = useContactPageBlocks()
</script>

<template>
  <div>
    <Hero :hero="hero" />
    <PageBuilder :blocks="blocks" reveal />
  </div>
</template>
