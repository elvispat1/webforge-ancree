<script setup lang="ts">
// Bloc d'article « lead » (_type "lead"). Typé contre le bloc discriminé
// (ArticleLeadBlock = BlockBase<'lead'> & ArticleLeadContent), même mécanique
// que les blocs réguliers. L'orchestrateur étale le bloc via v-bind: déclarer
// _type et _key en props évite qu'ils retombent en attributs sur l'élément racine.
import type { ArticleLeadBlock } from '~/types/blocks'

defineProps<ArticleLeadBlock>()
</script>

<template>
  <!-- Chapô: paragraphe d'introduction mis en valeur. Emphase strictement
       structurelle (filet d'accent à gauche), jamais par une taille de police:
       le texte reste en wf-body-1. -->
  <p class="wf-article-lead wf-body-1">{{ text }}</p>
</template>
