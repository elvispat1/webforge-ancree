// Config et gardes de build du blog (schema d'URL court /blog/<slug>).
//
// Fichier PUR TS (aucun import, ni Nuxt ni alias ~): importe a LA FOIS par
// l'app (useArticles, via alias) ET par la fermeture nuxt.config (chemin
// relatif, hors contexte d'alias). Meme regle dure que le route-map.
//
// Le schema court sert les archives de categorie a /blog/<slug-de-categorie>,
// au meme niveau que les billets sans categorie (/blog/<slug-de-billet>). Cette
// cohabitation, plus la pagination sous /blog/page/<n>, n'est sure que si les
// unicites ci-dessous tiennent; la garde les impose au build (echec clair
// plutot qu'une 404 silencieuse).

/** Taille de page de la liste du blog. La pagination ne se declenche qu'au-dela
 *  (la demo a 3 articles, donc une seule page). Source UNIQUE, partagee par
 *  paginate() (useArticles) et le prerendu/garde (nuxt.config). */
export const ARTICLES_PER_PAGE = 9

/** Segments reserves sous /blog (racine de la pagination): aucun slug de
 *  categorie ou de billet ne peut les prendre. Doit rester synchronise avec le
 *  dossier de route reel app/pages/blog/page/[n].vue (couplage du file-routing:
 *  renommer le dossier impose de changer cette liste). */
export const RESERVED_BLOG_SEGMENTS = ['page']

/** Collections du blog telles que vues par la garde: le strict des slugs. */
export interface BlogCollectionsInput {
  articlesPerPage: number
  /** Billets: slug + slug de categorie (null/absent = billet sans categorie). */
  articles: Array<{ slug: string; category?: string | null }>
  /** Slugs des categories. */
  categories: string[]
}

/** Valide les collections du blog contre le schema d'URL court. Lance une
 *  erreur (echec de build) listant TOUTES les violations detectees. */
export function assertBlogCollections(options: BlogCollectionsInput): void {
  const { articles, categories } = options
  const problems: string[] = []

  // 1. Slugs de categories uniques entre eux.
  for (const slug of findDuplicates(categories)) {
    problems.push(`slug de categorie en double: « ${slug} » (deux categories partageraient /blog/${slug})`)
  }

  // 2. Segments reserves (pagination).
  for (const slug of categories) {
    if (RESERVED_BLOG_SEGMENTS.includes(slug)) {
      problems.push(`slug de categorie reserve: « ${slug} » (segment de pagination sous /blog)`)
    }
  }
  for (const article of articles) {
    if (!article.category && RESERVED_BLOG_SEGMENTS.includes(article.slug)) {
      problems.push(`slug de billet sans categorie reserve: « ${article.slug} » (segment de pagination sous /blog)`)
    }
  }

  // 3. Billet sans categorie vs slug de categorie (le resolveur priorise la
  //    categorie: le billet deviendrait inatteignable).
  for (const article of articles) {
    if (!article.category && categories.includes(article.slug)) {
      problems.push(
        `collision billet/categorie sur /blog/${article.slug}: le billet sans categorie est masque par la page de categorie du meme slug`
      )
    }
  }

  // 4. Slugs de billets uniques dans leur espace d'URL.
  const articleUrls = articles.map((a) => (a.category ? `/blog/${a.category}/${a.slug}` : `/blog/${a.slug}`))
  for (const url of findDuplicates(articleUrls)) {
    problems.push(`deux billets partagent la meme URL: ${url}`)
  }

  // 5. Plafond d'archive (la pagination d'archive /blog/<cat>/page/<n> n'existe
  //    pas): aucune categorie ne peut depasser ARTICLES_PER_PAGE billets, sinon
  //    le composant Pagination de l'archive genererait des liens morts.
  for (const categorySlug of categories) {
    const count = articles.filter((a) => a.category === categorySlug).length
    if (count > options.articlesPerPage) {
      problems.push(
        `la categorie « ${categorySlug} » compte ${count} billets pour un plafond de ${options.articlesPerPage} `
        + `(ARTICLES_PER_PAGE): la pagination d'archive n'est pas implementee, /blog/${categorySlug}/page/2 serait un lien mort`
      )
    }
  }

  if (problems.length > 0) {
    throw new Error(
      '[webforge] Collections de blog invalides (garde du schema d\'URL court, app/content/guards.ts):\n'
      + problems.map((p) => `  - ${p}`).join('\n')
    )
  }
}

/** Valeurs presentes plus d'une fois (chaque doublon rapporte une seule fois). */
function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  }
  return [...duplicates]
}
