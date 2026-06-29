<script setup lang="ts">
import PageBuilder from '~/components/page-builder/regular/index.vue'
import ArticleBuilder from '~/components/page-builder/article/index.vue'
/* Catch-all sous /blog. Resout les segments: 1 segment = archive de categorie
 * (priorite) ou article sans categorie; 2 segments = article categorise. Article:
 * masthead hero-article + corps (ArticleBuilder) + reliés + bandeau d'appel.
 * Archive: masthead hero-page + filtre + grille filtree. Contenu du payload unique
 * (fail-fast): articles + categories de useBlog(), CTA et en-tete des relies du
 * document blogPage (useBlogPageContent), plus aucun repli fixtures. */
import type { HeroArticleBlock, HeroPageBlock, CtaBandBlock } from '~/types/blocks'
import type { HeroVisual } from '~/content/hero'
import type { ArticleCardData } from '~/composables/useArticles'
import {
  breadcrumbsFor,
  breadcrumbsFromTrail,
  routeLabel,
  routePath,
  type Locale,
  type Crumb
} from '~/config/route-map'

const route = useRoute()
const { locale } = useI18n()
const loc = computed(() => locale.value as Locale)

const segments = computed<string[]>(() => {
  const s = route.params.slug
  return Array.isArray(s) ? (s as string[]) : s ? [String(s)] : []
})

// Slug partage fr/en: le changement de langue garde les memes segments. Les deux
// locales sont declarees INCONDITIONNELLEMENT -> les liens hreflang page-level
// (useLocaleHead seo dans app.vue) pointent toujours fr ET en.
// DIVERGENCE ASSUMEE (constat de revue, doc): le sitemap, lui, est presence-aware
// (alternativesFor dans nuxt.config) et n'emet une alternative que si la
// traduction existe vraiment. Sur le seed actuel (tous les docs apparies fr+en)
// les deux signaux coincident. Pour un doc MONO-LANGUE futur, le hreflang
// page-level pointerait une 404 dans l'autre langue: le repli presence-aware
// page-level exige des slugs cross-langue que useBlog ne charge pas (il requete
// la seule locale courante). Reconciliation au pipeline de payload unique
// (etape 5), qui exposera la presence par langue. Site noindex d'ici la.
const setI18nParams = useSetI18nParams()
setI18nParams({ fr: { slug: segments.value }, en: { slug: segments.value } })

// Contenu du blog depuis le payload unique (fail-fast, aucun repli fixtures).
const { articles, categories } = useBlog()
// Copie du document blogPage (payload): CTA des sorties de conversion (article et
// archive) + en-tete de la section « a lire aussi ». Liens deja resolus en href.
const blogContent = useBlogPageContent()

const match = computed(() => resolveBlogRoute(segments.value, articles.value, categories.value))
if (!match.value) {
  throw createError({ statusCode: 404, statusMessage: 'Article introuvable', fatal: true })
}

const article = computed(() => (match.value?.type === 'article' ? match.value.article : null))
const archive = computed(() => (match.value?.type === 'category' ? match.value : null))

// ── Article ──────────────────────────────────────────────────────────────────
const articleHero = computed<HeroArticleBlock | null>(() => {
  const a = article.value
  if (!a) return null
  const trail: Crumb[] = [{ label: routeLabel('blog', loc.value), to: routePath('blog', loc.value) }]
  if (a.category) trail.push({ label: a.category.title, to: categoryHref(a.category.slug, loc.value) })
  trail.push({ label: a.title })
  const cover: HeroVisual = { src: a.cover.src, alt: a.cover.alt }
  return {
    _type: 'hero-article',
    _key: 'masthead',
    crumbs: breadcrumbsFromTrail(loc.value, ...trail),
    category: a.category ? { label: a.category.title, href: categoryHref(a.category.slug, loc.value) } : undefined,
    title: a.title,
    excerpt: a.excerpt,
    date: a.date,
    dateLabel: formatArticleDate(a.date, loc.value),
    author: authorByline(a.author),
    readingTime: a.readingTime,
    cover
  }
})

const related = computed<ArticleCardData[]>(() => {
  const a = article.value
  if (!a) return []
  return articles.value
    .filter((x) => x.slug !== a.slug && x.category?.slug === a.category?.slug)
    .slice(0, 3)
    .map((x) => toCard(x, loc.value))
})

const articleCta = computed<CtaBandBlock[]>(() => [
  { _type: 'cta-band', _key: 'article-cta', ...blogContent.articleCta }
])

// ── Archive de categorie ─────────────────────────────────────────────────────
const archiveHero = computed<HeroPageBlock | null>(() => {
  const ar = archive.value
  if (!ar) return null
  return {
    _type: 'hero-page',
    _key: 'masthead',
    crumbs: breadcrumbsFor('blog', { label: ar.category.title }, loc.value),
    title: ar.category.title,
    lead: ar.category.description
  }
})
// Archive de categorie en page 1. La garde de build (assertBlogCollections)
// plafonne chaque categorie a ARTICLES_PER_PAGE, donc une seule page: <Pagination>
// reste masque (pas de route /blog/<cat>/page/N). Cable pour la coherence et le
// jour ou la pagination d'archive sera implementee.
const archivePage = computed(() => (archive.value ? paginate(archive.value.articles, 1) : null))
const archiveCards = computed<ArticleCardData[]>(() =>
  archivePage.value ? archivePage.value.items.map((x) => toCard(x, loc.value)) : []
)
const categoryCta = computed<CtaBandBlock[]>(() => [
  { _type: 'cta-band', _key: 'category-cta', ...blogContent.categoryCta }
])

// ── SEO + Schema.org ──────────────────────────────────────────────────────────
// Branche figée au setup (snapshot du match résolu après l'await): article =
// og:type article + métas article:* + nœud Schema.org Article (cover en image,
// publisher, mainEntityOfPage); archive de catégorie = CollectionPage. Les deux
// portent un BreadcrumbList dérivé du même route-map que le fil d'Ariane visible.
// Archives INDEXABLES (contenu propre: titre + description + liste de billets),
// au sitemap; seule la pagination /blog/page/N reste noindex (point 2).
const seoMatch = match.value
if (seoMatch?.type === 'article') {
  const a = seoMatch.article
  const trail: Crumb[] = [{ label: routeLabel('blog', loc.value), to: routePath('blog', loc.value) }]
  if (a.category) trail.push({ label: a.category.title, to: categoryHref(a.category.slug, loc.value) })
  trail.push({ label: a.title })
  usePageSeo({
    title: a.seo?.title ?? a.title,
    description: a.seo?.description ?? a.excerpt,
    type: 'article',
    webPageType: 'ItemPage',
    image: a.seo?.image ?? a.cover.src,
    breadcrumbs: breadcrumbsFromTrail(loc.value, ...trail),
    article: {
      datePublished: a.date,
      dateModified: a.date,
      author: { name: a.author.name, jobTitle: a.author.role, image: a.author.portraitSrc || undefined },
      image: a.cover.src
    }
  })
} else if (seoMatch?.type === 'category') {
  const cat = seoMatch.category
  usePageSeo({
    title: cat.seo?.title ?? `${cat.title}, ${routeLabel('blog', loc.value)}`,
    description: cat.seo?.description ?? cat.description,
    image: cat.seo?.image,
    webPageType: 'CollectionPage',
    breadcrumbs: breadcrumbsFor('blog', { label: cat.title }, loc.value)
  })
}
</script>

<template>
  <!-- Article -->
  <div v-if="article && articleHero">
    <Hero :hero="articleHero" />
    <article class="article">
      <div class="wf-container">
        <div class="article__measure">
          <ArticleBuilder :blocks="article.body" />
        </div>
      </div>
    </article>

    <section v-if="related.length" class="article-related">
      <div class="wf-container">
        <h2 class="article-related__heading wf-h3">{{ blogContent.related.heading }}</h2>
        <ArticleGrid :cards="related" :columns="related.length" heading-level="h3" class="article-related__grid" />
      </div>
    </section>

    <PageBuilder :blocks="articleCta" reveal />
  </div>

  <!-- Archive de categorie -->
  <div v-else-if="archive && archiveHero">
    <Hero :hero="archiveHero" />
    <section class="blog-list">
      <div class="wf-container">
        <FilterBar :categories="categories" :active-slug="archive.category.slug" />
        <ArticleGrid :cards="archiveCards" class="blog-list__grid" />
        <Pagination
          v-if="archivePage"
          :page="archivePage.page"
          :total-pages="archivePage.totalPages"
          :base-path="categoryHref(archive.category.slug, loc)"
        />
      </div>
    </section>
    <PageBuilder :blocks="categoryCta" reveal />
  </div>
</template>

<style scoped>
.article {
  padding-block: clamp(3.6rem, 6vh, 5.6rem) var(--space-block-default);
  background: var(--bg-base);
}
/* Colonne de lecture: mesure contenue, centree. Les blocs d'accent (image,
 * citation, encadre, appel) remplissent cette mesure. */
.article__measure {
  max-width: 72rem;
  margin-inline: auto;
}

.article-related {
  padding-block: var(--space-block-default);
  background: var(--bg-alt);
}
.article-related__grid {
  margin-top: 3.2rem;
}

.blog-list {
  padding-block: clamp(3.2rem, 5vh, 4.8rem) var(--space-block-default);
  background: var(--bg-base);
}
.blog-list__grid {
  margin-top: 3.2rem;
}
</style>
