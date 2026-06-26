<script setup lang="ts">
/* Page legale du ONE-PAGER (sous /one-pager, layout landing: en-tete par ancres
 * qualifie par /one-pager). Masthead hero-page sobre, sans fil d'Ariane (hors de
 * l'arbre de breadcrumbs multipage). Rend le MEME document legal que la version
 * racine /conditions-utilisation, pilote par Sanity (useContent('legal')). */
import type { HeroPageBlock } from '~/types/blocks'

definePageMeta({ layout: 'landing' })

const legal = useContent('legal')
const doc = computed(() => legal.value.conditions)

const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  title: doc.value.title
}))

// Sous-arbre one-pager: NOINDEX (exclu du sitemap aussi). Pas de fil d'Ariane
// (hors de l'arbre de breadcrumbs multipage).
usePageSeo({
  title: doc.value.seo?.title ?? doc.value.title,
  description: doc.value.seo?.description,
  image: doc.value.seo?.image,
  noindex: true
})
</script>

<template>
  <article>
    <Hero :hero="heroBlock" />
    <LegalPage :doc="doc" />
  </article>
</template>
