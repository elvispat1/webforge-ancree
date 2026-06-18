<script setup lang="ts">
// Bloc d'article « quote » (_type "quote"). Typé contre le bloc discriminé
// (ArticleQuoteBlock = BlockBase<'quote'> & ArticleQuoteContent: { quote,
// attribution? }), même mécanique que les blocs réguliers. _type et _key déclarés
// en props pour éviter le fallthrough d'attributs (l'orchestrateur étale via v-bind).
import type { ArticleQuoteBlock } from '~/types/blocks'

defineProps<ArticleQuoteBlock>()
</script>

<template>
  <!-- Citation mise en exergue dans le corps d'article. Traitement éditorial fort:
       gros guillemet décoratif (aria-hidden) + filet d'accent à gauche. La citation
       passe en wf-h4 (display), l'attribution en wf-caption. Le figcaption est frère
       DANS le figure; margin:0 sur le figure neutralise le défaut UA. -->
  <figure class="wf-article-quote">
    <span class="wf-article-quote-mark" aria-hidden="true">&ldquo;</span>
    <blockquote class="wf-article-quote-body">
      <p class="wf-h4">{{ quote }}</p>
    </blockquote>
    <figcaption v-if="attribution" class="wf-article-quote-cite wf-caption">
      {{ attribution }}
    </figcaption>
  </figure>
</template>
