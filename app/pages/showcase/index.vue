<script setup lang="ts">
/* /showcase — guide client-facing de tout ce qu'un site WebForge multipage
 * comprend. Navigation reprise de l'outil dev d'origine: une BARRE D'ONGLETS
 * sombre en haut (changer de section: héros, blocs, formulaire, système visuel)
 * et une BARRE LATÉRALE SgNav (ancres de la section active). Les onglets
 * basculent la section affichée côté client -> une seule route bilingue,
 * noindex, prérendue (zéro complexité de routage). */
import SgNav from '~/components/showcase/styleguide/nav.vue'
import BlockShowcase from '~/components/showcase/styleguide/block-showcase.vue'
import SgForms from '~/components/showcase/styleguide/forms.vue'
import SgTypography from '~/components/showcase/styleguide/typography.vue'
import SgTokens from '~/components/showcase/styleguide/tokens.vue'
import SgAtoms from '~/components/showcase/styleguide/atoms.vue'
import { routePath, onePagerPath } from '~/config/route-map'

const { t } = useI18n()

definePageMeta({ layout: 'showcase' })

usePageSeo({
  title: t('showcase.seo.title'),
  description: t('showcase.seo.description'),
  titleTemplate: '%s, WebForge Minimaliste',
  noindex: true
})

const catalog = useBlockCatalog()
const heros = catalog.find((c) => c.id === 'heros')!
const reguliers = catalog.find((c) => c.id === 'reguliers')!
const articles = catalog.find((c) => c.id === 'articles')!

// Onglets primaires (barre sombre): icône + libellé i18n, comme l'ancien DevTabs.
const tabs = [
  { id: 'styleguide', label: t('showcase.nav.styleguide'), icon: 'lucide:palette' },
  { id: 'heros', label: t('showcase.nav.heros'), icon: 'lucide:panel-top' },
  { id: 'reguliers', label: t('showcase.nav.reguliers'), icon: 'lucide:layout-grid' },
  { id: 'articles', label: t('showcase.nav.articles'), icon: 'lucide:newspaper' },
  { id: 'formulaire', label: t('showcase.nav.formulaire'), icon: 'lucide:text-cursor-input' }
] as const
type TabId = (typeof tabs)[number]['id']

const activeTab = ref<TabId>('styleguide')

// Ancres de la barre latérale, par section active.
const formSections = [
  { id: 'champs', label: t('showcase.styleguide.forms.section_champs') },
  { id: 'selection', label: t('showcase.styleguide.forms.section_selection') },
  { id: 'saisie', label: t('showcase.styleguide.forms.section_saisie') },
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

// Liens vers les vrais sites de la démo (multipage + one-pager), localisés:
// FR -> '/' et '/one-pager', EN -> '/en' et '/en/one-pager'.
const locale = useWfLocale()
const multipageHref = routePath('home', locale)
const onepagerHref = onePagerPath('index', locale)
</script>

<template>
  <div class="wf-showcase">
    <!-- Barre sombre: marque + onglets (blanc sur noir, icônes), comme avant. -->
    <header class="wf-showcase-bar">
      <div class="wf-container wf-showcase-bar__inner">
        <p class="wf-showcase-bar__brand">
          <span class="wf-showcase-bar__brand-name">WebForge</span>
          <span class="wf-showcase-bar__brand-dash">-</span>
          <span class="wf-showcase-bar__brand-family">Minimaliste</span>
        </p>
        <nav class="wf-showcase-tabs" :aria-label="t('showcase.intro.title')">
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
        <!-- Liens vers les vrais sites de la démo (à droite): on regarde le
             guide, puis on clique pour voir le rendu réel. -->
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

    <!-- SgNav (ancres de la section active) + contenu. Les 5 panneaux coexistent
         en v-show (rendus au build -> leurs images cuisent leurs variantes IPX,
         ex. about.jpg du poster vidéo; seul l'onglet actif est visible). SgNav
         ré-observe le scroll-spy quand navItems change (cf. nav.vue). -->
    <SgNav :items="navItems" :label="navLabel">
      <h1 class="wf-sr-only">{{ t('showcase.seo.title') }}</h1>

      <div v-show="activeTab === 'heros'"><BlockShowcase :category="heros" /></div>
      <div v-show="activeTab === 'reguliers'"><BlockShowcase :category="reguliers" /></div>
      <div v-show="activeTab === 'articles'"><BlockShowcase :category="articles" /></div>
      <div v-show="activeTab === 'formulaire'"><SgForms /></div>
      <div v-show="activeTab === 'styleguide'" class="wf-showcase-styleguide">
        <section id="typographie" class="wf-showcase-styleguide__section">
          <div class="wf-container">
            <h2 class="wf-h2 wf-showcase-styleguide__title">{{ t('showcase.styleguide.sections.typography') }}</h2>
            <SgTypography />
          </div>
        </section>
        <section id="tokens" class="wf-showcase-styleguide__section">
          <div class="wf-container">
            <h2 class="wf-h2 wf-showcase-styleguide__title">{{ t('showcase.styleguide.sections.tokens') }}</h2>
            <SgTokens />
          </div>
        </section>
        <section id="composants" class="wf-showcase-styleguide__section">
          <div class="wf-container">
            <h2 class="wf-h2 wf-showcase-styleguide__title">{{ t('showcase.styleguide.sections.components') }}</h2>
            <SgAtoms />
          </div>
        </section>
      </div>
    </SgNav>
  </div>
</template>

<style scoped>
/* Barre sombre d'onglets (reprise de l'ancien outil dev): marque + onglets,
 * blanc sur noir. Tokens seulement. */
.wf-showcase-bar {
  background: var(--black);
  color: var(--bg-base);
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
  font-size: 1.3rem;
  display: inline-flex;
  align-items: baseline;
  gap: 0.5em;
}
.wf-showcase-bar__brand-name,
.wf-showcase-bar__brand-family {
  font-weight: 600;
  letter-spacing: -0.01em;
}
.wf-showcase-bar__brand-dash {
  color: color-mix(in oklch, var(--bg-base) 50%, transparent);
}

/* Onglets: icône + libellé, muté sur noir; actif = clair + gras + filet accent. */
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
  font-size: 1.4rem;
  color: color-mix(in oklch, var(--bg-base) 60%, transparent);
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: calc(var(--spacing-unit) * 1) 0;
  cursor: pointer;
  transition: color 150ms ease, border-color 150ms ease;
}
.wf-showcase-tabs__icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}
.wf-showcase-tabs__tab:hover {
  color: var(--bg-base);
}
.wf-showcase-tabs__tab:focus-visible {
  outline: 2px solid var(--bg-base);
  outline-offset: 2px;
  border-radius: var(--radius);
}
.wf-showcase-tabs__tab.is-active {
  color: var(--bg-base);
  font-weight: 600;
  /* Accent désaturé pour rester visible sur noir. */
  border-bottom-color: color-mix(in oklch, var(--accent-1) 55%, var(--bg-base));
}

/* Liens vers les vrais sites (multipage + one-pager), poussés à droite: petits
 * boutons à filet, blanc sur noir, icône + texte. */
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
  font-size: 1.3rem;
  color: var(--bg-base);
  text-decoration: none;
  padding: calc(var(--spacing-unit) * 0.6) calc(var(--spacing-unit) * 1.2);
  border: 1px solid color-mix(in oklch, var(--bg-base) 30%, transparent);
  border-radius: var(--radius);
  transition: background-color 150ms ease, border-color 150ms ease;
}
.wf-showcase-bar__link-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}
.wf-showcase-bar__link:hover {
  background: color-mix(in oklch, var(--bg-base) 12%, transparent);
  border-color: color-mix(in oklch, var(--bg-base) 50%, transparent);
}
.wf-showcase-bar__link:focus-visible {
  outline: 2px solid var(--bg-base);
  outline-offset: 2px;
}

/* Section « système visuel »: chaque sous-section dans .wf-container (gouttière),
 * filet de séparation. Corrige le contenu collé sur les côtés. */
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
