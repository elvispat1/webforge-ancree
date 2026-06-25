<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Page service-ville (SEO local), le moteur de la famille Ancree. Contenu tire de
 * Sanity (collection serviceCity par slug + langue), posture fail-fast: 404 si le
 * document est absent. Le slug est PARTAGE fr/en (seul le segment parent est
 * localise). La page se compose comme un singleton: un masthead (hero[1]) suivi d'un
 * pageBuilder de sections (editorial, grille des services, bandeau d'appel). */
import { breadcrumbsFor } from '~/config/route-map'
import type { HeroPageBlock } from '~/types/blocks'

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

// Appel direct depuis la NAP Sanity (tel: derive de phoneE164), jamais en dur.
const site = useContent('site')
const phoneHref = computed(() => `tel:${site.value.contact.phoneE164}`)

const breadcrumbs = computed(() => breadcrumbsFor('villes', { label: city.value.city }, loc.value))

// Masthead: le hero[1] du document, enrichi du fil d'Ariane. Surtitre par defaut
// « Villes » si absent; appel direct de la marque par defaut si aucun bouton saisi.
const hero = computed<HeroPageBlock>(() => {
  const fallbackCta = { label: t('hero.cta_primary'), href: phoneHref.value }
  const h = city.value.hero
  if (!h) {
    return {
      _type: 'hero-page',
      _key: `masthead-${city.value.slug}`,
      eyebrow: t('nav.areas'),
      title: city.value.city,
      crumbs: breadcrumbs.value,
      cta: fallbackCta
    }
  }
  return { ...h, crumbs: breadcrumbs.value, cta: h.cta ?? fallbackCta }
})

// Corps de la page: le pageBuilder du document, resolu (blocs intelligents inclus).
const blocks = computed(() => useCityBlocks(city.value))

// Page service-ville (SEO local): ItemPage + fil Accueil > Villes > ville. Le SEO
// vient de l'objet seo du document (replis titre/accroche du masthead deja resolus).
const seo = computed(() => city.value.seo)
usePageSeo({
  title: seo.value?.title ?? hero.value.title,
  description: seo.value?.description ?? '',
  image: seo.value?.image || undefined,
  webPageType: 'ItemPage',
  breadcrumbs: breadcrumbs.value
})
</script>

<template>
  <div>
    <Hero :hero="hero" />
    <PageBuilder :blocks="blocks" reveal />
  </div>
</template>
