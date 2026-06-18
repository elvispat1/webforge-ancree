// Interfaces des blocs héros dérivés d'une collection (détail projet/service,
// article). Le contenu vient du document de collection (titre, couverture…),
// composé en HeroBlock côté code; pas de champ Sanity tant qu'il n'y a qu'une
// variante (raffinement YAGNI du plan héros-en-blocs).
import type { HeroFigure } from './hero'

export interface DetailHeroContent {
  title: string
  lead?: string
  meta?: string[]
  image: HeroFigure
}

export interface ArticleHeroContent {
  category?: { label: string; to: string }
  title: string
  date: string
  author: string
  readingTime: number
  cover: HeroFigure
}
