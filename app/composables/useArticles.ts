/* Logique du blog. Lecture Sanity au BUILD via useSanityBuildQuery (null cote
 * client -> repli fixtures, le site ne casse jamais), sur le moule des autres
 * pages. Source unique des helpers d'URL d'article, de mise en carte, de
 * resolution du catch-all /blog et de formatage de date. i18n document-level:
 * slug partage fr/en, l'URL ne differe que par le prefixe de locale. */
import { articlesFixture, type ArticleContent } from '~/content/article'
import { categoriesFixture, type CategoryContent } from '~/content/blog'
import { BLOG_QUERY, transformBlog } from '~/sanity/content'
import { routePath, type Locale } from '~/config/route-map'
import { ARTICLES_PER_PAGE } from '~/content/blog-guards'
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

/* ---------- Pagination ---------- */

export interface Paginated<T> {
  items: T[]
  page: number
  totalPages: number
  total: number
}

/** Tranche une liste en page (1-indexee). totalPages >= 1 (jamais 0, meme vide).
 *  La page demandee est bornee dans [1, totalPages]. */
export function paginate<T>(items: T[], page: number, perPage = ARTICLES_PER_PAGE): Paginated<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * perPage
  return { items: items.slice(start, start + perPage), page: current, totalPages, total }
}

export type BlogRouteMatch =
  | { type: 'article'; article: ArticleContent }
  | { type: 'category'; category: CategoryContent; articles: ArticleContent[] }
  | null

/** Resout les segments du catch-all /blog contre le jeu d'articles + categories.
 *  Priorite a la categorie (1 segment), puis a l'article (1 segment sans
 *  categorie, ou 2 segments categorie+slug). */
export function resolveBlogRoute(
  segments: string[],
  articles: ArticleContent[],
  categories: CategoryContent[]
): BlogRouteMatch {
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

/** Contenu du blog (articles tries + categories), Sanity au build avec repli
 *  fixtures. Async: a appeler avec await en setup (Suspense Nuxt). */
export async function useBlog() {
  const { locale } = useI18n()
  const loc = computed(() => locale.value as Locale)
  const isEn = computed(() => loc.value === 'en')

  const { data: raw } = await useSanityBuildQuery<unknown>(`blog:${loc.value}`, BLOG_QUERY, { lang: loc.value })
  const fromSanity = computed(() => transformBlog(raw.value))

  const articles = computed<ArticleContent[]>(() => {
    const s = fromSanity.value
    if (s && s.articles.length) return s.articles
    return articlesFixture(isEn.value).slice().sort((a, b) => b.date.localeCompare(a.date))
  })
  const categories = computed<CategoryContent[]>(() => {
    const s = fromSanity.value
    if (s && s.categories.length) return s.categories
    return categoriesFixture(isEn.value)
  })

  return { locale: loc, isEn, articles, categories }
}
