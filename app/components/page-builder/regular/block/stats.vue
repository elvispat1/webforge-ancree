<script setup lang="ts">
import type { BlockBase } from '~/types/blocks'
import type { StatsContent } from '~/content/stats'

// Bande de crédibilité: rangée de chiffres clés. Le typage local étale le
// contenu sur la base de bloc; l'intégration à l'union PageBlock vient après.
const stats = defineProps<BlockBase<'stats'> & StatsContent>()

// En-tête optionnel, rendu seulement s'il porte un titre. Computed
// rétrécissant: heading garanti string pour <SectionHead>, qui l'exige (h2).
const head = computed(() =>
  stats.heading ? { eyebrow: stats.eyebrow, heading: stats.heading } : undefined
)
</script>

<template>
  <section class="wf-section wf-stats">
    <div class="wf-container">
      <!-- En-tête optionnel (titre seul): la bande peut vivre seule, chiffres
           pleine largeur. -->
      <SectionHead v-if="head" v-bind="head" />

      <!-- Rangée de chiffres. dl sémantique alignée sur hero-meta: le terme (dt)
           est le libellé, la description (dd) la valeur. L'ordre visuel valeur
           puis libellé se rétablit en CSS (grid-row), le DOM reste dt avant dd.
           Filets de séparation portés par les items en CSS (border-left + repli
           mobile). -->
      <dl
        class="wf-stats-row"
        :style="{ '--stat-count': stats.items.length }"
        data-reveal-stagger
      >
        <div v-for="(item, i) in stats.items" :key="i" class="wf-stat">
          <dt class="wf-caption wf-stat-label">{{ item.label }}</dt>
          <dd class="wf-h3 wf-text-accent wf-stat-value">{{ item.value }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
