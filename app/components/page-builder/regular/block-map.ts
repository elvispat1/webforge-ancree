// Table de correspondance _type -> composant pour le page-builder régulier.
//
// Extraite de l'orchestrateur pour être partagée: l'orchestrateur de prod
// (regular/index.vue) ET la vitrine des blocs dev (catalogue) la consomment,
// sans dupliquer la liste.
//
// Le héros n'y figure PAS: ce n'est pas un bloc de page-builder, c'est un
// composant imposé par type de page (components/hero/). Voir mémoire projet.

import About from './block/about.vue'
import Services from './block/services.vue'
import Testimonials from './block/testimonials.vue'
import Faq from './block/faq.vue'
import Contact from './block/contact.vue'
import MediaText from './block/media-text.vue'
import CtaBand from './block/cta-band.vue'
import Process from './block/process.vue'
import Stats from './block/stats.vue'
import Highlights from './block/highlights.vue'
import Logos from './block/logos.vue'
import ProjectsPreview from './block/projects-preview.vue'
import BlogPreview from './block/blog-preview.vue'
import Iframe from './block/iframe.vue'
import VideoYoutube from './block/video-youtube.vue'

export const regularBlockMap = {
  about: About,
  services: Services,
  testimonials: Testimonials,
  faq: Faq,
  contact: Contact,
  'media-text': MediaText,
  'cta-band': CtaBand,
  process: Process,
  stats: Stats,
  highlights: Highlights,
  logos: Logos,
  'projects-preview': ProjectsPreview,
  'blog-preview': BlogPreview,
  iframe: Iframe,
  'video-youtube': VideoYoutube
} as const

export type RegularBlockType = keyof typeof regularBlockMap
