<script setup lang="ts">
/* One-pager de la demo Rempart Extermination (mode One-Pager, sous /one-pager).
 * Tout sur une page: heros + tous les blocs, nav par ancres + scrollspy (layout
 * landing, en-tete qualifie par la racine /one-pager). Le contenu vient de Sanity
 * (une requete au build), repli sur les fixtures si le dataset est vide. */
import { HOME_QUERY, transformHome } from '~/sanity/content'

definePageMeta({ layout: 'landing' })

const { t, locale } = useI18n()

const { data: raw } = await useSanityBuildQuery<unknown>(`home:${locale.value}`, HOME_QUERY, { lang: locale.value })

const home = computed(() => transformHome(raw.value, locale.value as 'fr' | 'en'))

// Fixtures de repli (contenu identique au seed; garantit un rendu en l'absence
// de donnees Sanity).
const heroFallback = useHeroContent()
const blocksFallback = useHomeBlocks()

const hero = computed(() => home.value?.hero ?? heroFallback.value)
const blocks = computed(() => home.value?.blocks ?? blocksFallback)

// One-pager: gabarit de titre neutralise (le doc porte le titre complet de
// marque), visuel OG du heros. Sous-arbre NOINDEX (vitrine du palier 1 qui
// duplique le multipage), aussi exclu du sitemap (nuxt.config). Le flag reste du
// code (pattern du gabarit), conserve meme si le site bascule indexable.
usePageSeo({
  title: home.value?.seo.title || t('home.title'),
  titleTemplate: null,
  description: home.value?.seo.description || t('home.lead'),
  image: hero.value.visual.src,
  noindex: true
})
</script>

<template>
  <Hero :hero="hero" />
  <PageBuilder :blocks="blocks" reveal />
</template>
