// Types des blocs page-builder.
//
// Chaque bloc est discriminé par `_type` et identifié par `_key`. La shape
// reflète ce qu'on aura plus tard depuis Sanity: `{ _type, _key, ...fields }`.
// Les blocs Vue eux-mêmes ne savent pas d'où vient la donnée — ils reçoivent
// leurs props depuis l'orchestrateur (`page-builder/regular/index.vue`).

// Imports RELATIFS: ce fichier est dans la fermeture de nuxt.config.ts (via
// content/articles.ts), donc typechecké aussi par le projet TS node, où
// l'alias ~ n'est pas résolu.
import type { AboutContent } from '../content/about'
import type { ServicesContent } from '../content/services'
import type { TestimonialsContent } from '../content/testimonials'
import type { FaqContent } from '../content/faq'
import type { ContactContent } from '../content/contact'
import type { MediaTextContent } from '../content/media-text'
import type { CtaBandContent } from '../content/cta-band'
import type { ProcessContent } from '../content/process'
import type { StatsContent } from '../content/stats'
import type { HighlightsContent } from '../content/highlights'
import type { LogosContent } from '../content/logos'
import type { ProjectsPreviewContent } from '../content/projects-preview'
import type { BlogPreviewContent } from '../content/blog-preview'
import type { IframeContent } from '../content/iframe'
import type { VideoYoutubeContent } from '../content/video-youtube'
import type {
  ArticleLeadContent,
  ArticleRichTextContent,
  ArticleImageContent,
  ArticleQuoteContent,
  ArticleGalleryContent,
  ArticleCalloutContent,
  ArticleInlineCtaContent
} from '../content/article-blocks'
import type { HeroContent } from '../content/hero'
import type { PageHero } from '../content/page-heroes'
import type { DetailHeroContent, ArticleHeroContent } from '../content/hero-blocks'

// Exporté pour que chaque composant de bloc puisse se typer
// (BlockBase<'x'> & XContent) sans dépendre de son intégration dans l'union.
export type BlockBase<T extends string> = { _type: T; _key: string }

// Les héros sont désormais des blocs (voir HeroBlock plus bas), rendus via
// l'orchestrateur components/hero/index.vue (heroBlockMap).
export type AboutBlock        = BlockBase<'about'>        & AboutContent
export type ServicesBlock     = BlockBase<'services'>     & ServicesContent
export type TestimonialsBlock = BlockBase<'testimonials'> & TestimonialsContent
// faqSchema: balisage Schema.org FAQPage, décidé par l'ASSEMBLEUR (une seule
// instance balisée par site: le one-pager autonome; sur le multipage, /faq
// porte le balisage via usePageSeo et les blocs faq restent sans schéma).
export type FaqBlock          = BlockBase<'faq'>          & FaqContent & { faqSchema?: boolean }
export type ContactBlock      = BlockBase<'contact'>      & ContactContent

// Blocs multipage (famille Minimaliste).
export type MediaTextBlock        = BlockBase<'media-text'>        & MediaTextContent
export type CtaBandBlock          = BlockBase<'cta-band'>          & CtaBandContent
export type ProcessBlock          = BlockBase<'process'>          & ProcessContent
export type StatsBlock            = BlockBase<'stats'>            & StatsContent
export type HighlightsBlock       = BlockBase<'highlights'>       & HighlightsContent
export type LogosBlock            = BlockBase<'logos'>            & LogosContent
export type ProjectsPreviewBlock  = BlockBase<'projects-preview'> & ProjectsPreviewContent
export type BlogPreviewBlock      = BlockBase<'blog-preview'>     & BlogPreviewContent

// Blocs d'intégration (médias externes), autonomes comme media-text/cta-band.
export type IframeBlock           = BlockBase<'iframe'>           & IframeContent
export type VideoYoutubeBlock     = BlockBase<'video-youtube'>    & VideoYoutubeContent

export type PageBlock =
  | AboutBlock
  | ServicesBlock
  | TestimonialsBlock
  | FaqBlock
  | ContactBlock
  | MediaTextBlock
  | CtaBandBlock
  | ProcessBlock
  | StatsBlock
  | HighlightsBlock
  | LogosBlock
  | ProjectsPreviewBlock
  | BlogPreviewBlock
  | IframeBlock
  | VideoYoutubeBlock

// Blocs du page-builder d'ARTICLES (corps de billet de blog). Union discriminée
// par _type, même sécurité de dispatch que PageBlock: le contenu des articles
// (content/articles.ts) et l'orchestrateur (page-builder/article/index.vue) sont
// typés contre elle, chaque composant de bloc contre son type propre.
export type ArticleLeadBlock      = BlockBase<'lead'>       & ArticleLeadContent
export type ArticleRichTextBlock  = BlockBase<'rich-text'>  & ArticleRichTextContent
export type ArticleImageBlock     = BlockBase<'image'>      & ArticleImageContent
export type ArticleQuoteBlock     = BlockBase<'quote'>      & ArticleQuoteContent
export type ArticleGalleryBlock   = BlockBase<'gallery'>    & ArticleGalleryContent
export type ArticleCalloutBlock   = BlockBase<'callout'>    & ArticleCalloutContent
export type ArticleInlineCtaBlock = BlockBase<'inline-cta'> & ArticleInlineCtaContent

export type ArticleBlock =
  | ArticleLeadBlock
  | ArticleRichTextBlock
  | ArticleImageBlock
  | ArticleQuoteBlock
  | ArticleGalleryBlock
  | ArticleCalloutBlock
  | ArticleInlineCtaBlock

// Blocs héros: le héros devient un bloc discriminé par _type, rendu via
// heroBlockMap (components/hero/block-map.ts), comme PageBlock pour les blocs
// réguliers. _type kebab côté Vue. breadcrumbs est une prop de RENDU passée par
// l'orchestrateur, hors du type de contenu stocké.
export type HeroHomeBlock    = BlockBase<'hero-home'>    & HeroContent
export type HeroPageBlock    = BlockBase<'hero-page'>    & PageHero
export type HeroDetailBlock  = BlockBase<'hero-detail'>  & DetailHeroContent
export type HeroArticleBlock = BlockBase<'hero-article'> & ArticleHeroContent

export type HeroBlock =
  | HeroHomeBlock
  | HeroPageBlock
  | HeroDetailBlock
  | HeroArticleBlock
