// Copie de la page d'accueil multipage — CONTRAT.
//
// V2 (Sanity, actuel): la copie vit sur le document homePage (héros à CTA en
// routes + pageBuilder complet), assemblée par useHeroContent() et
// useHomeBlocks() depuis le payload. Interface conservée comme référence de la
// composition V1 (sections autorées + blocs data-driven).

import type { MediaTextContent } from './media-text'
import type { CtaBandContent } from './cta-band'
import type { ServicesContent } from './services'
import type { TestimonialsContent } from './testimonials'
import type { ProjectsPreviewContent } from './projects-preview'
import type { BlogPreviewContent } from './blog-preview'

export interface HomePageContent {
  /** CTA du héros en mode multipage: routes plutôt qu'ancres. */
  hero: {
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
  }
  projects: Omit<ProjectsPreviewContent, 'items'>
  services: Omit<ServicesContent, 'items'>
  story: MediaTextContent
  testimonials: Omit<TestimonialsContent, 'items'>
  blog: Omit<BlogPreviewContent, 'items'>
  cta: CtaBandContent
}
