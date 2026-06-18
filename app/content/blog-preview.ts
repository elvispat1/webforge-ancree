export interface BlogPreviewContent {
  eyebrow?: string
  heading: string
  lead?: string
  items: Array<{
    title: string
    excerpt: string
    href: string
    date: string
    category?: string
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
  ctaHref?: string // ex '/blog'
}
