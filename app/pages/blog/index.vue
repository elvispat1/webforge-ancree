<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Liste du blog (/blog). Masthead hero-page, puis la grille d'articles DIRECTEMENT
 * (filtre + cartes), comme les pages d'archive et de pagination; le pageBuilder suit
 * SOUS la liste (editorial de contexte + maillage, temoignages, bandeau d'appel,
 * contact). Le visiteur atteint les articles sans barrage d'intro. Contenu du payload
 * unique (fail-fast): articles + categories de useBlog(), heros et pageBuilder du
 * document blogPage, aucun repli fixtures. */
import type { HeroPageBlock } from '~/types/blocks'
import { breadcrumbsFor, routePath, type Locale } from '~/config/route-map'

const { locale } = useI18n()
const loc = computed(() => locale.value as Locale)

const { articles, categories } = useBlog()
const heroContent = usePageHero('blog')
// Page 1 de la liste. La pagination ne s'affiche qu'au-dela d'ARTICLES_PER_PAGE
// (la demo a 3 articles -> une seule page, <Pagination> masque). Les pages
// suivantes vivent sur /blog/page/[n].
const pageData = computed(() => paginate(articles.value, 1))
const cards = computed(() => pageData.value.items.map((a) => toCard(a, loc.value)))

// Heros de page lu du document blogPage (title/lead), fil d'Ariane derive du
// route-map (source unique du chemin), comme le port de Minimaliste.
const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  crumbs: breadcrumbsFor('blog', undefined, loc.value),
  title: heroContent.value.title,
  lead: heroContent.value.lead
}))

// Tout le pageBuilder suit la grille: l'editorial de contexte et le maillage SEO
// vivent SOUS la liste (pas en barrage devant), suivis des temoignages, du bandeau
// d'appel et du contact.
const blogBlocks = useBlogPageBlocks()

// Liste du blog: CollectionPage indexable + BreadcrumbList (route-map). Le nœud
// Article n'est porté que par les pages d'article (catch-all). Schema.org et
// métas via usePageSeo, source unique du SEO de page. Title/description du SEO du
// document blogPage (replis deja faits au transform).
const seo = useFixedPage('blog').seo
usePageSeo({
  title: seo.title,
  description: seo.description,
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
        <Pagination :page="pageData.page" :total-pages="pageData.totalPages" :base-path="routePath('blog', loc)" />
      </div>
    </section>
    <PageBuilder :blocks="blogBlocks" reveal />
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
