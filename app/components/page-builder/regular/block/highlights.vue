<script setup lang="ts">
/* Points forts (ce que vous obtenez): une série de bénéfices posés. Distinct du
 * processus, volontairement: pas de pastille ambre, pas de grille de trois tuiles,
 * pas de ligne d'horizon. Ici une liste à deux colonnes, chaque point amorcé d'une
 * languette ambre à l'axe gauche (le geste « ancré au sol » de la famille), titre
 * slab et corps muet, séparés par de fins filets. Base blanche; la matière vient de
 * l'ombre et des accents, jamais d'un fond crème. Asymétrie posée via SectionHead. */
import type { BlockBase } from '~/types/blocks'
import type { HighlightsContent } from '~/content/highlights'

const props = defineProps<BlockBase<'highlights'> & HighlightsContent>()

const hasHead = computed(() => Boolean(props.heading))
</script>

<template>
  <section class="highlights">
    <div class="wf-container">
      <SectionHead v-if="hasHead" :eyebrow="eyebrow" :heading="heading!" />

      <ul
        class="highlights__list"
        :class="{ 'highlights__list--headed': hasHead }"
        data-reveal-stagger
      >
        <li v-for="item in items" :key="item.title" class="highlights__item">
          <span class="highlights__tick" aria-hidden="true" />
          <h3 class="highlights__title wf-h4">{{ item.title }}</h3>
          <p class="highlights__body wf-body-2">{{ item.body }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.highlights {
  padding-block: var(--space-block-default);
  background: var(--bg-base);
}

/* Liste posée: empilée au mobile, deux colonnes au desktop. Chaque point est
 * séparé du précédent par un fin filet en tête (registre « ancré, planté »),
 * jamais une carte boîtée. */
.highlights__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}
.highlights__list--headed {
  margin-top: var(--space-head-content);
}
.highlights__item {
  padding-block: 2.8rem;
  border-top: var(--line-hair);
}
/* La languette ambre amorce chaque point: même geste que le tick du surtitre et
 * l'ancre du masthead, là où le contenu touche le sol. */
.highlights__tick {
  display: block;
  width: 2.6rem;
  height: 3px;
  border-radius: 2px;
  background: var(--accent-call);
  margin-bottom: 1.6rem;
}
.highlights__title {
  margin: 0;
  color: var(--text-base);
}
.highlights__body {
  margin-top: var(--space-card-title-body);
  max-width: 46ch;
  color: var(--text-muted);
}

@container site (min-width: 768px) {
  .highlights__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: clamp(3.2rem, 5vw, 6rem);
  }
}
</style>
