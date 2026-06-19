<script setup lang="ts">
/* Scene de la vitrine: un bloc rendu EN VRAI, precede d'une barre d'etiquette
 * (nom + type). Le bloc vit dans son propre .wf-site, donc ses requetes
 * @container site se resolvent contre la largeur de la scene, exactement comme en
 * production. La barre, elle, reste dans le contexte site de la page. */
defineProps<{ label: string; type?: string }>()
</script>

<template>
  <section class="sg-stage">
    <header class="sg-stage__bar">
      <div class="wf-container sg-stage__bar-inner">
        <span class="sg-stage__name">{{ label }}</span>
        <span v-if="type" class="sg-stage__type">{{ type }}</span>
      </div>
    </header>
    <div class="sg-stage__canvas">
      <div class="wf-site">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.sg-stage {
  border-top: var(--line-hair);
}
.sg-stage__bar {
  position: sticky;
  top: 0;
  z-index: 2;
  background: color-mix(in oklch, var(--bg-base) 88%, transparent);
  backdrop-filter: blur(8px);
  padding-block: 1.4rem;
  border-bottom: var(--line-soft);
}
.sg-stage__bar-inner {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.6rem;
}
.sg-stage__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.6rem;
  color: var(--text-base);
}
.sg-stage__type {
  font-family: var(--font-mono);
  font-size: 1.3rem;
  color: var(--text-muted);
}
.sg-stage__canvas {
  /* Le bloc peint son propre fond; la scene reste neutre. */
  overflow: hidden;
}
/* Le .wf-site global colle le pied de page (min-height: 100vh, flex colonne).
 * Dans une scene, on le neutralise: le bloc doit tenir sa hauteur naturelle. Le
 * container-type (requetes @container site) reste intact. */
.sg-stage__canvas .wf-site {
  min-height: 0;
  display: block;
}
</style>
