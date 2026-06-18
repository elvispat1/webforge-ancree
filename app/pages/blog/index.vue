<script setup lang="ts">
/* Blog: liste paginée de tous les articles. Page 1 (les pages suivantes vivent à
 * /blog/page/[n]). Héros de page + nav de catégories + grille + pagination + CTA.
 * Copie et SEO du document blogPage (payload). */
import PageBuilder from '~/components/page-builder/regular/index.vue'
import { breadcrumbsFor, routePath } from '~/config/route-map'
import type { PageBlock } from '~/types/blocks'

definePageMeta({ layout: 'default' })

const locale = useWfLocale()
const hero = usePageHero('blog')
const breadcrumbs = breadcrumbsFor('blog', undefined, locale)
// Base localisée de la section (T2b): /blog en FR, /en/blog en EN.
const blogBase = routePath('blog', locale)
const blogContent = useBlogPageContent()
const seo = useFixedPage('blog').seo

usePageSeo({
  title: seo.title,
  description: seo.description,
  webPageType: 'CollectionPage',
  breadcrumbs
})

// computed: la liste paginée se met à jour in-place en preview (useArticles reste
// plain, appelé dans le computed sa lecture du payload est suivie).
const pageData = computed(() => paginate(useArticles(), 1))
// articleCard résout la catégorie en titre affichable (jamais le slug brut).
const cards = computed(() => pageData.value.items.map(articleCard))
// La page calcule les options du filtre (BlogListSection est une vue pure).
const filterOptions = useBlogFilterOptions()

const ctaBlocks: PageBlock[] = [
  { _type: 'cta-band', _key: 'blog-cta', ...blogContent.listCta }
]
</script>

<template>
  <Hero :hero="hero" :breadcrumbs="breadcrumbs" />
  <!-- Cartes en h2: la liste vit directement sous le h1 du héros (pas de saut h1 -> h3). -->
  <BlogListSection
    :cards="cards"
    :page="pageData.page"
    :total-pages="pageData.totalPages"
    :total="pageData.total"
    :filter-options="filterOptions"
    :base-path="blogBase"
    :heading-level="2"
  />
  <PageBuilder :blocks="ctaBlocks" reveal />
</template>
