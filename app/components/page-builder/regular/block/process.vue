<script setup lang="ts">
import type { BlockBase } from '~/types/blocks'
import type { ProcessContent } from '~/content/process'

// Typé contre BlockBase<'process'> & ProcessContent. Le type ProcessBlock dédié
// sera promu dans ~/types/blocks.ts à l'intégration; ici on compose à plat.
const process = defineProps<BlockBase<'process'> & ProcessContent>()

// En-tête rendu seulement s'il porte un titre. Computed rétrécissant: heading
// garanti string pour <SectionHead>, qui l'exige (h2).
const head = computed(() =>
  process.heading
    ? {
        eyebrow: process.eyebrow,
        heading: process.heading,
        lead: process.lead,
        ctas: process.cta ? [process.cta] : []
      }
    : undefined
)
</script>

<template>
  <section class="wf-section wf-process">
    <div class="wf-container">
      <SectionHead v-if="head" v-bind="head" />

      <!-- Étapes: liste ordonnée (séquence = sens). 1 colonne en mobile, jusqu'à
           4 en desktop. Filets fins entre les étapes, tracés par bordure de cellule
           (collapse géré par overlap des bordures sur la grille). -->
      <ol
        class="wf-process-steps"
        :style="{ '--step-count': process.steps.length }"
        data-reveal-stagger
      >
        <li v-for="step in process.steps" :key="step.n" class="wf-process-step">
          <span class="wf-process-n wf-caption wf-text-accent">{{ step.n }}</span>
          <h3 class="wf-process-step-title wf-h5">{{ step.title }}</h3>
          <p class="wf-process-step-body wf-body-2 wf-text-muted">{{ step.body }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
