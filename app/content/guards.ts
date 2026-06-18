// Gardes de build des collections de blog (schéma d'URL court /blog/<slug>).
//
// Le schéma court entériné (D5, audit 2026-06-09) sert les archives de
// catégorie à /blog/<slug-de-categorie>, au même niveau que les billets sans
// catégorie (/blog/<slug-de-billet>). Cette cohabitation n'est sûre que si les
// unicités suivantes tiennent; c'est cette garde qui les impose au build (et en
// dev), avec un échec clair plutôt qu'une 404 silencieuse:
//   1. slugs de catégories uniques entre eux;
//   2. aucun slug (catégorie ou billet sans catégorie) égal à un segment
//      réservé sous /blog (« page », racine de la pagination);
//   3. aucun billet sans catégorie dont le slug égale un slug de catégorie
//      (le résolveur de /blog/[...slug] priorise la catégorie: le billet
//      deviendrait inatteignable);
//   4. slugs de billets uniques dans leur espace d'URL (même catégorie, ou
//      sans catégorie);
//   5. plafond d'archive: tant que la pagination d'archive n'est pas
//      implémentée (/blog/<categorie>/page/<n> n'existe pas), aucune catégorie
//      ne peut dépasser ARTICLES_PER_PAGE billets, sinon <Pagination> générera
//      des liens morts.
//
// Appelée depuis nuxt.config.ts au chargement de la config, sur les slugs
// FETCHÉS DE SANITY (ROUTE_SLUGS_QUERY): `nuxt dev`, `nuxt build` et
// `nuxt generate` échouent tous avant de produire quoi que ce soit. Les
// collections sont INJECTÉES en paramètres (plus aucun import de contenu):
// fichier pur, importable hors contexte Nuxt par le projet TS node.

// Segments réservés sous /blog. Doit rester synchronisé avec
// RESERVED_BLOG_SEGMENTS dans app/composables/useArticles.ts (la composable
// importe via alias `~`, irrésoluble au moment du chargement de la config).
const RESERVED_SEGMENTS = ['page']

/** Collections du blogue telles que vues par la garde: le strict nécessaire
 *  des slugs, forme alignée sur RouteSlugs (app/types/sanity.ts). */
export interface BlogCollectionsInput {
  /** Taille de page de la liste (plafond d'archive tant que la pagination
   *  d'archive n'est pas implémentée). Passer ARTICLES_PER_PAGE de
   *  app/content/articles.ts, synchronisée avec useArticles.ts. */
  articlesPerPage: number
  /** Billets: slug + slug de catégorie (null/absent = billet sans catégorie). */
  articles: Array<{ slug: string; category?: string | null }>
  /** Slugs des catégories. */
  categories: string[]
}

/**
 * Valide les collections du blog contre le schéma d'URL court. Lance une
 * erreur (échec de build) listant TOUTES les violations détectées.
 */
export function assertBlogCollections(options: BlogCollectionsInput): void {
  const { articles, categories } = options
  const problems: string[] = []

  // ── 1. Slugs de catégories uniques entre eux ─────────────────────────────
  for (const slug of findDuplicates(categories)) {
    problems.push(`slug de catégorie en double: « ${slug} » (deux catégories partageraient /blog/${slug})`)
  }

  // ── 2. Segments réservés ─────────────────────────────────────────────────
  for (const slug of categories) {
    if (RESERVED_SEGMENTS.includes(slug)) {
      problems.push(`slug de catégorie réservé: « ${slug} » (segment de pagination sous /blog)`)
    }
  }
  for (const article of articles) {
    if (!article.category && RESERVED_SEGMENTS.includes(article.slug)) {
      problems.push(`slug de billet sans catégorie réservé: « ${article.slug} » (segment de pagination sous /blog)`)
    }
  }

  // ── 3. Billet sans catégorie vs slug de catégorie ────────────────────────
  for (const article of articles) {
    if (!article.category && categories.includes(article.slug)) {
      problems.push(
        `collision billet/catégorie sur /blog/${article.slug}: le billet sans catégorie « ${article.slug} » `
        + 'est masqué par la page de catégorie du même slug (le résolveur priorise la catégorie)'
      )
    }
  }

  // ── 4. Slugs de billets uniques dans leur espace d'URL ───────────────────
  const articleUrls = articles.map((a) => (a.category ? `/blog/${a.category}/${a.slug}` : `/blog/${a.slug}`))
  for (const url of findDuplicates(articleUrls)) {
    problems.push(`deux billets partagent la même URL: ${url}`)
  }

  // ── 5. Plafond d'archive (pagination d'archive non implémentée) ──────────
  for (const categorySlug of categories) {
    const count = articles.filter((a) => a.category === categorySlug).length
    if (count > options.articlesPerPage) {
      problems.push(
        `la catégorie « ${categorySlug} » compte ${count} billets pour un plafond de ${options.articlesPerPage} `
        + `(ARTICLES_PER_PAGE): la pagination d'archive n'est pas implémentée, /blog/${categorySlug}/page/2 serait `
        + 'un lien mort. Implémenter la pagination d\'archive ou réduire la catégorie.'
      )
    }
  }

  if (problems.length > 0) {
    throw new Error(
      '[webforge] Collections de blog invalides (garde du schéma d\'URL court, app/content/guards.ts):\n'
      + problems.map((p) => `  - ${p}`).join('\n')
    )
  }
}

/** Valeurs présentes plus d'une fois (chaque doublon rapporté une seule fois). */
function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}
