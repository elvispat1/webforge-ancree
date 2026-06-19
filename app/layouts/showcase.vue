<script setup lang="ts">
/* Gabarit de la page /showcase: canvas propre pour le guide de style et la
 * bibliotheque de blocs, sans le chrome marketing (en-tete collant, pied). Le
 * conteneur .wf-site fournit le contexte de requete de conteneur (name: site)
 * dont les sections du guide ont besoin (padding fluide de .wf-container). Chaque
 * scene de bloc re-declare son propre .wf-site (voir ShowcaseStage). */
const { t } = useI18n()
</script>

<template>
  <div class="wf-site sg-shell">
    <a class="sg-skip" href="#sg-main">{{ t('a11y.skip_to_content') }}</a>
    <main id="sg-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.sg-shell {
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-base);
  font-family: var(--font-body);
}
.sg-skip {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 10;
}
.sg-skip:focus {
  left: 1.6rem;
  top: 1.6rem;
  padding: 1rem 1.6rem;
  background: var(--text-base);
  color: var(--paper);
  border-radius: var(--radius-sm);
}
</style>
