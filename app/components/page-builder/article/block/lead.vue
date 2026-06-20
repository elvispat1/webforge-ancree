<script setup lang="ts">
/* Amorce (chapo): le paragraphe d'ouverture, en emphase posee. Signature Ancree:
 * une languette ambre au-dessus (le contenu se pose), pas de filet lateral (banni).
 * Texte plus grand et plus dense que le corps courant. */
import type { BlockBase } from '~/types/blocks'
import type { ArticleLeadContent } from '~/content/article-blocks'

defineProps<BlockBase<'lead'> & ArticleLeadContent>()
</script>

<template>
  <p class="article-lead">
    <span class="article-lead__tick" aria-hidden="true" />
    <span class="article-lead__text">{{ text }}</span>
  </p>
</template>

<style scoped>
.article-lead {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}
.article-lead__tick {
  width: 3.2rem;
  height: 4px;
  border-radius: 2px;
  background: var(--accent-call);
}
.article-lead__text {
  font-family: var(--font-body);
  font-size: clamp(1.9rem, calc(1.7rem + 0.4vw), 2.2rem);
  line-height: 1.5;
  font-weight: 500;
  color: var(--text-base);
  text-wrap: pretty;
}
</style>
