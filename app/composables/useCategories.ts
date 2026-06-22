// Acces aux categories de blog (collection adressable).
//
// V2 (Sanity, fail-fast): lit la collection du payload (triee `order asc` par la
// query). Les items portent `translations` (slug partage fr/en), consomme par
// setI18nParams sur la page de categorie. Porte 1:1 de Minimaliste.

import type { Category } from '~/content/categories'
import type { Translated } from '~/sanity/transform'

export function useCategories(): Translated<Category>[] {
  return usePayload().collections.categories
}

export function useCategory(slug: string): Translated<Category> | undefined {
  return useCategories().find((c) => c.slug === slug)
}
