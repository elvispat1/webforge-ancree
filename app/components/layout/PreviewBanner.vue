<script setup lang="ts">
/* PreviewBanner: chrome du mode preview Sanity (plan T2c, pattern de la
 * référence nuxt-sanity-test). Sans ce rappel, un éditeur qui a activé la
 * preview depuis le Studio puis navigue hors de l'iframe (onglet oublié, lien
 * partagé) verrait des brouillons sans le savoir.
 *
 * Affichage: hors iframe seulement (window.self === window.top). La bannière
 * n'est montée QUE dans les builds preview (layouts gatés sur __WF_PREVIEW__ via
 * defineAsyncComponent), et le Worker preview sert TOUJOURS des brouillons
 * (always-drafts, cf. plugin 01.content): dès qu'on est hors iframe sur ce
 * domaine, le rappel « prévisualisation » est pertinent. Plus de dépendance au
 * cookie sanity-preview (cloisonné dans l'iframe du Studio, invisible à un onglet
 * autonome): elle masquerait la bannière sur le 2e écran qui voit pourtant des
 * brouillons. Dans le Presentation tool, le Studio est juste à côté: isInIframe
 * coupe le bruit.
 *
 * Sortie « Quitter »: $fetch GET /api/exit-preview (204, le serveur supprime
 * le cookie SUR le domaine preview, aucun redirect serveur, cf.
 * server/api/exit-preview.get.ts) puis window.location.assign vers l'ACCUEIL de
 * la PROD (décision Charles 16 juin: « Quitter » ramène TOUJOURS à l'accueil
 * publié, peu importe la page prévisualisée — évite un 404 sur un brouillon
 * jamais publié, et reste simple). Accueil localisé (fr /, en /en). La cible
 * prod est dérivée de l'hôte courant par prodHostFromPreviewHost (convention
 * <worker>-preview); hors preview (dev local), prodHost est null et on va à
 * l'accueil local. Le plein rechargement force un SSR sans cookie: contenu
 * publié, état preview purgé. */
import { EXIT_PREVIEW_PATH, prodHostFromPreviewHost } from '~/config/preview'

const { t } = useI18n()
const localePath = useLocalePath()

/* Détection iframe côté client seulement (window indisponible en SSR).
 * Défaut false (= « pas en iframe »): faux négatif d'une fraction de seconde
 * en iframe (bannière brièvement rendue côté serveur) préférable à un flash
 * visible hors iframe (bannière qui apparaît puis disparaît). */
const isInIframe = useState('wf-preview-banner-in-iframe', () => false)
onMounted(() => {
  isInIframe.value = window.self !== window.top
})

const show = computed(() => !isInIframe.value)

/* Cible de sortie: TOUJOURS l'accueil de la PROD (décision Charles 16 juin),
 * localisé (fr /, en /en). window.location n'est lu qu'au clic (client), donc
 * sûr. Hors hôte preview (dev local), prodHost null -> accueil local. */
function exitTarget(): string {
  const home = localePath('/')
  const prodHost = prodHostFromPreviewHost(window.location.host)
  return prodHost ? `${window.location.protocol}//${prodHost}${home}` : home
}

const exiting = ref(false)
async function handleExit(e: MouseEvent) {
  e.preventDefault()
  if (exiting.value) return
  exiting.value = true
  try {
    // GET 204, uniquement pour supprimer le cookie. Aucun redirect à suivre.
    await $fetch(EXIT_PREVIEW_PATH, { method: 'GET' })
  } catch {
    // Échec silencieux: on navigue quand même. Si le cookie n'a pas été
    // supprimé, l'éditeur peut réessayer depuis la bannière toujours visible.
  }
  window.location.assign(exitTarget())
}
</script>

<template>
  <div v-if="show" class="wf-preview" role="status">
    <span class="wf-caption wf-preview-label">
      <span class="wf-preview-dot" aria-hidden="true" />
      {{ t('ui.preview.label') }}
    </span>
    <a
      :href="EXIT_PREVIEW_PATH"
      class="wf-caption wf-preview-exit"
      @click="handleExit"
    >{{ exiting ? t('ui.preview.exiting') : t('ui.preview.exit') }}</a>
  </div>
</template>
