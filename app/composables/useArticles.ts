/* Logique du blog (fixtures pour l'instant; le fetch Sanity au build s'y branchera
 * ensuite sur le meme moule que les autres pages). Source unique des helpers d'URL
 * d'article, de mise en carte, de resolution du catch-all /blog et de formatage de
 * date. i18n document-level: slug partage fr/en, l'URL ne differe que par le
 * prefixe de locale. */
import { articlesFixture, type ArticleContent } from '~/content/article'
import { categoriesFixture, type CategoryContent } from '~/content/blog'
import { routePath, type Locale } from '~/config/route-map'
import type { ArticleFigure } from '~/content/article-blocks'

export interface ArticleCardData {
  slug: string
  title: string
  excerpt: string
  cover: ArticleFigure
  href: string
  dateLabel: string
  readingMinutes: number
  category?: { title: string; slug: string; href: string }
}

/** URL complete d'un article: avec categorie -> /blog/<cat>/<slug>, sinon /blog/<slug>. */
export function articleHref(article: ArticleContent, locale: Locale): string {
  const base = routePath('blog', locale)
  return article.category ? `${base}/${article.category.slug}/${article.slug}` : `${base}/${article.slug}`
}

/** URL d'archive d'une categorie: /blog/<slug>. */
export function categoryHref(slug: string, locale: Locale): string {
  return `${routePath('blog', locale)}/${slug}`
}

/** Date de publication formatee dans la locale (transformation pure, sans middle dot). */
export function formatArticleDate(iso: string, locale: Locale): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d)
}

/** Met un article en forme de carte (liste, grille, reliés). */
export function toCard(article: ArticleContent, locale: Locale): ArticleCardData {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    cover: article.cover,
    href: articleHref(article, locale),
    dateLabel: formatArticleDate(article.date, locale),
    readingMinutes: article.readingMinutes,
    category: article.category
      ? { title: article.category.title, slug: article.category.slug, href: categoryHref(article.category.slug, locale) }
      : undefined
  }
}

export type BlogRouteMatch =
  | { type: 'article'; article: ArticleContent }
  | { type: 'category'; category: CategoryContent; articles: ArticleContent[] }
  | null

/** Resout les segments du catch-all /blog. Priorite a la categorie (1 segment),
 *  puis a l'article (1 segment sans categorie, ou 2 segments categorie+slug). */
export function resolveBlogRoute(segments: string[], isEn: boolean): BlogRouteMatch {
  const articles = articlesFixture(isEn)
  const categories = categoriesFixture(isEn)

  if (segments.length === 1) {
    const seg = segments[0]!
    const category = categories.find((c) => c.slug === seg)
    if (category) {
      const inCat = articles
        .filter((a) => a.category?.slug === category.slug)
        .sort((a, b) => b.date.localeCompare(a.date))
      return { type: 'category', category, articles: inCat }
    }
    const article = articles.find((a) => !a.category && a.slug === seg)
    if (article) return { type: 'article', article }
    return null
  }

  if (segments.length === 2) {
    const [catSlug, slug] = segments
    const article = articles.find((a) => a.category?.slug === catSlug && a.slug === slug)
    if (article) return { type: 'article', article }
  }

  return null
}

/** Donnees reactives du blog (liste triee + categories), localisees. */
export function useBlogContent() {
  const { locale } = useI18n()
  const loc = computed(() => locale.value as Locale)
  const isEn = computed(() => loc.value === 'en')

  const articles = computed<ArticleContent[]>(() =>
    [...articlesFixture(isEn.value)].sort((a, b) => b.date.localeCompare(a.date))
  )
  const categories = computed<CategoryContent[]>(() => categoriesFixture(isEn.value))
  const cards = computed<ArticleCardData[]>(() => articles.value.map((a) => toCard(a, loc.value)))

  return { locale: loc, isEn, articles, categories, cards }
}
