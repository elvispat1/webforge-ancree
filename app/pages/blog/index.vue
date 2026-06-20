<script setup lang="ts">
/* Liste du blog (/blog). Masthead hero-page + filtre de categories (route-based)
 * + grille d'articles. Contenu en fixtures pour l'instant (le fetch Sanity au
 * build s'y branchera sur le moule de services/index.vue). */
import type { HeroPageBlock } from '~/types/blocks'
import { breadcrumbsFor, type Locale } from '~/config/route-map'

const { t, locale } = useI18n()
const loc = computed(() => locale.value as Locale)

const { articles, categories } = await useBlog()
const cards = computed(() => articles.value.map((a) => toCard(a, loc.value)))

const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  crumbs: breadcrumbsFor('blog', undefined, loc.value),
  title: t('pages.blog_heading'),
  lead: t('pages.blog_lead')
}))

// Liste du blog: CollectionPage indexable + BreadcrumbList (route-map). Le nœud
// Article n'est porté que par les pages d'article (catch-all). Schema.org et
// métas via usePageSeo, source unique du SEO de page (port de Minimaliste).
usePageSeo({
  title: t('pages.blog_heading'),
  description: t('pages.blog_lead'),
  webPageType: 'CollectionPage',
  breadcrumbs: breadcrumbsFor('blog', undefined, loc.value)
})
</script>

<template>
  <div>
    <Hero :hero="heroBlock" />
    <section class="blog-list">
      <div class="wf-container">
        <FilterBar :categories="categories" />
        <ArticleGrid :cards="cards" class="blog-list__grid" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.blog-list {
  padding-block: clamp(3.2rem, 5vh, 4.8rem) var(--space-block-default);
  background: var(--bg-base);
}
.blog-list__grid {
  margin-top: 3.2rem;
}
</style>
