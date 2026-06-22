<script setup lang="ts">
/* DevGrid: overlay des colonnes de la grille (4 en mobile, 12 au desktop) pour
 * valider que les blocs se calent bien sur les pistes de `.section-grid`.
 *
 * Activable par la touche `g` seule (universelle FR/EN, azerty/qwerty; Cmd+G,
 * Ctrl+G et backtick sont pris ailleurs). Aucun toggle si l'utilisateur tape
 * dans un champ (input, textarea, contenteditable). Rouge fixe, independant du
 * theme de marque. Gate dev-only au montage (app.vue: v-if import.meta.dev).
 *
 * Le wrapper externe se declare lui-meme conteneur nomme `site`: en position
 * fixed inset:0, il a la largeur du viewport (scrollbar exclue), soit la meme
 * inline-size que `.wf-site`. Les regles @container site de grid.css se
 * resolvent donc contre lui: l'overlay bascule 4 -> 12 colonnes au meme instant
 * que la vraie grille, padding et gouttieres compris. Cache par defaut,
 * pointer-events: none. */
const isShown = ref(false)

function onKeydown(e: KeyboardEvent) {
  if (e.key.toLowerCase() !== 'g') return
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
  const target = e.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return
  }
  e.preventDefault()
  isShown.value = !isShown.value
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-show="isShown" class="wf-dev-grid" aria-hidden="true">
    <div class="wf-dev-grid-inner">
      <ul class="section-grid wf-dev-grid-cols">
        <li v-for="i in 16" :key="i" :class="i > 4 ? 'wf-dev-grid-col-desktop' : ''" />
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Conteneur `site` autonome: meme inline-size que .wf-site, les @container site
 * de grid.css (section-grid) et du wrapper interne se resolvent contre lui. */
.wf-dev-grid {
  container-type: inline-size;
  container-name: site;
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
  display: flex;
  justify-content: center;
}

/* Mime .wf-container: 24px en mobile/tablette, 8rem fluide en desktop. */
.wf-dev-grid-inner {
  width: 100%;
  max-width: 1920px;
  height: 100%;
  margin-inline: auto;
  padding-inline: 24px;
}
@container site (min-width: 1024px) {
  .wf-dev-grid-inner {
    padding-inline: 8rem;
  }
}

.wf-dev-grid-cols {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  opacity: 0.16;
}
.wf-dev-grid-cols li {
  background: #ff3b30; /* rouge dev fixe, hors theme */
  height: 100%;
}
.wf-dev-grid-col-desktop {
  display: none;
}
@container site (min-width: 1024px) {
  .wf-dev-grid-col-desktop {
    display: block;
  }
}
</style>
