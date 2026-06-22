<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Hub des villes desservies (le « ou » du SEO local). Masthead hero-page (document
 * villesPage, fil Accueil -> Villes), puis le corps de page vient du pageBuilder du
 * meme document (la mosaique service-cities, chaque ville mene a /villes/[ville], et
 * un bandeau d'appel), resolu par useVillesPageBlocks contre la collection. */
import { breadcrumbsFor } from '~/config/route-map'
import type { HeroPageBlock } from '~/types/blocks'

const { t, locale } = useI18n()
const loc = computed(() => locale.value as 'fr' | 'en')

// Fil d'Ariane (route-map): injecte dans le bloc masthead (le Hero d'Ancree ne
// prend pas de prop breadcrumbs separee).
const breadcrumbs = computed(() => breadcrumbsFor('villes', undefined, loc.value))

// Masthead de la page (document villesPage, rendu par <Hero>). Hero du payload +
// fil d'Ariane (route-map) + eyebrow d'ancrage local (i18n, hors Sanity).
const pageHero = usePageHero('villes')
const heroBlock = computed<HeroPageBlock>(() => ({
  ...pageHero.value,
  crumbs: breadcrumbs.value,
  eyebrow: pageHero.value.eyebrow ?? t('nav.areas')
}))

// Corps de page: pageBuilder du document villesPage (mosaique de villes + bandeau
// d'appel), resolu contre la collection serviceCity.
const blocks = useVillesPageBlocks()

// CollectionPage (hub de villes). SEO du document villesPage; fil d'Ariane = route-map.
const seo = useFixedPage('villes').seo
usePageSeo({
  title: seo.title,
  description: seo.description,
  webPageType: 'CollectionPage',
  breadcrumbs: breadcrumbs.value
})
</script>

<template>
  <div>
    <Hero :hero="heroBlock" />
    <PageBuilder :blocks="blocks" reveal />
  </div>
</template>
