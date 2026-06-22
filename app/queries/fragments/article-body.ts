// Fragment GROQ: corps d'article (7 blocs discrimines par `_type`).
// Sous-arbre LOURD, projete seulement pour l'article courant en preview (et pour
// tous au build statique). Imports RELATIFS (fermeture nuxt.config).
//
// Le Portable Text de articleRichText est projete RICHE (style, listItem, level,
// children avec marks, markDefs avec href): le bloc Vue rich-text serialise les
// titres, listes, gras/italique et liens. C'est la projection deja eprouvee dans
// l'ancien app/sanity/content.ts, reportee ici telle quelle (le transform aplatit
// vers PortableTextBlock du contrat article-blocks).

import { FIGURE_PROJECTION } from './figure'
import { LINK_PROJECTION } from './link'

export const ARTICLE_BODY_PROJECTION = /* groq */ `body[]{
  _key,
  _type,
  _type == "articleLead" => { text },
  _type == "articleRichText" => {
    "body": body[]{
      _key,
      _type,
      style,
      listItem,
      level,
      "children": children[]{ _key, text, marks },
      "markDefs": markDefs[]{ _key, _type, href }
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
