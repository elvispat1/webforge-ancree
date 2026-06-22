<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
/* Blog: page de pagination [n] (n >= 2; la page 1 est /blog nu). Meme masthead +
 * filtre + grille + bandeau d'appel que la liste, sur la tranche n. Contenu du
 * payload unique (fail-fast): articles + categories de useBlog(), heros et copie du
 * document blogPage, CTA de liste (listCta). Contenu mince duplique de la liste ->
 * NOINDEX au niveau page (hors index ET sitemap meme si le site devient
 * indexable). 404 hors borne. Route plus specifique que le catch-all /blog. */
import type { HeroPageBlock, CtaBandBlock } from '~/types/blocks'
import {
  breadcrumbsFromTrail,
  routeLabel,
  routePath,
  type Locale,
  type Crumb
} from '~/config/route-map'

const { t, locale } = useI18n()
const loc = computed(() => locale.value as Locale)
const route = useRoute()

// Numero de page identique entre langues (le segment /page/N ne se traduit pas).
const rawN = String(route.params.n ?? '')
const n = Number(rawN)
const setI18nParams = useSetI18nParams()
setI18nParams({ fr: { n: rawN }, en: { n: rawN } })

const { articles, categories } = useBlog()
const heroContent = usePageHero('blog')
const blogContent = useBlogPageContent()
const pageData = computed(() => paginate(articles.value, n))

// Borne: entier CANONIQUE >= 2 et <= totalPages, sinon 404 (la page 1 vit sur
// /blog nu). String(n) === rawN rejette les alias de Number() ('02', '+2', '1e1',
// ' 2') qui rendraient le meme contenu sous des URLs non canoniques.
if (!Number.isInteger(n) || String(n) !== rawN || n < 2 || n > pageData.value.totalPages) {
  throw createError({ statusCode: 404, statusMessage: 'Page introuvable', fatal: true })
}

const cards = computed(() => pageData.value.items.map((a) => toCard(a, loc.value)))
const pageLabel = computed(() => t('ui.blog.page_label', { n }))

const crumbs = computed<Crumb[]>(() =>
  breadcrumbsFromTrail(
    loc.value,
    { label: routeLabel('blog', loc.value), to: routePath('blog', loc.value) },
    { label: pageLabel.value }
  )
)

const heroBlock = computed<HeroPageBlock>(() => ({
  _type: 'hero-page',
  _key: 'masthead',
  crumbs: crumbs.value,
  title: heroContent.value.title,
  lead: heroContent.value.lead
}))

const ctaBlocks = computed<CtaBandBlock[]>(() => [
  { _type: 'cta-band', _key: 'blog-cta', ...blogContent.listCta }
])

// Titre et description PROPRES a la page (derives du numero, jamais ceux de /blog
// mot pour mot). NOINDEX: contenu mince. CollectionPage + fil d'Ariane.
usePageSeo({
  title: `${routeLabel('blog', loc.value)}, ${pageLabel.value}`,
  description: t('ui.blog.pagination_description', { n }),
  webPageType: 'CollectionPage',
  noindex: true,
  breadcrumbs: crumbs.value
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
    <PageBuilder :blocks="ctaBlocks" reveal />
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
