/* Contrat de contenu d'un article du blog Ancree. Fichier TYPE-ONLY: la
 * transformation Sanity (app/sanity/transform.ts) produit cette forme, aucune
 * fonction de repli ici. Le corps est une suite de blocs d'article (discrimines
 * par _type), rendus par l'ArticleBuilder. i18n document-level: un article par
 * langue, slug partage. Aucune numerotation affichee, site-wide. AUCUNE valeur
 * design ni de contenu ici, que des champs. */
import type { ArticleBlock } from '~/types/blocks'
import type { ArticleFigure } from '~/content/article-blocks'

export interface ArticleCategoryRef {
  title: string
  slug: string
}

export interface Article {
  slug: string // partage fr/en
  title: string
  excerpt: string
  cover: ArticleFigure
  date: string // ISO de publication
  author: string
  readingTime: number
  category?: ArticleCategoryRef
  body: ArticleBlock[]
}
