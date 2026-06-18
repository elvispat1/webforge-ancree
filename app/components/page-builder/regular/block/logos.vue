<script setup lang="ts">
import type { BlockBase } from '~/types/blocks'
import type { LogosContent } from '~/content/logos'

// Bande de confiance: certifications, guildes, affiliations. En V1, rendues en
// libellés texte; le passage à de vrais logos (fichiers image) est prévu, voir la
// note de format dans ~/content/logos.ts. NE PAS référencer un type LogosBlock: il
// sera ajouté à types/blocks.ts à l'intégration. On compose BlockBase + le contenu.
const logos = defineProps<BlockBase<'logos'> & LogosContent>()
</script>

<template>
  <section class="wf-section wf-logos">
    <div class="wf-container">
      <!-- En-tête standard à gauche via <SectionHead>, aligné sur les autres blocs.
           Rendu si un titre est fourni (l'eyebrow comme le titre se méritent). -->
      <SectionHead
        v-if="logos.heading"
        :eyebrow="logos.eyebrow"
        :heading="logos.heading"
      />

      <!-- Rangée de libellés à filets. ul/li: c'est une liste d'affiliations.
           data-reveal-stagger révèle chaque cellule en cascade. Les filets
           (hairline) sont portés par les cellules elles-mêmes (cf. CSS). -->
      <ul class="wf-logos-grid" data-reveal-stagger>
        <li
          v-for="(item, i) in logos.items"
          :key="i"
          class="wf-logos-cell"
        >
          <span class="wf-h5 wf-text-muted wf-logos-label">{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
