<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Index des services = hub des pages par nuisible. La grille liste les services
 * (collection Sanity) en cartes CLIQUABLES vers /services/<slug>. Masthead = bloc
 * hero-page (document servicesPage), le fil d'Ariane vient du route-map. Sous la
 * grille, le corps de page vient du pageBuilder du document servicesPage
 * (processus, maillage local, bandeau d'appel), resolu par useServicesPageBlocks. */
import { breadcrumbsFor } from '~/config/route-map'
import type { HeroPageBlock } from '~/types/blocks'

const { t, locale } = useI18n()
const loc = computed(() => locale.value as 'fr' | 'en')

// Fil d'Ariane (route-map): le Hero d'Ancree ne prend pas de prop breadcrumbs
// separee, on injecte donc crumbs dans le bloc masthead.
const breadcrumbs = computed(() => breadcrumbsFor('services', undefined, loc.value))

// Masthead de la page (document servicesPage, rendu par <Hero>). On reprend le hero
// du payload (titre, accroche, appel) et on lui ajoute le fil d'Ariane (route-map)
// et l'eyebrow d'ancrage local (i18n, libelle d'interface hors Sanity).
const pageHero = usePageHero('services')
const heroBlock = computed<HeroPageBlock>(() => ({
  ...pageHero.value,
  crumbs: breadcrumbs.value,
  eyebrow: pageHero.value.eyebrow ?? t('hero.kicker')
}))

// La grille des cartes service (cliquables) vit dans <ServicesGrid>, reutilisee par
// les pages ville. Corps de page sous la grille: pageBuilder du document servicesPage
// (processus + maillage villes + bandeau d'appel), resolu contre les collections.
const blocks = useServicesPageBlocks()

// SEO du document servicesPage (payload, par locale). Fil d'Ariane = route-map.
const seo = useFixedPage('services').seo
usePageSeo({
  title: seo.title,
  description: seo.description,
  webPageType: 'CollectionPage',
  breadcrumbs: breadcrumbs.value
})
</script>

<template>
  <div class="svc">
    <Hero :hero="heroBlock" />

    <div class="wf-container svc__body">
      <ServicesGrid heading-level="h2" />
    </div>

    <PageBuilder :blocks="blocks" reveal />
  </div>
</template>

<style scoped>
.svc__body {
  padding-block: var(--space-block-default);
}
</style>
