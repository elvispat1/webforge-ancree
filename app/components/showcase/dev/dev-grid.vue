<script setup lang="ts">
/* DevGrid — overlay des 12 colonnes (4 en mobile) pour valider le placement.
 *
 * Activable via la touche `g` seule. Universelle sur tous les claviers (FR/EN
 * et qwerty/azerty), libre dans Chrome (Cmd+G, Ctrl+G et backtick sont pris
 * par Find Next, Gemini, ou inaccessibles sur clavier QC).
 *
 * Guard: pas de toggle si l'utilisateur tape dans un input, textarea ou élément
 * contenteditable, pour ne pas voler la lettre dans la saisie.
 *
 * Couleur: rouge fixe (#FF3B30) — outil dev indépendant du theme de marque.
 *
 * Wrapper interne (.wf-dev-grid-inner): mime wf-container. Le DevGrid vit en
 * position fixed hors du `.wf-site` (monté dans app.vue), donc le wrapper
 * externe (.wf-dev-grid) se déclare lui-même conteneur nommé `site`: fixed
 * inset:0 lui donne la largeur du viewport scrollbar exclue, soit exactement
 * l'inline-size de .wf-site. L'overlay bascule donc 4 → 12 colonnes au même
 * instant que la vraie grille de page (@container site), padding compris.
 *
 * Caché par défaut, pointer-events: none donc transparent à l'interaction.
 */

const isShown = ref(false)

function onKeydown(e: KeyboardEvent) {
  if (e.key.toLowerCase() !== 'g') return
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
  const target = e.target as HTMLElement | null
  if (target && (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  )) {
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
        <li
          v-for="i in 12"
          :key="i"
          :class="i > 4 ? 'wf-dev-grid-col-desktop' : ''"
        />
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Conteneur `site` autonome (voir note du script): même inline-size que
 * .wf-site, les règles @container site de grid.css et du wrapper interne se
 * résolvent contre lui. */
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

/* Mime .wf-container: 24px fixe en mobile/tablette, 8rem fluide en desktop. */
.wf-dev-grid-inner {
  width: 100%;
  max-width: 1920px;
  height: 100%;
  margin: 0 auto;
  padding-inline: 24px;
}
@container site (min-width: 1024px) {
  .wf-dev-grid-inner { padding-inline: 8rem; }
}

.wf-dev-grid-cols {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  opacity: 0.18;
}
.wf-dev-grid-cols li {
  background: #FF3B30; /* rouge dev fixe, indépendant du theme */
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
