// Fragments GROQ: bandeau CTA et bloc processus (réutilisés dans le page-builder
// ET dans des champs dédiés de même type). Imports RELATIFS (fermeture nuxt.config).

import { LINK_PROJECTION } from './link'

/**
 * Bandeau CTA: réutilisé par le bloc `ctaBand` du pageBuilder ET par les champs
 * dédiés de même type (blogPage.listCta, service.detail.cta, project.detail.cta).
 */
export const CTA_BAND_PROJECTION = /* groq */ `{
  title,
  subtitle,
  "primaryCta": primaryCta ${LINK_PROJECTION},
  "secondaryCta": secondaryCta ${LINK_PROJECTION}
}`

/**
 * Bloc processus: réutilisé par le pageBuilder ET par service.detail.process
 * (même type `process` réutilisé en champ dédié).
 */
export const PROCESS_PROJECTION = /* groq */ `{
  eyebrow,
  heading,
  lead,
  "cta": cta ${LINK_PROJECTION},
  steps[]{ title, body }
}`
