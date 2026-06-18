<script setup lang="ts">
/* Page dynamique sous /blog. Résout le ou les segments contre l'index connu:
 *  - 1 segment correspondant à une catégorie -> page de catégorie (liste filtrée
 *    des billets, /blog/<categorie>).
 *  - 1 segment (billet sans catégorie) ou 2 segments (catégorie + billet) -> article.
 * Le préfixe « page » (pagination de /blog) est capté par une route plus spécifique.
 * Article: héros article + corps + reliés + CTA, Schema.org Article + BreadcrumbList. */
import ArticlePageBuilder from '~/components/page-builder/article/index.vue'
import PageBuilder from '~/components/page-builder/regular/index.vue'
import { breadcrumbsFromTrail, routeLabel, routePath } from '~/config/route-map'
import type { WfLocale } from '~/sanity/transform'
import type { HeroArticleBlock, HeroPageBlock, PageBlock } from '~/types/blocks'

definePageMeta({ layout: 'default' })

// Copie du document blogPage (payload): CTA des sorties de conversion + en-tête
// des articles reliés. computed: se met à jour in-place en preview.
const blogContent = computed(() => useBlogPageContent())

const route = useRoute()
const locale = useWfLocale()
// Composable appelé inconditionnellement en setup (avant le 404 possible).
const setI18nParams = useSetI18nParams()

const raw = route.params.slug
const segments = (Array.isArray(raw) ? raw : [raw]).map(String).filter(Boolean)

// 1 segment qui correspond à une catégorie = page de catégorie. Sinon, article.
const category = segments.length === 1 ? useCategory(segments[0]!) : undefined
const article = category ? undefined : resolveArticle(segments)

if (!category && !article) {
  throw createError({ statusCode: 404, statusMessage: 'Page introuvable', fatal: true })
}

// Versions RÉACTIVES pour le rendu (suivent les éditions live; repli sur le
// snapshot validé ci-dessus si l'item disparaît du graphe scopé). Le branchement,
// le 404, l'i18n, les fils d'Ariane et le SEO restent sur les snapshots setup-once.
const articleDoc = computed(() => (article ? resolveArticle(segments) ?? article : undefined))
const categoryDoc = computed(() => (category ? useCategory(segments[0]!) ?? category : undefined))

// setI18nParams (T2b): segments équivalents du catch-all pour chaque langue
// (doc.translations du payload): catégorie -> [slug], article -> [catSlug,
// slug] ou [slug]. switchLocalePath et les hreflang du module pointent ainsi
// l'équivalent traduit. Doc sans traduction: repli sur les segments courants
// (alternate dégradé acceptable, démo noindex).
const segmentsFor = (lang: WfLocale): string[] => {
  if (category) {
    return [category.translations?.find((t) => t.lang === lang)?.slug ?? category.slug]
  }
  if (article) {
    const translation = article.translations?.find((t) => t.lang === lang)
    const slug = translation?.slug ?? article.slug
    const catSlug = translation?.catSlug ?? article.category
    return catSlug ? [catSlug, slug] : [slug]
  }
  return segments
}
setI18nParams({ fr: { slug: segmentsFor('fr') }, en: { slug: segmentsFor('en') } })

// ── Page de catégorie ────────────────────────────────────────────────────────
// Liste complète des billets de la catégorie (les catégories sont petites: une
// seule page, paginate renvoie totalPages = 1, la pagination ne s'affiche pas).
const catData = category ? paginate(useArticles({ category: category.slug }), 1) : null
// articleCard résout la catégorie en titre affichable (jamais le slug brut). Les
// CARTES lisent la liste LIVE (réactif en preview: ajout/édition d'article suivi);
// catData ne sert qu'à la méta de pagination (page/total), figée au setup (les
// catégories tiennent sur une seule page).
const catCards = computed(() => (category ? useArticles({ category: category.slug }) : []).map(articleCard))
// La page calcule les options du filtre (BlogListSection est une vue pure).
// Appel inconditionnel: les composables se consomment en setup synchrone,
// jamais derrière un ternaire (la branche article n'en a juste pas besoin).
const filterOptions = useBlogFilterOptions()
// Maillon « Blogue » et chemins localisés (T2b): libellé + base /blog (ou
// /en/blog) via le route-map, locale courante.
const blogBase = routePath('blog', locale)
const blogCrumb = { label: routeLabel('blog', locale), to: blogBase }
const categoryBreadcrumbs = category
  ? breadcrumbsFromTrail(locale, blogCrumb, { label: category.title })
  : []

// ── Article ────────────────────────────────────────────────────────────────
const articleCategory = article?.category ? useCategory(article.category) : undefined
const related = computed(() => article ? useRelatedArticles(article, 2).map(articleCard) : [])
// Chip de catégorie du héros article, vers l'archive localisée.
const articleCategoryChip = articleCategory
  ? { label: articleCategory.title, to: `${blogBase}/${articleCategory.slug}` }
  : undefined
const articleBreadcrumbs = !article
  ? []
  : articleCategory
    ? breadcrumbsFromTrail(
      locale,
      blogCrumb,
      { label: articleCategory.title, to: `${blogBase}/${articleCategory.slug}` },
      { label: article.title }
    )
    : breadcrumbsFromTrail(locale, blogCrumb, { label: article.title })

// SEO + Schema selon la branche. Article: og:type article + métas article:* et
// nœud Schema.org Article (image, mainEntityOfPage, publisher) via usePageSeo.
if (category) {
  usePageSeo({
    // Archives de catégorie INDEXABLES (politique blog, décision Charles): chaque
    // page porte un contenu propre (titre + description de la catégorie via le
    // héros) plus la liste de ses billets, donc pas de thin content. Elles
    // figurent au sitemap (nuxt.config SITEMAP_DYNAMIC_URLS). Seule la pagination
    // /blog/page/N reste noindex et hors sitemap.
    title: `${category.title}, ${routeLabel('blog', locale)}`,
    description: category.description,
    webPageType: 'CollectionPage',
    breadcrumbs: categoryBreadcrumbs
  })
} else if (article) {
  usePageSeo({
    title: article.title,
    description: article.excerpt,
    type: 'article',
    webPageType: 'ItemPage',
    image: article.cover.src,
    breadcrumbs: articleBreadcrumbs,
    article: {
      datePublished: article.date,
      dateModified: article.date,
      author: article.author,
      image: article.cover.src
    }
  })
}

const ctaCategory = computed<PageBlock[]>(() => [
  { _type: 'cta-band', _key: 'blog-cat-cta', ...blogContent.value.categoryCta }
])
const ctaArticle = computed<PageBlock[]>(() => [
  { _type: 'cta-band', _key: 'article-cta', ...blogContent.value.articleCta }
])

// Héros « page » de la catégorie, composé depuis le document catégorie (pas saisi
// au CMS). Suit le doc live (categoryDoc ?? category), même donnée qu'avant. null
// hors branche catégorie (le template ne le lit que sous v-if="category").
const categoryHeroBlock = computed<HeroPageBlock | null>(() => {
  const c = categoryDoc.value ?? category
  if (!c) return null
  return {
    _type: 'hero-page',
    _key: `hero-${c.slug}`,
    title: c.title,
    lead: c.description
  }
})

// Héros « article », composé depuis le document article (pas saisi au CMS). Suit
// le doc live (articleDoc ?? article); chip de catégorie et fil d'Ariane calculés
// au setup. null hors branche article (le template ne le lit que sous
// v-else-if="article").
const articleHeroBlock = computed<HeroArticleBlock | null>(() => {
  const a = articleDoc.value ?? article
  if (!a) return null
  return {
    _type: 'hero-article',
    _key: `hero-${a.slug}`,
    category: articleCategoryChip,
    title: a.title,
    date: a.date,
    author: a.author,
    readingTime: a.readingTime,
    cover: a.cover
  }
})
</script>

<template>
  <!-- Page de catégorie: héros + liste filtrée (le filtre actif reflète la route). -->
  <template v-if="category && catData">
    <Hero v-if="categoryHeroBlock" :hero="categoryHeroBlock" :breadcrumbs="categoryBreadcrumbs" />
    <!-- Cartes en h2: la liste vit directement sous le h1 du héros (pas de saut h1 -> h3). -->
    <BlogListSection
      :cards="catCards"
      :page="catData.page"
      :total-pages="catData.totalPages"
      :total="catData.total"
      :filter-options="filterOptions"
      :base-path="`${blogBase}/${category.slug}`"
      :active-category="category.slug"
      :heading-level="2"
    />
    <PageBuilder :blocks="ctaCategory" reveal />
  </template>

  <!-- Article. -->
  <template v-else-if="article">
    <Hero v-if="articleHeroBlock" :hero="articleHeroBlock" :breadcrumbs="articleBreadcrumbs" />

    <article class="wf-section wf-article">
      <div class="wf-container">
        <div class="wf-article-body">
          <ArticlePageBuilder :blocks="(articleDoc ?? article).body" />
        </div>
      </div>
    </article>

    <section v-if="related.length" class="wf-section wf-article-related">
      <div class="wf-container">
        <div class="wf-section-head wf-article-related-head">
          <h2 class="wf-h3">{{ blogContent.related.heading }}</h2>
        </div>
        <ArticleGrid :articles="related" :columns="2" />
      </div>
    </section>

    <PageBuilder :blocks="ctaArticle" reveal />
  </template>
</template>
