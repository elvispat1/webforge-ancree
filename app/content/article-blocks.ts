// Blocs d'article — interfaces de contenu (la forme des champs, sans _type/_key).
//
// Miroir des composants app/components/page-builder/article/block/*. Les types
// discriminés (ArticleLeadBlock, ..., union ArticleBlock) vivent dans
// app/types/blocks.ts, même mécanique que les blocs réguliers: un _type mal
// orthographié ou un champ manquant dans le corps d'un article casse la
// compilation au lieu d'échouer silencieusement au rendu. En V2 Sanity, ces
// interfaces deviennent le miroir des types d'objets du schéma `post.body`.

/** Image légendée du monde article (cover, bloc image, items de galerie).
 *  `src` absent = placeholder du composant <Image> (jamais une 404). */
export interface ArticleImage {
  ratio: string
  src?: string
  alt: string
  label: string
  caption: string
}

/** Chapô: paragraphe d'introduction mis en valeur. */
export interface ArticleLeadContent {
  text: string
}

/** Entrée du corps riche: paragraphe, sous-titre ou liste à puces. */
export interface RichTextEntry {
  kind: 'paragraph' | 'heading' | 'list'
  /** Texte du paragraphe ou du sous-titre (absent pour une liste). */
  text?: string
  /** Items de la liste (présent seulement quand kind = 'list'). */
  items?: string[]
}

/** Corps de texte riche (suite de paragraphes, sous-titres et listes). */
export interface ArticleRichTextContent {
  blocks: RichTextEntry[]
}

/** Image légendée insérée dans le corps de l'article. */
export interface ArticleImageContent {
  image: ArticleImage
}

/** Citation mise en exergue. */
export interface ArticleQuoteContent {
  quote: string
  attribution?: string
}

/** Grille de figures dans la colonne de lecture. */
export interface ArticleGalleryContent {
  images: ArticleImage[]
}

/** Encadré: note ou avertissement complémentaire au corps. */
export interface ArticleCalloutContent {
  /** Ton de l'encadré: 'note' (accent) ou 'warning' (erreur). Défaut: note. */
  tone?: 'note' | 'warning'
  title?: string
  text: string
}

/** Appel à l'action en ligne, inséré dans le flux de lecture. */
export interface ArticleInlineCtaContent {
  text: string
  ctaLabel: string
  /** Cible interne du bouton (route /...). */
  ctaHref: string
}
