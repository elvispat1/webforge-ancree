<script setup lang="ts">
/* Page service-ville (SEO local), le moteur de la famille Ancree. Contenu tire
 * de Sanity (serviceCity par slug + langue). Repli generique a partir du slug si
 * le document est absent, pour que le build statique ne tombe jamais en 404.
 * En-tete solide (pas de heros), donc on reserve la hauteur de l'en-tete. */
import { breadcrumbsFromTrail } from '~/config/route-map'

const { t, locale } = useI18n()
const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const setI18nParams = useSetI18nParams()
setI18nParams({ fr: { slug: slug.value }, en: { slug: slug.value } })

// Page service-ville depuis le payload unique (plugin 01.content), reactif au
// slug. null si absente -> repli generique derive du slug ci-dessous (jamais 404).
const page = useServiceCity(slug)

// Repli: titre derive du slug (ex "saint-eustache" -> "Saint-Eustache").
const cityName = computed(() => page.value?.city || slug.value.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('-'))
const heading = computed(() => page.value?.heading || (locale.value === 'en' ? `Pest control in ${cityName.value}` : `Extermination à ${cityName.value}`))
const lead = computed(() => page.value?.lead || (locale.value === 'en'
  ? `Local, certified pest control in ${cityName.value} and across the North Shore. A technician at your door, often the same day.`
  : `Extermination locale et certifiée à ${cityName.value} et partout sur la Rive-Nord. Un technicien à votre porte, souvent le jour même.`))
const body = computed(() => page.value?.body ?? [])
const services = computed(() => page.value?.services ?? [])
const phoneHref = computed(() => page.value?.phoneHref || t('contact.phone_href'))
const phoneDisplay = computed(() => page.value?.phoneDisplay || t('contact.phone_display'))

// Page service-ville (SEO local): ItemPage + fil d'Ariane home -> ville. Le
// seoTitle Sanity est un titre COMPLET (la marque y est deja, comme le homePage):
// on neutralise le gabarit pour ne pas doubler le suffixe. Le repli (heading nu,
// derive du slug) garde le gabarit « %s | {marque} » pour porter la marque.
const hasSanityTitle = !!page.value?.seo.title
usePageSeo({
  title: page.value?.seo.title || heading.value,
  titleTemplate: hasSanityTitle ? null : undefined,
  description: page.value?.seo.description || lead.value,
  webPageType: 'ItemPage',
  breadcrumbs: breadcrumbsFromTrail(locale.value as 'fr' | 'en', { label: cityName.value })
})
</script>

<template>
  <article class="city">
    <header class="city__head">
      <div class="wf-container">
        <p class="city__kicker wf-caption">
          <span class="city__tick" aria-hidden="true" />
          {{ t('nav.areas') }}
        </p>
        <h1 class="city__title wf-h1">{{ heading }}</h1>
        <p class="city__lead wf-body-1">{{ lead }}</p>
        <div class="city__actions">
          <Button :href="phoneHref" kind="anchor" variant="call" icon="lucide:phone" :pulse="true">
            {{ phoneDisplay }}
          </Button>
          <Button :to="localeRoute" :href="`#services`" kind="anchor" variant="ghost" tone="ondark" icon="lucide:arrow-down">
            {{ t('nav.services') }}
          </Button>
        </div>
      </div>
    </header>

    <div class="wf-container city__body">
      <div class="city__prose">
        <p v-for="(para, i) in body" :key="i" class="wf-body-1 wf-text-muted city__para">{{ para }}</p>
      </div>

      <section v-if="services.length" id="services" class="city__services">
        <h2 class="wf-h3 city__services-title">{{ t('nav.services') }}</h2>
        <ul class="city__services-grid">
          <li v-for="s in services" :key="s.title" class="city__service">
            <Icon v-if="s.icon" :name="s.icon" class="city__service-icon" aria-hidden="true" />
            <h3 class="wf-h5">{{ s.title }}</h3>
            <p v-if="s.body" class="wf-body-3">{{ s.body }}</p>
          </li>
        </ul>
      </section>
    </div>
  </article>
</template>

<style scoped>
.city__head {
  background: var(--bg-deep);
  color: var(--text-ondeep);
  padding-block: calc(var(--header-height) + 5rem) clamp(4rem, 7vh, 6rem);
}
.city__kicker {
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  color: color-mix(in oklch, var(--text-ondeep) 72%, transparent);
  margin-bottom: 1.6rem;
}
.city__tick {
  display: inline-block;
  width: 2.6rem;
  height: 3px;
  border-radius: 2px;
  background: var(--accent-call);
}
.city__title {
  color: var(--text-ondeep);
  max-width: 20ch;
}
.city__lead {
  margin-top: var(--space-title-lead);
  max-width: 52ch;
  color: color-mix(in oklch, var(--text-ondeep) 86%, transparent);
}
.city__actions {
  margin-top: var(--space-lead-cta);
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
}

.city__body {
  padding-block: var(--space-block-default);
  display: grid;
  gap: 4rem;
}
.city__para + .city__para {
  margin-top: 1.6rem;
}
.city__prose {
  max-width: 68ch;
}
.city__services-title {
  margin-bottom: 2.8rem;
}
.city__services-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
.city__service {
  padding: 2.4rem;
  background: var(--bg-lift);
  border: var(--line-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--elev-low);
}
.city__service-icon {
  width: 2.8rem;
  height: 2.8rem;
  color: var(--accent-trust);
  margin-bottom: 1.4rem;
}
.city__service h3 {
  margin: 0;
}
.city__service p {
  margin-top: 1rem;
  color: var(--text-muted);
}

@container site (min-width: 640px) {
  .city__services-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@container site (min-width: 1024px) {
  .city__services-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
