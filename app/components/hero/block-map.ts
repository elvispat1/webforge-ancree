// Table _type -> composant pour les héros (calque de regular/block-map.ts).
// Partagée par l'orchestrateur de héros (index.vue) et la vitrine /showcase.
import HeroHome from './block/home.vue'
import HeroPage from './block/page.vue'
import HeroDetail from './block/detail.vue'
import HeroArticle from './block/article.vue'

export const heroBlockMap = {
  'hero-home': HeroHome,
  'hero-page': HeroPage,
  'hero-detail': HeroDetail,
  'hero-article': HeroArticle
} as const

export type HeroBlockType = keyof typeof heroBlockMap
