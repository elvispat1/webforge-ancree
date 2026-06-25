/* Types de blocs. BlockBase porte la discrimination (_type) et la cle (_key) que
 * les mecanismes de dispatch (block-map + <component :is>) utilisent. Les contrats
 * de contenu vivent dans content/. */
import type { HeroContent, HeroPageContent, HeroArticleContent } from '~/content/hero'
import type { TrustBarContent, ServicesContent, ServiceCitiesContent } from '~/content/blocks'
import type { AboutContent } from '~/content/about'
import type { TestimonialsContent } from '~/content/testimonials'
import type { FaqContent } from '~/content/faq'
import type { CtaBandContent } from '~/content/cta-band'
import type { ContactContent } from '~/content/contact'
import type { ProcessContent } from '~/content/process'
import type { EditorialContent } from '~/content/editorial'
import type { HighlightsContent } from '~/content/highlights'
import type {
  ArticleLeadContent,
  ArticleRichTextContent,
  ArticleImageContent,
  ArticleQuoteContent,
  ArticleGalleryContent,
  ArticleCalloutContent,
  ArticleInlineCtaContent
} from '~/content/article-blocks'

export type BlockBase<T extends string> = { _type: T; _key: string }

// Heros (catalogue a part, comme dans le systeme).
export type HeroHomeBlock = BlockBase<'hero-home'> & HeroContent
export type HeroPageBlock = BlockBase<'hero-page'> & HeroPageContent
export type HeroArticleBlock = BlockBase<'hero-article'> & HeroArticleContent
export type HeroBlock = HeroHomeBlock | HeroPageBlock | HeroArticleBlock

// Blocs de la page-builder.
export type TrustBarBlock = BlockBase<'trust-bar'> & TrustBarContent
export type ServicesBlock = BlockBase<'services'> & ServicesContent
export type ServiceCitiesBlock = BlockBase<'service-cities'> & ServiceCitiesContent
export type AboutBlock = BlockBase<'about'> & AboutContent
export type TestimonialsBlock = BlockBase<'testimonials'> & TestimonialsContent
export type FaqBlock = BlockBase<'faq'> & FaqContent
export type CtaBandBlock = BlockBase<'cta-band'> & CtaBandContent
export type ContactBlock = BlockBase<'contact'> & ContactContent
export type ProcessBlock = BlockBase<'process'> & ProcessContent
export type EditorialBlock = BlockBase<'editorial'> & EditorialContent
export type HighlightsBlock = BlockBase<'highlights'> & HighlightsContent

export type PageBlock =
  | TrustBarBlock
  | ServicesBlock
  | ServiceCitiesBlock
  | AboutBlock
  | TestimonialsBlock
  | FaqBlock
  | CtaBandBlock
  | ContactBlock
  | ProcessBlock
  | EditorialBlock
  | HighlightsBlock

// Blocs du corps d'article (catalogue a part, comme les heros). _type courts.
export type ArticleLeadBlock = BlockBase<'lead'> & ArticleLeadContent
export type ArticleRichTextBlock = BlockBase<'rich-text'> & ArticleRichTextContent
export type ArticleImageBlock = BlockBase<'image'> & ArticleImageContent
export type ArticleQuoteBlock = BlockBase<'quote'> & ArticleQuoteContent
export type ArticleGalleryBlock = BlockBase<'gallery'> & ArticleGalleryContent
export type ArticleCalloutBlock = BlockBase<'callout'> & ArticleCalloutContent
export type ArticleInlineCtaBlock = BlockBase<'inline-cta'> & ArticleInlineCtaContent

export type ArticleBlock =
  | ArticleLeadBlock
  | ArticleRichTextBlock
  | ArticleImageBlock
  | ArticleQuoteBlock
  | ArticleGalleryBlock
  | ArticleCalloutBlock
  | ArticleInlineCtaBlock
