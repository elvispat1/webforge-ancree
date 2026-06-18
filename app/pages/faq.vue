<script setup lang="ts">
/* FAQ. Héros de page + banque complète groupée par thème + bande CTA (le
 * pageBuilder du document faqPage). Balisage Schema.org FAQPage (une seule
 * entité pour toute la page) via usePageSeo (option faq). */
import PageBuilder from '~/components/page-builder/regular/index.vue'
import { breadcrumbsFor } from '~/config/route-map'

definePageMeta({ layout: 'default' })

const locale = useWfLocale()
const hero = usePageHero('faq')
const breadcrumbs = breadcrumbsFor('faq', undefined, locale)
const seo = useFixedPage('faq').seo

const groups = useFaqByTheme()

// Schema.org FAQPage: /faq est la SEULE page du site à baliser ses questions
// (mainEntity du nœud WebPage, via le graphe du module). Même source et même
// ordre que le listing rendu: les groupes issus de faqPage.sections.
usePageSeo({
  title: seo.title,
  description: seo.description,
  breadcrumbs,
  faq: groups.value.flatMap((g) => g.items).map((f) => ({ question: f.q, answer: f.a }))
})
// Thèmes pour le rail (libellé + ancre). Dérivé des groupes, ordre conservé.
// computed: le rail se met à jour in-place quand les thèmes/sections sont édités.
const themes = computed(() => groups.value.map((g) => ({ slug: g.slug, label: g.theme })))

const ctaBlocks = useFaqPageBlocks()
</script>

<template>
  <Hero :hero="hero" :breadcrumbs="breadcrumbs" />

  <section class="wf-section">
    <div class="wf-container">
      <div class="section-grid wf-faq-page-grid">
        <ThemeRail :themes="themes" />

        <div class="wf-faq-page-body">
          <div
            v-for="group in groups"
            :id="`faq-theme-${group.slug}`"
            :key="group.slug"
            :data-slug="group.slug"
            class="wf-faq-page-group"
          >
            <h2 class="wf-caption wf-faq-page-theme">{{ group.theme }}</h2>
            <Accordion
              :items="group.items.map((i) => ({ title: i.q, content: i.a }))"
              :heading-level="3"
            />
          </div>
        </div>
      </div>
    </div>
  </section>

  <PageBuilder :blocks="ctaBlocks" reveal />
</template>
