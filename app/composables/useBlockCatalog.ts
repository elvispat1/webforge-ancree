// useBlockCatalog — source unique de la vitrine des blocs (/showcase).
//
// Groupe les blocs par categorie pour le guide interne. Pioche les blocs de
// PRODUCTION via les MEMES composables que les pages (useHomeBlocks,
// useServicesPageBlocks, ...), donc la vitrine rend les blocs EXACTEMENT comme le
// site (memes composants, memes props). Quand le contenu evolue au Studio, la
// vitrine suit sans entretien. Porte de Minimaliste, adapte a la peau Ancree:
// pas de project (serviceCity prend sa place), pas de media-text/stats/highlights/
// logos/projects-preview/blog-preview/iframe/video; le bloc process vit sur le
// detail d'un service.
//
// Trois categories, miroir de l'architecture:
//   - heros     -> les heros (hors page-builder: imposes par type de page)
//   - reguliers -> blocs du page-builder regulier (modulaires, reordonnables)
//   - articles  -> blocs du page-builder d'articles

import type { Component } from 'vue'
import { regularBlockMap } from '~/components/page-builder/regular/block-map'
import { articleBlockMap } from '~/components/page-builder/article/block-map'
import Hero from '~/components/hero/index.vue'
import type { PageBlock, HeroBlock, HeroPageBlock } from '~/types/blocks'
import { breadcrumbsFor, routePath } from '~/config/route-map'
import type { EditorialDisposition, EditorialImage } from '~/content/editorial'

/** Une variante commutable d'un bloc dans la vitrine (compte d'items, style…). */
export interface BlockVariant {
  /** Libelle court affiche dans le controle (ex. '3 items'). */
  label: string
  /** Props passees au composant pour cette variante. */
  props: Record<string, unknown>
  /** Variante preselectionnee a l'ouverture (sinon la premiere). */
  isDefault?: boolean
}

export interface CatalogItem {
  /** Nom lisible affiche dans le bandeau. */
  label: string
  /** _type technique (cle du block-map, ou 'hero'). */
  type: string
  /** Etiquette de variante FIGEE (badge), pour un bloc sans controle (ex. heros). */
  variant?: string
  /** Composant a rendre. */
  component: Component
  /** Props par defaut. Repli quand `variants` est absent. */
  props: Record<string, unknown>
  /** Variantes commutables via un controle (onglets). >1 -> affiche le controle. */
  variants?: BlockVariant[]
}

export interface CatalogCategory {
  id: string
  label: string
  emptyLabel?: string
  items: CatalogItem[]
}

// Ancre DOM d'un item: #type pour la 1re occurrence d'un type, #type-i pour les
// suivantes (les heros partagent le type 'hero'). Partage par la nav laterale et
// le rendu, pour pointer sur les memes ids.
export function anchorIdFor(items: CatalogItem[], index: number): string {
  const item = items[index]
  if (!item) return ''
  const first = items.findIndex((i) => i.type === item.type)
  return index === first ? item.type : `${item.type}-${index}`
}

// Entrees de la nav laterale d'une categorie: une par item.
export function navItemsFor(items: CatalogItem[]): { id: string; label: string }[] {
  return items.map((item, i) => ({ id: anchorIdFor(items, i), label: item.label }))
}

// Pioche le premier bloc d'un _type dans une composition resolue. La vitrine EXIGE
// la presence (seed fidele): un bloc manquant echoue ici avec un message clair,
// jamais une vitrine silencieusement trouee.
function pickBlock<T extends PageBlock['_type']>(
  blocks: PageBlock[],
  type: T
): Extract<PageBlock, { _type: T }> {
  const block = blocks.find((b): b is Extract<PageBlock, { _type: T }> => b._type === type)
  if (!block) {
    throw new Error(`Vitrine des blocs: aucun bloc « ${type} » dans la composition piochee`)
  }
  return block
}

// Props d'un bloc pioche, re-cle pour la vitrine (_key showcase-*). Le detour par
// unknown elargit le bloc discrimine (union PageBlock) vers la forme generique.
function showcaseProps(block: PageBlock, key: string): Record<string, unknown> {
  return { ...(block as unknown as Record<string, unknown>), _key: `showcase-${key}` }
}

// Variantes de COMPTE: de `min` a `max` enfants, via `build(n)`. `unit` etiquette
// le controle. La variante `def` est preselectionnee.
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

  // Compositions de production (snapshot: la vitrine n'a pas besoin de reactivite).
  // On reunit tous les pageBuilder en un pool, puis on pioche chaque _type ou qu'il
  // soit defini (trust-bar/services/about sur l'accueil, contact sur la page contact,
  // etc.). Couvre les 8 blocs du page-builder; `process` vit sur le detail service.
  const pool: PageBlock[] = [
    ...useHomeBlocks().value,
    ...useServicesPageBlocks().value,
    ...useVillesPageBlocks().value,
    ...useAboutBlocks().value,
    ...useContactPageBlocks().value,
    ...useFaqPageBlocks().value
  ]

  // Bloc process: vit desormais dans le pageBuilder des pages de detail (service/
  // ville), pas sur les singletons. On pioche le 1er service dont le pageBuilder
  // porte un process, puis on le resout (build statique).
  const serviceWithProcess = useServices().find((s) => s.pageBuilder?.some((b) => b._type === 'process'))
  const processBlock = serviceWithProcess
    ? useServiceBlocks(serviceWithProcess).find((b) => b._type === 'process')
    : undefined

  // Bloc editorial: idem, il vit dans le pageBuilder des pages de detail. On cherche
  // le 1er service dont l'editorial porte au moins deux images AU TOTAL (reparties sur
  // ses segments), de quoi batir TOUTES les compositions de la vitrine (bandeau,
  // diptyque, emboitee...). Les onglets de variantes sont mono-segment, donc honores
  // tels quels par le rendu; le total suffit, un segment a deux images n'est plus requis.
  let editorialBlock: Extract<PageBlock, { _type: 'editorial' }> | undefined
  for (const s of useServices()) {
    const found = useServiceBlocks(s).find(
      (b): b is Extract<PageBlock, { _type: 'editorial' }> =>
        b._type === 'editorial' &&
        b.segments.reduce((n, seg) => n + seg.media.length, 0) >= 2
    )
    if (found) {
      editorialBlock = found
      break
    }
  }

  // Bloc highlights (« points forts »): vit aussi sur le detail d'un service.
  const serviceWithHighlights = useServices().find((s) => s.pageBuilder?.some((b) => b._type === 'highlights'))
  const highlightsBlock = serviceWithHighlights
    ? useServiceBlocks(serviceWithHighlights).find((b) => b._type === 'highlights')
    : undefined

  // Variantes de compte du bloc services, derivees de la grille de prod tranchee au
  // compte voulu. Liens neutralises (les pages de detail par service ne sont pas
  // crawlees par le link-checker du build statique; les villes, pages reelles, le
  // sont et restent intactes).
  const servicesGrid = pickBlock(pool, 'services')
  const servicesVariant = (count: number): Record<string, unknown> => ({
    ...servicesGrid,
    _key: `showcase-services-${count}`,
    ctaHref: undefined,
    items: servicesGrid.items.slice(0, count).map((it) => ({ ...it, href: undefined }))
  })

  // Echantillon de bloc d'article: 1er bloc de ce _type rencontre dans les corps.
  const articles = useArticles()
  const sampleArticle = articles[0]
  const sampleArticleCat = sampleArticle?.category
  const sampleArticleBlock = (type: string): Record<string, unknown> => {
    for (const article of articles) {
      const block = article.body.find((b) => b._type === type)
      if (block) return block as unknown as Record<string, unknown>
    }
    return { _type: type, _key: `showcase-${type}` }
  }
  const formatDate = (iso: string): string =>
    new Intl.DateTimeFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    }).format(new Date(iso))

  // Heros, rendus via le dispatcher <Hero :hero> (heroBlockMap par _type), comme en
  // prod. Un objet bloc par type (home/page/article).
  const site = useContent('site')
  const heroHome = useHeroContent().value as unknown as HeroBlock

  // Masthead (hero-page): SOURCE REELLE, comme les vraies pages (fini le masthead
  // synthetise depuis l'i18n, deconnecte du contenu Studio). Le masthead de page
  // (usePageHero) et de detail (useService/useServiceCity .hero) portent leur titre,
  // accroche, appel ET image du Studio; on les enrichit du fil d'Ariane exactement
  // comme les pages le font. Quatre onglets: avec image (reel), texte seul (image
  // retiree, montre la disposition dormante), detail service, detail ville. CTA en
  // tel: (non crawle par le link-checker du build statique).
  const fallbackCta = { label: t('hero.cta_primary'), href: `tel:${site.value.contact.phoneE164}` }

  const pageHero = usePageHero('services').value
  const mastheadPage: HeroPageBlock = {
    ...pageHero,
    _type: 'hero-page',
    _key: 'showcase-hero-page',
    crumbs: breadcrumbsFor('services', undefined, locale),
    eyebrow: pageHero.eyebrow ?? t('hero.kicker')
  }
  const mastheadText: HeroPageBlock = { ...mastheadPage, _key: 'showcase-hero-page-text', image: undefined }

  const svcList = useServices()
  const svc = svcList[0] ? useService(svcList[0].slug) : undefined
  const svcHero = svc?.hero
  const mastheadService: HeroPageBlock | undefined =
    svc && svcHero
      ? {
          ...svcHero,
          _type: 'hero-page',
          _key: 'showcase-hero-detail-service',
          crumbs: breadcrumbsFor('services', { label: svc.title }, locale),
          cta: svcHero.cta ?? fallbackCta
        }
      : undefined

  const cityList = useServiceCities()
  const cityDetail = cityList[0] ? useServiceCity(cityList[0].slug) : undefined
  const cityHero = cityDetail?.hero
  const mastheadCity: HeroPageBlock | undefined =
    cityDetail && cityHero
      ? {
          ...cityHero,
          _type: 'hero-page',
          _key: 'showcase-hero-detail-city',
          crumbs: breadcrumbsFor('villes', { label: cityDetail.city }, locale),
          cta: cityHero.cta ?? fallbackCta
        }
      : undefined

  const mastheadVariants: BlockVariant[] = [
    { label: t('showcase.hero.with_image'), props: { hero: mastheadPage }, isDefault: true },
    { label: t('showcase.hero.text_only'), props: { hero: mastheadText } }
  ]
  if (mastheadService) mastheadVariants.push({ label: t('showcase.hero.detail_service'), props: { hero: mastheadService } })
  if (mastheadCity) mastheadVariants.push({ label: t('showcase.hero.detail_city'), props: { hero: mastheadCity } })

  const heroItems: CatalogItem[] = [
    { label: t('showcase.hero_home'), type: 'hero', variant: 'home', component: Hero, props: { hero: heroHome } },
    { label: t('showcase.hero_page'), type: 'hero', component: Hero, props: { hero: mastheadPage }, variants: mastheadVariants }
  ]
  if (sampleArticle) {
    const heroArticle: HeroBlock = {
      _type: 'hero-article',
      _key: 'showcase-hero-article',
      crumbs: breadcrumbsFor('blog', { label: sampleArticle.title }, locale),
      category: sampleArticleCat
        ? { label: sampleArticleCat.title, href: `${routePath('blog', locale)}/${sampleArticleCat.slug}` }
        : undefined,
      title: sampleArticle.title,
      excerpt: sampleArticle.excerpt,
      date: sampleArticle.date,
      dateLabel: formatDate(sampleArticle.date),
      author: sampleArticle.author,
      readingTime: sampleArticle.readingTime,
      cover: sampleArticle.cover
    } as unknown as HeroBlock
    heroItems.push({ label: t('showcase.hero_article'), type: 'hero', variant: 'article', component: Hero, props: { hero: heroArticle } })
  }

  const reguliers: CatalogItem[] = [
    { label: t('showcase.block.trust_bar'), type: 'trust-bar', component: regularBlockMap['trust-bar'], props: showcaseProps(pickBlock(pool, 'trust-bar'), 'trust-bar') },
    { label: t('showcase.block.services'), type: 'services', component: regularBlockMap.services, props: servicesVariant(4), variants: countVariants(2, 5, 4, servicesVariant, t('showcase.unit.items')) },
    { label: t('showcase.block.service_cities'), type: 'service-cities', component: regularBlockMap['service-cities'], props: showcaseProps(pickBlock(pool, 'service-cities'), 'service-cities') },
    { label: t('showcase.block.about'), type: 'about', component: regularBlockMap.about, props: showcaseProps(pickBlock(pool, 'about'), 'about') },
    { label: t('showcase.block.testimonials'), type: 'testimonials', component: regularBlockMap.testimonials, props: showcaseProps(pickBlock(pool, 'testimonials'), 'testimonials') },
    { label: t('showcase.block.faq'), type: 'faq', component: regularBlockMap.faq, props: showcaseProps(pickBlock(pool, 'faq'), 'faq') },
    { label: t('showcase.block.contact'), type: 'contact', component: regularBlockMap.contact, props: showcaseProps(pickBlock(pool, 'contact'), 'contact') },
    { label: t('showcase.block.cta_band'), type: 'cta-band', component: regularBlockMap['cta-band'], props: showcaseProps(pickBlock(pool, 'cta-band'), 'cta-band') }
  ]
  if (processBlock) {
    reguliers.splice(2, 0, {
      label: t('showcase.block.process'),
      type: 'process',
      component: regularBlockMap.process,
      props: showcaseProps(processBlock, 'process')
    })
  }

  // Editorial: range avec les blocs de contenu long, juste apres « A propos ». Source
  // reelle (comme process) + variantes commutables (onglets) qui exhibent CHAQUE
  // disposition avec les vraies images live. Aucun editorial ne montre tout a la fois;
  // les onglets couvrent l'ensemble du vocabulaire (cote alterne pour exposer le
  // zigzag gauche/droite sans doubler les onglets).
  if (editorialBlock) {
    const eBlock = editorialBlock
    const eImages: EditorialImage[] = eBlock.segments.flatMap((seg) => seg.media)
    const eBody = eBlock.segments.find((seg) => seg.body.length)?.body ?? []
    const eVariant = (
      disposition: EditorialDisposition,
      images: EditorialImage[],
      key: string,
      side: 'left' | 'right' = 'right'
    ): Record<string, unknown> => ({
      ...eBlock,
      _key: `showcase-editorial-${key}`,
      eyebrow: undefined,
      heading: undefined,
      lead: undefined,
      segments: [{ body: eBody, media: images, mediaSide: side, disposition }]
    })
    const aboutIdx = reguliers.findIndex((it) => it.type === 'about')
    reguliers.splice(aboutIdx === -1 ? reguliers.length : aboutIdx + 1, 0, {
      label: t('showcase.block.editorial'),
      type: 'editorial',
      component: regularBlockMap.editorial,
      props: showcaseProps(eBlock, 'editorial'),
      variants: [
        { label: t('showcase.editorial.as_is'), props: showcaseProps(eBlock, 'editorial-asis'), isDefault: true },
        { label: t('showcase.editorial.aside'), props: eVariant('aside', eImages.slice(0, 1), 'aside', 'right') },
        { label: t('showcase.editorial.overhang'), props: eVariant('overhang', eImages.slice(0, 1), 'overhang', 'left') },
        { label: t('showcase.editorial.band'), props: eVariant('band', eImages.slice(0, 1), 'band') },
        { label: t('showcase.editorial.nested'), props: eVariant('nested', eImages.slice(0, 2), 'nested', 'right') },
        { label: t('showcase.editorial.duo'), props: eVariant('duo', eImages.slice(0, 2), 'duo', 'left') },
        { label: t('showcase.editorial.text'), props: eVariant('text', [], 'text') }
      ]
    })
  }

  // Highlights: range juste apres l'editorial (blocs de contenu long du detail service).
  if (highlightsBlock) {
    const hIdx = reguliers.findIndex((it) => it.type === 'editorial')
    reguliers.splice(hIdx === -1 ? reguliers.length : hIdx + 1, 0, {
      label: t('showcase.block.highlights'),
      type: 'highlights',
      component: regularBlockMap.highlights,
      props: showcaseProps(highlightsBlock, 'highlights')
    })
  }

  return [
    { id: 'heros', label: t('showcase.nav.heros'), items: heroItems },
    { id: 'reguliers', label: t('showcase.nav.reguliers'), items: reguliers },
    {
      id: 'articles',
      label: t('showcase.nav.articles'),
      items: [
        { label: t('showcase.block.lead'), type: 'lead', component: articleBlockMap.lead, props: sampleArticleBlock('lead') },
        { label: t('showcase.block.rich_text'), type: 'rich-text', component: articleBlockMap['rich-text'], props: sampleArticleBlock('rich-text') },
        { label: t('showcase.block.image'), type: 'image', component: articleBlockMap.image, props: sampleArticleBlock('image') },
        { label: t('showcase.block.quote'), type: 'quote', component: articleBlockMap.quote, props: sampleArticleBlock('quote') },
        { label: t('showcase.block.gallery'), type: 'gallery', component: articleBlockMap.gallery, props: sampleArticleBlock('gallery') },
        { label: t('showcase.block.callout'), type: 'callout', component: articleBlockMap.callout, props: sampleArticleBlock('callout') },
        { label: t('showcase.block.inline_cta'), type: 'inline-cta', component: articleBlockMap['inline-cta'], props: sampleArticleBlock('inline-cta') }
      ]
    }
  ]
}
