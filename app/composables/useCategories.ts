// Accès aux catégories de blog (collection adressable).
// V2 (Sanity, actuel): lit la collection du payload (triée `order asc` par la
// query). Signature inchangée depuis V1; retour élargi ADDITIVEMENT (T2b):
// les items portent `translations` (slug de l'autre langue), consommé par
// setI18nParams sur la page de catégorie. Tout appelant V1 reste valide.

import type { Category } from '~/content/categories'
import type { Translated } from '~/sanity/transform'

export function useCategories(): Translated<Category>[] {
  return usePayload().collections.categories
}

export function useCategory(slug: string): Translated<Category> | undefined {
  return useCategories().find((c) => c.slug === slug)
}
