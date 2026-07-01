<script setup lang="ts">
/* En-tete collant avec numero d'urgence (langage de conversion grave de la
 * famille). Par-dessus tout masthead de tete: transparent et un cran plus haut
 * (deploye). Le ton suit le fond: sur le heros full bleed sombre d'accueil il reste
 * clair (texte clair + degrade de garde); sur les mastheads internes clairs il passe
 * en texte sombre, sans degrade. Des qu'on descend (SOLID_AFTER), il dock: passe au
 * blanc solide, NU (ni ombre ni filet), et se compacte. Solide d'emblee sur une page
 * sans masthead. Se masque au defilement vers le bas, revient vers le haut. Deux
 * modes: 'landing' (one-pager: ancres, qualifiees par la racine `home`) et
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
// Logotype slab a deux tons: le premier mot du nom de marque (Sanity) en gras,
// le reste en sous-titre. Nom depuis siteSettings (discipline 3), jamais en dur.
const brandWords = computed(() => {
  const name = site.value.brand.name
  const i = name.indexOf(' ')
  return i === -1 ? { lead: name, rest: '' } : { lead: name.slice(0, i), rest: name.slice(i + 1) }
})
// Coordonnees d'appel depuis la NAP Sanity (tel: derive de phoneE164).
const phoneHref = computed(() => `tel:${site.value.contact.phoneE164}`)
// Bascule de langue: deleguee a <LangSwitcher>, lien <a> en plein chargement (le
// payload Sanity est fetche par langue cote serveur, une nav client cross-locale
// laisserait le contenu de la langue de depart). Voir LangSwitcher.vue.

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
// Ton du fond derriere l'en-tete transparent: 'dark' = heros full bleed (texte clair
// + degrade de garde), 'light' = masthead interne clair (texte sombre, sans degrade).
const heroTone = ref<'dark' | 'light'>('dark')

// Auto-masquage au defilement (mecanique reprise de la famille Minimaliste):
// l'en-tete se retire vers le haut quand on descend (au-dela de sa propre
// hauteur, pour ne pas disparaitre trop tot), et revient des qu'on remonte.
// Hysteresis de quelques pixels pour ignorer les micro-mouvements (anti-jitter).
// Le seuil = la hauteur REELLE de l'en-tete, mesuree au montage et suivie au
// redimensionnement: --header-height est fluide, un px en dur se desynchroniserait.
const headerRef = ref<HTMLElement | null>(null)
const hidden = ref(false)
const hideAfter = ref(0)
// Escamotage: descente NETTE pour escamoter, remontee legere pour reveler. Le calcul
// est echantillonne une fois par frame (rAF, voir onScroll) pour des deltas propres
// malgre le defilement inertiel mobile (evenements en rafale, position qui oscille au
// changement de direction) qui faisait clignoter l'en-tete (translate vers le haut).
const HIDE_DELTA = 6
const SHOW_DELTA = 4
let lastScrollY = 0
let rafId = 0
let headerObserver: ResizeObserver | null = null

function measureHero(): void {
  // Tout masthead de tete autorise l'en-tete transparent: heros full bleed (.hero,
  // fond sombre) comme mastheads internes (.page-hero / .article-hero, fond clair).
  // Le ton derive de la classe trouvee; aucun masthead = en-tete solide d'emblee.
  const hero = document.querySelector('.hero, .page-hero, .article-hero') as HTMLElement | null
  heroH = hero ? hero.offsetHeight : 0
  heroTone.value = hero?.classList.contains('hero') ? 'dark' : 'light'
}
function applyScroll(): void {
  rafId = 0
  const y = window.scrollY
  // Transparent uniquement tout en haut du heros; solide des qu'on descend.
  // Page sans heros (heroH === 0) = solide d'emblee.
  solid.value = heroH === 0 ? true : y > SOLID_AFTER

  const delta = y - lastScrollY
  // Toujours montre pres du haut (dans la hauteur de l'en-tete): en arrivant en haut
  // l'en-tete est revele, jamais escamote d'un coup. Au-dela: escamote a la descente
  // nette, revele a la remontee.
  if (y <= hideAfter.value) {
    hidden.value = false
  } else if (delta > HIDE_DELTA) {
    hidden.value = true
  } else if (delta < -SHOW_DELTA) {
    hidden.value = false
  }
  lastScrollY = y
}
// Un seul calcul par frame: deltas propres, pas de clignotement sur scroll inertiel.
function onScroll(): void {
  if (rafId) return
  rafId = requestAnimationFrame(applyScroll)
}
function onResize(): void {
  measureHero()
  applyScroll()
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
  lastScrollY = window.scrollY
  applyScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (rafId) cancelAnimationFrame(rafId)
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
    applyScroll()
  })
})
</script>

<template>
  <header
    ref="headerRef"
    class="header"
    :class="{ 'header--solid': solid, 'header--light': !solid && heroTone === 'light', 'header--hidden': hidden }"
    @focusin="onHeaderFocusIn"
  >
    <div class="wf-container header__row">
      <NuxtLink :to="brandTo" class="header__brand" :aria-label="site.brand.homeAriaLabel">
        <span class="header__mark" aria-hidden="true">
          <Icon name="lucide:shield-check" />
        </span>
        <span class="header__word">
          <strong>{{ brandWords.lead }}</strong>
          <span v-if="brandWords.rest">{{ brandWords.rest }}</span>
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
        <LangSwitcher class="header__lang" />
        <!-- CTA d'urgence: un seul geste d'appel. Le libelle EST le numero (confiance
             + clic-pour-appeler), precede d'une icone cercle-alerte (alerte douce) de la
             meme couleur que le texte. Bouton ambre, langage d'appel de la famille.
             L'aria porte le contexte « urgence » que l'icone seule ne dit pas. -->
        <Button
          :href="phoneHref"
          :aria-label="t('contact.urgent_aria', { number: site.contact.phone })"
          kind="anchor"
          variant="call"
          size="sm"
          icon="lucide:circle-alert"
          class="header__cta"
        >
          {{ site.contact.phone }}
        </Button>
        <!-- Mobile uniquement: bouton d'urgence compact (le CTA pleine forme ci-dessus
             prend le relais au desktop). Icone de telephone + « Urgence », lien tel: qui
             compose le numero (l'icone dit « appeler », le libelle seul ne porte pas le
             numero comme au desktop). -->

        <Button
          :href="phoneHref"
          :aria-label="t('contact.urgent_aria', { number: site.contact.phone })"
          kind="anchor"
          variant="call"
          size="sm"
          icon="lucide:phone"
          class="header__urgence"
        >
          {{ t('contact.urgent_label') }}
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
    color var(--motion-duration-line) var(--motion-ease-settle);
}
/* Garde de contraste, transparent SUR HEROS SOMBRE uniquement: un degrade navy ancre
   en haut garantit la lisibilite de la nav et de la marque claires par-dessus n'importe
   quelle image de heros. Pas de degrade sur masthead clair (header--light) ni au dock
   (solide): le fond clair / blanc porte deja le texte sombre. */
.header:not(.header--solid):not(.header--light)::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: calc(var(--header-height-open) + 2.4rem);
  background: linear-gradient(
    to bottom,
    color-mix(in oklch, var(--navy) 52%, transparent),
    transparent
  );
  pointer-events: none;
  z-index: -1;
}
/* Masthead interne clair: l'en-tete transparent passe en texte sombre (lisible sur le
   fond clair). Le passage au dock garde la meme couleur sombre, seul le fond change. */
.header--light:not(.header--solid) {
  color: var(--text-base);
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
/* Dock: blanc NU (ni filet ni ombre). Le fond blanc est porte par une couche ::after
   en OPACITE (compositee GPU), pas par background-color: le fondu reste lisse pendant
   le defilement inertiel mobile, ou une transition de paint (background-color) saccade
   ("le blanc s'en va sec"). Le texte sombre prend le relais via color. */
.header--solid {
  color: var(--text-base);
}
.header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--bg-base);
  opacity: 0;
  transition: opacity var(--motion-duration-line) var(--motion-ease-settle);
  pointer-events: none;
  z-index: -1;
}
.header--solid::after {
  opacity: 1;
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

/* Navigation: soulignement ambre qui POUSSE depuis la gauche a l'entree et SE RETIRE
   vers la droite a la sortie (bascule de transform-origin sur scaleX). Lisible en
   transparent clair, transparent sombre ou solide. */
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
  /* Repos: ancre a droite -> au depart du survol, la ligne se retire vers la droite. */
  transform-origin: right;
  transition: transform var(--motion-duration-line) var(--motion-ease-settle);
}
.header__link:hover::after,
.header__link:focus-visible::after {
  transform: scaleX(1);
  /* Survol: ancre a gauche -> la ligne pousse depuis la gauche. */
  transform-origin: left;
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
/* Bascule d'affichage qualifiee par .header__actions (specificite 0,3,0) pour battre
   DETERMINISTIQUEMENT le .btn { display: inline-flex } de base du composant Button
   (0,2,0). Sans ce cran de specificite, l'egalite se tranche par l'ordre des feuilles
   scoped, qui differe entre `nuxt dev` (l'en-tete gagne) et le build de prod (le .btn
   gagne): les deux CTA restaient alors affiches en meme temps, cassant le mobile. */
.header__actions .header__cta {
  display: none;
}
/* Bouton d'urgence: visible au mobile, masque au desktop (le CTA pleine forme prend
   le relais). Compact pour tenir a cote du burger sur les petits ecrans. */
.header__actions .header__urgence {
  display: inline-flex;
  gap: 0.6rem;
  padding: 1rem 1.4rem;
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
/* Cible tactile: plancher physique 44px sur ecran tactile (le moteur rem plancher
 * 1rem sous 375px rapetisserait le burger sous le seuil WCAG 2.5.5). */
@media (pointer: coarse) {
  .header__burger {
    min-width: 44px;
    min-height: 44px;
  }
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
  .header__actions .header__cta {
    display: inline-flex;
  }
  .header__actions .header__urgence {
    display: none;
  }
  .header__burger {
    display: none;
  }
}
</style>
