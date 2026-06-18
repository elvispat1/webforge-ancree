// Fragments GROQ: copies de page de détail (service.detail, project.detail).
// Sous-arbres LOURDS, projetés seulement pour l'item de détail courant en preview
// (et pour tous au build statique). Imports RELATIFS (fermeture nuxt.config).

import { LINK_PROJECTION } from './link'
import { CTA_BAND_PROJECTION, PROCESS_PROJECTION } from './cta'

/**
 * Copie de la page de détail d'un service (champ `service.detail`, spec 6.10):
 * chaque document de la collection porte sa propre copie (12.16), plus de
 * gabarit partagé sur servicesPage.
 */
export const SERVICE_DETAIL_PROJECTION = /* groq */ `{
  benefits{ heading, "cta": cta ${LINK_PROJECTION} },
  included{ heading },
  "process": process ${PROCESS_PROJECTION},
  projects{ eyebrow, heading, lead, "cta": cta ${LINK_PROJECTION} },
  testimonials{ eyebrow, heading },
  "cta": cta ${CTA_BAND_PROJECTION}
}`

/**
 * Copie de la page de détail d'un projet (champ `project.detail`, spec 6.11):
 * même principe que SERVICE_DETAIL_PROJECTION.
 */
export const PROJECT_DETAIL_PROJECTION = /* groq */ `{
  gallery{ heading },
  caseStudy{ eyebrow, heading, challengeLabel, solutionLabel, resultLabel },
  testimonial{ eyebrow, heading },
  similar{ eyebrow, heading, lead, "cta": cta ${LINK_PROJECTION} },
  "cta": cta ${CTA_BAND_PROJECTION}
}`
