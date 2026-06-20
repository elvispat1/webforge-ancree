/* Contrats de contenu du blog Ancree (catégorie + chrome de la section blog).
 * Miroir de ce que la transformation Sanity produira; AUCUNE valeur design ici.
 * i18n document-level: une catégorie par langue partageant le meme slug (la
 * désambiguïsation d'URL vient du préfixe de locale, jamais du slug). */

export interface CategoryContent {
  title: string
  slug: string // partagé fr/en
  description?: string // amorce de la page d'archive
}

/* Catégories de démo (Rempart Extermination). Bilingue. Slugs partagés fr/en. */
export function categoriesFixture(isEn: boolean): CategoryContent[] {
  if (isEn) {
    return [
      {
        title: 'Prevention',
        slug: 'prevention',
        description: 'Simple habits to keep pests out before they ever settle in.'
      },
      {
        title: 'Knowing your pests',
        slug: 'nuisibles',
        description: 'Spot the signs early and understand what you are dealing with.'
      }
    ]
  }
  return [
    {
      title: 'Prévention',
      slug: 'prevention',
      description: 'Des gestes simples pour garder les nuisibles dehors avant qu’ils ne s’installent.'
    },
    {
      title: 'Connaître les nuisibles',
      slug: 'nuisibles',
      description: 'Repérer les signes tôt et comprendre à quoi vous avez affaire.'
    }
  ]
}
