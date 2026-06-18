<script setup lang="ts">
// Bloc d'article « inline-cta » (_type "inline-cta"). Typé contre le bloc
// discriminé (ArticleInlineCtaBlock = BlockBase<'inline-cta'> &
// ArticleInlineCtaContent: { text, ctaLabel, ctaHref }), même mécanique que les
// blocs réguliers. _type et _key déclarés en props pour qu'ils ne retombent pas
// en attributs de fallthrough sur l'élément racine (v-bind de l'orchestrateur).
import type { ArticleInlineCtaBlock } from '~/types/blocks'

defineProps<ArticleInlineCtaBlock>()
</script>

<template>
  <!-- Appel à l'action en ligne, inséré dans le corps de l'article. Petite bande
       contrastée (fond --bg-alt) qui interrompt le flux de lecture sans le rompre:
       texte d'invite en wf-h5, bouton interne à droite. <aside> = contenu
       complémentaire au corps de lecture (a11y). Empilé sous le seuil, en ligne
       au-dessus (container query @container site, jamais de media viewport). -->
  <aside class="wf-article-cta">
    <p class="wf-article-cta-text wf-h5">{{ text }}</p>
    <Button
      class="wf-article-cta-action"
      :href="ctaHref"
      kind="internal"
      icon="lucide:chevron-right"
    >
      {{ ctaLabel }}
    </Button>
  </aside>
</template>
