/* Logique du blog. Le contenu vient du payload unique (plugin 01.content) via
 * usePayload().collections (articles + categories), en POSTURE FAIL-FAST: plus de
 * repli fixtures runtime (usePayload throw si le contenu manque). Source unique des
 * helpers d'URL d'article, de mise en carte, de resolution du catch-all /blog, de
 * pagination et de formatage de date. i18n document-level: slug partage fr/en,
 * l'URL ne differe que par le prefixe de locale. */
import { computed } from 'vue'
import type { Article } from '~/content/articles'
import type { Category } from '~/content/categories'
import { routePath, type Locale } from '~/config/route-map'
import { ARTICLES_PER_PAGE } from '~/content/guards'
import type { ArticleFigure } from '~/content/article-blocks'
import type { Translated } from '~/sanity/transform'

export interface ArticleCardData {
  slug: string
  title: string
  excerpt: string
  cover: ArticleFigure
  href: string
  dateLabel: string
  readingTime: number
  category?: { title: string; slug: string; href: string }
}

/** URL complete d'un article: avec categorie -> /blog/<cat>/<slug>, sinon /blog/<slug>. */
export function articleHref(article: Article, locale: Locale): string {
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

/** Met un article en forme de carte (liste, grille, relies). */
export function toCard(article: Article, locale: Locale): ArticleCardData {
  return {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    cover: article.cover,
    href: articleHref(article, locale),
    dateLabel: formatArticleDate(article.date, locale),
    readingTime: article.readingTime,
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
  | { type: 'article'; article: Translated<Article> }
  | { type: 'category'; category: Translated<Category>; articles: Article[] }
  | null

/** Resout les segments du catch-all /blog contre le jeu d'articles + categories.
 *  Priorite a la categorie (1 segment), puis a l'article (1 segment sans categorie,
 *  ou 2 segments categorie+slug). */
export function resolveBlogRoute(
  segments: string[],
  articles: Translated<Article>[],
  categories: Translated<Category>[]
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

/* ---------- Selection (helpers purs sur la collection du payload) ---------- */

export interface ArticleQuery {
  category?: string
  exclude?: string
  limit?: number
}

/** Articles tries par date decroissante (plus recent d'abord), filtres localement. */
export function useArticles(query: ArticleQuery = {}): Translated<Article>[] {
  let out = [...usePayload().collections.articles].sort((a, b) => (a.date < b.date ? 1 : -1))
  if (query.category) out = out.filter((a) => a.category?.slug === query.category)
  if (query.exclude) out = out.filter((a) => a.slug !== query.exclude)
  if (typeof query.limit === 'number') out = out.slice(0, query.limit)
  return out
}

export function useArticle(slug: string): Translated<Article> | undefined {
  return usePayload().collections.articles.find((a) => a.slug === slug)
}

/** Articles relies: meme categorie (ou plus recents si l'article n'en a pas), en
 *  excluant l'article courant. */
export function useRelatedArticles(article: Article, limit = 2): Translated<Article>[] {
  return useArticles({ category: article.category?.slug, exclude: article.slug, limit })
}

/** Met un article en forme de carte (categorie resolue en titre affichable). */
export function articleCard(article: Article, locale: Locale): ArticleCardData {
  return toCard(article, locale)
}

/* ---------- Contenu du blog (articles + categories du payload) ---------- */

/** Contenu du blog, lu du payload unique (fail-fast, aucun repli fixtures). Lecture
 *  synchrone via usePayload(); reactif a la langue pour la navigation cliente. */
export function useBlog() {
  const { locale } = useI18n()
  const loc = computed(() => locale.value as Locale)
  const isEn = computed(() => loc.value === 'en')

  const articles = computed<Translated<Article>[]>(() =>
    [...usePayload().collections.articles].sort((a, b) => b.date.localeCompare(a.date))
  )
  const categories = computed<Translated<Category>[]>(() => usePayload().collections.categories)

  return { locale: loc, isEn, articles, categories }
}
