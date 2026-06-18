import type { Directive } from 'vue'
import { MOTION, motionDisabled } from '~/family/motion'
import { collectRevealTargets } from '~/utils/revealTargets'

/* Directive v-reveal — apparition au scroll du CONTENU d'une section, en cascade
 * (surtitre, titre, description, puis items), dans l'ordre de lecture. Pilotée par
 * GSAP + ScrollTrigger, jouée une seule fois à l'entrée dans le viewport.
 *
 * La section elle-même n'est jamais animée: son fond (ex: Contact foncé) est là
 * d'emblée, seuls les éléments de contenu se révèlent par-dessus. On marque les
 * cibles dans les blocs:
 *   - [data-reveal]          → l'élément lui-même est une cible (ex: une photo);
 *   - [data-reveal-stagger]  → ses enfants directs sont chacun une cible (ex: les
 *                              lignes d'un en-tête, les items d'une liste).
 * Les cibles sont révélées dans l'ordre du DOM. CMS-proof: un élément absent
 * (description vide, etc.) n'est pas dans le DOM, donc pas dans la cascade — aucune
 * durée figée à maintenir. Les éléments décoratifs (aria-hidden) sont ignorés.
 *
 * Opt-in: v-reveal="false" (binding falsy) = no-op. Accessibilité: sous
 * prefers-reduced-motion, aucune animation, le contenu reste pleinement visible
 * (jamais caché); le HTML statique rend aussi visible sans JS (hooks client-only).
 *
 * GSAP est chargé par import() dynamique (motion-gsap.ts): la directive est
 * bundlée dans l'entrée (plugin global), mais la librairie ne l'est pas — les
 * pages sans reveal ne la téléchargent jamais. Ce fichier n'importe que
 * motion.ts (tokens purs).
 *
 * Candidat webforge-core au 2e site. */

interface RevealEl extends HTMLElement {
  _wfReveal?: gsap.core.Tween
}

export const reveal: Directive<RevealEl, boolean | undefined> = {
  mounted(el, binding) {
    if (binding.value === false) return
    if (motionDisabled()) return
    const targets = collectRevealTargets(el)
    if (!targets.length) return
    // Les hooks de directive ne sont pas async: IIFE async pour charger le chunk
    // GSAP, avec garde « élément toujours monté » APRÈS le await — sinon un
    // élément démonté pendant la résolution recevrait un ScrollTrigger orphelin
    // (fuite: unmounted est déjà passé, personne ne le tuerait).
    void (async () => {
      const { gsap, registerGsap } = await import('~/family/motion-gsap')
      if (!el.isConnected) return
      registerGsap()
      el._wfReveal = gsap.from(targets, {
        opacity: 0,
        y: MOTION.reveal.distance,
        duration: MOTION.duration.reveal,
        ease: MOTION.ease.settle,
        stagger: MOTION.reveal.stagger,
        scrollTrigger: {
          trigger: el,
          start: MOTION.reveal.start,
          once: true
        }
      })
    })()
  },
  unmounted(el) {
    el._wfReveal?.scrollTrigger?.kill()
    el._wfReveal?.kill()
  }
}
