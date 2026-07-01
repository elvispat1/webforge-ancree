<script setup lang="ts">
/* Encadre: une note ou un avertissement. Fond teinte (jamais de filet lateral),
 * puce d'icone de matiere, titre slab optionnel. note = ambre doux; warning =
 * rouge fonctionnel doux. */
import type { BlockBase } from '~/types/blocks'
import type { ArticleCalloutContent } from '~/content/article-blocks'

const props = defineProps<BlockBase<'callout'> & ArticleCalloutContent>()

const icon = computed(() => (props.tone === 'warning' ? 'lucide:triangle-alert' : 'lucide:lightbulb'))
</script>

<template>
  <aside class="article-callout" :class="`article-callout--${tone}`">
    <span class="article-callout__chip" aria-hidden="true">
      <Icon :name="icon" class="article-callout__icon" />
    </span>
    <div class="article-callout__body">
      <p v-if="title" class="article-callout__title wf-h5">{{ title }}</p>
      <p class="article-callout__text">{{ text }}</p>
    </div>
  </aside>
</template>

<style scoped>
.article-callout {
  display: flex;
  gap: 1.6rem;
  padding: 2.4rem;
  border-radius: var(--radius-md);
  box-shadow: var(--elev-flush);
}
.article-callout--note {
  background: var(--accent-call-soft);
}
.article-callout--warning {
  background: var(--error-soft);
}
.article-callout__chip {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  flex: none;
  border-radius: var(--radius-sm);
  background: var(--bg-lift);
}
.article-callout__icon {
  width: 2.2rem;
  height: 2.2rem;
}
.article-callout--note .article-callout__icon {
  /* Bleu de confiance (pas l'ambre d'appel): 5.21:1 sur le chip clair, conforme au
   * seuil 3:1 de WCAG 1.4.11. Le type du callout reste aussi porte par son titre. */
  color: var(--accent-trust);
}
.article-callout--warning .article-callout__icon {
  color: var(--error);
}
.article-callout__title {
  margin: 0 0 0.4rem;
  color: var(--text-base);
}
.article-callout__text {
  margin: 0;
  font-size: 1.6rem;
  line-height: 1.55;
  color: color-mix(in oklch, var(--text-base) 82%, transparent);
}
</style>
