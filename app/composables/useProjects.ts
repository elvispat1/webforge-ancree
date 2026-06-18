// Sélection dans la collection de projets.
// V2 (Sanity, actuel): la collection vient du payload (triée `order asc` par
// la query); le filtrage reste local, signatures inchangées depuis V1. Retour
// de useProject élargi ADDITIVEMENT: le doc porte `translations` (slug de
// l'autre langue, T2b) et `detail` (copie de SA page de détail, spec 6.11 et
// 12.16, consommée par useProjectBlocks et la page détail).

import type { Project } from '~/content/projects'
import type { ProjectWithDetail } from '~/sanity/transform'

export interface ProjectQuery {
  service?: string
  featured?: boolean
  /** Slug à exclure (projets similaires sur une page détail). */
  exclude?: string
  limit?: number
  /** Compléter jusqu'à `limit` avec d'autres projets si la sélection est plus courte. */
  pad?: boolean
}

export function useProjects(query: ProjectQuery = {}): Project[] {
  const projects = usePayload().collections.projects
  let out = projects
  if (query.service) out = out.filter((p) => p.service === query.service)
  if (query.featured) out = out.filter((p) => p.featured)
  if (query.exclude) out = out.filter((p) => p.slug !== query.exclude)

  // pad: si la sélection filtrée est plus courte que limit, compléter avec
  // d'autres projets (hors doublons et hors exclude), vedettes d'abord, pour ne
  // jamais afficher une grille esseulée.
  if (query.pad && typeof query.limit === 'number' && out.length < query.limit) {
    const have = new Set(out.map((p) => p.slug))
    const fillers = projects
      .filter((p) => !have.has(p.slug) && p.slug !== query.exclude)
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    out = [...out, ...fillers]
  }

  if (typeof query.limit === 'number') out = out.slice(0, query.limit)
  return out
}

export function useProject(slug: string): ProjectWithDetail | undefined {
  return usePayload().collections.projects.find((p) => p.slug === slug)
}
