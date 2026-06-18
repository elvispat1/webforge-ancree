import type { Ref } from 'vue'
import { MOTION, motionDisabled } from '~/family/motion'
import { collectRevealTargets } from '~/utils/revealTargets'

/* useEntrance — apparition au CHARGEMENT (pas au scroll) du contenu marqué d'un
 * conteneur above-the-fold (le héros), en cascade harmonieuse. Joue une fois au
 * montage. Mêmes marqueurs que v-reveal: data-reveal / data-reveal-stagger.
 *
 * Anti-flash: les cibles sont aussi masquées en CSS via @media (scripting: enabled)
 * (cf. global.css), donc invisibles dès le premier rendu quand JS + motion sont là;
 * sans JS ou sous prefers-reduced-motion, elles restent visibles. Le masquage CSS
 * tient aussi pendant le chargement du chunk GSAP (import() dynamique de
 * motion-gsap.ts: GSAP hors de l'entrée, cf. perf). Client-only, nettoie son
 * tween au démontage. Candidat webforge-core au 2e site. */
export function useEntrance(root: Ref<HTMLElement | null>): void {
  let tween: gsap.core.Tween | null = null
  let disposed = false

  onMounted(() => {
    if (motionDisabled()) return
    const el = root.value
    if (!el) return
    const targets = collectRevealTargets(el)
    if (!targets.length) return
    // Chargement dynamique du chunk GSAP, garde « composant toujours vivant »
    // après le await (un démontage pendant la résolution laisserait sinon un
    // tween orphelin que onUnmounted, déjà passé, ne tuerait pas).
    void (async () => {
      const { gsap, registerGsap } = await import('~/family/motion-gsap')
      if (disposed || !el.isConnected) return
      registerGsap()
      // fromTo (cible explicite opacity:1) et non from: le masquage anti-flash CSS
      // met l'opacité courante à 0, qu'un simple `from` prendrait pour cible finale
      // (il animerait de 0 vers 0). fromTo force l'arrivée à 1.
      tween = gsap.fromTo(
        targets,
        { opacity: 0, y: MOTION.entrance.distance },
        {
          opacity: 1,
          y: 0,
          duration: MOTION.entrance.duration,
          ease: MOTION.ease.settle,
          stagger: MOTION.entrance.stagger,
          delay: MOTION.entrance.delay
        }
      )
    })()
  })

  onUnmounted(() => {
    disposed = true
    tween?.kill()
  })
}
