// Catégories de blog — contrat de la collection.
//
// V2 (Sanity, actuel): la collection vit dans les documents `category`
// (payload via useCategories). Chaque catégorie a un `slug` (clé d'URL stable,
// anglais kebab) servant sa page /blog/<slug> (liste filtrée), au même niveau
// qu'un billet sans catégorie.

export interface Category {
  slug: string
  title: string
  description: string
}
