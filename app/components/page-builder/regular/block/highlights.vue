<script setup lang="ts">
import type { BlockBase } from '~/types/blocks'
import type { HighlightsContent } from '~/content/highlights'

const highlights = defineProps<BlockBase<'highlights'> & HighlightsContent>()

// En-tête rendu seulement s'il porte un titre (les engagements peuvent tenir
// seuls selon le contexte de page). Computed rétrécissant: heading garanti
// string pour <SectionHead>, qui l'exige (h2).
const head = computed(() =>
  highlights.heading
    ? { eyebrow: highlights.eyebrow, heading: highlights.heading, lead: highlights.lead }
    : undefined
)
</script>

<template>
  <section class="wf-section wf-highlights">
    <div class="wf-container">
      <SectionHead v-if="head" v-bind="head" />

      <ul class="wf-highlights-grid" data-reveal-stagger>
        <li v-for="(item, i) in highlights.items" :key="i" class="wf-highlight">
          <!-- Icône décorative: le sens passe par le titre/corps, donc aria-hidden. -->
          <Icon
            v-if="item.icon"
            :name="item.icon"
            class="wf-highlight-icon"
            aria-hidden="true"
          />
          <h3 class="wf-h5 wf-highlight-title">{{ item.title }}</h3>
          <p class="wf-body-2 wf-text-muted wf-highlight-body">{{ item.body }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
