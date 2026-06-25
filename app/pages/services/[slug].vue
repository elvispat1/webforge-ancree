<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Page de service par nuisible (le « quoi » du SEO local). Contenu tire de Sanity
 * (collection service, par slug + langue). Le slug est RICHE en mots-cles et TRADUIT
 * par langue (FR extermination-fourmis-charpentieres <-> EN carpenter-ant-extermination);
 * on pose les params i18n via service.translations pour que l'alternate de langue
 * porte SON propre slug. La page se compose comme un singleton: un masthead (hero[1])
 * suivi d'un pageBuilder de sections (points forts, processus, editorial, temoignages,
 * bandeau d'appel), tous edites au Studio. */
import { breadcrumbsFor } from '~/config/route-map'
import type { WfLocale } from '~/sanity/transform'
import type { HeroPageBlock } from '~/types/blocks'

const { t, locale } = useI18n()
const route = useRoute()
const loc = computed(() => locale.value as 'fr' | 'en')

// Composable appele inconditionnellement en setup (avant le 404 possible).
const setI18nParams = useSetI18nParams()

const slug = String(route.params.slug)
const maybeService = useService(slug)
// Slug inconnu: 404 fatal propre. En statique, seuls les slugs connus sont
// prerendus; ce garde couvre une navigation cliente vers un slug inexistant.
if (!maybeService) {
  throw createError({ statusCode: 404, statusMessage: 'Service introuvable', fatal: true })
}

// Alternate de langue: chaque langue porte SON slug (traduit). Slug equivalent tire
// de service.translations (payload); repli sur le meme slug si la traduction manque.
const slugFor = (lang: WfLocale): string =>
  maybeService.translations?.find((tr) => tr.lang === lang)?.slug ?? maybeService.slug
setI18nParams({ fr: { slug: slugFor('fr') }, en: { slug: slugFor('en') } })

// Rendu reactif: suit les editions live du service courant; repli sur le snapshot
// si l'item disparait du graphe scope. Le template auto-unwrap ces computed.
const service = computed(() => useService(slug) ?? maybeService)

// Appel direct depuis la NAP Sanity (tel: derive de phoneE164), jamais en dur.
const site = useContent('site')
const phoneHref = computed(() => `tel:${site.value.contact.phoneE164}`)

const breadcrumbs = computed(() => breadcrumbsFor('services', { label: service.value.title }, loc.value))

// Masthead: le hero[1] du document (surtitre, titre, accroche, appel), enrichi du
// fil d'Ariane derive du route-map. Si aucun bouton n'est saisi, on pose l'appel
// direct de la marque par defaut (source unique tel:, jamais en dur).
const hero = computed<HeroPageBlock>(() => {
  const fallbackCta = { label: t('hero.cta_primary'), href: phoneHref.value }
  const h = service.value.hero
  if (!h) {
    return {
      _type: 'hero-page',
      _key: `masthead-${service.value.slug}`,
      title: service.value.title,
      crumbs: breadcrumbs.value,
      cta: fallbackCta
    }
  }
  return { ...h, crumbs: breadcrumbs.value, cta: h.cta ?? fallbackCta }
})

// Corps de la page: le pageBuilder du document, resolu (blocs intelligents inclus).
const blocks = computed(() => useServiceBlocks(service.value))

// Page nuisible (SEO local): ItemPage + fil Accueil > Services > [nuisible]. Le SEO
// vient de l'objet seo du document (replis titre/accroche du masthead deja resolus).
const seo = computed(() => service.value.seo)
usePageSeo({
  title: seo.value?.title ?? service.value.title,
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
