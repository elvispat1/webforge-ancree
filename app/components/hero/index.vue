<script setup lang="ts">
import type { HeroBlock } from '~/types/blocks'
import type { Crumb } from '~/config/route-map'
import { heroBlockMap } from './block-map'

// Orchestrateur héros (calque de page-builder/regular/index.vue): rend le
// composant héros selon hero._type. breadcrumbs est une prop de rendu (fil
// d'Ariane calculé par la page), passée à côté du bloc.
defineProps<{ hero: HeroBlock; breadcrumbs?: Crumb[] }>()
</script>

<template>
  <component :is="heroBlockMap[hero._type]" v-bind="hero" :breadcrumbs="breadcrumbs" />
</template>
