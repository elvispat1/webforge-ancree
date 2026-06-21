<script setup lang="ts">
/* Index des services. Liste tous les services depuis Sanity (langue courante),
 * repli sur la fixture si vide. Masthead = bloc hero-page (catalogue de heros),
 * fil d'Ariane localise depuis le route-map. Sous la grille, un corps de page:
 * un bloc « processus » (comment on intervient) puis la REUTILISATION des blocs
 * villes (SEO local) et bandeau d'appel du payload de l'accueil (contenu reel
 * partage, repli fixtures), pour que la page ait du corps et mene a la conversion. */
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

// Cartes de services depuis le payload unique (plugin 01.content), repli fixtures.
const services = useServicesIndex()

// Contenu de l'accueil (payload unique, repli fixtures): on y puise les blocs a
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
      <ul class="svc__grid">
        <li v-for="s in services" :key="s.title" class="svc__card" :class="{ 'svc__card--featured': s.featured }">
          <span class="svc__icon-wrap">
            <Icon v-if="s.icon" :name="s.icon" class="svc__icon" aria-hidden="true" />
          </span>
          <h2 class="svc__card-title wf-h4">{{ s.title }}</h2>
          <p class="svc__card-body wf-body-2">{{ s.body }}</p>
        </li>
      </ul>
    </div>

    <PageBuilder :blocks="bodyBlocks" reveal />
  </div>
</template>

<style scoped>
.svc__body {
  padding-block: var(--space-block-default);
}
.svc__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
.svc__card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 2.8rem;
  background: var(--bg-lift);
  border: var(--line-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--elev-low);
}
.svc__card--featured {
  background: var(--bg-deep);
  border-color: transparent;
  color: var(--text-ondeep);
  box-shadow: var(--elev-mid);
}
.svc__icon-wrap {
  display: grid;
  place-items: center;
  width: 5.2rem;
  height: 5.2rem;
  border-radius: var(--radius);
  background: var(--accent-call-soft);
  margin-bottom: 2rem;
}
.svc__card--featured .svc__icon-wrap {
  background: color-mix(in oklch, white 12%, transparent);
}
.svc__icon {
  width: 2.8rem;
  height: 2.8rem;
  color: var(--accent-trust);
}
.svc__card--featured .svc__icon {
  color: var(--accent-call);
}
.svc__card-title {
  margin: 0;
}
.svc__card--featured .svc__card-title {
  color: var(--text-ondeep);
}
.svc__card-body {
  margin-top: 1.2rem;
  color: var(--text-muted);
}
.svc__card--featured .svc__card-body {
  color: color-mix(in oklch, var(--text-ondeep) 80%, transparent);
}

@container site (min-width: 640px) {
  .svc__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@container site (min-width: 1024px) {
  .svc__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
