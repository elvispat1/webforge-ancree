// Copie de la page /a-propos — CONTRAT.
//
// V2 (Sanity, actuel): la copie vit sur le document aboutPage (héros +
// pageBuilder complet), assemblée par useAboutBlocks() depuis le payload.
// Interface conservée comme référence de la composition V1.

import type { CtaBandContent } from './cta-band'
import type { TestimonialsContent } from './testimonials'

export interface AboutPageContent {
  testimonials: Omit<TestimonialsContent, 'items'>
  cta: CtaBandContent
}
