<script setup lang="ts">
/* En-tete collant avec numero d'urgence (langage de conversion grave de la
 * famille). Par-dessus le heros full bleed: transparent, clair et un cran plus
 * haut (deploye). Des qu'on descend (SOLID_AFTER), il dock: passe au blanc solide
 * et se compacte a sa hauteur collante, d'un seul geste. Solide d'emblee sur une
 * page sans heros. Se masque au defilement vers le bas, revient vers le haut.
 * Deux modes: 'landing' (one-pager: ancres, qualifiees par la racine `home`) et
 * 'multipage' (liens de route via le route-map). */
import { routePath } from '~/config/route-map'

const props = withDefaults(
  defineProps<{
    mode?: 'multipage' | 'landing'
    /** Racine pour qualifier les ancres en mode landing (one-pager sous /one-pager). */
    home?: string
  }>(),
  { mode: 'landing', home: '/' }
)

const { t, locale } = useI18n()
const localePath = useLocalePath()
// Navigation editable depuis Sanity (siteSettings.nav): landing = ancres du
// one-pager, multipage = routes reelles. Source unique, partagee avec le Pied de
// page et le Menu mobile (plus aucun jeu de liens code en dur cote composant).
const site = useContent('site')
const headerLandingLinks = computed(() => site.value.nav.landing.primary)
const headerMultipageLinks = computed(() => site.value.nav.multipage.primary)
// Bascule de langue via <SwitchLocalePathLink>: ses routes sont resolues AVANT
// l'envoi, en honorant setI18nParams (slug TRADUIT par langue des pages nuisible).
// L'imperatif switchLocalePath garderait le slug brut au prerendu -> lien croise
// casse (et pages fantomes via crawlLinks).
const otherLocale = computed<'fr' | 'en'>(() => (locale.value === 'fr' ? 'en' : 'fr'))

// Liens du menu mobile, normalises {label, href} selon le mode. En landing, les
// ancres sont qualifiees par la racine du one-pager (landingHref).
const menuLinks = computed(() =>
  props.mode === 'multipage'
    ? headerMultipageLinks.value.map((l) => ({ label: l.label, href: l.route }))
    : headerLandingLinks.value.map((l) => ({ label: l.label, href: landingHref(l.anchor) }))
)
const brandTo = computed(() =>
  props.mode === 'multipage' ? routePath('home', locale.value as 'fr' | 'en') : localePath('/')
)
// Ancres du landing qualifiees par la racine du one-pager (fonctionnent depuis
// une page legale du sous-arbre). En racine '/', l'ancre reste #section.
function landingHref(href: string): string {
  return props.home && props.home !== '/' ? `${props.home}${href}` : href
}

const solid = ref(false)
const menuOpen = ref(false)
// Bascule transparent -> solide tres pres du haut: le heros garde un bref moment
// pleine image, puis l'en-tete passe au blanc lisible. Petit seuil pour que la nav
// ne flotte jamais, illisible, par-dessus le titre clair du heros.
const SOLID_AFTER = 24
let heroH = 0

// Auto-masquage au defilement (mecanique reprise de la famille Minimaliste):
// l'en-tete se retire vers le haut quand on descend (au-dela de sa propre
// hauteur, pour ne pas disparaitre trop tot), et revient des qu'on remonte.
// Hysteresis de quelques pixels pour ignorer les micro-mouvements (anti-jitter).
// Le seuil = la hauteur REELLE de l'en-tete, mesuree au montage et suivie au
// redimensionnement: --header-height est fluide, un px en dur se desynchroniserait.
const headerRef = ref<HTMLElement | null>(null)
const hidden = ref(false)
const hideAfter = ref(0)
const JITTER = 4
let lastScrollY = 0
let headerObserver: ResizeObserver | null = null

function measureHero(): void {
  const hero = document.querySelector('.hero') as HTMLElement | null
  heroH = hero ? hero.offsetHeight : 0
}
function onScroll(): void {
  const y = window.scrollY
  // Transparent uniquement tout en haut du heros; solide des qu'on descend.
  // Page sans heros (heroH === 0) = solide d'emblee.
  solid.value = heroH === 0 ? true : y > SOLID_AFTER

  const delta = y - lastScrollY
  if (delta > JITTER && y > hideAfter.value) {
    hidden.value = true
  } else if (delta < -JITTER) {
    hidden.value = false
  }
  lastScrollY = y
}
function onResize(): void {
  measureHero()
  onScroll()
}
// Garde clavier (miroir du :focus-within CSS): si le focus entre dans l'en-tete
// masque, on le revele pour qu'il ne se recache pas brutalement au tab suivant.
function onHeaderFocusIn(): void {
  hidden.value = false
}

onMounted(() => {
  measureHero()
  if (headerRef.value) {
    hideAfter.value = headerRef.value.offsetHeight
    headerObserver = new ResizeObserver(() => {
      if (headerRef.value) hideAfter.value = headerRef.value.offsetHeight
    })
    headerObserver.observe(headerRef.value)
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  headerObserver?.disconnect()
})

// L'en-tete vit dans le layout persistant: il ne se remonte pas au changement de
// route. Sans ca, la hauteur de heros mesuree au montage reste figee, et arriver
// de l'accueil full bleed (classe .hero) sur une page interne claire (masthead
// page-hero, sans .hero) laisse l'en-tete en mode transparent: texte blanc
// invisible sur fond clair. On re-mesure et on reevalue l'etat solide a chaque
// navigation (aucune transition de page configuree -> le DOM de la nouvelle page
// est present au nextTick).
const route = useRoute()
watch(() => route.fullPath, () => {
  nextTick(() => {
    measureHero()
    onScroll()
  })
})
</script>

<template>
  <header
    ref="headerRef"
    class="header"
    :class="{ 'header--solid': solid, 'header--hidden': hidden }"
    @focusin="onHeaderFocusIn"
  >
    <div class="wf-container header__row">
      <NuxtLink :to="brandTo" class="header__brand" :aria-label="t('site.home_aria')">
        <span class="header__mark" aria-hidden="true">
          <Icon name="lucide:shield-check" />
        </span>
        <span class="header__word">
          <strong>Rempart</strong>
          <span>Extermination</span>
        </span>
      </NuxtLink>

      <nav class="header__nav" :aria-label="t('a11y.main_nav')">
        <template v-if="mode === 'multipage'">
          <NuxtLink v-for="link in headerMultipageLinks" :key="link.route" :to="link.route" class="header__link">
            {{ link.label }}
          </NuxtLink>
        </template>
        <template v-else>
          <a v-for="link in headerLandingLinks" :key="link.anchor" :href="landingHref(link.anchor)" class="header__link">
            {{ link.label }}
          </a>
        </template>
      </nav>

      <div class="header__actions">
        <SwitchLocalePathLink class="header__lang" :locale="otherLocale">{{ t('home.switch') }}</SwitchLocalePathLink>
        <!-- CTA d'urgence: un seul geste d'appel. Le libelle EST le numero (confiance
             + clic-pour-appeler), precede d'une icone cercle-alerte (alerte douce) de la
             meme couleur que le texte. Bouton ambre, langage d'appel de la famille.
             L'aria porte le contexte « urgence » que l'icone seule ne dit pas. -->
        <Button
          :href="t('contact.phone_href')"
          :aria-label="t('contact.urgent_aria', { number: t('contact.phone_display') })"
          kind="anchor"
          variant="call"
          size="sm"
          icon="lucide:circle-alert"
          class="header__cta"
        >
          {{ t('contact.phone_display') }}
        </Button>
        <button
          type="button"
          class="header__burger"
          :aria-label="t('a11y.open_menu')"
          :aria-expanded="menuOpen"
          aria-haspopup="dialog"
          @click="menuOpen = true"
        >
          <Icon name="lucide:menu" aria-hidden="true" />
        </button>
      </div>
    </div>

    <MobileMenu :open="menuOpen" :mode="mode" :links="menuLinks" @close="menuOpen = false" />
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  color: var(--text-ondeep);
  transition:
    transform var(--motion-duration-expand) var(--motion-ease-settle),
    background-color var(--motion-duration-line) var(--motion-ease-settle),
    color var(--motion-duration-line) var(--motion-ease-settle),
    box-shadow var(--motion-duration-line) var(--motion-ease-settle);
}
/* Auto-masquage: l'en-tete se retire vers le haut (il deborde hors viewport).
   Le focus clavier le rappelle: une cible focalisee ne doit jamais rester
   hors-champ (miroir du garde onHeaderFocusIn). */
.header--hidden {
  transform: translateY(-100%);
}
.header--hidden:focus-within {
  transform: none;
}
.header--solid {
  background: var(--bg-base);
  color: var(--text-base);
  border-bottom: var(--line-hair);
  box-shadow: var(--elev-low);
}
.header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  min-height: var(--header-height);
  /* Compaction au dock, synchronisee avec le passage au blanc (meme courbe et
     duree). L'en-tete etant fixe, ce changement de hauteur ne reflue pas la
     page: il ne recadre que la rangee, c'est fluide. */
  transition: min-height var(--motion-duration-line) var(--motion-ease-settle);
}

.header__brand {
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  text-decoration: none;
  color: inherit;
}
.header__mark {
  display: grid;
  place-items: center;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: var(--radius-sm);
  background: var(--accent-call);
  color: var(--navy);
  box-shadow: var(--elev-low);
}
.header__mark svg {
  width: 2.1rem;
  height: 2.1rem;
}
.header__word {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
  font-family: var(--font-display);
  color: inherit;
}
.header__word strong {
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.header__word span {
  font-size: 1.2rem;
  font-weight: 600;
  color: color-mix(in oklch, currentColor 62%, transparent);
  letter-spacing: 0.02em;
}

/* Navigation: ancres, soulignement ambre au survol (lisible clair ou solide). */
.header__nav {
  display: none;
}
.header__link {
  position: relative;
  color: inherit;
  text-decoration: none;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.6rem;
  padding-block: 0.6rem;
}
.header__link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background: var(--accent-call);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--motion-duration-line) var(--motion-ease-settle);
}
.header__link:hover::after,
.header__link:focus-visible::after {
  transform: scaleX(1);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: 1.4rem;
}
.header__lang {
  display: none;
  align-items: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.5rem;
  color: inherit;
  text-decoration: none;
  opacity: 0.85;
}
.header__lang:hover {
  opacity: 1;
  color: var(--accent-call);
}
.header__cta {
  display: none;
}
.header__burger {
  display: grid;
  place-items: center;
  width: 4.4rem;
  height: 4.4rem;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.header__burger svg {
  width: 2.6rem;
  height: 2.6rem;
}

@container site (min-width: 1024px) {
  /* Dock: deploye (plus haut) au sommet du heros, puis compacte a la hauteur
     collante des qu'il dock (passage au solide). Desktop seulement: au mobile il
     reste compact pour ne pas manger le petit viewport. */
  .header:not(.header--solid) .header__row {
    min-height: var(--header-height-open);
  }
  .header__nav {
    display: flex;
    gap: 2.8rem;
  }
  .header__lang {
    display: inline-flex;
  }
  .header__cta {
    display: inline-flex;
  }
  .header__burger {
    display: none;
  }
}
</style>
