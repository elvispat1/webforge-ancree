/* Table de dispatch des blocs du corps d'article: un _type (kebab) vers un
 * composant. Meme moteur que la page-builder reguliere (string-keyed map +
 * <component :is> + v-bind), catalogue a part propre au blog. */
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
