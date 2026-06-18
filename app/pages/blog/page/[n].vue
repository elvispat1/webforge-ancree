<script setup lang="ts">
/* Blog: page de pagination [n] (n >= 2; la page 1 est /blog). */
import PageBuilder from '~/components/page-builder/regular/index.vue'
import { breadcrumbsFromTrail, routeLabel, routePath } from '~/config/route-map'
import type { PageBlock } from '~/types/blocks'

definePageMeta({ layout: 'default' })

const route = useRoute()
const n = Number(route.params.n)
// computed: la liste paginée se met à jour in-place en preview. La garde 404 lit
// la valeur courante au setup (pageData.value), suffisante pour le borne de page.
const pageData = computed(() => paginate(useArticles(), n))
if (!Number.isInteger(n) || n < 2 || n > pageData.value.totalPages) {
  throw createError({ statusCode: 404, statusMessage: 'Page introuvable', fatal: true })
}

const hero = usePageHero('blog')
const blogContent = useBlogPageContent()
const locale = useWfLocale()
// Base localisée de la section (T2b): /blog en FR, /en/blog en EN.
const blogBase = routePath('blog', locale)
const breadcrumbs = breadcrumbsFromTrail(
  locale,
  { label: routeLabel('blog', locale), to: blogBase },
  { label: `Page ${n}` }
)

// Titre et description propres à la page de pagination (dérivés du numéro de
// page: ils restent calculés en code, jamais ceux de /blog mot pour mot).
// Localisés (T2b): libellé de section du route-map + gabarit i18n (nom de
// site interpolé depuis le payload, jamais en dur dans les locales).
const { t } = useI18n()
// Snapshot: `site` ne sert qu'à la description SEO (head, non réactif).
const site = useContent('site').value
usePageSeo({
  title: `${routeLabel('blog', locale)}, page ${n}`,
  description: t('ui.blog.pagination_description', { site: site.brand.name, n }),
  webPageType: 'CollectionPage',
  // Pages de pagination noindex au niveau page (contenu mince, dupliqué de la
  // liste): exclues de l'index ET du sitemap même quand site.indexable est true.
  noindex: true,
  breadcrumbs
})

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
