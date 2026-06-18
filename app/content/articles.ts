// Articles de blog — contrats de la collection.
//
// V2 (Sanity, actuel): la collection vit dans les documents `article` (payload
// via useArticles). Un article a 0 ou 1 catégorie (jamais plusieurs: éviterait
// deux URL pour un même contenu). Le corps (`body`) est un tableau de blocs
// d'article rendus par le page-builder d'articles. Ce fichier ne garde que
// ARTICLES_PER_PAGE et les contrats.

// Taille de page de la liste /blog. Vit ICI (fichier de contenu autonome, sans
// import Nuxt) parce que les deux consommateurs ne partagent aucune autre
// couture: useArticles.ts (paginate) et nuxt.config.ts (routes de prérendu
// /blog/page/n — l'alias ~ n'y est pas résolu, impossible d'importer un
// composable). Source unique: pas de désynchronisation pagination/prérendu.
// Grille de 9 par page: avec les 12 articles de démo, la pagination se
// déclenche (page 1 pleine à 9, 3 articles en page 2).
export const ARTICLES_PER_PAGE = 9

// Forme des images et des blocs de corps: interfaces de contenu dans
// ./article-blocks (réexport d'ArticleImage pour les consommateurs existants),
// union discriminée ArticleBlock dans ../types/blocks. Import RELATIF: ce
// fichier est aussi chargé par nuxt.config.ts (projet TS node), où l'alias ~
// n'est pas résolu, ni au runtime ni pour les types.
import type { ArticleImage } from './article-blocks'
import type { ArticleBlock } from '../types/blocks'

export type { ArticleImage }

export interface Article {
  slug: string
  title: string
  excerpt: string
  cover: ArticleImage
  /** Date ISO (YYYY-MM-DD), publication. */
  date: string
  author: string
  /** Slug de catégorie (0 ou 1). Absent = article sans catégorie (URL à 1 segment). */
  category?: string
  /** Temps de lecture en minutes. */
  readingTime: number
  body: ArticleBlock[]
}
