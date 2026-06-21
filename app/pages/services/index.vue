<script setup lang="ts">
/* Index des services = hub des pages par nuisible. La grille liste les nuisibles
 * (fixture services-detail) en cartes CLIQUABLES vers /services/<slug-traduit>.
 * Masthead = bloc hero-page (catalogue de heros), fil d'Ariane du route-map. Sous
 * la grille, un corps de page: le bloc « processus » (comment on intervient) puis
 * la REUTILISATION des blocs villes (maillage local) et bandeau d'appel du payload
 * de l'accueil (repli fixtures), pour donner du corps et mener a la conversion. */
import { breadcrumbsFor } from '~/config/route-map'
import { processFixture } from '~/content/process'
import type { HeroPageBlock, PageBlock, CtaBandBlock, ServiceCitiesBlock } from '~/types/blocks'

const { t, locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const localePrefix = computed(() => (isEn.value ? '/en' : ''))

// Masthead de la page (bloc du catalogue de heros, rendu par <Hero>). L'eyebrow
// reprend la zone de service (motif local d'Ancree), distinct du fil d'Ariane.
const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  crumbs: breadcrumbsFor('services', undefined, locale.value as 'fr' | 'en'),
  eyebrow: t('hero.kicker'),
  title: t('pages.services_heading'),
  lead: t('pages.services_lead'),
  cta: { label: t('hero.cta_primary'), href: t('contact.phone_href') }
}))

// La grille des cartes nuisible (cliquables) vit dans <ServicesGrid>, reutilise par
// les pages ville. Contenu de l'accueil (payload unique, repli fixtures): on y puise
// les blocs a
// reutiliser plus bas, sans dupliquer le contenu.
const home = useHome()

// Recable une ancre du one-pager (#contact) vers la vraie route /contact (meme
// traitement que l'accueil pour le geste secondaire du bandeau d'appel).
function toContactRoute(href: string | undefined): string | undefined {
  return href === '#contact' ? `${localePrefix.value}/contact` : href
}

// Corps de page sous la grille: nouveau bloc processus, puis villes + bandeau
// d'appel repris de l'accueil (presents seulement s'ils existent au payload).
const bodyBlocks = computed<PageBlock[]>(() => {
  const out: PageBlock[] = [
    { _type: 'process', _key: 'process', ...processFixture(isEn.value) }
  ]
  const cities = home.value.blocks.find((b): b is ServiceCitiesBlock => b._type === 'service-cities')
  if (cities) out.push({ ...cities, _key: 'cities' })
  const cta = home.value.blocks.find((b): b is CtaBandBlock => b._type === 'cta-band')
  if (cta) {
    out.push({
      ...cta,
      _key: 'cta-band',
      secondaryCta: cta.secondaryCta
        ? { ...cta.secondaryCta, href: toContactRoute(cta.secondaryCta.href)! }
        : undefined
    })
  }
  return out
})

// CollectionPage (index de services). Fil d'Ariane = route-map.
usePageSeo({
  title: t('pages.services_heading'),
  description: t('pages.services_lead'),
  webPageType: 'CollectionPage',
  breadcrumbs: breadcrumbsFor('services', undefined, locale.value as 'fr' | 'en')
})
</script>

<template>
  <div class="svc">
    <Hero :hero="heroBlock" />

    <div class="wf-container svc__body">
      <ServicesGrid heading-level="h2" />
    </div>

    <PageBuilder :blocks="bodyBlocks" reveal />
  </div>
</template>

<style scoped>
.svc__body {
  padding-block: var(--space-block-default);
}
</style>
