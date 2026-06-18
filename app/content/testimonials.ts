// Témoignages — contrats de la banque + du bloc « testimonials ».
//
// V2 (Sanity, actuel): la banque vit dans les documents `testimonial` (payload
// via useTestimonials, `id` = _id Sanity). La copie des sections vit dans les
// pageBuilders et les gabarits de détail. Ce fichier ne garde que les CONTRATS.

export interface Testimonial {
  id: string
  quote: string
  name: string
  context: string
  /** Slug du service rattaché (sélection sur les pages détail). */
  service?: string
  /** Slug du projet rattaché. */
  project?: string
  /** Mis de l'avant (accueil, sélections génériques). */
  featured?: boolean
}

// ── Bloc « testimonials » ───────────────────────────────────────────────────
export interface TestimonialsContent {
  eyebrow: string
  heading: string
  items: Array<{
    quote: string
    name: string
    context: string
  }>
}
