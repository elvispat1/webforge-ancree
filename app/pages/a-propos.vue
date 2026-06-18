<script setup lang="ts">
/* À propos. Héros de page + histoire (bloc about) + engagements + chiffres +
 * affiliations + témoignages + bande CTA. Bâtir la confiance. */
import PageBuilder from '~/components/page-builder/regular/index.vue'
import { breadcrumbsFor } from '~/config/route-map'

definePageMeta({ layout: 'default' })

const locale = useWfLocale()
const hero = usePageHero('about')
const breadcrumbs = breadcrumbsFor('about', undefined, locale)
// SEO du document aboutPage (payload, par locale; replis 12.10 au transform).
const seo = useFixedPage('about').seo

// AboutPage explicite: l'inférence du module ne reconnaît pas le chemin français.
usePageSeo({
  title: seo.title,
  description: seo.description,
  image: hero.value.image?.src,
  webPageType: 'AboutPage',
  breadcrumbs
})

const blocks = useAboutBlocks()
</script>

<template>
  <Hero :hero="hero" :breadcrumbs="breadcrumbs" />
  <PageBuilder :blocks="blocks" reveal />
</template>
