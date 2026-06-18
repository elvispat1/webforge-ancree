<script setup lang="ts">
import type { ServicesBlock } from '~/types/blocks'
const services = defineProps<ServicesBlock>()

// Indice de tuile: chrome produit générique (i18n ui.*), pas du contenu de site.
const { t } = useI18n()

const floaterEl = ref<HTMLElement | null>(null)
const floaterSrc = ref('')
const floaterVisible = ref(false)

/* Suivi fluide: la cible saute au curseur, la position interpole (lerp) à
 * chaque frame. Pas de listener global, tout passe par la grille. */
const targetPos = { x: 0, y: 0 }
const pos = { x: 0, y: 0 }
let raf: number | null = null
let preloaded = false

/* Décalage vs le curseur: l'aperçu s'ancre en bas-droite du pointeur au lieu
 * d'être centré dessus, pour ne pas masquer le titre/description de la tuile. */
const OFFSET = 24

/* Largeur rendue du floater pour le srcset (boîte de 30rem, global.css), partagée
 * entre le préchargement et le <Image> du template pour que le navigateur réutilise
 * exactement le même candidat. Desktop only (le floater n'existe pas sous lg);
 * xxl à 400px car la racine clampe jusqu'à 13.33px (30rem peut atteindre ~400px). */
const FLOATER_SIZES = 'lg:320px xl:320px xxl:400px'
const $img = useImage()

/* Modifiers IPX du floater, partagés entre le préchargement client (preload) et
 * la déclaration de prérendu (usePrerenderImages), pour que les DEUX produisent
 * EXACTEMENT les mêmes URLs /_ipx/ que le <Image> du floater. getSizes n'hérite
 * pas du quality global (NuxtImg l'injecte au niveau composant), d'où le passage
 * explicite de $img.options.quality. */
const FLOATER_MODIFIERS = { width: undefined, height: undefined, format: 'webp', quality: $img.options.quality }

/* Images distinctes du floater (vides écartées). */
const floaterImages = computed(() => [...new Set(services.items.map((s) => s.image).filter(Boolean))])

/* Prérendu statique: l'aperçu est chargé dynamiquement au survol (v-if floaterSrc),
 * donc jamais rendu pendant `nuxt generate` -> ipxStatic ne cuirait pas ses variantes
 * (w_320/w_400) et elles 404 en statique (prod/staging). On déclare donc les srcset du
 * floater (mêmes getSizes que le <Image>) pour que Nitro écrive les fichiers /_ipx/.
 * Même mécanisme que l'art direction du héros (D23). No-op hors prerender. */
usePrerenderImages(
  ...floaterImages.value.map((src) => $img.getSizes(src, { sizes: FLOATER_SIZES, modifiers: FLOATER_MODIFIERS }).srcset)
)

function canHover(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches
}

/* Précharge les 4 images au premier survol de la section pour que l'aperçu
 * apparaisse sans délai (aucun coût au chargement initial de la page). On réchauffe
 * les variantes IPX (mêmes srcset/sizes que le NuxtImg du floater), jamais les JPEG
 * bruts: une URL brute ne serait jamais affichée, donc téléchargée pour rien.
 * DEUX PIÈGES (vérifiés dans la source @nuxt/image):
 * 1. getSizes n'hérite PAS du défaut global image.quality (c'est NuxtImg qui
 *    l'injecte au niveau du composant), donc on repasse $img.options.quality.
 * 2. La clé de cache du navigateur est la chaîne d'URL exacte, et IPX sérialise
 *    les modifiers dans leur ordre d'insertion. On reproduit donc l'ordre des
 *    clés de NuxtImg (width, height, format, quality; les undefined sont ignorés
 *    à la sérialisation) pour obtenir les mêmes /_ipx/w_X&f_webp&q_72/... */
function preload() {
  if (preloaded) return
  preloaded = true
  for (const s of services.items) {
    const { srcset, sizes } = $img.getSizes(s.image, { sizes: FLOATER_SIZES, modifiers: FLOATER_MODIFIERS })
    const img = new window.Image()
    if (sizes) img.sizes = sizes
    if (srcset) img.srcset = srcset
  }
}

function render() {
  pos.x += (targetPos.x - pos.x) * 0.18
  pos.y += (targetPos.y - pos.y) * 0.18
  if (floaterEl.value) {
    floaterEl.value.style.transform =
      `translate3d(${pos.x + OFFSET}px, ${pos.y + OFFSET}px, 0)`
  }
  raf = requestAnimationFrame(render)
}
function startLoop() { if (raf === null) raf = requestAnimationFrame(render) }
function stopLoop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null } }

function onGridMove(e: MouseEvent) {
  if (!canHover()) return
  preload()
  const tile = (e.target as HTMLElement).closest('.wf-service') as HTMLElement | null
  if (!tile) { onLeave(); return }
  const src = tile.dataset.image || ''
  if (src && src !== floaterSrc.value) floaterSrc.value = src
  targetPos.x = e.clientX
  targetPos.y = e.clientY
  if (!floaterVisible.value) {
    pos.x = e.clientX
    pos.y = e.clientY
    floaterVisible.value = true
  }
  startLoop()
}
function onLeave() {
  floaterVisible.value = false
  stopLoop()
}

onBeforeUnmount(stopLoop)
</script>

<template>
  <section class="wf-section wf-services" id="services">
    <div class="wf-container">
      <SectionHead
        :eyebrow="services.eyebrow"
        :heading="services.heading"
        :lead="services.lead"
        :ctas="services.ctaHref ? [{ label: services.ctaLabel, href: services.ctaHref }] : []"
      />

      <ul
        class="wf-services-grid"
        :style="{ '--service-count': services.items.length }"
        data-reveal-stagger
        @mousemove="onGridMove"
        @mouseleave="onLeave"
      >
        <li
          v-for="s in services.items"
          :key="s.n"
          class="wf-service"
          :class="{ 'is-linked': s.href }"
          :data-image="s.image"
        >
          <div class="wf-service-main">
            <h3 class="wf-h5">
              <NuxtLink v-if="s.href" :to="s.href" class="wf-service-link">{{ s.title }}</NuxtLink>
              <template v-else>{{ s.title }}</template>
            </h3>
            <p class="wf-service-body">{{ s.body }}</p>
          </div>
          <!-- Indice « En savoir plus »: seulement quand la tuile est cliquable
               (href présent = variante multipage). Filet d'accent tracé au survol
               de la tuile, signature de la famille. Décoratif (aria-hidden): le lien
               étiré du titre porte déjà la sémantique de navigation. -->
          <span v-if="s.href" class="wf-service-cue" aria-hidden="true">
            <span class="wf-service-cue-label">{{ t('ui.learn_more') }}</span>
            <Icon name="lucide:chevron-right" class="wf-service-cue-arrow" />
          </span>
        </li>
      </ul>

      <!-- Aperçu flottant qui suit le curseur au survol d'une tuile (desktop only).
           Décoratif: aria-hidden + pointer-events:none. Caché sur tactile via CSS. -->
      <div
        ref="floaterEl"
        class="wf-service-floater"
        :class="{ 'is-visible': floaterVisible }"
        aria-hidden="true"
      >
        <!-- Aperçu décoratif suivi-curseur: pas de parallaxe (transform déjà piloté en JS). -->
        <Image v-if="floaterSrc" :src="floaterSrc" alt="" :ratio="'4/5'" :sizes="FLOATER_SIZES" loading="lazy" :parallax="false" />
      </div>
    </div>
  </section>
</template>
