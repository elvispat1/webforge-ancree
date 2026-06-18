<script setup lang="ts">
/* BlockShowcaseItem — un bloc de la vitrine, avec son éventuel contrôle de
 * variantes (onglets segmentés). Tient son propre état de sélection: changer de
 * variante échange les props passées au composant, rendu EN VRAI dans .wf-site
 * (contexte de container query, comme en prod). Voir useBlockCatalog pour le
 * modèle (CatalogItem.variants). */
import { computed, ref } from 'vue'
import type { BlockVariant, CatalogItem } from '~/composables/useBlockCatalog'

const props = defineProps<{ item: CatalogItem; anchorId: string; narrow?: boolean }>()

// Normalisation: un bloc sans `variants` se ramène à une variante unique (ses
// props + son badge figé). Le contrôle n'apparaît qu'au-delà d'une variante.
const variants = computed<BlockVariant[]>(() =>
  props.item.variants?.length
    ? props.item.variants
    : [{ label: props.item.variant ?? '', props: props.item.props }]
)
const defaultIndex = computed(() => {
  const i = variants.value.findIndex((v) => v.isDefault)
  return i === -1 ? 0 : i
})
const selected = ref(defaultIndex.value)
const active = computed(() => variants.value[selected.value] ?? variants.value[0]!)
const hasControl = computed(() => variants.value.length > 1)
</script>

<template>
  <article :id="anchorId" class="wf-bs__item">
    <header class="wf-bs__bar">
      <div class="wf-container wf-bs__bar-inner">
        <span class="wf-bs__name">{{ item.label }}</span>
        <span class="wf-bs__type">{{ item.type }}</span>
        <span v-if="!hasControl && active.label" class="wf-bs__variant">{{ active.label }}</span>

        <!-- Contrôle de variantes: onglets segmentés (filets, esprit Minimaliste).
             Groupe de boutons à bascule (aria-pressed). -->
        <div
          v-if="hasControl"
          class="wf-bs__variants"
          role="group"
          :aria-label="`Variantes : ${item.label}`"
        >
          <button
            v-for="(v, i) in variants"
            :key="i"
            type="button"
            class="wf-bs__variant-tab"
            :class="{ 'is-active': i === selected }"
            :aria-pressed="i === selected"
            @click="selected = i"
          >{{ v.label }}</button>
        </div>
      </div>
    </header>

    <!-- .wf-site: contexte de container query + tokens, comme en prod. `narrow`
         (blocs d'article) enveloppe le rendu dans une colonne de lecture centrée. -->
    <div class="wf-bs__stage" :class="{ 'is-narrow': narrow }">
      <div class="wf-site">
        <component :is="item.component" v-bind="active.props" />
      </div>
    </div>
  </article>
</template>

<style scoped>
/* Styles dev-only scoped (comme l'orchestrateur et nav.vue). */
.wf-bs__item {
  margin-bottom: calc(var(--spacing-unit) * 6);
  /* Léger décalage d'ancre au saut (la nav est désormais latérale, plus en haut,
   * donc pas besoin de compenser une barre sticky). */
  scroll-margin-top: 2rem;
}
/* Bandeau pleine largeur (bande de repère), texte aligné sur le container 1920. */
.wf-bs__bar {
  background: var(--bg-alt);
  border-block: var(--line-hair);
}
.wf-bs__bar-inner {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: calc(var(--spacing-unit) * 1.5);
  padding-block: calc(var(--spacing-unit) * 1.5);
}
.wf-bs__name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.4rem;
  color: var(--text-base);
}
.wf-bs__type,
.wf-bs__variant {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--text-muted);
  padding: 0.2em 0.6em;
  border: 1px solid color-mix(in oklch, var(--text-base) 15%, transparent);
  border-radius: var(--radius);
}
.wf-bs__variant {
  color: var(--accent-1);
  border-color: color-mix(in oklch, var(--accent-1) 30%, transparent);
}

/* Onglets segmentés de variantes, poussés à droite du bandeau. */
.wf-bs__variants {
  margin-left: auto;
  align-self: center;
  display: flex;
  border: var(--line-hair);
  border-radius: var(--radius);
  overflow: hidden;
}
.wf-bs__variant-tab {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--text-muted);
  background: transparent;
  border: 0;
  border-left: var(--line-hair);
  padding: 0.35em 0.8em;
  cursor: pointer;
  transition:
    color var(--motion-duration-hover) var(--motion-ease-settle),
    background-color var(--motion-duration-hover) var(--motion-ease-settle);
}
.wf-bs__variant-tab:first-child {
  border-left: 0;
}
.wf-bs__variant-tab:hover {
  color: var(--text-base);
}
.wf-bs__variant-tab.is-active {
  color: var(--accent-1);
  background: color-mix(in oklch, var(--accent-1) 8%, transparent);
}
.wf-bs__stage {
  background: var(--bg-base);
}
/* Blocs d'article: contenu étroit (mesure de lecture) centré dans la scène, plutôt
 * qu'étalé pleine largeur. Le bandeau, lui, reste pleine largeur. */
.wf-bs__stage.is-narrow .wf-site {
  max-width: 86rem;
  margin-inline: auto;
  padding-block: calc(var(--spacing-unit) * 4);
}
</style>
