// Table de correspondance _type -> composant pour le page-builder d'ARTICLES.
//
// Deuxième type de page-builder (distinct du régulier): porte les blocs
// spécifiques aux articles de blog (chapô, corps riche, image, citation, galerie,
// encadré, CTA en ligne). Même forme que regularBlockMap pour que l'orchestrateur
// soit identique. Les clés à tiret (rich-text, inline-cta) s'accèdent par notation
// littérale dans l'orchestrateur (articleBlockMap[block._type]).

import Lead from './block/lead.vue'
import RichText from './block/rich-text.vue'
import ArticleImage from './block/image.vue'
import Quote from './block/quote.vue'
import Gallery from './block/gallery.vue'
import Callout from './block/callout.vue'
import InlineCta from './block/inline-cta.vue'

export const articleBlockMap = {
  lead: Lead,
  'rich-text': RichText,
  image: ArticleImage,
  quote: Quote,
  gallery: Gallery,
  callout: Callout,
  'inline-cta': InlineCta
} as const

export type ArticleBlockType = keyof typeof articleBlockMap
