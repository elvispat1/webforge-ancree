/* Contrat de contenu d'une categorie de blog Ancree. Fichier TYPE-ONLY: la
 * transformation Sanity (app/sanity/transform.ts) produit cette forme, aucune
 * fonction de repli ici. i18n document-level: une categorie par langue partageant
 * le meme slug (la desambiguisation d'URL vient du prefixe de locale, jamais du
 * slug). AUCUNE valeur design ni de contenu ici, que des champs. */

import type { SeoOverride } from '~/content/site'

export interface Category {
  title: string
  slug: string // partage fr/en
  description?: string // amorce de la page d'archive
  /** SEO éditable (onglet SEO). Vide: titre d'archive + description ci-dessus. */
  seo?: SeoOverride
}
