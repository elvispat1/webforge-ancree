/* Famille Minimaliste — valeurs de motion canoniques (face JS).
 *
 * Tokens PURS, sans dépendance GSAP: importable statiquement partout (y compris
 * dans la directive v-reveal, bundlée dans l'entrée via plugins/reveal.ts) sans
 * embarquer la librairie. La face GSAP (registerGsap, exports gsap/ScrollTrigger)
 * vit dans motion-gsap.ts, chargée par import() dynamique au premier élément
 * animé. Le miroir CSS, pour les effets pilotés en CSS (survols, accordéon), vit
 * dans `app/family/tokens.css` (--motion-duration-*, --motion-ease-settle). Les
 * deux faces partagent la même courbe « settle » = cubic-bezier(0.22, 1, 0.36, 1),
 * la courbe bespoke déjà dominante du repo.
 *
 * La motion est une décision de famille: ce fichier part avec la famille
 * Minimaliste le jour de l'extraction vers packages/webforge-minimaliste/.
 * Aucune valeur design en dur dans les composants (discipline 1): ils consomment
 * MOTION, pas des littéraux. */

export const MOTION = {
  /** Durées en secondes (unité GSAP). */
  duration: {
    reveal: 0.6
  },
  /** Eases GSAP (enregistrées par registerGsap ou built-in). */
  ease: {
    /** Miroir de --motion-ease-settle (CSS). Créée par registerGsap() (motion-gsap.ts). */
    settle: 'settle'
  },
  /** Apparition au scroll (directive v-reveal). */
  reveal: {
    /** Translation verticale d'entrée, en px (base 10px/rem). */
    distance: 24,
    /** Déclenchement ScrollTrigger: haut de l'élément vs viewport. */
    start: 'top 85%',
    /** Décalage entre éléments d'une cascade, en secondes. */
    stagger: 0.08
  },
  /** Parallaxe verticale (<Image parallax>). */
  parallax: {
    /** Amplitude de translation, en % de la hauteur de l'image. Volontairement
     *  minime (la parallaxe est globale): juste un souffle de vie, jamais flagrant.
     *  La marge du cadre (Image.vue, 30 % par côté) couvre jusqu'à ~18 %. */
    travel: 1.5,
    /** Lissage du scrub, en secondes de rattrapage. L'image continue un peu
     *  après l'arrêt du scroll (inertie), au lieu d'un suivi sec 1:1. */
    scrub: 1.2,
    /** Fenêtre ScrollTrigger: la course démarre quand le haut du cadre touche le
     *  bas du viewport (l'image entre à l'écran)... */
    start: 'top bottom',
    /** ...et se termine quand le bas du cadre quitte le haut du viewport: la
     *  parallaxe couvre toute la fenêtre de visibilité de l'image. */
    end: 'bottom top'
  },
  /** Entrée au chargement du héros (useEntrance, above-the-fold). */
  entrance: {
    /** Translation verticale d'entrée, en px (base 10px/rem). */
    distance: 20,
    /** Durée par élément, en secondes. */
    duration: 0.7,
    /** Décalage entre éléments (cascade rapprochée, harmonieuse), en secondes. */
    stagger: 0.09,
    /** Léger retard après le montage avant de lancer la cascade, en secondes. */
    delay: 0.15
  }
} as const

/** Vrai si l'utilisateur demande moins d'animations. Client-only (matchMedia). */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Vrai si les animations doivent être désactivées. En PREVIEW (édition visuelle
 *  Sanity), on coupe apparition/reveal/parallaxe: la mise en scène n'a pas sa place
 *  dans l'outil d'édition, et surtout un raté d'init JS (mismatch d'hydratation du
 *  visual editing) laisserait sinon le contenu masqué (opacity:0 / cadre collapsé).
 *  Le contenu doit rester pleinement visible d'emblée. Hors preview, comportement
 *  inchangé (prefers-reduced-motion seul). Client-only (court-circuit avant matchMedia
 *  en preview). __WF_PREVIEW__ = constante de compile (false en prod -> tree-shake). */
export function motionDisabled(): boolean {
  return __WF_PREVIEW__ || prefersReducedMotion()
}
