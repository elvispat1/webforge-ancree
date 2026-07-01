<script setup lang="ts">
/* PreviewBanner: chrome du mode preview Sanity, peau Ancree.
 *
 * Rappelle a l'editeur qu'il regarde des BROUILLONS. Sans lui, quelqu'un qui a
 * active la preview depuis le Studio puis navigue hors de l'iframe (onglet oublie,
 * lien partage) verrait du contenu non publie sans le savoir.
 *
 * Affichage: HORS iframe seulement (window.self === window.top). La banniere n'est
 * montee QUE dans les builds preview (layouts gates sur __WF_PREVIEW__ via
 * defineAsyncComponent), et le Worker preview sert TOUJOURS des brouillons: des
 * qu'on est hors iframe sur ce domaine, le rappel est pertinent. Dans le
 * Presentation tool, le Studio est juste a cote: isInIframe coupe le bruit.
 *
 * Sortie « Quitter »: $fetch GET /api/exit-preview (204, le serveur supprime le
 * cookie sur le domaine preview, aucun redirect serveur) puis
 * window.location.assign vers l'ACCUEIL de la PROD (« Quitter » ramene TOUJOURS a
 * l'accueil publie, peu importe la page previsualisee: evite un 404 sur un
 * brouillon jamais publie). Accueil localise (fr /, en /en). La cible prod est
 * derivee de l'hote courant par prodHostFromPreviewHost (convention
 * <worker>-preview); hors preview (dev local), prodHost est null et on va a
 * l'accueil local. Le plein rechargement force un SSR sans cookie: contenu publie,
 * etat preview purge.
 *
 * Plomberie portee 1:1 de webforge-minimaliste; SEULE la peau (pastille navy posee
 * au sol, point d'appel ambre, tokens Ancree, style scope) est propre a Ancree. */
import { EXIT_PREVIEW_PATH, prodHostFromPreviewHost } from '~/config/preview'

const { t } = useI18n()
const localePath = useLocalePath()

/* Detection iframe cote client seulement (window indisponible en SSR). Defaut
 * false (= « pas en iframe »): un faux negatif d'une fraction de seconde en iframe
 * (banniere brievement rendue au serveur) est preferable a un flash visible hors
 * iframe (banniere qui apparait puis disparait). */
const isInIframe = useState('wf-preview-banner-in-iframe', () => false)
onMounted(() => {
  isInIframe.value = window.self !== window.top
})

const show = computed(() => !isInIframe.value)

/* Cible de sortie: TOUJOURS l'accueil de la PROD, localise (fr /, en /en).
 * window.location n'est lu qu'au clic (client), donc sur. Hors hote preview (dev
 * local), prodHost null -> accueil local. */
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
    // GET 204, uniquement pour supprimer le cookie. Aucun redirect a suivre.
    await $fetch(EXIT_PREVIEW_PATH, { method: 'GET' })
  } catch {
    // Echec silencieux: on navigue quand meme. Si le cookie n'a pas ete supprime,
    // l'editeur peut reessayer depuis la banniere toujours visible.
  }
  window.location.assign(exitTarget())
}
</script>

<template>
  <div v-if="show" class="wf-preview" role="status">
    <span class="wf-preview__label wf-caption">
      <span class="wf-preview__dot" aria-hidden="true" />
      {{ t('ui.preview.label') }}
    </span>
    <a
      :href="EXIT_PREVIEW_PATH"
      class="wf-preview__exit wf-caption"
      @click="handleExit"
    >
      {{ exiting ? t('ui.preview.exiting') : t('ui.preview.exit') }}
      <Icon class="wf-preview__exit-icon" name="lucide:log-out" aria-hidden="true" />
    </a>
  </div>
</template>

<style scoped>
/* Pastille fixe en bas a DROITE, miroir de la carte consent (bas gauche): les deux
 * cohabitent sans se chevaucher. Fond navy (bande forte d'Ancree), coins pleins et
 * ombre chaude: elle se pose au sol. Rendue seulement quand le visual editing est
 * actif (jamais en statique pur). */
.wf-preview {
  position: fixed;
  right: clamp(1.2rem, 3vw, 2.4rem);
  bottom: clamp(1.2rem, 3vw, 2.4rem);
  z-index: 70; /* meme palier que la carte consent; cotes opposes, aucun chevauchement */
  display: flex; /* exception inline toleree: rangee point + libelle + action */
  align-items: center;
  gap: 1.2rem;
  padding: 0.7rem 0.7rem 0.7rem 1.6rem;
  background: var(--bg-deep);
  border-radius: var(--radius-pill);
  box-shadow: var(--elev-high);
  color: var(--text-ondeep);
}
.wf-preview__label {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--text-ondeep);
}
/* Point d'appel: signale « brouillon en direct ». Ambre (accent d'appel d'Ancree),
 * halo doux, pulsation calme (courbe posee, pas d'alerte). */
.wf-preview__dot {
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: var(--accent-call);
  box-shadow: 0 0 0 0.35rem color-mix(in oklch, var(--accent-call) 22%, transparent);
  animation: wf-preview-pulse 2.4s ease-in-out infinite;
}
@keyframes wf-preview-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
/* Chip « Quitter »: filet clair sur navy, teinte au survol (pas de soulevement,
 * les boutons d'Ancree restent ancres au sol). */
.wf-preview__exit {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  color: var(--text-ondeep);
  text-decoration: none;
  border: var(--line-ondeep);
  border-radius: var(--radius-pill);
  white-space: nowrap;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.wf-preview__exit:hover,
.wf-preview__exit:focus-visible {
  background-color: color-mix(in oklch, white 12%, transparent);
  border-color: color-mix(in oklch, white 42%, transparent);
}
.wf-preview__exit-icon {
  font-size: 1.5rem;
}
.wf-preview :focus-visible {
  outline: 2px solid color-mix(in oklch, white 60%, transparent);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .wf-preview__dot { animation: none; }
}
</style>
