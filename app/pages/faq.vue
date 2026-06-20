<script setup lang="ts">
/* Page FAQ (multipage). Masthead hero-page (fil d'Ariane + titre + appel), puis
 * le bloc FAQ (accordeon + carte d'appel) et un bandeau d'appel de cloture. Le
 * contenu de demo vient des fixtures en attendant l'architecture Sanity; le bloc
 * porte son propre titre de section (le masthead porte le titre de page), mais
 * SANS sur-titre: le masthead a deja l'eyebrow d'ancrage local. Le bandeau d'appel
 * pointe son geste secondaire vers la vraie page /contact. */
import { faqFixture } from '~/content/faq'
import { ctaBandFixture } from '~/content/cta-band'
import { breadcrumbsFor } from '~/config/route-map'
import type { HeroPageBlock, PageBlock } from '~/types/blocks'

const { t, locale } = useI18n()
const isEn = computed(() => locale.value === 'en')
const localePrefix = computed(() => (isEn.value ? '/en' : ''))

const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  crumbs: breadcrumbsFor('faq', undefined, locale.value as 'fr' | 'en'),
  eyebrow: t('hero.kicker'),
  title: t('pages.faq_heading'),
  lead: t('pages.faq_lead'),
  cta: { label: t('hero.cta_primary'), href: t('contact.phone_href') }
}))

const blocks = computed<PageBlock[]>(() => {
  const cta = ctaBandFixture(isEn.value)
  return [
    { _type: 'faq', _key: 'faq', ...faqFixture(isEn.value), eyebrow: undefined },
    {
      _type: 'cta-band',
      _key: 'cta',
      ...cta,
      secondaryCta: { label: cta.secondaryCta!.label, href: `${localePrefix.value}/contact` }
    }
  ]
})

// FAQPage: /faq est la SEULE page du site a baliser ses questions (mainEntity du
// noeud WebPage). Meme source et meme ordre que l'accordeon rendu (faqFixture).
usePageSeo({
  title: t('pages.faq_heading'),
  description: t('pages.faq_lead'),
  breadcrumbs: breadcrumbsFor('faq', undefined, locale.value as 'fr' | 'en'),
  faq: faqFixture(isEn.value).items.map((it) => ({ question: it.q, answer: it.a }))
})
</script>

<template>
  <div>
    <Hero :hero="heroBlock" />
    <PageBuilder :blocks="blocks" reveal />
  </div>
</template>
