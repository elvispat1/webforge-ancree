<script setup lang="ts">
/* Appel a l'action en ligne, au fil du texte: panneau bleu nuit pose, une phrase
 * et un bouton d'appel. Plus compact que le bandeau CTA de fin de page. */
import type { BlockBase } from '~/types/blocks'
import type { ArticleInlineCtaContent } from '~/content/article-blocks'

const props = defineProps<BlockBase<'inline-cta'> & ArticleInlineCtaContent>()

function ctaKind(href: string): 'internal' | 'external' | 'anchor' {
  if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return 'anchor'
  if (href.startsWith('http')) return 'external'
  return 'internal'
}
</script>

<template>
  <aside class="article-cta">
    <p class="article-cta__text wf-h5">{{ text }}</p>
    <div class="article-cta__action">
      <Button :href="cta.href" :kind="ctaKind(cta.href)" variant="call" icon="lucide:phone">
        {{ cta.label }}
      </Button>
    </div>
  </aside>
</template>

<style scoped>
.article-cta {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  padding: 2.8rem;
  border-radius: var(--radius-lg);
  background: var(--bg-deep);
  color: var(--text-ondeep);
  box-shadow: var(--elev-mid);
  container-type: inline-size;
}
.article-cta__text {
  margin: 0;
  max-width: 32ch;
  color: var(--text-ondeep);
}
.article-cta__action {
  flex: none;
}
@container (min-width: 520px) {
  .article-cta {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 2.4rem;
  }
}
</style>
