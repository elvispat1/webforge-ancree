<script setup lang="ts">
/* Orchestrateur de la page-builder. <component :is> resout chaque bloc par son
 * _type; v-bind diffuse le bloc entier en props; v-reveal applique la signature
 * « s'ancre en montant » au defilement (opt-in). */
import type { PageBlock } from '~/types/blocks'
import { regularBlockMap } from './block-map'

withDefaults(defineProps<{ blocks?: PageBlock[] | null; reveal?: boolean }>(), {
  blocks: () => [],
  reveal: false
})
</script>

<template>
  <div v-if="blocks && blocks.length" class="page-builder">
    <component
      :is="regularBlockMap[block._type]"
      v-for="block in blocks"
      :id="block._key"
      :key="block._key"
      v-reveal="reveal"
      v-bind="block"
    />
  </div>
</template>
