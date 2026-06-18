// Projets — contrats de la collection (études de cas).
//
// V2 (Sanity, actuel): la collection vit dans les documents `project` (payload
// via useProjects). Ce fichier ne garde que les CONTRATS, importés en
// type-only par les composants (ProjectGrid), le transform et les composables.
//
// Images: `src` absent = placeholder du composant <Image>, jamais une 404.

export interface ProjectImage {
  ratio: string
  src?: string
  alt: string
  label: string
  caption: string
}

export interface Project {
  slug: string
  title: string
  /** Résumé court (carte de grille, projects-preview). */
  excerpt: string
  /** Slug du service rattaché. */
  service: string
  location: string
  year: string
  cover: ProjectImage
  gallery: ProjectImage[]
  /** Étude de cas. */
  challenge: string
  solution: string
  result: string
  /** Chiffres clés optionnels (bloc stats sur le détail). */
  stats?: Array<{ label: string; value: string }>
  /** Id (_id Sanity) du témoignage du client de ce projet. */
  testimonial?: string
  /** Mis de l'avant (accueil, sélections génériques). */
  featured?: boolean
}
