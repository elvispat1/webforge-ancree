<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Page FAQ (multipage). Masthead hero-page (porte son propre fil d'Ariane, du
 * payload) puis le pageBuilder du document faqPage (bloc faq en accordeon,
 * bandeau d'appel de cloture). La copie et le SEO viennent du document Sanity
 * (payload), composes par la couche composable. Posture fail-fast: aucune
 * fixture en direct. /faq est la SEULE page du site a baliser ses questions
 * (mainEntity du noeud WebPage): la source du balisage est la banque groupee par
 * theme (useFaqByTheme), aplatie dans l'ordre des sections du document. */
import { breadcrumbsFor } from '~/config/route-map'

const { locale } = useI18n()
const wfLocale = locale.value as 'fr' | 'en'

const hero = usePageHero('faq')
const breadcrumbs = breadcrumbsFor('faq', undefined, wfLocale)
const seo = useFixedPage('faq').seo

// Source unique du balisage FAQPage: les questions groupees par theme (memes
// sections, meme ordre que le Studio). Aplaties pour le mainEntity Schema.org.
const groups = useFaqByTheme()

// FAQPage: balise ses questions (mainEntity du noeud WebPage). Meme source et
// meme ordre que la banque rendue.
usePageSeo({
  title: seo.title,
  description: seo.description,
  breadcrumbs,
  faq: groups.value.flatMap((g) => g.items).map((f) => ({ question: f.q, answer: f.aText }))
})

const blocks = useFaqPageBlocks()
</script>

<template>
  <div>
    <Hero :hero="hero" />
    <PageBuilder :blocks="blocks" reveal />
  </div>
</template>
