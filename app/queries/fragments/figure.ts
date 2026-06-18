// Fragment GROQ: figure (objet partagé `figure`).
//
// Piège fermeture: les fragments sont composés par app/queries/documents.ts,
// lui-même importé par nuxt.config.ts. Imports RELATIFS seulement, aucun alias ~,
// aucun auto-import Nuxt.
//
// Convention: chaque fragment est une projection complète entre accolades, à
// interpoler après le champ source (ex. `"cover": cover ${FIGURE_PROJECTION}`).
// Les types miroirs vivent dans app/types/sanity.ts.

/**
 * Figure (objet partagé `figure`): l'asset est résolu en URL CDN dès la query
 * (`asset->url`), le front ne voit jamais d'objet asset. `src` absent =
 * placeholder du fragment <Image>, comme en V1.
 */
export const FIGURE_PROJECTION = /* groq */ `{
  "src": image.asset->url,
  alt,
  label,
  caption,
  ratio
}`
