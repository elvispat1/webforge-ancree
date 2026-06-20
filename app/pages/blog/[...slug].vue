<script setup lang="ts">
/* Catch-all sous /blog. Resout les segments: 1 segment = archive de categorie
 * (priorite) ou article sans categorie; 2 segments = article categorise. Article:
 * masthead hero-article + corps (ArticleBuilder) + reliés + bandeau d'appel.
 * Archive: masthead hero-page + filtre + grille filtree. Contenu en fixtures pour
 * l'instant (le fetch Sanity au build s'y branchera). */
import type { HeroArticleBlock, HeroPageBlock, CtaBandBlock } from '~/types/blocks'
import type { HeroVisual } from '~/content/hero'
import type { ArticleCardData } from '~/composables/useArticles'
import { articlesFixture } from '~/content/article'
import { ctaBandFixture } from '~/content/cta-band'
import {
  breadcrumbsFor,
  breadcrumbsFromTrail,
  routeLabel,
  routePath,
  type Locale,
  type Crumb
} from '~/config/route-map'

const route = useRoute()
const { t, locale } = useI18n()
const loc = computed(() => locale.value as Locale)
const isEn = computed(() => loc.value === 'en')

const segments = computed<string[]>(() => {
  const s = route.params.slug
  return Array.isArray(s) ? (s as string[]) : s ? [String(s)] : []
})

// Slug partage fr/en: le changement de langue garde les memes segments.
const setI18nParams = useSetI18nParams()
setI18nParams({ fr: { slug: segments.value }, en: { slug: segments.value } })

const match = computed(() => resolveBlogRoute(segments.value, isEn.value))
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
  const cover: HeroVisual = { ratio: '21/9', src: a.cover.src, alt: a.cover.alt, label: '', caption: '' }
  return {
    _type: 'hero-article',
    _key: 'masthead',
    crumbs: breadcrumbsFromTrail(loc.value, ...trail),
    category: a.category ? { label: a.category.title, href: categoryHref(a.category.slug, loc.value) } : undefined,
    title: a.title,
    excerpt: a.excerpt,
    date: a.date,
    dateLabel: formatArticleDate(a.date, loc.value),
    author: a.author,
    readingMinutes: a.readingMinutes,
    cover
  }
})

const related = computed<ArticleCardData[]>(() => {
  const a = article.value
  if (!a) return []
  return articlesFixture(isEn.value)
    .filter((x) => x.slug !== a.slug && x.category?.slug === a.category?.slug)
    .sort((x, y) => y.date.localeCompare(x.date))
    .slice(0, 3)
    .map((x) => toCard(x, loc.value))
})

const articleCta = computed<CtaBandBlock[]>(() => [
  { _type: 'cta-band', _key: 'article-cta', ...ctaBandFixture(isEn.value) }
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
const archiveCards = computed<ArticleCardData[]>(() =>
  archive.value ? archive.value.articles.map((x) => toCard(x, loc.value)) : []
)
const { categories } = useBlogContent()

// ── SEO ──────────────────────────────────────────────────────────────────────
useSeoMeta({
  title: () => article.value?.title ?? archive.value?.category.title ?? '',
  description: () => article.value?.excerpt ?? archive.value?.category.description ?? '',
  ogType: () => (article.value ? 'article' : 'website')
})
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
        <h2 class="article-related__heading wf-h3">{{ t('ui.blog.related') }}</h2>
        <ArticleGrid :cards="related" heading-level="h3" class="article-related__grid" />
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
      </div>
    </section>
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
