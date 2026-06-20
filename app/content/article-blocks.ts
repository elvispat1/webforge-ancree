/* Contrats de contenu des blocs d'article du blog Ancree. Miroir de ce que la
 * transformation Sanity produira; AUCUNE valeur design ici, que des champs. Le
 * corps d'un article est une suite de ces blocs (discrimines par _type), rendus
 * par l'ArticleBuilder sur le meme moteur que la page-builder reguliere.
 * Set de depart: amorce, texte riche, image, citation, galerie, encadre, appel.
 * Aucune numerotation affichee, site-wide. */

// Figure d'article: URL CDN deja resolue (jamais un objet asset Sanity), legende
// optionnelle. Reutilisee par l'image seule et la galerie.
export interface ArticleFigure {
  src: string
  alt: string
  caption?: string
}

/* Portable Text: la forme standard Sanity du texte riche. On la garde telle quelle
 * dans les fixtures pour que le meme serialiseur serve le contenu Sanity plus tard.
 * Marques supportees au rendu: strong, em, et l'annotation link. */
export interface PortableTextSpan {
  _type: 'span'
  _key: string
  text: string
  marks?: string[] // 'strong' | 'em' | une cle de markDefs (lien)
}
export interface PortableTextLink {
  _key: string
  _type: 'link'
  href: string
}
export interface PortableTextBlock {
  _type: 'block'
  _key: string
  style?: 'normal' | 'h2' | 'h3'
  listItem?: 'bullet' | 'number'
  level?: number
  children: PortableTextSpan[]
  markDefs?: PortableTextLink[]
}

// Amorce (chapo): le paragraphe d'ouverture, emphase structurelle.
export interface ArticleLeadContent {
  text: string
}

// Texte riche: une suite de blocs Portable Text (titres, paragraphes, listes).
export interface ArticleRichTextContent {
  value: PortableTextBlock[]
}

// Image legendee, pleine mesure de lecture.
export interface ArticleImageContent {
  image: ArticleFigure
}

// Citation mise en exergue, attribution optionnelle.
export interface ArticleQuoteContent {
  quote: string
  attribution?: string
}

// Galerie: au moins deux figures, en grille.
export interface ArticleGalleryContent {
  items: ArticleFigure[]
}

// Encadre: une note ou un avertissement, titre optionnel.
export interface ArticleCalloutContent {
  tone: 'note' | 'warning'
  title?: string
  text: string
}

// Appel a l'action en ligne, au fil du texte.
export interface ArticleInlineCtaContent {
  text: string
  cta: { label: string; href: string }
}
