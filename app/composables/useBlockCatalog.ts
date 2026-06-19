// useBlockCatalog — source unique de la vitrine des blocs (vitrine /showcase).
//
// Groupe les blocs par catégorie pour la page de présentation interne. Pioche
// les blocs de PRODUCTION dans le payload Sanity via les MÊMES composables que
// les pages (useHomeBlocks, useAboutBlocks, ...), donc la vitrine rend les
// blocs EXACTEMENT comme le site (mêmes composants, mêmes props). Quand le
// contenu évolue au Studio, la vitrine suit sans entretien. Les samples
// restants (media-text, cta-band, iframe, video-youtube) sont des builders
// i18n de démonstration (texte fr/en, scaffolding inline), jamais consommés en
// production.
//
// Trois catégories, qui reflètent l'architecture (voir mémoire projet):
//   - heros    → les héros (hors page-builder: composants imposés par type de page)
//   - reguliers → blocs du page-builder régulier (modulaires, réordonnables)
//   - articles  → blocs du page-builder d'articles

import type { Component } from 'vue'
import { regularBlockMap } from '~/components/page-builder/regular/block-map'
import { articleBlockMap } from '~/components/page-builder/article/block-map'
import HeroHome from '~/components/hero/block/home.vue'
import HeroPage from '~/components/hero/block/page.vue'
import HeroDetail from '~/components/hero/block/detail.vue'
import HeroArticle from '~/components/hero/block/article.vue'

import { mediaTextSample } from '~/content/media-text'
import { ctaBandSample } from '~/content/cta-band'
import { iframeSample } from '~/content/iframe'
import { videoYoutubeSample } from '~/content/video-youtube'
import type { PageBlock } from '~/types/blocks'
import { breadcrumbsFor, breadcrumbsFromTrail, routeLabel, routePath } from '~/config/route-map'

/** Une variante commutable d'un bloc dans la vitrine (compte d'items, style…). */
export interface BlockVariant {
  /** Libellé court affiché dans le contrôle (ex. '3 items', 'Centré'). */
  label: string
  /** Props passées au composant pour cette variante. */
  props: Record<string, unknown>
  /** Variante présélectionnée à l'ouverture (sinon la première). */
  isDefault?: boolean
}

export interface CatalogItem {
  /** Nom lisible affiché dans le bandeau dev. */
  label: string
  /** _type technique (clé du block-map). */
  type: string
  /** Étiquette de variante FIGÉE (badge du bandeau), pour un bloc sans contrôle
   *  interactif (ex. les héros: une entrée par type). */
  variant?: string
  /** Composant à rendre. */
  component: Component
  /** Props par défaut. Sert de repli quand `variants` est absent. */
  props: Record<string, unknown>
  /** Variantes commutables via un contrôle (onglets) dans la vitrine. Quand
   *  présent et > 1, la vitrine affiche le contrôle au lieu du badge figé. */
  variants?: BlockVariant[]
}

export interface CatalogCategory {
  id: string
  label: string
  /** Message affiché quand la catégorie est vide. */
  emptyLabel?: string
  items: CatalogItem[]
}

// Ancre DOM d'un item de vitrine: #type pour la 1re occurrence d'un type, #type-i
// pour les suivantes (les héros partagent tous le type 'hero'). Partagé par la nav
// latérale et le rendu, pour qu'ils pointent sur les mêmes ids.
export function anchorIdFor(items: CatalogItem[], index: number): string {
  const item = items[index]
  if (!item) return ''
  const first = items.findIndex((i) => i.type === item.type)
  return index === first ? item.type : `${item.type}-${index}`
}

// Entrées de la nav latérale d'une catégorie: une par item, libellée par
// item.label, ancrée via anchorIdFor (donc une entrée distincte par variante de
// héros, et non une seule pour tous les 'hero').
export function navItemsFor(items: CatalogItem[]): { id: string; label: string }[] {
  return items.map((item, i) => ({ id: anchorIdFor(items, i), label: item.label }))
}

// Pioche le premier bloc d'un _type dans une composition résolue. La vitrine
// EXIGE la présence (seed fidèle au multipage V1): une composition Studio qui
// perd le bloc échoue ici avec un message clair plutôt qu'une vitrine
// silencieusement trouée.
function pickBlock<T extends PageBlock['_type']>(
  blocks: PageBlock[],
  type: T
): Extract<PageBlock, { _type: T }> {
  const block = blocks.find((b): b is Extract<PageBlock, { _type: T }> => b._type === type)
  if (!block) {
    throw new Error(`Vitrine des blocs: aucun bloc « ${type} » dans la composition piochée`)
  }
  return block
}

// Props d'un bloc pioché, re-clé pour la vitrine (_key showcase-*). Le détour
// par unknown élargit le bloc discriminé (union PageBlock, sans signature
// d'index) vers la forme générique des props de la vitrine.
function showcaseProps(block: PageBlock, key: string): Record<string, unknown> {
  return { ...(block as unknown as Record<string, unknown>), _key: `showcase-${key}` }
}

// Construit la liste de variantes de COMPTE d'un bloc, de `min` à `max` enfants,
// via `build(n)` qui retourne les props du bloc à ce compte. `unit` étiquette le
// contrôle (« items », « étapes »…). La variante `def` est présélectionnée.
function countVariants(
  min: number,
  max: number,
  def: number,
  build: (n: number) => Record<string, unknown>,
  unit: string
): BlockVariant[] {
  const out: BlockVariant[] = []
  for (let n = min; n <= max; n++) {
    out.push({ label: `${n} ${unit}`, props: build(n), isDefault: n === def })
  }
  return out
}

export function useBlockCatalog(): CatalogCategory[] {
  const { t } = useI18n()
  const locale = useWfLocale()

  // Compositions de production (payload), résolues par les mêmes composables
  // que les vraies pages.
  // Catalogue /showcase: snapshot des blocs (les assembleurs retournent un computed
  // depuis le passage au live editing; la vitrine n'a pas besoin de réactivité).
  const homeBlocks = useHomeBlocks().value
  const aboutBlocks = useAboutBlocks().value
  const servicesPageBlocks = useServicesPageBlocks().value
  const contactBlocks = useContactPageBlocks().value
  const onePagerBlocks = useOnePagerBlocks().value
  const articles = useArticles()

  // Échantillons de héros « detail » et « article » bâtis depuis les collections,
  // comme une vraie page le ferait.
  const sampleProject = useProjects()[0]!
  const sampleArticle = articles[0]!
  const sampleArticleCat = sampleArticle.category ? useCategory(sampleArticle.category) : undefined

  // Échantillon de bloc d'article: premier bloc de ce _type rencontré dans les
  // corps d'articles, rendu tel quel par la vitrine (mêmes props qu'en prod).
  const sampleArticleBlock = (type: string): Record<string, unknown> => {
    for (const article of articles) {
      const block = article.body.find((b) => b._type === type)
      if (block) return block as unknown as Record<string, unknown>
    }
    return { _type: type, _key: `showcase-${type}` }
  }

  // Variantes de compte du bloc « services », dérivées de la grille de
  // production (page Services, cartes cliquables) tranchée au compte voulu.
  // Sert à valider à l'œil la résilience de la grille (--service-count): peu
  // importe le compte, une rangée pleine, jamais d'orphelin. Double comme
  // fixture anti-régression de la famille.
  const servicesGrid = pickBlock(servicesPageBlocks, 'services')
  const servicesVariant = (count: number): Record<string, unknown> => ({
    ...servicesGrid,
    _key: `showcase-services-${count}`,
    items: servicesGrid.items.slice(0, count)
  })

  // Mêmes principes pour process et logos: on dérive du contenu réel en
  // tranchant le tableau d'enfants au compte voulu.
  const processBlock = pickBlock(servicesPageBlocks, 'process')
  const processVariant = (count: number): Record<string, unknown> => ({
    ...processBlock,
    _key: `showcase-process-${count}`,
    steps: processBlock.steps.slice(0, count)
  })

  const logosBlock = pickBlock(aboutBlocks, 'logos')
  const logosVariant = (count: number): Record<string, unknown> => ({
    ...logosBlock,
    _key: `showcase-logos-${count}`,
    items: logosBlock.items.slice(0, count)
  })

  return [
    {
      id: 'heros',
      label: 'Héros',
      items: [
        {
          label: 'Hero Home',
          type: 'hero',
          variant: 'home',
          component: HeroHome,
          props: { ...useHeroContent().value }
        },
        {
          label: 'Hero Page',
          type: 'hero',
          variant: 'page',
          component: HeroPage,
          props: { ...usePageHero('services').value, breadcrumbs: breadcrumbsFor('services', undefined, locale) }
        },
        {
          label: 'Hero Detail',
          type: 'hero',
          variant: 'detail',
          component: HeroDetail,
          props: {
            breadcrumbs: breadcrumbsFor('projects', { label: sampleProject.title }, locale),
            title: sampleProject.title,
            meta: [sampleProject.location, sampleProject.year],
            image: sampleProject.cover
          }
        },
        {
          label: 'Hero Article',
          type: 'hero',
          variant: 'article',
          component: HeroArticle,
          props: {
            // Catalogue /showcase: échantillons localisés selon la locale courante.
            breadcrumbs: breadcrumbsFromTrail(
              locale,
              { label: routeLabel('blog', locale), to: routePath('blog', locale) },
              { label: sampleArticle.title }
            ),
            category: sampleArticleCat
              ? { label: sampleArticleCat.title, to: `${routePath('blog', locale)}/${sampleArticleCat.slug}` }
              : undefined,
            title: sampleArticle.title,
            date: sampleArticle.date,
            author: sampleArticle.author,
            readingTime: sampleArticle.readingTime,
            cover: sampleArticle.cover
          }
        }
      ]
    },
    {
      id: 'reguliers',
      label: 'Blocs réguliers',
      items: [
        {
          label: 'About',
          type: 'about',
          component: regularBlockMap.about,
          props: showcaseProps(pickBlock(aboutBlocks, 'about'), 'about')
        },
        {
          label: 'Services',
          type: 'services',
          component: regularBlockMap.services,
          props: servicesVariant(4),
          variants: countVariants(2, 5, 4, servicesVariant, 'items')
        },
        {
          label: 'Testimonials',
          type: 'testimonials',
          component: regularBlockMap.testimonials,
          props: showcaseProps(pickBlock(homeBlocks, 'testimonials'), 'testimonials')
        },
        {
          label: 'FAQ',
          type: 'faq',
          component: regularBlockMap.faq,
          // faqSchema neutralisé: la vitrine ne balise jamais FAQPage (le
          // one-pager garde la seule instance balisée de son site).
          props: { ...showcaseProps(pickBlock(onePagerBlocks, 'faq'), 'faq'), faqSchema: false }
        },
        {
          label: 'Contact',
          type: 'contact',
          component: regularBlockMap.contact,
          props: showcaseProps(pickBlock(contactBlocks, 'contact'), 'contact')
        },
        {
          label: 'Media + Text',
          type: 'media-text',
          component: regularBlockMap['media-text'],
          props: { _type: 'media-text', _key: 'showcase-media-text', ...mediaTextSample(t, locale) }
        },
        {
          label: 'CTA Band',
          type: 'cta-band',
          component: regularBlockMap['cta-band'],
          props: { _type: 'cta-band', _key: 'showcase-cta-band', ...ctaBandSample(t, locale) }
        },
        {
          label: 'Process',
          type: 'process',
          component: regularBlockMap.process,
          props: processVariant(4),
          variants: countVariants(3, 4, 4, processVariant, 'étapes')
        },
        {
          label: 'Stats',
          type: 'stats',
          component: regularBlockMap.stats,
          props: showcaseProps(pickBlock(homeBlocks, 'stats'), 'stats')
        },
        {
          label: 'Highlights',
          type: 'highlights',
          component: regularBlockMap.highlights,
          props: showcaseProps(pickBlock(homeBlocks, 'highlights'), 'highlights')
        },
        {
          label: 'Logos',
          type: 'logos',
          component: regularBlockMap.logos,
          props: logosVariant(5),
          variants: countVariants(3, 5, 5, logosVariant, 'libellés')
        },
        {
          label: 'Projects Preview',
          type: 'projects-preview',
          component: regularBlockMap['projects-preview'],
          props: showcaseProps(pickBlock(homeBlocks, 'projects-preview'), 'projects-preview')
        },
        {
          label: 'Blog Preview',
          type: 'blog-preview',
          component: regularBlockMap['blog-preview'],
          props: showcaseProps(pickBlock(homeBlocks, 'blog-preview'), 'blog-preview')
        },
        {
          label: 'Iframe',
          type: 'iframe',
          component: regularBlockMap.iframe,
          props: { _type: 'iframe', _key: 'showcase-iframe', ...iframeSample(t) }
        },
        {
          label: 'Vidéo YouTube',
          type: 'video-youtube',
          component: regularBlockMap['video-youtube'],
          props: { _type: 'video-youtube', _key: 'showcase-video-youtube', ...videoYoutubeSample(t) },
          // Deux affiches: image personnalisée (défaut) ou vignette YouTube + bouton de lecture.
          variants: [
            {
              // Variante par défaut: BlockShowcaseItem rend la variante isDefault
              // AU BUILD, donc <NuxtImg> cuit les variantes IPX du poster custom
              // (jusqu'aux largeurs retina du 100vw). Sans ça, le poster custom
              // togglé demandait des largeurs non cuites (2048/2880/3840) -> 404
              // sur desktop haute densité. La vignette YouTube, elle, est un <img>
              // externe (hors IPX), aucun prérendu requis.
              label: 'Image custom',
              props: { _type: 'video-youtube', _key: 'showcase-video-youtube-custom', ...videoYoutubeSample(t), posterMode: 'custom' },
              isDefault: true
            },
            {
              label: 'Vignette YouTube',
              props: { _type: 'video-youtube', _key: 'showcase-video-youtube-yt', ...videoYoutubeSample(t), posterMode: 'youtube' }
            }
          ]
        }
      ]
    },
    {
      id: 'articles',
      label: 'Blocs d\'articles',
      items: [
        { label: 'Lead', type: 'lead', component: articleBlockMap.lead, props: sampleArticleBlock('lead') },
        { label: 'Rich Text', type: 'rich-text', component: articleBlockMap['rich-text'], props: sampleArticleBlock('rich-text') },
        { label: 'Image', type: 'image', component: articleBlockMap.image, props: sampleArticleBlock('image') },
        { label: 'Quote', type: 'quote', component: articleBlockMap.quote, props: sampleArticleBlock('quote') },
        { label: 'Gallery', type: 'gallery', component: articleBlockMap.gallery, props: sampleArticleBlock('gallery') },
        { label: 'Callout', type: 'callout', component: articleBlockMap.callout, props: sampleArticleBlock('callout') },
        { label: 'Inline CTA', type: 'inline-cta', component: articleBlockMap['inline-cta'], props: sampleArticleBlock('inline-cta') }
      ]
    }
  ]
}
