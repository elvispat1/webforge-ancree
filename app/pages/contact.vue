<script setup lang="ts">
/* Contact. Héros de page court + bloc contact (formulaire Resend/Turnstile +
 * coordonnées et horaires). Pas de bande CTA: le formulaire est la conversion.
 * Copie et SEO du document contactPage (payload), composition via la couche
 * composable. */
import PageBuilder from '~/components/page-builder/regular/index.vue'
import { breadcrumbsFor } from '~/config/route-map'

definePageMeta({ layout: 'default' })

const locale = useWfLocale()
const hero = usePageHero('contact')
const breadcrumbs = breadcrumbsFor('contact', undefined, locale)
const seo = useFixedPage('contact').seo

usePageSeo({
  title: seo.title,
  description: seo.description,
  breadcrumbs
})

const blocks = useContactPageBlocks()
</script>

<template>
  <Hero :hero="hero" :breadcrumbs="breadcrumbs" />
  <PageBuilder :blocks="blocks" reveal />
</template>
