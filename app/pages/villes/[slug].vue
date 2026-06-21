<script setup lang="ts">
/* Page service-ville (SEO local), le moteur de la famille Ancree. Contenu tire
 * de Sanity (serviceCity par slug + langue). Repli generique a partir du slug si
 * le document est absent, pour que le build statique ne tombe jamais en 404.
 * En-tete solide (pas de heros), donc on reserve la hauteur de l'en-tete. Sous le
 * contenu propre a la ville, un corps reutilise: le bloc process (methode) et le
 * bandeau d'appel repris du payload de l'accueil (conversion). */
import { breadcrumbsFor } from '~/config/route-map'
import { processFixture } from '~/content/process'
import type { PageBlock, CtaBandBlock } from '~/types/blocks'

const { t, locale } = useI18n()
const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const isEn = computed(() => locale.value === 'en')
const localePrefix = computed(() => (isEn.value ? '/en' : ''))

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
const phoneHref = computed(() => page.value?.phoneHref || t('contact.phone_href'))
const phoneDisplay = computed(() => page.value?.phoneDisplay || t('contact.phone_display'))

// Contenu de l'accueil (payload unique, repli fixtures): source du bandeau d'appel
// a reutiliser plus bas, sans dupliquer le contenu.
const home = useHome()

// Recable une ancre du one-pager (#contact) vers la vraie route /contact.
function toContactRoute(href: string | undefined): string | undefined {
  return href === '#contact' ? `${localePrefix.value}/contact` : href
}

// Corps reutilise sous le contenu propre a la ville: bloc process (methode) puis
// bandeau d'appel repris de l'accueil (present seulement s'il existe au payload).
const bodyBlocks = computed<PageBlock[]>(() => {
  const out: PageBlock[] = [
    { _type: 'process', _key: 'process', ...processFixture(isEn.value) }
  ]
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

// Page service-ville (SEO local): ItemPage + fil d'Ariane Accueil -> Villes ->
// ville (le hub /villes est le parent). Le seoTitle Sanity est un titre COMPLET
// (la marque y est deja, comme le homePage): on neutralise le gabarit pour ne pas
// doubler le suffixe. Le repli (heading nu, derive du slug) garde le gabarit
// « %s | {marque} » pour porter la marque.
const hasSanityTitle = !!page.value?.seo.title
usePageSeo({
  title: page.value?.seo.title || heading.value,
  titleTemplate: hasSanityTitle ? null : undefined,
  description: page.value?.seo.description || lead.value,
  webPageType: 'ItemPage',
  breadcrumbs: breadcrumbsFor('villes', { label: cityName.value }, locale.value as 'fr' | 'en')
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
          <Button :href="`#services`" kind="anchor" variant="ghost" tone="ondark" icon="lucide:arrow-down">
            {{ t('nav.services') }}
          </Button>
        </div>
      </div>
    </header>

    <div class="wf-container city__body">
      <div class="city__prose">
        <p v-for="(para, i) in body" :key="i" class="wf-body-1 wf-text-muted city__para">{{ para }}</p>
      </div>

      <section id="services" class="city__services">
        <h2 class="wf-h3 city__services-title">{{ t('pages.city_services', { city: cityName }) }}</h2>
        <ServicesGrid />
      </section>
    </div>

    <PageBuilder :blocks="bodyBlocks" reveal />
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
</style>
