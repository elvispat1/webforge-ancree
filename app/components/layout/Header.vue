<script setup lang="ts">
import { routePath } from '~/config/route-map'

const props = withDefaults(defineProps<{
  mode?: 'landing' | 'multipage'
  /* Racine du site pour qualifier les ancres en mode landing. Le one-pager vit
   * sous /one-pager, donc la nav pointe vers /one-pager#section: ça scrolle sur
   * la page d'accueil ET ramène vers elle depuis une page légale du sous-arbre. */
  home?: string
}>(), {
  mode: 'multipage',
  home: '/'
})

/* Logo: en landing on vise la racine du one-pager (avec #top pour scroller au
 * héros, racine localisée par le layout); en multipage on ramène à l'accueil
 * de la langue courante (FR /, EN /en) via le route-map. */
const locale = useWfLocale()
const logoHref = computed(() =>
  props.mode === 'landing' ? `${props.home}#top` : routePath('home', locale)
)

const { t } = useI18n()
const site = useContent('site')
const overlay = useOverlayStore()

const scrolled = ref(false)

/* Auto-hide: cache le header quand on scrolle vers le bas (au-delà de la
 * hauteur du header pour éviter qu'il disparaisse trop tôt), réapparait dès
 * qu'on scrolle vers le haut. Hystérésis de 4px pour ignorer les micro-
 * mouvements et éviter le jitter.
 *
 * Le seuil = la hauteur RÉELLE du header, mesurée au montage et suivie par
 * ResizeObserver (même pattern que MobileMenu): --header-height (8rem) suit le
 * rem fluide (~68px à 320px de viewport, ~107px à 1920), un px en dur se
 * désynchroniserait aux deux extrémités (discipline 1: aucune valeur design
 * dupliquée dans un composant). */
const headerRef = ref<HTMLElement | null>(null)
const hidden = ref(false)
const hideAfter = ref(0)
const JITTER = 4
let lastScrollY = 0
let headerObserver: ResizeObserver | null = null

function onScroll() {
  const y = window.scrollY
  scrolled.value = y > 24

  const delta = y - lastScrollY
  if (delta > JITTER && y > hideAfter.value) {
    hidden.value = true
  } else if (delta < -JITTER) {
    hidden.value = false
  }
  lastScrollY = y
}

/* Garde clavier (miroir du :focus-within CSS de .wf-header.is-hidden): quand
 * le focus entre dans le header masqué, on resynchronise l'état pour qu'il ne
 * se recache pas brutalement dès que le focus en ressort. */
function onHeaderFocusIn() {
  hidden.value = false
}

/* Scrollspy en mode landing: IntersectionObserver suit quelle section
 * traverse la bande centrale du viewport et met à jour activeSection.
 * Les rootMargin -40%/-55% créent une bande au centre — seule la section
 * qui la croise est marquée active. La nav surligne le lien correspondant. */
const activeSection = ref<string>('')
let observer: IntersectionObserver | null = null

const navAnchorIds = computed(() =>
  site.value.nav.landing.primary.map((l) =>
    l.anchor.startsWith('#') ? l.anchor.slice(1) : l.anchor
  )
)

/* Quand on est dans le hero (id=top) ou hors de toute section nav, aucun
 * lien ne correspond. Charles veut que dans ce cas tous les liens soient
 * en pleine couleur (text-base) au lieu d'être muted. */
const noNavSectionActive = computed(() => !navAnchorIds.value.includes(activeSection.value))

function isAnchorActive(anchor: string): boolean {
  const id = anchor.startsWith('#') ? anchor.slice(1) : anchor
  return id === activeSection.value
}

onMounted(() => {
  // Mesure du seuil d'auto-hide avant le premier onScroll, puis suivi du
  // redimensionnement (le header est fluide, sa hauteur bouge avec le viewport).
  if (headerRef.value) {
    hideAfter.value = headerRef.value.offsetHeight
    headerObserver = new ResizeObserver(() => {
      if (headerRef.value) hideAfter.value = headerRef.value.offsetHeight
    })
    headerObserver.observe(headerRef.value)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  if (props.mode === 'landing') {
    const sections = document.querySelectorAll('section[id]')
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeSection.value = entry.target.id
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )
    sections.forEach((section) => observer!.observe(section))
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  headerObserver?.disconnect()
  observer?.disconnect()
})
</script>

<template>
  <header
    ref="headerRef"
    :class="['wf-header', { 'is-scrolled': scrolled, 'is-hidden': hidden }]"
    @focusin="onHeaderFocusIn"
  >
    <div :class="['wf-container', 'wf-header-row', { 'has-lang': mode === 'multipage' }]">
      <Logo :href="logoHref" />
      <nav class="wf-nav" :aria-label="t('a11y.main_nav')">
        <!-- Landing: ancres internes du one-pager, surlignées par scrollspy.
             aria-current suit isAnchorActive SEUL: l'état « tous surlignés »
             (noNavSectionActive) est purement visuel, le déclarer en ARIA
             marquerait toutes les sections actives à la fois (faux). -->
        <template v-if="mode === 'landing'">
          <a
            v-for="link in site.nav.landing.primary"
            :key="link.anchor"
            :href="home + link.anchor"
            :class="['wf-link', { 'is-active': noNavSectionActive || isAnchorActive(link.anchor) }]"
            :aria-current="isAnchorActive(link.anchor) ? 'true' : undefined"
          >{{ link.label }}</a>
        </template>
        <!-- Multipage: routes internes, état actif délégué à NuxtLink. -->
        <template v-else>
          <NuxtLink
            v-for="link in site.nav.multipage.primary"
            :key="link.route"
            :to="link.route"
            class="wf-link"
            active-class="is-active"
          >{{ link.label }}</NuxtLink>
        </template>
      </nav>
      <!-- Switcher de langue: multipage seulement (R1, le one-pager est autonome
           par langue). Lien <a> plein chargement, voir LangSwitcher.vue. Caché
           sous le breakpoint nav (il vit alors dans le menu mobile). -->
      <LangSwitcher v-if="mode === 'multipage'" class="wf-header-lang" />
      <Button
        v-if="mode === 'landing'"
        :href="home + site.nav.landing.cta.anchor"
        kind="anchor"
        size="sm"
        icon="lucide:chevron-right"
        class="wf-header-cta"
      >
        {{ site.nav.landing.cta.label }}
      </Button>
      <Button
        v-else
        :href="site.nav.multipage.cta.route"
        kind="internal"
        size="sm"
        icon="lucide:chevron-right"
        class="wf-header-cta"
      >
        {{ site.nav.multipage.cta.label }}
      </Button>
      <!-- Burger: ouvre le menu mobile (overlay plein écran) via le store.
           Visible uniquement sous le breakpoint nav. La fermeture se fait par
           le X dans le menu, Escape, ou le store. -->
      <button
        type="button"
        class="wf-burger"
        :aria-label="t('a11y.toggle_menu_open')"
        :aria-expanded="overlay.isActive('mobile-menu')"
        aria-haspopup="dialog"
        @click="overlay.open('mobile-menu')"
      >
        <Icon name="lucide:menu" aria-hidden="true" />
      </button>
    </div>

    <MobileMenu :mode="mode" :home="home" />
  </header>
</template>
