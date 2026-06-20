<script setup lang="ts">
/* Grille de cartes d'article. Colonnes paramétrables (defaut 3 au desktop), via
 * une variable locale; responsive sans media query (auto-fit a mesure minimale). */
import type { ArticleCardData } from '~/composables/useArticles'

withDefaults(
  defineProps<{ cards: ArticleCardData[]; minColWidth?: string; headingLevel?: 'h2' | 'h3' }>(),
  { minColWidth: '30rem', headingLevel: 'h2' }
)
</script>

<template>
  <ul class="agrid" :style="{ '--agrid-min': minColWidth }">
    <li v-for="card in cards" :key="card.slug" class="agrid__item">
      <ArticleCard :card="card" :heading-level="headingLevel" />
    </li>
  </ul>
</template>

<style scoped>
.agrid {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(var(--agrid-min), 100%), 1fr));
  gap: 2.4rem;
}
.agrid__item {
  display: flex;
}
.agrid__item > * {
  width: 100%;
}
</style>
