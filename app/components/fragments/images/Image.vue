<template>
  <!-- Image réelle avec parallaxe: cadre clippé + image surdimensionnée translatée.
       NuxtImg = srcset + sizes responsives (webp), optimisées au build. -->
  <div
    v-if="src && parallaxEnabled"
    ref="frame"
    class="wf-image-parallax"
    :style="{ aspectRatio: ratio }"
  >
    <NuxtImg
      :ref="setImageEl"
      :src="src"
      :alt="alt"
      :loading="loading"
      :sizes="sizes"
      :fetchpriority="fetchpriority"
      :decoding="decoding"
      format="webp"
      class="wf-image wf-image--parallax"
    />
  </div>
  <!-- Image réelle responsive (srcset + sizes via @nuxt/image) -->
  <NuxtImg
    v-else-if="src"
    :src="src"
    :alt="alt"
    :loading="loading"
    :sizes="sizes"
    :fetchpriority="fetchpriority"
    :decoding="decoding"
    format="webp"
    :style="{ aspectRatio: ratio }"
    class="wf-image"
  />
  <!-- Placeholder (mode démo, ou en attente d'image réelle). Sans label ni
       caption, aucun nom accessible utile n'existe: le placeholder devient
       décoratif (aria-hidden) plutôt que d'annoncer un nom vide de sens. -->
  <div
    v-else
    :class="['wf-ph', `wf-ph-${tone}`]"
    :style="{ aspectRatio: ratio }"
    :role="label || caption ? 'img' : undefined"
    :aria-label="label || caption || undefined"
    :aria-hidden="label || caption ? undefined : 'true'"
  >
    <svg class="wf-ph-stripes" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <pattern
          :id="patternId"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" stroke-width="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" :fill="`url(#${patternId})`" />
    </svg>
    <span v-if="caption || label" class="wf-ph-label">{{ caption || label }}</span>
  </div>
</template>

<script setup lang="ts">
// Point d'entrée unique pour toute image du site.
//
// V2 (Sanity, actuel): le src est une URL d'asset du CDN Sanity (résolue par la
// couche composable, app/sanity/transform.ts), rendue en <NuxtImg> webp responsive
// (srcset + sizes, variantes optimisées au build par IPX, domains cdn.sanity.io
// dans nuxt.config), ou placeholder visuel si aucun src. Les images locales de
// public/images/ ne servent plus que la vitrine /showcase (consts *_SAMPLE).

const props = withDefaults(
  defineProps<{
    /** URL de l'image. Absent = mode placeholder. */
    src?: string
    /** Texte alternatif. RECOMMANDÉ dès qu'on a un src, jamais imposé: l'attribut
     *  `alt` est TOUJOURS émis sur le <img> (défaut '' = image décorative). Un
     *  attribut absent serait un échec WCAG; un alt vide est volontaire et valide.
     *  Convention dans docs/CONVENTIONS-CONTRACT.md (section 8). */
    alt?: string
    /** Ratio CSS (ex: '4/5', '3/4', '16/9'). */
    ratio?: string
    /** Largeur rendue selon l'emplacement, pour le srcset. Syntaxe @nuxt/image
     *  avec alias d'écran (sm:/md:/lg:/xl:/xxl:). Défaut = demi-largeur desktop,
     *  pleine largeur en deçà.
     *  PIÈGE (cf. contrat §8, vérifié dans la source getSizes): @nuxt/image ne
     *  génère une largeur candidate QUE pour les clés d'écran NOMMÉES ici. Il faut
     *  donc nommer les hauts breakpoints (xl/xxl), sinon le plafond du srcset reste
     *  à la plus haute clé nommée et l'image ramollit sur grand écran et Retina.
     *  À surcharger selon la colonne occupée:
     *    pleine largeur   : "sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
     *    split 5/7 ou 6/6 : "sm:100vw md:100vw lg:50vw xl:50vw xxl:50vw"
     *    tiers (galerie)  : "sm:100vw md:50vw lg:33vw xl:33vw xxl:33vw"
     *    quart (4 cols)   : "sm:50vw md:50vw lg:25vw xl:25vw xxl:25vw"
     *    largeur fixe (corps d'article ~72ch) : "sm:100vw md:768px" */
    sizes?: string
    /** Texte ARIA en mode placeholder. Pas de défaut: sans label (ni caption),
     *  le placeholder est rendu décoratif (aria-hidden) au lieu d'annoncer un
     *  nom générique en dur (discipline i18n + nom accessible descriptif). */
    label?: string
    /** Texte visible en mode placeholder (fallback sur label). */
    caption?: string
    /** Teinte du fond en mode placeholder. */
    tone?: 'alt' | 'base'
    /** Stratégie de chargement (eager pour above-the-fold). */
    loading?: 'eager' | 'lazy'
    /** Priorité réseau de l'image. `high` sur l'image LCP des héros (le
     *  fallthrough d'attributs n'atteint pas le <img> dans la branche parallaxe,
     *  d'où la prop explicite). Absent = attribut omis (défaut navigateur). */
    fetchpriority?: 'high' | 'low' | 'auto'
    /** Décodage. `sync` sur les images de héros (LCP): le navigateur décode avant
     *  de peindre, ce qui évite le « pop » d'une image qui finit de décoder après
     *  le fondu d'entrée. Absent = attribut omis (défaut navigateur). */
    decoding?: 'sync' | 'async' | 'auto'
    /** Parallaxe verticale au scroll (image réelle). Activée par défaut; passer
     *  `false` pour la désactiver (image décorative, contexte sans scroll, etc.). */
    parallax?: boolean
  }>(),
  {
    src: undefined,
    alt: '',
    ratio: '4/3',
    sizes: 'sm:100vw md:100vw lg:50vw xl:50vw xxl:50vw',
    label: undefined,
    caption: undefined,
    tone: 'alt',
    loading: 'lazy',
    fetchpriority: undefined,
    decoding: undefined,
    parallax: true
  }
)

const patternId = computed(
  () => `p-${(props.label || 'image').replace(/\s+/g, '-')}`
)

// En preview (édition visuelle), on rend la branche image SIMPLE plutôt que la
// branche parallaxe (cadre clippé + image absolue surdimensionnée): la parallaxe
// est une mise en scène inutile pour éditer, et sans son init JS le cadre peut se
// collapser (image à hauteur 0). __WF_PREVIEW__ = false en prod (tree-shake) ->
// comportement inchangé. Le template ne peut pas lire la constante de compile
// directement (Vue la résoudrait comme propriété d'instance), d'où ce relais.
const parallaxEnabled = computed(() => props.parallax && !__WF_PREVIEW__)

// Parallaxe encapsulée: la variante <Image parallax> est déclarative côté appelant.
// Le composable est client-only, no-op sous prefers-reduced-motion, et ne fait rien
// si les refs sont absentes (parallax désactivée → éléments non rendus).
//
// NuxtImg est un composant: un ref dessus renvoie l'instance, pas le <img> du DOM.
// useParallax a besoin du noeud DOM, donc on capture `$el` via une ref de fonction
// (appelée au montage, avant le onMounted de useParallax).
const frame = ref<HTMLElement | null>(null)
const image = ref<HTMLElement | null>(null)
function setImageEl(el: unknown) {
  image.value = (el as { $el?: HTMLElement } | null)?.$el ?? null
}
useParallax(image, frame)
</script>

<style scoped>
.wf-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Variante parallaxe: cadre qui clippe, image surdimensionnée librement
 * translatable par useParallax sans révéler de bord. La géométrie de débordement
 * (hauteur 160 %, centrée → 30 % de marge par côté) est mécanique à l'effet, pas
 * une valeur de design: elle couvre l'amplitude de MOTION.parallax.travel. Pour
 * pousser l'amplitude plus loin, augmenter aussi cette hauteur. */
.wf-image-parallax {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.wf-image--parallax {
  position: absolute;
  left: 0;
  top: -30%;
  width: 100%;
  height: 160%;
  object-fit: cover;
}
</style>
