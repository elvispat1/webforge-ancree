import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

/* Face GSAP de la motion famille — séparée de motion.ts (tokens purs) pour que
 * GSAP + ScrollTrigger + CustomEase (~35-50 Ko gzip) ne soient JAMAIS tirés dans
 * le chunk d'entrée. Les consommateurs (directive v-reveal, useEntrance,
 * useParallax) chargent ce module par import() dynamique au montage: Vite en
 * fait un chunk async partagé unique, chargé une fois puis mis en cache. Les
 * pages sans animation (légales) ne le téléchargent jamais.
 *
 * Ne JAMAIS importer ce fichier statiquement depuis un plugin ou un module de
 * l'entrée (plugins/reveal.ts importe la directive, qui importe seulement
 * motion.ts): un import statique réintroduirait GSAP dans toutes les pages. */

let registered = false

/** Enregistre les plugins GSAP et la CustomEase « settle ». Idempotent, client-only. */
export function registerGsap(): void {
  if (registered) return
  gsap.registerPlugin(ScrollTrigger, CustomEase)
  // Reproduit à l'identique --motion-ease-settle: cubic-bezier(0.22, 1, 0.36, 1).
  // Les points de contrôle du bezier deviennent ceux du segment cubique SVG.
  CustomEase.create('settle', 'M0,0 C0.22,1 0.36,1 1,1')
  registered = true
}

export { gsap, ScrollTrigger }
