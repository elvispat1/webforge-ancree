<script setup lang="ts">
// Bloc d'article « callout » (_type "callout"). Typé contre le bloc discriminé
// (ArticleCalloutBlock = BlockBase<'callout'> & ArticleCalloutContent: { tone?,
// title?, text }), même mécanique que les blocs réguliers. _type et _key déclarés
// en props pour qu'ils ne retombent pas en attributs sur le <aside> racine
// (l'orchestrateur étale le bloc via v-bind).
import type { ArticleCalloutBlock } from '~/types/blocks'

defineProps<ArticleCalloutBlock>()
</script>

<template>
  <!-- Encadré d'article: note ou avertissement, filet d'accent à gauche.
       <aside> = contenu complémentaire au corps de lecture (a11y). -->
  <aside class="wf-callout" :class="'wf-callout--' + (tone || 'note')">
    <p v-if="title" class="wf-callout__title">{{ title }}</p>
    <p class="wf-body-2">{{ text }}</p>
  </aside>
</template>
