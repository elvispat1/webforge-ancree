// Fragment GROQ: corps d'article (7 blocs discrimines par `_type`).
// Sous-arbre LOURD, projete seulement pour l'article courant en preview (et pour
// tous au build statique). Imports RELATIFS (fermeture nuxt.config).
//
// Le Portable Text de articleRichText est projete RICHE (style, listItem, level,
// children avec marks). Les markDefs portent l'annotation `link` RICHE (interne/
// externe/ancre, ref dereferencee), PARTAGEE avec l'editorial (PT_LINK_MARKDEFS); le
// transform la resout en href localise via ptToLinkedEntries, vers PortableTextBlock
// du contrat article-blocks. Le serialiseur PortableText.vue rend interne -> NuxtLink.

import { FIGURE_PROJECTION } from './figure'
import { LINK_PROJECTION, PT_LINK_MARKDEFS } from './link'

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
      "markDefs": ${PT_LINK_MARKDEFS}
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
