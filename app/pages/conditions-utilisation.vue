<script setup lang="ts">
/* Page legale (conditions d'utilisation) en mode multipage. Masthead hero-page
 * sobre (fil d'Ariane + titre, sans eyebrow ni appel: une page legale ne convertit
 * pas), puis le corps pilote par Sanity. Le contenu (titre, dates, sections) vient
 * du payload (useContent('legal')); plus aucun texte legal en dur. */
import { breadcrumbsFor } from '~/config/route-map'
import type { HeroPageBlock } from '~/types/blocks'

const { locale } = useI18n()
const legal = useContent('legal')
const doc = computed(() => legal.value.conditions)

const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  crumbs: breadcrumbsFor('terms', undefined, locale.value as 'fr' | 'en'),
  title: doc.value.title
}))

usePageSeo({
  title: doc.value.seo?.title ?? doc.value.title,
  description: doc.value.seo?.description,
  image: doc.value.seo?.image,
  breadcrumbs: breadcrumbsFor('terms', undefined, locale.value as 'fr' | 'en')
})
</script>

<template>
  <article>
    <Hero :hero="heroBlock" />
    <LegalPage :doc="doc" />
  </article>
</template>
