<script setup lang="ts">
/* Citation mise en exergue au fil du texte: grand guillemet ambre, citation slab,
 * attribution sobre. Languette ambre au sol (ancrage), pas de filet lateral. */
import type { BlockBase } from '~/types/blocks'
import type { ArticleQuoteContent } from '~/content/article-blocks'

defineProps<BlockBase<'quote'> & ArticleQuoteContent>()
</script>

<template>
  <figure class="article-quote">
    <Icon name="lucide:quote" class="article-quote__mark" aria-hidden="true" />
    <blockquote class="article-quote__text wf-h4">{{ quote }}</blockquote>
    <figcaption v-if="attribution" class="article-quote__cite">{{ attribution }}</figcaption>
    <span class="article-quote__anchor" aria-hidden="true" />
  </figure>
</template>

<style scoped>
.article-quote {
  position: relative;
  margin: 0;
  padding: 0.4rem 0 2.4rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.6rem;
}
.article-quote__mark {
  width: 3.6rem;
  height: 3.6rem;
  color: color-mix(in oklch, var(--accent-call) 80%, transparent);
}
.article-quote__text {
  margin: 0;
  max-width: 30ch;
  color: var(--text-base);
}
.article-quote__cite {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.5rem;
  color: var(--text-muted);
}
/* Languette ambre au sol: la citation se pose. */
.article-quote__anchor {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 6rem;
  height: 4px;
  border-radius: 2px;
  background: var(--accent-call);
}
</style>
