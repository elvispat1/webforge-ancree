// Fragment GROQ: corps d'article (Portable Text, 7 blocs discriminés par `_type`).
// Sous-arbre LOURD, projeté seulement pour l'article courant en preview (et pour
// tous au build statique). Imports RELATIFS (fermeture nuxt.config).

import { FIGURE_PROJECTION } from './figure'
import { LINK_PROJECTION } from './link'

/**
 * Corps d'article (7 blocs discriminés par `_type`). Le Portable Text de
 * articleRichText est projeté au minimum utile: la transformation aplatit les
 * marks (le bloc Vue rich-text rend du texte brut, parité V1, voir R3 du plan).
 */
export const ARTICLE_BODY_PROJECTION = /* groq */ `body[]{
  _key,
  _type,
  _type == "articleLead" => { text },
  _type == "articleRichText" => {
    body[]{
      _key,
      style,
      listItem,
      children[]{ text }
    }
  },
  _type == "articleImage" => {
    "image": image ${FIGURE_PROJECTION}
  },
  _type == "articleQuote" => { quote, attribution },
  _type == "articleGallery" => {
    "images": images[] ${FIGURE_PROJECTION}
  },
  _type == "articleCallout" => { tone, title, text },
  _type == "articleInlineCta" => {
    text,
    "cta": cta ${LINK_PROJECTION}
  }
}`
