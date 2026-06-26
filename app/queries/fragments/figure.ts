// Fragment GROQ: figure (objet partage `figure` d'Ancree).
//
// Piege fermeture: les fragments sont composes par app/queries/documents.ts,
// lui-meme importe par nuxt.config.ts. Imports RELATIFS seulement, aucun alias ~,
// aucun auto-import Nuxt.
//
// Convention: chaque fragment est une projection complete entre accolades, a
// interpoler apres le champ source (ex. `"photo": photo ${FIGURE_PROJECTION}`).
// La resolution de l'objet `figure` (src/alt/caption) vit cote transform.

/**
 * Figure (objet partage `figure`, un seul champ `image`): l'asset image natif est
 * resolu en URL CDN des la query (`image.asset->url`), le front ne voit jamais
 * d'objet asset. `src` absent = placeholder soigne du fragment <Image> (jamais 404).
 *
 * Tout le texte est lu sur l'ASSET, BILINGUE (plugin media configure avec locales),
 * via $language: l'ALT depuis `altText` { fr, en }, la LEGENDE depuis `description`
 * { fr, en }. Une image porte son texte une seule fois, traduit, partout. Plus de
 * champ alt/etiquette/legende par usage; le ratio est decide par l'emplacement.
 */
export const FIGURE_PROJECTION = /* groq */ `{
  "src": image.asset->url,
  "alt": select($language == "en" => image.asset->altText.en, image.asset->altText.fr),
  "caption": select($language == "en" => image.asset->description.en, image.asset->description.fr)
}`
