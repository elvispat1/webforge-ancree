<script setup lang="ts">
/* Page À propos (multipage). Masthead hero-page (fil d'Ariane + titre + appel),
 * puis le bloc about (media-texte en zigzag: photo d'equipe, recit, chiffres de
 * confiance) et un bandeau d'appel de cloture. Le bloc garde son titre de section
 * editorial (le masthead porte le titre de page), SANS sur-titre: le masthead a
 * deja l'eyebrow d'ancrage local. Contenu de demo via fixtures, en attendant
 * l'architecture Sanity. Le geste secondaire du bandeau mene a la vraie /contact. */
import { aboutFixture } from '~/content/about'
import { ctaBandFixture } from '~/content/cta-band'
import { breadcrumbsFor } from '~/config/route-map'
import type { HeroPageBlock, PageBlock } from '~/types/blocks'

const { t, locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const localePrefix = computed(() => (isEn.value ? '/en' : ''))

const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  crumbs: breadcrumbsFor('about', undefined, locale.value as 'fr' | 'en'),
  eyebrow: t('hero.kicker'),
  title: t('pages.about_heading'),
  lead: t('pages.about_lead'),
  cta: { label: t('hero.cta_primary'), href: t('contact.phone_href') }
}))

const blocks = computed<PageBlock[]>(() => {
  const cta = ctaBandFixture(isEn.value)
  return [
    { _type: 'about', _key: 'about', ...aboutFixture(isEn.value), eyebrow: undefined },
    {
      _type: 'cta-band',
      _key: 'cta',
      ...cta,
      secondaryCta: { label: cta.secondaryCta!.label, href: `${localePrefix.value}/contact` }
    }
  ]
})

// AboutPage explicite: l'inference du module ne reconnait pas le chemin francais
// (/a-propos). Fil d'Ariane = meme source route-map que le masthead visible.
usePageSeo({
  title: t('pages.about_heading'),
  description: t('pages.about_lead'),
  webPageType: 'AboutPage',
  breadcrumbs: breadcrumbsFor('about', undefined, locale.value as 'fr' | 'en')
})
</script>

<template>
  <div>
    <Hero :hero="heroBlock" />
    <PageBuilder :blocks="blocks" reveal />
  </div>
</template>
