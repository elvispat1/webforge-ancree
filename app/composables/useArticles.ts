// Articles de blog: sélection, pagination, reliés, et résolution d'URL.
// V2 (Sanity, actuel): la collection vient du payload (triée `date desc` par
// la query); sélection, pagination et résolution restent locales, signatures
// et retours inchangés depuis V1.

import { ARTICLES_PER_PAGE } from '~/content/articles'
import type { Article } from '~/content/articles'
import { routePath } from '~/config/route-map'
import type { Translated } from '~/sanity/transform'

export interface ArticleQuery {
  category?: string
  exclude?: string
  limit?: number
}

// Triés par date décroissante (plus récent d'abord; la query trie déjà, le tri
// local reste inoffensif et garde le contrat explicite).
export function useArticles(query: ArticleQuery = {}): Article[] {
  let out = [...usePayload().collections.articles].sort((a, b) => (a.date < b.date ? 1 : -1))
  if (query.category) out = out.filter((a) => a.category === query.category)
  if (query.exclude) out = out.filter((a) => a.slug !== query.exclude)
  if (typeof query.limit === 'number') out = out.slice(0, query.limit)
  return out
}

export function useArticle(slug: string): Article | undefined {
  return usePayload().collections.articles.find((a) => a.slug === slug)
}

// Articles reliés: même catégorie (ou plus récents si l'article n'en a pas),
// en excluant l'article courant.
export function useRelatedArticles(article: Article, limit = 2): Article[] {
  return useArticles({
    category: article.category,
    exclude: article.slug,
    limit
  })
}

// ── URL d'un article ────────────────────────────────────────────────────────
// 2 segments si catégorie ({base}/{cat}/{slug}), 1 sinon ({base}/{slug}).
// Base localisée (T2b): /blog en FR, /en/blog en EN (préfixe via route-map,
// locale courante lue par useWfLocale). Signature inchangée.
export function articlePath(article: Article): string {
  const base = routePath('blog', useWfLocale())
  return article.category
    ? `${base}/${article.category}/${article.slug}`
    : `${base}/${article.slug}`
}

// ── Forme « carte » d'un article ────────────────────────────────────────────
// Mapping partagé vers la forme attendue par <ArticleCard>/<ArticleGrid>: URL
// résolue et catégorie AFFICHABLE (titre résolu contre la collection, jamais le
// slug brut). Utilisé par /blog, la pagination, les archives, les reliés et le
// bloc blog-preview: un seul endroit où la relation se résout.
export function articleCard(article: Article) {
  return {
    title: article.title,
    excerpt: article.excerpt,
    href: articlePath(article),
    date: article.date,
    category: article.category ? useCategory(article.category)?.title : undefined,
    cover: article.cover
  }
}

// Résolution de l'attrape-tout /blog/[...slug] contre l'index connu.
// Préfixe réservé sous /blog: « page » (pagination de /blog). Une catégorie occupe
// /blog/<slug> au même niveau qu'un billet sans catégorie; la page dynamique tente
// d'abord useCategory(slug) (page de catégorie) puis resolveArticle (billet).
// Synchronisé avec RESERVED_SEGMENTS de app/content/guards.ts (duplication
// assumée: la garde est importée par nuxt.config, où l'alias ~ est irrésoluble).
export const RESERVED_BLOG_SEGMENTS = ['page']

// Retour élargi ADDITIVEMENT (T2b): l'article résolu porte `translations`
// (slug et catSlug de l'autre langue), consommé par setI18nParams sur la page.
export function resolveArticle(segments: string[]): Translated<Article> | undefined {
  const articles = usePayload().collections.articles
  if (segments.length === 1) {
    return articles.find((a) => !a.category && a.slug === segments[0])
  }
  if (segments.length === 2) {
    return articles.find((a) => a.category === segments[0] && a.slug === segments[1])
  }
  return undefined
}

// ── Pagination générique ────────────────────────────────────────────────────
export interface Paginated<T> {
  items: T[]
  page: number
  totalPages: number
  total: number
}

export function paginate<T>(items: T[], page: number, perPage = ARTICLES_PER_PAGE): Paginated<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * perPage
  return { items: items.slice(start, start + perPage), page: current, totalPages, total }
}
