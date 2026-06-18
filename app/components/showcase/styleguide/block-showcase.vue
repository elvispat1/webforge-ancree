<script setup lang="ts">
/* BlockShowcase — rend une catégorie du catalogue de blocs (outil dev).
 *
 * Orchestrateur: délègue chaque bloc à <BlockShowcaseItem>, qui gère son propre
 * contrôle de variantes et le rend EN VRAI dans un wrapper .wf-site (contexte de
 * container query, comme en prod). La vitrine montre la vérité visuelle, et
 * double comme QA.
 */
import { computed } from 'vue'
import { anchorIdFor } from '~/composables/useBlockCatalog'
import type { CatalogCategory } from '~/composables/useBlockCatalog'
import BlockShowcaseItem from '~/components/showcase/styleguide/block-showcase-item.vue'

const props = defineProps<{ category: CatalogCategory }>()

// Les blocs d'article sont du contenu étroit (mesure de lecture): on les enveloppe
// dans une colonne centrée plutôt que de les étaler pleine largeur.
const isNarrow = computed(() => props.category.id === 'articles')
</script>

<template>
  <div class="wf-bs">
    <div v-if="category.items.length === 0" class="wf-container">
      <p class="wf-bs__empty">
        {{ category.emptyLabel || 'Aucun bloc dans cette catégorie.' }}
      </p>
    </div>

    <BlockShowcaseItem
      v-for="(item, index) in category.items"
      :key="item.type + (item.variant || '')"
      :item="item"
      :anchor-id="anchorIdFor(category.items, index)"
      :narrow="isNarrow"
    />
  </div>
</template>

<style scoped>
/* Style dev-only scoped. Le rendu d'un bloc (bandeau, contrôle, scène) vit dans
 * BlockShowcaseItem; ici on ne garde que l'état vide. */
.wf-bs__empty {
  font-family: var(--font-body);
  font-size: 1.5rem;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 60ch;
  padding: calc(var(--spacing-unit) * 4) 0;
}
</style>
