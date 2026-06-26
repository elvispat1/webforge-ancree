// Fragment GROQ: page legale (conditions d'utilisation / politique de
// confidentialite). A partager entre la query de prod et la query scopee preview.
// Import RELATIF (fermeture nuxt.config).

import { SEO_PROJECTION } from './seo'

/**
 * Page legale: id deterministe du seed (legalPage-<conditions|confidentialite>-
 * <lang>), titre, dates optionnelles (effective/updated) et sections (titre +
 * corps minimal { _type, text, items }). Petit document, garde FULL dans tous les
 * regimes. Aucun slug: le routage se fait par _id (legalRouteKeyForId).
 */
export const LEGAL_PROJECTION = /* groq */ `{
  _id,
  title,
  effective,
  updated,
  "seo": seo ${SEO_PROJECTION},
  sections[]{
    title,
    body[]{ _type, text, items }
  }
}`
