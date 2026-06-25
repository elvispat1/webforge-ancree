// Fragments GROQ: bandeau d'appel et bloc processus (reutilises dans le
// page-builder ET dans des champs dedies de meme type). Imports RELATIFS
// (fermeture nuxt.config).

import { LINK_PROJECTION } from './link'

/**
 * Bandeau d'appel (objet `ctaBand`): reutilise par le bloc `ctaBand` du
 * pageBuilder ET par le champ dedie de fin de page service.detail.cta. Deux
 * boutons en objet `link`.
 */
export const CTA_BAND_PROJECTION = /* groq */ `{
  title,
  subtitle,
  "primaryCta": primaryCta ${LINK_PROJECTION},
  "secondaryCta": secondaryCta ${LINK_PROJECTION}
}`
