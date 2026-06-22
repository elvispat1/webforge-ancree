<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* One-pager de la demo Rempart Extermination (mode One-Pager, sous /one-pager).
 * Tout sur une page: heros + tous les blocs, nav par ancres + scrollspy (layout
 * landing, en-tete qualifie par la racine /one-pager).
 *
 * V2 (Sanity, fail-fast): copie et SEO du document onePager (payload). Le heros a
 * des CTA en ancres (par opposition au homePage, en routes). useOnePagerBlocks
 * resout tous les blocs (pas de filtre passerelle, contrairement a /) et neutralise
 * deja les href des cartes services (pas de pages de detail sur le one-pager). */
definePageMeta({ layout: 'landing' })

const hero = useHeroContent('one-pager')
const seo = useFixedPage('onePager').seo

const blocks = useOnePagerBlocks()

// One-pager: gabarit de titre neutralise (le doc porte le titre complet de
// marque), visuel OG du heros. Sous-arbre NOINDEX (vitrine du palier 1 qui
// duplique le multipage), aussi exclu du sitemap (nuxt.config). Le flag reste du
// code (pattern du gabarit), conserve meme si le site bascule indexable.
usePageSeo({
  title: seo.title,
  titleTemplate: null,
  description: seo.description,
  image: hero.value.visual.src,
  noindex: true
})
</script>

<template>
  <Hero :hero="hero" />
  <PageBuilder :blocks="blocks" reveal />
</template>
