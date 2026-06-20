<script setup lang="ts">
/* Vitrine de la famille Ancree: guide de style (couleurs, typo, boutons) et
 * bibliotheque de blocs rendus EN VRAI a partir des fixtures de la home. Page
 * interne, non indexee. Calquee sur la structure de la vitrine Minimaliste, peau
 * Ancree. Chaque bloc est rendu dans sa propre scene .wf-site (contexte de
 * requete de conteneur), via le meme block-map que la page-builder de prod. */
import { regularBlockMap } from '~/components/page-builder/block-map'
import { breadcrumbsFor } from '~/config/route-map'
import type { HeroPageBlock } from '~/types/blocks'

definePageMeta({ layout: 'showcase' })

const { t, locale } = useI18n()
// Vitrine interne, NOINDEX (point niveau page + exclue du sitemap). Gabarit de
// titre local « %s, WebForge Ancrée » (la marque de la famille, pas du demo).
usePageSeo({
  title: t('showcase.subtitle'),
  description: t('showcase.lead'),
  titleTemplate: '%s, WebForge Ancrée',
  noindex: true
})

const heroSample = useHeroContent()

// Masthead de page, echantillon de catalogue (fil d'Ariane reel, appel tel:
// non crawle par le link checker).
const heroPageSample = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'hero-page',
  crumbs: breadcrumbsFor('services', undefined, locale.value as 'fr' | 'en'),
  eyebrow: t('hero.kicker'),
  title: t('pages.services_heading'),
  lead: t('pages.services_lead'),
  cta: { label: t('hero.cta_primary'), href: t('contact.phone_href') }
}))

/* Echantillons = fixtures de la home. On neutralise les liens du bloc services:
 * le fixture pointe vers des slugs de parasites sans page, ce qui casserait le
 * link checker du build statique. Les liens de villes (pages reelles) restent. */
type AnyBlock = Record<string, unknown>
const sampleBlocks = (useHomeBlocks() as AnyBlock[]).map((b) =>
  b._type === 'services'
    ? {
        ...b,
        ctaHref: undefined,
        items: ((b.items as AnyBlock[]) ?? []).map((it) => ({ ...it, href: undefined }))
      }
    : b
)
function blockComp(type: string) {
  return regularBlockMap[type as keyof typeof regularBlockMap]
}

const swatches = [
  { token: '--navy', label: 'Bleu nuit' },
  { token: '--blue', label: 'Bleu confiance' },
  { token: '--amber', label: 'Ambre, l’appel' },
  { token: '--slate', label: 'Ardoise' },
  { token: '--paper', label: 'Papier, le fond' },
  { token: '--bg-alt', label: 'Fond alterné' },
  { token: '--bg-deep', label: 'Bande forte' }
]
const typeScale = ['wf-h1', 'wf-h2', 'wf-h3', 'wf-h4', 'wf-h5', 'wf-body-1', 'wf-body-2', 'wf-body-3', 'wf-caption']

// Sections pour la navigation scroll-spy: le systeme visuel, le heros, puis chaque bloc.
const sections = [
  { id: 'sys', label: t('showcase.section_system') },
  { id: 'hero-home', label: t('showcase.hero_home') },
  { id: 'hero-page', label: t('showcase.hero_page') },
  ...sampleBlocks.map((b) => ({ id: b._type as string, label: b._type as string }))
]
</script>

<template>
  <article class="sg">
    <ShowcaseNav :items="sections" />

    <header class="sg-intro wf-container">
      <p class="sg-intro__kicker wf-caption">{{ t('showcase.title') }}</p>
      <h1 class="sg-intro__title wf-h1">{{ t('showcase.subtitle') }}</h1>
      <p class="sg-intro__lead wf-body-1 wf-text-muted">{{ t('showcase.lead') }}</p>
    </header>

    <section id="sys" class="sg-sys wf-container">
      <h2 class="sg-sys__title wf-h3">{{ t('showcase.section_system') }}</h2>

      <h3 class="sg-sub wf-h5">{{ t('showcase.colors') }}</h3>
      <ul class="sg-swatches">
        <li v-for="c in swatches" :key="c.token" class="sg-swatch">
          <span class="sg-swatch__chip" :style="{ background: `var(${c.token})` }" />
          <span class="sg-swatch__label">{{ c.label }}</span>
          <code class="sg-swatch__token">{{ c.token }}</code>
        </li>
      </ul>

      <h3 class="sg-sub wf-h5">{{ t('showcase.typography') }}</h3>
      <ul class="sg-type">
        <li v-for="cls in typeScale" :key="cls" class="sg-type__row">
          <span :class="cls">{{ t('showcase.type_sample') }}</span>
          <code class="sg-type__meta">.{{ cls }}</code>
        </li>
      </ul>

      <h3 class="sg-sub wf-h5">{{ t('showcase.buttons') }}</h3>
      <div class="sg-btns">
        <Button variant="call" icon="lucide:phone">{{ t('hero.cta_primary') }}</Button>
        <Button variant="primary" icon="lucide:arrow-right">{{ t('ui.learn_more') }}</Button>
        <Button variant="ghost" :icon="false">{{ t('nav.contact') }}</Button>
      </div>
      <div class="sg-btns sg-btns--dark">
        <Button variant="call" icon="lucide:phone">{{ t('hero.cta_primary') }}</Button>
        <Button variant="ghost" tone="ondark" :icon="false">{{ t('nav.contact') }}</Button>
      </div>
    </section>

    <h2 class="sg-gallery-title wf-container wf-h3">{{ t('showcase.blocks') }}</h2>

    <ShowcaseStage id="hero-home" :label="t('showcase.hero_home')" type="hero-home">
      <Hero :hero="heroSample" />
    </ShowcaseStage>

    <ShowcaseStage id="hero-page" :label="t('showcase.hero_page')" type="hero-page">
      <Hero :hero="heroPageSample" />
    </ShowcaseStage>

    <ShowcaseStage v-for="b in sampleBlocks" :id="(b._type as string)" :key="(b._key as string)" :label="(b._type as string)" :type="(b._type as string)">
      <component :is="blockComp(b._type as string)" v-bind="b" />
    </ShowcaseStage>
  </article>
</template>

<style scoped>
.sg {
  padding-bottom: 8rem;
}

/* Toute scene de la vitrine montre l'etat FINAL des blocs: on desamorce la
 * signature d'entree (qui se joue en prod) pour un guide lisible d'emblee. */
.sg :deep([data-reveal]),
.sg :deep([data-reveal] *),
.sg :deep([data-reveal-stagger]),
.sg :deep([data-reveal-stagger] *) {
  opacity: 1 !important;
  transform: none !important;
}

.sg-intro {
  padding-block: 6rem 4rem;
}
.sg-intro__kicker {
  color: var(--text-muted);
}
.sg-intro__title {
  margin-top: 1.2rem;
  max-width: 20ch;
}
.sg-intro__lead {
  margin-top: var(--space-title-lead);
  max-width: 60ch;
}

.sg-sys {
  padding-block: 2rem 5rem;
}
.sg-sys__title {
  padding-bottom: 2.4rem;
  border-bottom: var(--line-hair);
}
.sg-sub {
  margin: 4rem 0 1.8rem;
  color: var(--text-muted);
}

.sg-swatches {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 2rem;
}
.sg-swatch {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.sg-swatch__chip {
  aspect-ratio: 3 / 2;
  border-radius: var(--radius);
  box-shadow: var(--elev-low);
  border: var(--line-soft);
}
.sg-swatch__label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.5rem;
}
.sg-swatch__token {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  color: var(--text-muted);
}

.sg-type {
  list-style: none;
  margin: 0;
  padding: 0;
}
.sg-type__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 2.4rem;
  padding-block: 1.8rem;
  border-bottom: var(--line-hair);
}
.sg-type__meta {
  flex: none;
  font-family: var(--font-mono);
  font-size: 1.2rem;
  color: var(--text-muted);
}

.sg-btns {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.4rem;
  margin-top: 1.6rem;
}
.sg-btns--dark {
  padding: 2.4rem;
  background: var(--bg-deep);
  border-radius: var(--radius);
}

.sg-gallery-title {
  margin-top: 5rem;
  margin-bottom: 1rem;
}
</style>
