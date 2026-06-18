<script setup lang="ts">
/* Détail d'un service. Héros detail (image phare) + composition orientée
 * conversion (bénéfices, processus, projets liés, témoignages, bande CTA). */
import PageBuilder from '~/components/page-builder/regular/index.vue'
import { breadcrumbsFor } from '~/config/route-map'
import { serviceImage } from '~/content/services'
import type { WfLocale } from '~/sanity/transform'
import type { HeroDetailBlock } from '~/types/blocks'

definePageMeta({ layout: 'default' })

const route = useRoute()
const locale = useWfLocale()
// Composable appelé inconditionnellement en setup (avant le 404 possible).
const setI18nParams = useSetI18nParams()

const slug = String(route.params.slug)
const maybeService = useService(slug)
if (!maybeService) {
  throw createError({ statusCode: 404, statusMessage: 'Service introuvable', fatal: true })
}

// setI18nParams (T2b): slug équivalent de chaque langue (doc.translations du
// payload), pour que switchLocalePath et les hreflang du module pointent le
// détail traduit. Doc sans traduction: repli sur le même slug (alternate
// dégradé acceptable, démo noindex). Logique setup-once: snapshot validé,
// non réactif (route/head).
const slugFor = (lang: WfLocale): string =>
  maybeService.translations?.find((t) => t.lang === lang)?.slug ?? maybeService.slug
setI18nParams({ fr: { slug: slugFor('fr') }, en: { slug: slugFor('en') } })

const breadcrumbs = breadcrumbsFor('services', { label: maybeService.title }, locale)

usePageSeo({
  title: maybeService.title,
  description: maybeService.summary,
  image: maybeService.image,
  webPageType: 'ItemPage',
  breadcrumbs
})

// Rendu réactif: suit les éditions live du service courant; repli sur le snapshot
// si l'item disparaît du graphe scopé. Le template auto-unwrap ces computed.
const service = computed(() => useService(slug) ?? maybeService)
const blocks = computed(() => useServiceBlocks(service.value))

// Héros « detail » composé depuis le document service (pas saisi au CMS): même
// donnée qu'avant, rendue via l'orchestrateur.
const heroBlock = computed<HeroDetailBlock>(() => ({
  _type: 'hero-detail',
  _key: `hero-${service.value.slug}`,
  title: service.value.title,
  lead: service.value.summary,
  image: serviceImage(service.value)
}))
</script>

<template>
  <Hero :hero="heroBlock" :breadcrumbs="breadcrumbs" />
  <PageBuilder :blocks="blocks" reveal />
</template>
