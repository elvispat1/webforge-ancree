<script setup lang="ts">
/* Page service-ville (SEO local), le moteur de la famille Ancree. Contenu tire de
 * Sanity (collection serviceCity par slug + langue), posture fail-fast: 404 si le
 * document est absent (plus de repli generique derive du slug). Le slug est PARTAGE
 * fr/en (seul le segment parent est localise). En-tete solide (pas de heros), donc
 * on reserve la hauteur de l'en-tete. Sous le contenu propre a la ville (prose), la
 * grille service x lieu (maillage local) mene aux pages de service. */
import { breadcrumbsFor } from '~/config/route-map'

const { t, locale } = useI18n()
const route = useRoute()
const loc = computed(() => locale.value as 'fr' | 'en')

// Composable appele inconditionnellement en setup (avant le 404 possible).
const setI18nParams = useSetI18nParams()

const slug = String(route.params.slug)
const maybeCity = useServiceCity(slug)
// Ville inconnue: 404 fatal propre. En statique, seuls les slugs connus sont
// prerendus; ce garde couvre une navigation cliente vers un slug inexistant.
if (!maybeCity) {
  throw createError({ statusCode: 404, statusMessage: 'Ville introuvable', fatal: true })
}

// Slug PARTAGE entre langues (seul le segment parent est localise): l'alternate
// porte le meme slug dans les deux langues.
setI18nParams({ fr: { slug }, en: { slug } })

// Rendu reactif: suit les editions live de la ville courante; repli sur le snapshot
// si l'item disparait du graphe scope. Le template auto-unwrap ces computed.
const city = computed(() => useServiceCity(slug) ?? maybeCity)

// Coordonnees d'appel: NAP de la marque (siteSettings), plus du document ville.
const site = useContent('site')
const phoneHref = computed(() => `tel:${site.value.contact.phoneE164}`)
const phoneDisplay = computed(() => site.value.contact.phone)

const cityName = computed(() => city.value.city)
const heading = computed(() => city.value.heading ?? city.value.city)
const lead = computed(() => city.value.lead ?? '')
const body = computed(() => city.value.body ?? [])

// Page service-ville (SEO local): ItemPage + fil d'Ariane Accueil -> Villes -> ville
// (le hub /villes est le parent). Le seo.title Sanity est un titre COMPLET (la marque
// y est deja, comme le homePage): on neutralise le gabarit pour ne pas doubler le
// suffixe. Sans titre Sanity, le repli (heading) garde le gabarit « %s | {marque} ».
const hasSanityTitle = computed(() => !!city.value.seo?.title)
usePageSeo({
  title: city.value.seo?.title || heading.value,
  titleTemplate: hasSanityTitle.value ? null : undefined,
  description: city.value.seo?.description || lead.value,
  webPageType: 'ItemPage',
  breadcrumbs: breadcrumbsFor('villes', { label: cityName.value }, loc.value)
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
        <p v-if="lead" class="city__lead wf-body-1">{{ lead }}</p>
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
      <div v-if="body.length" class="city__prose">
        <p v-for="(para, i) in body" :key="i" class="wf-body-1 wf-text-muted city__para">{{ para }}</p>
      </div>

      <section id="services" class="city__services">
        <h2 class="wf-h3 city__services-title">{{ t('pages.city_services', { city: cityName }) }}</h2>
        <ServicesGrid />
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
</style>
