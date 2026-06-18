// Copie de la page /projets et des pages détail /projets/[slug] — CONTRATS.
//
// V2 (Sanity, actuel): la copie du hub vit sur le document projectsPage
// (héros + pageBuilder, assemblée par useProjectsPageBlocks()); la copie des
// pages détail vit sur CHAQUE document project (champ detail, spec 6.11 et
// 12.16), consommée par useProjectBlocks() depuis l'item. ProjectDetailContent
// reste le contrat de cette copie: le défi, la solution, le résultat, les
// chiffres et le témoignage viennent du projet.

import type { CtaBandContent } from './cta-band'
import type { TestimonialsContent } from './testimonials'
import type { ProjectsPreviewContent } from './projects-preview'

export interface ProjectsPageContent {
  cta: CtaBandContent
}

export interface ProjectDetailContent {
  gallery: { heading: string }
  /** Bloc media-text de l'étude de cas: libellés des trois volets, le texte
   *  vient du projet (challenge, solution, result). */
  caseStudy: {
    eyebrow: string
    heading: string
    challengeLabel: string
    solutionLabel: string
    resultLabel: string
  }
  testimonial: Omit<TestimonialsContent, 'items'>
  similar: Omit<ProjectsPreviewContent, 'items'>
  cta: CtaBandContent
}
