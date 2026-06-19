<script setup lang="ts">
/* Index des services. Liste tous les services depuis Sanity (langue courante),
 * repli sur la fixture si vide. Masthead = bloc hero-page (catalogue de heros),
 * fil d'Ariane localise depuis le route-map. */
import { SERVICES_INDEX_QUERY } from '~/sanity/content'
import { breadcrumbsFor } from '~/config/route-map'
import type { HeroPageBlock } from '~/types/blocks'

const { t, locale } = useI18n()

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

const { data: raw } = await useSanityQuery<{ services?: Array<{ _id: string; icon?: string; title: string; body?: string; featured?: boolean }> }>(
  SERVICES_INDEX_QUERY,
  { lang: locale.value }
)

// Repli: items du bloc services de la fixture d'accueil.
const fallback = computed(() => {
  const block = useHomeBlocks().find((b) => b._type === 'services') as { items?: Array<{ icon?: string; title: string; body?: string; featured?: boolean }> } | undefined
  return block?.items ?? []
})

const services = computed(() => {
  const fromSanity = raw.value?.services
  return fromSanity && fromSanity.length ? fromSanity : fallback.value
})

useSeoMeta({
  title: () => `${t('pages.services_heading')} | Rempart Extermination`,
  description: () => t('pages.services_lead')
})
</script>

<template>
  <div class="svc">
    <Hero :hero="heroBlock" />

    <div class="wf-container svc__body">
      <ul class="svc__grid">
        <li v-for="(s, i) in services" :key="s.title" class="svc__card" :class="{ 'svc__card--featured': s.featured }">
          <span class="svc__icon-wrap">
            <Icon v-if="s.icon" :name="s.icon" class="svc__icon" aria-hidden="true" />
          </span>
          <h2 class="svc__card-title wf-h4">{{ s.title }}</h2>
          <p class="svc__card-body wf-body-2">{{ s.body }}</p>
        </li>
      </ul>
    </div>
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
