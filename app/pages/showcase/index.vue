<script setup lang="ts">
/* /showcase — guide interne de tout ce qu'un site de la famille Ancree comprend.
 * Coquille reprise de Minimaliste, peau Ancree: une BARRE D'ONGLETS sombre en haut
 * (heros, blocs, articles, formulaire, guide de style) et une BARRE LATERALE SgNav
 * (ancres de la section active). Les onglets basculent la section affichee cote
 * client -> une seule route bilingue, noindex, prerendue (zero routage). */
import SgNav from '~/components/showcase/styleguide/nav.vue'
import BlockShowcase from '~/components/showcase/styleguide/block-showcase.vue'
import SgForms from '~/components/showcase/styleguide/forms.vue'
import SgTypography from '~/components/showcase/styleguide/typography.vue'
import SgTokens from '~/components/showcase/styleguide/tokens.vue'
import SgAtoms from '~/components/showcase/styleguide/atoms.vue'
import { navItemsFor } from '~/composables/useBlockCatalog'
import { routePath, onePagerPath } from '~/config/route-map'

const { t } = useI18n()

definePageMeta({ layout: 'showcase' })

usePageSeo({
  title: t('showcase.seo.title'),
  description: t('showcase.seo.description'),
  titleTemplate: '%s, WebForge Ancrée',
  noindex: true
})

const catalog = useBlockCatalog()
const heros = catalog.find((c) => c.id === 'heros')!
const reguliers = catalog.find((c) => c.id === 'reguliers')!
const articles = catalog.find((c) => c.id === 'articles')!

// Onglets primaires (barre sombre): icone + libelle i18n.
const tabs = [
  { id: 'styleguide', label: t('showcase.nav.styleguide'), icon: 'lucide:palette' },
  { id: 'heros', label: t('showcase.nav.heros'), icon: 'lucide:panel-top' },
  { id: 'reguliers', label: t('showcase.nav.reguliers'), icon: 'lucide:layout-grid' },
  { id: 'articles', label: t('showcase.nav.articles'), icon: 'lucide:newspaper' },
  { id: 'formulaire', label: t('showcase.nav.formulaire'), icon: 'lucide:text-cursor-input' }
] as const
type TabId = (typeof tabs)[number]['id']

const activeTab = ref<TabId>('styleguide')

// Ancres de la barre laterale, par section active.
const formSections = [
  { id: 'champs', label: t('showcase.styleguide.forms.section_champs') },
  { id: 'selection', label: t('showcase.styleguide.forms.section_selection') },
  { id: 'retroaction', label: t('showcase.styleguide.forms.section_retroaction') },
  { id: 'exemple', label: t('showcase.styleguide.forms.section_exemple') }
]
const styleguideSections = [
  { id: 'typographie', label: t('showcase.styleguide.sections.typography') },
  { id: 'tokens', label: t('showcase.styleguide.sections.tokens') },
  { id: 'composants', label: t('showcase.styleguide.sections.components') }
]

const navItems = computed(() => {
  switch (activeTab.value) {
    case 'reguliers': return navItemsFor(reguliers.items)
    case 'articles': return navItemsFor(articles.items)
    case 'formulaire': return formSections
    case 'styleguide': return styleguideSections
    default: return navItemsFor(heros.items)
  }
})
const navLabel = computed(() => tabs.find((tb) => tb.id === activeTab.value)?.label ?? '')

// Liens vers les vrais sites de la demo (multipage + one-pager), localises.
const locale = useWfLocale()
const multipageHref = routePath('home', locale)
const onepagerHref = onePagerPath('index', locale)
</script>

<template>
  <div class="wf-showcase">
    <!-- Barre sombre: marque + onglets (clair sur navy, icones). -->
    <header class="wf-showcase-bar">
      <div class="wf-container wf-showcase-bar__inner">
        <p class="wf-showcase-bar__brand">
          <span class="wf-showcase-bar__brand-name">WebForge</span>
          <span class="wf-showcase-bar__brand-dash">-</span>
          <span class="wf-showcase-bar__brand-family">Ancrée</span>
        </p>
        <nav class="wf-showcase-tabs" :aria-label="t('showcase.subtitle')">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="wf-showcase-tabs__tab"
            :class="{ 'is-active': activeTab === tab.id }"
            :aria-pressed="activeTab === tab.id"
            @click="activeTab = tab.id"
          >
            <Icon :name="tab.icon" class="wf-showcase-tabs__icon" aria-hidden="true" />
            <span>{{ tab.label }}</span>
          </button>
        </nav>
        <!-- Liens vers les vrais sites (a droite): on regarde le guide, puis on
             clique pour voir le rendu reel. -->
        <div class="wf-showcase-bar__links">
          <NuxtLink :to="multipageHref" class="wf-showcase-bar__link">
            <Icon name="lucide:layout-template" class="wf-showcase-bar__link-icon" aria-hidden="true" />
            <span>{{ t('showcase.links.multipage') }}</span>
          </NuxtLink>
          <NuxtLink :to="onepagerHref" class="wf-showcase-bar__link">
            <Icon name="lucide:file" class="wf-showcase-bar__link-icon" aria-hidden="true" />
            <span>{{ t('showcase.links.onepager') }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- SgNav (ancres de la section active) + contenu. Les 5 panneaux coexistent en
         v-show (rendus au build -> leurs images cuisent leurs variantes IPX; seul
         l'onglet actif est visible). SgNav re-observe le scroll-spy au changement. -->
    <SgNav :items="navItems" :label="navLabel">
      <h1 class="wf-sr-only">{{ t('showcase.seo.title') }}</h1>

      <div v-show="activeTab === 'heros'"><BlockShowcase :category="heros" /></div>
      <div v-show="activeTab === 'reguliers'"><BlockShowcase :category="reguliers" /></div>
      <div v-show="activeTab === 'articles'"><BlockShowcase :category="articles" /></div>
      <div v-show="activeTab === 'formulaire'"><SgForms /></div>
      <div v-show="activeTab === 'styleguide'" class="wf-showcase-styleguide">
        <section id="typographie" class="wf-showcase-styleguide__section">
          <div class="wf-container">
            <h2 class="wf-h3 wf-showcase-styleguide__title">{{ t('showcase.styleguide.sections.typography') }}</h2>
            <SgTypography />
          </div>
        </section>
        <section id="tokens" class="wf-showcase-styleguide__section">
          <div class="wf-container">
            <h2 class="wf-h3 wf-showcase-styleguide__title">{{ t('showcase.styleguide.sections.tokens') }}</h2>
            <SgTokens />
          </div>
        </section>
        <section id="composants" class="wf-showcase-styleguide__section">
          <div class="wf-container">
            <h2 class="wf-h3 wf-showcase-styleguide__title">{{ t('showcase.styleguide.sections.components') }}</h2>
            <SgAtoms />
          </div>
        </section>
      </div>
    </SgNav>
  </div>
</template>

<style scoped>
/* La vitrine montre l'etat FINAL: on desamorce la signature d'entree (data-reveal,
 * jouee en prod via GSAP) sur TOUS les panneaux (blocs ET formulaire/confirmation)
 * pour un guide lisible d'emblee et des captures stables. */
.wf-showcase :deep([data-reveal]),
.wf-showcase :deep([data-reveal] *),
.wf-showcase :deep([data-reveal-stagger]),
.wf-showcase :deep([data-reveal-stagger] *) {
  opacity: 1 !important;
  transform: none !important;
}

/* Barre sombre d'onglets: marque + onglets, clair sur navy (bande forte d'Ancree).
 * Tokens seulement. */
.wf-showcase-bar {
  background: var(--bg-deep);
  color: var(--text-ondeep);
}
.wf-showcase-bar__inner {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 4);
  padding-block: calc(var(--spacing-unit) * 1.5);
}
.wf-showcase-bar__brand {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
  display: inline-flex;
  align-items: baseline;
  gap: 0.5em;
}
.wf-showcase-bar__brand-name,
.wf-showcase-bar__brand-family {
  font-weight: 700;
  letter-spacing: -0.01em;
}
.wf-showcase-bar__brand-dash {
  color: color-mix(in oklch, var(--text-ondeep) 50%, transparent);
}

/* Onglets: icone + libelle, mute sur navy; actif = clair + gras + filet ambre. */
.wf-showcase-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing-unit) * 3);
}
.wf-showcase-tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 0.75);
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: color-mix(in oklch, var(--text-ondeep) 62%, transparent);
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: calc(var(--spacing-unit) * 1) 0;
  cursor: pointer;
  transition: color var(--motion-duration-hover) var(--motion-ease-out), border-color var(--motion-duration-hover) var(--motion-ease-out);
}
.wf-showcase-tabs__icon {
  font-size: 1.7rem;
  flex-shrink: 0;
}
.wf-showcase-tabs__tab:hover {
  color: var(--text-ondeep);
}
.wf-showcase-tabs__tab:focus-visible {
  outline: 2px solid var(--text-ondeep);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
.wf-showcase-tabs__tab.is-active {
  color: var(--text-ondeep);
  font-weight: 700;
  border-bottom-color: var(--accent-call);
}

/* Liens vers les vrais sites, pousses a droite: petits boutons a filet. */
.wf-showcase-bar__links {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing-unit) * 1);
  margin-left: auto;
}
.wf-showcase-bar__link {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 0.6);
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--text-ondeep);
  text-decoration: none;
  padding: calc(var(--spacing-unit) * 0.6) calc(var(--spacing-unit) * 1.2);
  border: 1px solid color-mix(in oklch, var(--text-ondeep) 30%, transparent);
  border-radius: var(--radius-sm);
  transition: background-color var(--motion-duration-hover) var(--motion-ease-out), border-color var(--motion-duration-hover) var(--motion-ease-out);
}
.wf-showcase-bar__link-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}
.wf-showcase-bar__link:hover {
  background: color-mix(in oklch, var(--text-ondeep) 12%, transparent);
  border-color: color-mix(in oklch, var(--text-ondeep) 50%, transparent);
}
.wf-showcase-bar__link:focus-visible {
  outline: 2px solid var(--text-ondeep);
  outline-offset: 2px;
}

/* Guide de style: chaque sous-section dans .wf-container (gouttiere), filet de
 * separation. */
.wf-showcase-styleguide {
  padding-bottom: calc(var(--spacing-unit) * 4);
}
.wf-showcase-styleguide__section {
  padding-block: calc(var(--spacing-unit) * 6);
  border-bottom: var(--line-hair);
  scroll-margin-top: 2rem;
}
.wf-showcase-styleguide__section:first-child {
  padding-top: calc(var(--spacing-unit) * 4);
}
.wf-showcase-styleguide__section:last-child {
  border-bottom: none;
}
.wf-showcase-styleguide__title {
  margin-bottom: calc(var(--spacing-unit) * 4);
}
</style>
