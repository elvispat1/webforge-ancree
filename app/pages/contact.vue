<script setup lang="ts">
/* Page Contact (multipage). Masthead hero-page (fil d'Ariane + titre + appel),
 * puis le bloc contact (coordonnees + zone de service + formulaire factice). Le
 * bloc garde son titre de section et son accroche (propres au formulaire), mais
 * SANS sur-titre: le masthead porte deja l'eyebrow d'ancrage local. Pas de bandeau
 * d'appel: la page EST le point de conversion. Contenu de demo via fixture, en
 * attendant l'architecture Sanity (et un vrai backend de formulaire). */
import { contactFixture } from '~/content/contact'
import { breadcrumbsFor } from '~/config/route-map'
import type { HeroPageBlock, PageBlock } from '~/types/blocks'

const { t, locale } = useI18n()
const isEn = computed(() => locale.value === 'en')

const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  crumbs: breadcrumbsFor('contact', undefined, locale.value as 'fr' | 'en'),
  eyebrow: t('hero.kicker'),
  title: t('pages.contact_heading'),
  lead: t('pages.contact_lead'),
  cta: { label: t('hero.cta_primary'), href: t('contact.phone_href') }
}))

const blocks = computed<PageBlock[]>(() => [
  { _type: 'contact', _key: 'contact', ...contactFixture(isEn.value), eyebrow: undefined }
])

// ContactPage infere du chemin /contact par le module. Fil d'Ariane = route-map.
usePageSeo({
  title: t('pages.contact_heading'),
  description: t('pages.contact_lead'),
  breadcrumbs: breadcrumbsFor('contact', undefined, locale.value as 'fr' | 'en')
})
</script>

<template>
  <div>
    <Hero :hero="heroBlock" />
    <PageBuilder :blocks="blocks" reveal />
  </div>
</template>
