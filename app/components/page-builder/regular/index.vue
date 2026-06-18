<script setup lang="ts">
import type { PageBlock } from '~/types/blocks'
import { regularBlockMap } from './block-map'

// Le dispatch _type -> composant vit dans block-map.ts (partagé avec la vitrine
// des blocs dev). TypeScript y valide la correspondance.
withDefaults(defineProps<{
  blocks?: PageBlock[] | null
  // Active l'apparition au scroll (directive v-reveal) bloc par bloc. Opt-in:
  // réservé aux contextes éditoriaux (one-pager, multipage). Le catalogue de
  // blocs dev et la vitrine n'en veulent pas, d'où le défaut false.
  reveal?: boolean
}>(), {
  reveal: false
})

const componentMap = regularBlockMap
</script>

<template>
  <div v-if="blocks?.length" class="wf-page-builder">
    <component
      :is="componentMap[block._type]"
      v-for="block in blocks"
      :key="block._key"
      v-reveal="reveal"
      v-bind="block"
    />
  </div>
</template>
