/* Table de dispatch des variantes de heros: un _type (kebab-case) vers un
 * composant. Mecanisme repris tel quel du systeme. hero-home = le full bleed
 * d'accueil; hero-page = le masthead des pages internes (services, faq, contact,
 * a-propos, blog). Les variantes hero-detail / hero-article rejoindront ensuite. */
import HeroHome from './block/home.vue'
import HeroPage from './block/page.vue'
import HeroArticle from './block/article.vue'

export const heroBlockMap = {
  'hero-home': HeroHome,
  'hero-page': HeroPage,
  'hero-article': HeroArticle
} as const

export type HeroBlockType = keyof typeof heroBlockMap
