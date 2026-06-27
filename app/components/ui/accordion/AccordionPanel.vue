<script setup lang="ts">
/* Panneau d'accordeon: anime sa HAUTEUR REELLE en JS (GSAP), pas via une
 * transition CSS de grid-template-rows.
 *
 * Pourquoi: la transition CSS de `grid-template-rows` (0fr -> 1fr) n'est pas
 * honoree de facon fiable selon les navigateurs (l'ouverture « snappe » d'un coup
 * alors que les transitions de couleur/opacite, elles, jouent). Une hauteur en
 * pixels pilotee par GSAP s'interpole partout, douce et premium, avec la courbe
 * in-out delicate de la famille (MOTION.ease.drawer).
 *
 * Contraintes tenues:
 *  - le contenu reste dans le DOM ferme (SEO: les reponses sont dans le HTML);
 *  - l'etat ferme INITIAL est rendu au SSR par une classe CONSTANTE (snapshot de
 *    l'etat de depart), donc aucun flash au chargement et aucune bataille avec les
 *    styles inline que GSAP pose au runtime;
 *  - a11y: ferme = `visibility: hidden` (hors tabulation et hors arbre AT), l'etat
 *    etant aussi porte par aria-expanded sur le declencheur;
 *  - reduced-motion / preview Sanity: bascule instantanee (motionDisabled). */
import { MOTION, motionDisabled } from '~/family/motion'

const props = defineProps<{
  open: boolean
  panelId: string
  labelledby: string
}>()

// Snapshot NON reactif de l'etat de depart: pilote la classe d'etat ferme rendue au
// SSR. Constante (jamais retoggle), donc elle ne se bat pas avec les styles inline.
const initialOpen = props.open
const root = ref<HTMLElement | null>(null)

function applyInstant(el: HTMLElement, open: boolean): void {
  el.style.height = open ? 'auto' : '0px'
  el.style.visibility = open ? 'visible' : 'hidden'
}

async function run(open: boolean): Promise<void> {
  const el = root.value
  if (!el) return
  if (motionDisabled()) {
    applyInstant(el, open)
    return
  }
  // GSAP par import dynamique (chunk partage, deja charge par la directive reveal
  // de la page). Si le chunk echoue, on garde l'etat correct sans animation: un
  // tiroir pilote au clic ne doit jamais rester coince.
  const mod = await import('~/family/motion-gsap').catch(() => null)
  if (!el.isConnected) return
  if (!mod) {
    applyInstant(el, open)
    return
  }
  const { gsap } = mod
  gsap.killTweensOf(el)
  if (open) {
    // Rend mesurable AVANT de mesurer la cible, puis deploie de 0 a la hauteur reelle.
    el.style.visibility = 'visible'
    el.style.height = 'auto'
    const target = el.offsetHeight
    gsap.fromTo(
      el,
      { height: 0 },
      {
        height: target,
        duration: MOTION.duration.drawer,
        ease: MOTION.ease.drawer,
        // Hauteur auto a la fin: le contenu respire (reflow responsive, contenu dynamique).
        onComplete: () => {
          el.style.height = 'auto'
        }
      }
    )
  } else {
    gsap.fromTo(
      el,
      { height: el.offsetHeight },
      {
        height: 0,
        duration: MOTION.duration.drawer,
        ease: MOTION.ease.drawer,
        // Sort de l'arbre a11y/tabulation APRES le repli (pas avant, sinon snap).
        onComplete: () => {
          el.style.visibility = 'hidden'
        }
      }
    )
  }
}

// flush post: Vue a deja mis a jour le DOM (aria-*) quand GSAP mesure et anime.
watch(() => props.open, (open) => run(open), { flush: 'post' })
</script>

<template>
  <div
    :id="panelId"
    ref="root"
    role="region"
    :aria-labelledby="labelledby"
    class="acc__panel"
    :class="{ 'acc__panel--init-collapsed': !initialOpen }"
  >
    <div class="acc__content wf-body-2 wf-text-muted">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Hauteur pilotee en inline par GSAP; overflow cache le contenu pendant le
 * deploiement et au repos ferme (hauteur nulle). */
.acc__panel {
  overflow: hidden;
}
/* Etat ferme rendu au SSR. Classe CONSTANTE (snapshot initial): une fois que GSAP
 * pose des styles inline, ils gagnent en specificite; la classe ne retoggle jamais. */
.acc__panel--init-collapsed {
  height: 0;
  visibility: hidden;
}
.acc__content {
  padding: 0 2.4rem 2.4rem;
  max-width: 64ch;
}
</style>
