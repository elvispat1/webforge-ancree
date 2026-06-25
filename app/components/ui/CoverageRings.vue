<script setup lang="ts">
/* Anneaux de couverture radiale: signature visuelle locale d'Ancree, partagee
 * (footer, contact, villes, bandeau CTA) pour rester IDENTIQUE partout et ne plus
 * etre dupliquee inline. Purement decoratif: aria-hidden, hors tabulation. La
 * COULEUR vient du parent (`color` -> stroke = currentColor); le placement, la
 * taille et l'opacite restent au parent via sa classe. */
</script>

<template>
  <svg class="wf-rings" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    <circle cx="100" cy="100" r="92" />
    <circle cx="100" cy="100" r="66" />
    <circle cx="100" cy="100" r="40" />
    <circle cx="100" cy="100" r="16" />
  </svg>
</template>

<style scoped>
.wf-rings circle {
  fill: none;
  stroke: currentColor;
  stroke-width: 1;
}
</style>
