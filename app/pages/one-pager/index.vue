<script setup lang="ts">
/* Coquille du site one-pager (la marque de ce site). Le héros coiffe la page
 * (composant imposé, pas un bloc), puis le page-builder rend la suite des
 * blocs. Layout landing (header en mode ancres + scrollspy). Copie et SEO du
 * document onePager (payload): héros à CTA en ancres, pageBuilder dédié. */
import PageBuilder from '~/components/page-builder/regular/index.vue'

definePageMeta({
  layout: 'landing'
})

const hero = useHeroContent('one-pager')
const seo = useFixedPage('onePager').seo

// One-pager: gabarit de titre neutralisé (le doc porte le titre complet de
// marque), visuel OG du héros. Sous-arbre noindex: vitrine interne du palier 1,
// qui duplique le contenu du multipage (LE site du démo); aussi exclu du
// sitemap (nuxt.config). Le flag noindex reste du CODE (pattern du gabarit),
// conservé même si le site bascule indexable.
usePageSeo({
  title: seo.title,
  titleTemplate: null,
  description: seo.description,
  image: hero.value.visual.src,
  noindex: true
})

const blocks = useOnePagerBlocks()
</script>

<template>
  <Hero :hero="hero" />
  <PageBuilder :blocks="blocks" reveal />
</template>
