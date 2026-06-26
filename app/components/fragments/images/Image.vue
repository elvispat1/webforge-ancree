<template>
  <!-- Image reelle avec parallaxe (opt-in): cadre clippe + image surdimensionnee
       translatee. NuxtImg = srcset + sizes responsives (webp), optimisees au build. -->
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
  <!-- Image reelle responsive (srcset + sizes via @nuxt/image) -->
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
  <!-- Placeholder (figure sans image): cadre raye soigne, jamais une 404. Sans
       legende, aucun nom accessible utile: le placeholder devient decoratif
       (aria-hidden) plutot que d'annoncer un nom vide de sens. -->
  <div
    v-else
    :class="['wf-ph', `wf-ph-${tone}`]"
    :style="{ aspectRatio: ratio }"
    :role="caption ? 'img' : undefined"
    :aria-label="caption || undefined"
    :aria-hidden="caption ? undefined : 'true'"
  >
    <svg class="wf-ph-stripes" aria-hidden="true" focusable="false" preserveAspectRatio="none">
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
    <span v-if="caption" class="wf-ph-label">{{ caption }}</span>
  </div>
</template>

<script setup lang="ts">
// Point d'entree UNIQUE pour toute image du site (fragment partage). Le src est une
// URL d'asset du CDN Sanity (resolue par app/sanity/transform.ts -> ResolvedFigure),
// rendue en <NuxtImg> webp responsive (srcset + sizes, variantes optimisees au build
// par IPX, domains cdn.sanity.io dans nuxt.config), ou placeholder visuel si aucun
// src. Porte de webforge-minimaliste; SEULE adaptation Ancree: la parallaxe est
// OPT-IN (defaut false) au lieu d'opt-out, fidele au langage « ancre au sol » de la
// famille (les images restent posees, pas flottantes). Discipline 1: le ratio passe
// par un token (var(--ratio-*)), jamais une valeur en dur cote appelant.

const props = withDefaults(
  defineProps<{
    /** URL de l'image. Absent = mode placeholder. */
    src?: string
    /** Texte alternatif. L'attribut `alt` est TOUJOURS emis (defaut '' = decoratif). */
    alt?: string
    /** Ratio CSS, idealement un token (ex: 'var(--ratio-landscape)'). */
    ratio?: string
    /** Largeur rendue selon l'emplacement, pour le srcset (syntaxe @nuxt/image avec
     *  alias d'ecran sm:/md:/lg:/xl:/xxl:). Nommer les hauts breakpoints (xl/xxl),
     *  sinon le srcset ramollit sur grand ecran et Retina. */
    sizes?: string
    /** Legende (derivee de la description de l'asset). En mode placeholder: nom
     *  accessible + texte visible; absente -> placeholder decoratif. */
    caption?: string
    /** Teinte du fond en mode placeholder. */
    tone?: 'alt' | 'base'
    /** Strategie de chargement (eager pour above-the-fold). */
    loading?: 'eager' | 'lazy'
    /** Priorite reseau (`high` sur l'image LCP des heros). */
    fetchpriority?: 'high' | 'low' | 'auto'
    /** Decodage (`sync` sur les images de heros LCP). */
    decoding?: 'sync' | 'async' | 'auto'
    /** Parallaxe verticale au scroll. OPT-IN (defaut false): la famille Ancree pose
     *  ses images au sol; activer ponctuellement si un visuel doit respirer. */
    parallax?: boolean
  }>(),
  {
    src: undefined,
    alt: '',
    ratio: 'var(--ratio-landscape)',
    sizes: 'sm:100vw md:100vw lg:50vw xl:50vw xxl:50vw',
    caption: undefined,
    tone: 'alt',
    loading: 'lazy',
    fetchpriority: undefined,
    decoding: undefined,
    parallax: false
  }
)

const patternId = computed(
  () => `p-${(props.caption || 'image').replace(/[^a-z0-9]+/gi, '-')}`
)

// En preview (edition visuelle), branche image SIMPLE plutot que parallaxe (sans son
// init JS le cadre peut se collapser). __WF_PREVIEW__ = false en prod (tree-shake).
const parallaxEnabled = computed(() => props.parallax && !__WF_PREVIEW__)

// Parallaxe encapsulee: composable client-only, no-op sous prefers-reduced-motion et
// si les refs sont absentes (parallaxe off -> elements non rendus). NuxtImg est un
// composant: on capture le noeud DOM ($el) via une ref de fonction.
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

/* Variante parallaxe: cadre qui clippe, image surdimensionnee librement translatable
 * par useParallax sans reveler de bord. Geometrie d'overflow (hauteur 160 %, centree
 * -> 30 % de marge par cote) mecanique a l'effet, pas une valeur de design. */
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
