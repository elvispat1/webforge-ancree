export interface ProjectsPreviewContent {
  eyebrow?: string
  heading: string
  lead?: string
  items: Array<{
    slug: string
    title: string
    excerpt: string
    service?: string
    cover: {
      ratio: string
      // V1: chemin string. V2: asset Sanity résolu en URL dans la couche d'assemblage.
      src?: string
      alt: string
      label: string
      caption: string
    }
  }>
  ctaLabel?: string
  // Route interne vers la collection complète (ex. '/projets').
  ctaHref?: string
}
