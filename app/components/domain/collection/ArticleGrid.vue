<script setup lang="ts">
// Grille de cartes d'articles (page /blog, pages de catégorie, articles reliés, et
// aperçu blog de l'accueil). Rend la grille; chaque carte est <ArticleCard> (carte
// partagée). Le nombre de colonnes au palier large vient de la prop (2 ou 3).
// showCategory pilote l'affichage du tag de catégorie sur la cover de chaque carte
// (vrai sur le blog, faux à l'accueil où le maillage ne montre pas la catégorie).
withDefaults(defineProps<{
  articles: Array<{
    title: string
    excerpt: string
    href: string
    date: string
    category?: string
    cover: { ratio: string; src?: string; alt: string; label: string; caption: string }
  }>
  /** Nombre de colonnes au palier large (2 ou 3). Défaut 3. */
  columns?: number
  /** Afficher le tag de catégorie sur la cover de chaque carte. Défaut true (blog). */
  showCategory?: boolean
  /** Niveau de titre des cartes (h2..h6), transmis à chaque <ArticleCard>.
   *  2 quand la grille vit directement sous le h1 du héros (listes /blog). */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}>(), {
  columns: 3,
  showCategory: true,
  headingLevel: 3
})
</script>

<template>
  <!-- `--wf-article-cols` pilote le nombre de pistes au palier large depuis la prop,
       sans valeur en dur dans le CSS. Mobile reste 1 colonne, peu importe. -->
  <ul
    class="wf-article-grid"
    :style="{ '--wf-article-cols': columns }"
    data-reveal-stagger
  >
    <ArticleCard
      v-for="article in articles"
      :key="article.href"
      v-bind="article"
      :show-category="showCategory"
      :heading-level="headingLevel"
    />
  </ul>
</template>
