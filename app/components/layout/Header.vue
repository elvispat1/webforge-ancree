<script setup lang="ts">
/* En-tete collant avec numero (langage de conversion grave de la famille).
 * Transparent et clair par-dessus le heros full bleed; devient blanc solide une
 * fois le heros quitte au defilement; solide d'emblee sur une page sans heros.
 * Deux modes: 'landing' (one-pager: ancres + scrollspy, qualifiees par la racine
 * `home`) et 'multipage' (liens de route via le route-map). */
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
const switchLocalePath = useSwitchLocalePath()
const links = useSiteNav()
const otherLocalePath = computed(() => switchLocalePath(locale.value === 'fr' ? 'en' : 'fr'))

// Nav multipage: source partagee avec le pied de page (useMultipageNav).
const multipageLinks = useMultipageNav()

// Liens du menu mobile, normalises {label, href} selon le mode (route ou ancre).
const menuLinks = computed(() =>
  props.mode === 'multipage'
    ? multipageLinks.value.map((l) => ({ label: l.label, href: l.to }))
    : links.map((l) => ({ label: t(l.labelKey), href: landingHref(l.href) }))
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
let heroH = 0

function measureHero(): void {
  const hero = document.querySelector('.hero') as HTMLElement | null
  heroH = hero ? hero.offsetHeight : 0
}
function onScroll(): void {
  solid.value = heroH === 0 ? true : window.scrollY > Math.max(0, heroH - 140)
}
function onResize(): void {
  measureHero()
  onScroll()
}

onMounted(() => {
  measureHero()
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
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
  <header class="header" :class="{ 'header--solid': solid }">
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
          <NuxtLink v-for="link in multipageLinks" :key="link.to" :to="link.to" class="header__link">
            {{ link.label }}
          </NuxtLink>
        </template>
        <template v-else>
          <a v-for="link in links" :key="link.href" :href="landingHref(link.href)" class="header__link">
            {{ t(link.labelKey) }}
          </a>
        </template>
      </nav>

      <div class="header__actions">
        <a class="header__lang" :href="otherLocalePath">{{ t('home.switch') }}</a>
        <a class="header__phone" :href="t('contact.phone_href')">
          <Icon name="lucide:phone" class="header__phone-icon" aria-hidden="true" />
          {{ t('contact.phone_display') }}
        </a>
        <Button
          :href="t('contact.phone_href')"
          kind="anchor"
          variant="call"
          size="sm"
          icon="lucide:phone"
          class="header__cta"
        >
          {{ t('contact.call_short') }}
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

    <MobileMenu :open="menuOpen" :links="menuLinks" @close="menuOpen = false" />
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 50;
  color: var(--text-ondeep);
  transition:
    background-color var(--motion-duration-line) var(--motion-ease-settle),
    color var(--motion-duration-line) var(--motion-ease-settle),
    box-shadow var(--motion-duration-line) var(--motion-ease-settle);
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
.header__phone {
  display: none;
  align-items: center;
  gap: 0.7rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.6rem;
  color: inherit;
  text-decoration: none;
}
.header__phone:hover {
  color: var(--accent-trust);
}
.header__phone-icon {
  width: 1.8rem;
  height: 1.8rem;
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
  .header__nav {
    display: flex;
    gap: 2.8rem;
  }
  .header__phone {
    display: inline-flex;
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
