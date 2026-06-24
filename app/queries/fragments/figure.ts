// Fragment GROQ: figure (objet partage `figure` d'Ancree).
//
// Piege fermeture: les fragments sont composes par app/queries/documents.ts,
// lui-meme importe par nuxt.config.ts. Imports RELATIFS seulement, aucun alias ~,
// aucun auto-import Nuxt.
//
// Convention: chaque fragment est une projection complete entre accolades, a
// interpoler apres le champ source (ex. `"photo": photo ${FIGURE_PROJECTION}`).
// La resolution de l'objet `figure` (src/alt/label/caption/ratio) vit cote
// transform (resolveFigure).

/**
 * Figure (objet partage `figure`): l'asset image natif est resolu en URL CDN
 * des la query (`image.asset->url`), le front ne voit jamais d'objet asset.
 * `src` absent = placeholder soigne du fragment <Image> (jamais une 404).
 *
 * L'ALT est lu sur l'ASSET, BILINGUE (`altText` localisé { fr, en } du plugin
 * media configuré avec locales). On pioche la langue courante via $language; une
 * image porte son alt une seule fois, traduit, partout. Plus de champ alt par usage.
 */
export const FIGURE_PROJECTION = /* groq */ `{
  "src": image.asset->url,
  "alt": select($language == "en" => image.asset->altText.en, image.asset->altText.fr),
  label,
  caption,
  ratio
}`
