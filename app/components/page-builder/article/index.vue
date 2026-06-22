<script setup lang="ts">
/* Orchestrateur du corps d'article: dispatch chaque bloc par _type via la
 * articleBlockMap, dans une colonne de lecture. Pas de v-reveal ici: le corps
 * d'un article est du contenu critique qui doit rester lisible d'emblee (un
 * masque d'entree gele laisserait le texte invisible). */
import type { ArticleBlock } from '~/types/blocks'
import { articleBlockMap } from './block-map'

withDefaults(defineProps<{ blocks?: ArticleBlock[] | null }>(), { blocks: () => [] })
</script>

<template>
  <div class="article-body">
    <component
      :is="articleBlockMap[block._type]"
      v-for="block in blocks"
      :key="block._key"
      v-bind="block"
    />
  </div>
</template>

<style scoped>
.article-body {
  display: flex;
  flex-direction: column;
  gap: clamp(2.8rem, 4vw, 4rem);
}
</style>
