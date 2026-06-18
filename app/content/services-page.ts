// Copie de la page /services et des pages détail /services/[slug] — CONTRATS.
//
// V2 (Sanity, actuel): la copie du hub vit sur le document servicesPage
// (héros + pageBuilder, assemblée par useServicesPageBlocks()); la copie des
// pages détail vit sur CHAQUE document service (champ detail, spec 6.10 et
// 12.16), consommée par useServiceBlocks() depuis l'item. ServiceDetailContent
// reste le contrat de cette copie: seuls les items (intro, bénéfices, projets
// liés, témoignages) viennent de la collection.

import type { ServicesContent } from './services'
import type { TestimonialsContent } from './testimonials'
import type { FaqContent } from './faq'
import type { CtaBandContent } from './cta-band'
import type { ProjectsPreviewContent } from './projects-preview'

export interface ServicesPageContent {
  grid: Omit<ServicesContent, 'items'>
  testimonials: Omit<TestimonialsContent, 'items'>
  faq: Omit<FaqContent, 'items'>
  cta: CtaBandContent
}

export interface ServiceDetailContent {
  /** Bloc media-text d'intro (le corps vient de service.intro). */
  benefits: {
    heading: string
    cta: { label: string; href: string }
  }
  /** Bloc highlights (les items viennent de service.benefits). */
  included: { heading: string }
  projects: Omit<ProjectsPreviewContent, 'items'>
  testimonials: Omit<TestimonialsContent, 'items'>
  cta: CtaBandContent
}
