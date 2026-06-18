<script setup lang="ts">
/* Services (collection). Héros de page + grille des services (chaque carte vers
 * son détail) + processus + témoignages + FAQ services + bande CTA. */
import PageBuilder from '~/components/page-builder/regular/index.vue'
import { breadcrumbsFor } from '~/config/route-map'

definePageMeta({ layout: 'default' })

const locale = useWfLocale()
const hero = usePageHero('services')
const breadcrumbs = breadcrumbsFor('services', undefined, locale)
// SEO du document servicesPage (payload, par locale; replis 12.10 au transform).
const seo = useFixedPage('services').seo

usePageSeo({
  title: seo.title,
  description: seo.description,
  image: hero.value.image?.src,
  webPageType: 'CollectionPage',
  breadcrumbs
})

const blocks = useServicesPageBlocks()
</script>

<template>
  <Hero :hero="hero" :breadcrumbs="breadcrumbs" />
  <PageBuilder :blocks="blocks" reveal />
</template>
