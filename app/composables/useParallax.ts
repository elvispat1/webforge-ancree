import type { Ref } from 'vue'
import { MOTION, motionDisabled } from '~/family/motion'

/* useParallax — parallaxe verticale au scroll, encapsulée pour <Image parallax>.
 * L'image (surdimensionnée) se translate dans son cadre overflow:hidden pendant le
 * défilement, sans révéler de bord. Fenêtre et amplitude consommées depuis MOTION
 * (décisions de famille, aucun littéral de motion ici).
 *
 * GSAP chargé par import() dynamique (motion-gsap.ts): le hook est tiré par les
 * chunks de pages, mais la librairie vit dans un chunk async partagé unique.
 * Client-only (onMounted), no-op sous prefers-reduced-motion (le reset CSS global
 * ne couvre pas les transforms JS, d'où le garde explicite), nettoie son
 * ScrollTrigger au démontage. Candidat webforge-core au 2e site. */
export function useParallax(
  image: Ref<HTMLElement | null>,
  frame: Ref<HTMLElement | null>
): void {
  let tween: gsap.core.Tween | null = null
  let disposed = false

  onMounted(() => {
    if (motionDisabled()) return
    const el = image.value
    const trigger = frame.value
    if (!el || !trigger) return
    // Garde « composant toujours vivant » après le await: un démontage pendant la
    // résolution du chunk laisserait sinon un ScrollTrigger orphelin.
    void (async () => {
      const { gsap, registerGsap } = await import('~/family/motion-gsap')
      if (disposed || !el.isConnected) return
      registerGsap()
      // De +travel à -travel sur la course: l'image monte quand on défile vers le bas.
      tween = gsap.fromTo(
        el,
        { yPercent: MOTION.parallax.travel },
        {
          yPercent: -MOTION.parallax.travel,
          // Mécanique, pas une décision de famille: un tween scrubbé doit mapper
          // linéairement la position de scroll (toute courbe fausserait le suivi).
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: MOTION.parallax.start,
            end: MOTION.parallax.end,
            scrub: MOTION.parallax.scrub
          }
        }
      )
    })()
  })

  onUnmounted(() => {
    disposed = true
    tween?.scrollTrigger?.kill()
    tween?.kill()
  })
}
