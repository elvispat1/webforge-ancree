/* Tokens de mouvement (face JS) pour la signature Ancree « ca s'ancre en montant »:
 * les elements montent depuis le bas en se fondant et se posent au sol, en cascade.
 * Module PUR (aucun import GSAP), sur a importer dans l'entree. La face GSAP vit
 * dans motion-gsap.ts (import dynamique). Miroir CSS dans family/tokens.css (meme
 * courbe settle). Discipline 1: les composants lisent MOTION.*, jamais de litteraux. */
export const MOTION = {
  duration: { reveal: 0.8, drawer: 0.46 }, // secondes (unite GSAP)
  // settle = CustomEase enregistre dans motion-gsap.ts. drawer = ease in-out built-in
  // (depart ET fin doux): l'ouverture d'un tiroir d'accordeon se pose sans a-coup.
  ease: { settle: 'settle', drawer: 'power2.inOut' },
  // Apparition au defilement (directive v-reveal). Montee plus ample qu'en
  // Minimaliste (32px), deceleration plus lente: le bloc « se pose ».
  reveal: { distance: 32, start: 'top 88%', stagger: 0.1 },
  // Parallaxe d'image, discret par design (DESIGN.md: leger parallaxe).
  parallax: { travel: 2, scrub: 1.1, start: 'top bottom', end: 'bottom top' },
  // Apparition au chargement (useEntrance) pour le contenu au-dessus de la ligne
  // de flottaison (le heros), en cascade titre puis texte puis bouton.
  entrance: { distance: 36, duration: 0.9, stagger: 0.11, delay: 0.12 }
} as const

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* Porte universelle: vrai quand le mouvement doit etre COUPE (preview Sanity ou
 * preference utilisateur). Chaque consommateur JS l'appelle en premier et ne
 * fait rien si vrai, laissant le contenu a son etat naturel visible. */
export function motionDisabled(): boolean {
  return __WF_PREVIEW__ || prefersReducedMotion()
}
