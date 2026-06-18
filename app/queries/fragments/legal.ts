// Fragment GROQ: page légale (conditions / confidentialité).
// Extrait de la projection inline de CONTENT_GRAPH_QUERY pour être partagé entre
// la query de prod et la query scopée preview. Import RELATIF (fermeture nuxt.config).

/**
 * Page légale: id déterministe du seed (legalPage-<key>-<lang>), titre, dates
 * optionnelles et sections (titre + corps minimal { _type, text, items }).
 * Petit document, gardé FULL dans tous les régimes.
 */
export const LEGAL_PROJECTION = /* groq */ `{
  _id,
  title,
  effective,
  updated,
  sections[]{
    title,
    body[]{ _type, text, items }
  }
}`
