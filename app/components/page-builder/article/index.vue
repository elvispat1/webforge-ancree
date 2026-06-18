<script setup lang="ts">
// Orchestrateur du page-builder d'ARTICLES. Miroir du régulier, mais branché sur
// articleBlockMap (blocs spécifiques au blog). Le corps d'un article est un
// tableau de blocs DISCRIMINÉS par _type (union ArticleBlock de types/blocks.ts,
// même sécurité de dispatch que PageBlock): un _type mal orthographié ou un champ
// manquant dans content/articles.ts casse la compilation.
import type { Component } from 'vue'
import type { ArticleBlock } from '~/types/blocks'
import { articleBlockMap } from './block-map'

defineProps<{ blocks?: ArticleBlock[] | null }>()

// Résolution contrainte aux clés du map (ArticleBlock['_type'] ===
// keyof articleBlockMap), élargie en Component à la sortie: les 7 blocs ont des
// props distinctes et le cast évite que vue-tsc tente de valider v-bind="block"
// contre l'union de leurs props (le dispatch dynamique est correct au runtime).
const resolve = (type: ArticleBlock['_type']): Component =>
  articleBlockMap[type] as Component
</script>

<template>
  <div v-if="blocks?.length" class="wf-page-builder wf-page-builder--article">
    <component
      :is="resolve(block._type)"
      v-for="block in blocks"
      :key="block._key"
      v-bind="block"
    />
  </div>
</template>
