<script setup lang="ts">
/* MobileMenu — menu de navigation mobile, premier consommateur de <Modal>.
 *
 * Plein écran qui glisse depuis la droite (placement="right" à pleine largeur,
 * size="100%") par-dessus un voile qui s'assombrit pendant l'entrée. Reprend
 * les liens de la nav (mode-aware) et le CTA, en miroir du Header: en mode landing
 * les liens pointent vers les ancres, en multipage vers les routes. Chaque clic
 * ferme le menu (via le `close` exposé par le slot du Modal) pour que la
 * navigation se voie.
 *
 * Le burger du Header ouvre ce menu par le store (overlay.open('mobile-menu')).
 * Toute la mécanique a11y (focus trap, Escape, scroll lock, fond inerte) vit
 * dans <Modal>; ce composant ne fait que remplir le panneau.
 */
import { routePath } from '~/config/route-map'

const props = withDefaults(defineProps<{
  mode?: 'landing' | 'multipage'
  /* Miroir du Header: racine du site pour qualifier les ancres en mode landing. */
  home?: string
}>(), {
  mode: 'multipage',
  home: '/'
})

/* Miroir du logo du Header: racine du one-pager en landing (localisée par le
 * layout), accueil de la langue courante en multipage (FR /, EN /en). */
const locale = useWfLocale()
const logoHref = computed(() =>
  props.mode === 'landing' ? `${props.home}#top` : routePath('home', locale)
)

const { t } = useI18n()
const site = useContent('site')
const overlay = useOverlayStore()

/* Auto-fermeture quand on repasse au-dessus du breakpoint mobile: au-delà de
 * 1024px le burger disparait et la nav desktop revient, donc un menu resté
 * ouvert n'a plus lieu d'être. On observe la largeur du conteneur .wf-site (la
 * même inline-size que le @container du burger dans global.css), pas le
 * viewport, pour coller exactement à la visibilité du burger — ça réagit donc
 * aussi quand on force .wf-site { width } pour tester le responsive. */
/* px — miroir de @container site (max-width: 1023.98px) du burger: la borne CSS
 * est exclusive, le burger disparaît dès 1024px exactement (comparaison >=). */
const MOBILE_MAX = 1024

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  const siteEl = document.querySelector<HTMLElement>('.wf-site')
  if (!siteEl) return
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return
    if (entry.contentRect.width >= MOBILE_MAX && overlay.isActive('mobile-menu')) {
      overlay.close()
    }
  })
  resizeObserver.observe(siteEl)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <Modal id="mobile-menu" :label="t('a11y.mobile_menu')" placement="right" size="100%">
    <template #default="{ close, closeForNavigation }">
      <div class="wf-mobile-menu">
        <div class="wf-mobile-menu__bar">
          <!-- Le logo navigue (accueil/racine du one-pager): fermeture par
               navigation pour que la cible démarre où le routeur la place. -->
          <Logo :href="logoHref" @click="closeForNavigation" />
          <!-- Le X ferme sans naviguer: on restaure la position de scroll. -->
          <button
            type="button"
            class="wf-burger"
            :aria-label="t('a11y.toggle_menu_close')"
            @click="close"
          >
            <Icon name="lucide:x" aria-hidden="true" />
          </button>
        </div>

        <!-- Liens de nav: chaque clic navigue (ancre en landing, route en
             multipage), donc fermeture par navigation (pas de restauration). -->
        <nav class="wf-mobile-menu__nav" :aria-label="t('a11y.main_nav')">
          <template v-if="mode === 'landing'">
            <a
              v-for="link in site.nav.landing.primary"
              :key="link.anchor"
              :href="home + link.anchor"
              class="wf-mobile-menu__link wf-h3"
              @click="closeForNavigation"
            >{{ link.label }}</a>
          </template>
          <template v-else>
            <NuxtLink
              v-for="link in site.nav.multipage.primary"
              :key="link.route"
              :to="link.route"
              class="wf-mobile-menu__link wf-h3"
              @click="closeForNavigation"
            >{{ link.label }}</NuxtLink>
          </template>
        </nav>

        <!-- Switcher de langue: miroir du Header, multipage seulement (R1).
             Plein chargement (élément a) qui réinitialise le scroll; le close ne
             sert qu'au nouvel onglet (cmd-clic) où l'usager RESTE sur la page
             courante: fermeture simple pour restaurer sa position. -->
        <LangSwitcher
          v-if="mode === 'multipage'"
          class="wf-mobile-menu__lang"
          @click="close"
        />

        <div class="wf-mobile-menu__cta">
          <Button
            v-if="mode === 'landing'"
            :href="home + site.nav.landing.cta.anchor"
            kind="anchor"
            icon="lucide:chevron-right"
            @click="closeForNavigation"
          >
            {{ site.nav.landing.cta.label }}
          </Button>
          <Button
            v-else
            :href="site.nav.multipage.cta.route"
            kind="internal"
            icon="lucide:chevron-right"
            @click="closeForNavigation"
          >
            {{ site.nav.multipage.cta.label }}
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
