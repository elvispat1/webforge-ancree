// Sélection dans la banque de témoignages.
// V2 (Sanity, actuel): la banque vient du payload (triée `order asc` par la
// query, ids = _id Sanity); le filtrage reste local, signature et retour
// inchangés depuis V1.

import type { Testimonial } from '~/content/testimonials'

export interface TestimonialQuery {
  ids?: string[]
  service?: string
  project?: string
  featured?: boolean
  limit?: number
  /** Compléter jusqu'à `limit` avec d'autres témoignages si la sélection est plus courte. */
  pad?: boolean
}

export function useTestimonials(query: TestimonialQuery = {}): Testimonial[] {
  const testimonials = usePayload().collections.testimonials
  let out = testimonials
  if (query.ids) {
    // L'ordre des ids fait foi (sélection manuelle), pas l'ordre de la banque;
    // une ref brisée est écartée sans trou. Même règle que useFaq({ ids }) (12.8).
    const byId = new Map(out.map((t) => [t.id, t]))
    out = query.ids.map((id) => byId.get(id)).filter((t): t is Testimonial => t !== undefined)
  }
  if (query.service) out = out.filter((t) => t.service === query.service)
  if (query.project) out = out.filter((t) => t.project === query.project)
  if (query.featured) out = out.filter((t) => t.featured)

  // pad: si la sélection filtrée est plus courte que limit, compléter avec
  // d'autres témoignages (hors doublons), vedettes d'abord, pour en avoir 3.
  if (query.pad && typeof query.limit === 'number' && out.length < query.limit) {
    const have = new Set(out.map((t) => t.id))
    const fillers = testimonials
      .filter((t) => !have.has(t.id))
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    out = [...out, ...fillers]
  }

  if (typeof query.limit === 'number') out = out.slice(0, query.limit)
  return out
}
