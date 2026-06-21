/* Requetes GROQ et transformation pure Sanity -> formes de contenu que les
 * composants consomment (HeroContent, *Content). Document-level i18n: on filtre
 * par language == $lang. La page fetch via useSanityQuery au build; si Sanity est
 * vide, l'appelant retombe sur les fixtures (le site ne casse jamais). Les
 * libelles d'interface (formulaire de contact, etc.) restent hors de Sanity. */
import type { HeroHomeBlock, PageBlock, ArticleBlock } from '~/types/blocks'
import type { ArticleContent } from '~/content/article'
import type { CategoryContent } from '~/content/blog'
import type { SiteIdentity } from '~/content/site'
import { contactFixture } from '~/content/contact'
import { serviceCityPath } from '~/config/route-map'

type Locale = 'fr' | 'en'

function prefix(locale: Locale): string {
  return locale === 'en' ? '/en' : ''
}

/* Coerce un tableau de contenu en paragraphes texte. Accepte des chaines, des
 * blocs Portable Text { _type:'block', children:[{text}] } ou { text }. */
/* eslint-disable @typescript-eslint/no-explicit-any */
function toParagraphs(arr: any): string[] {
  if (!Array.isArray(arr)) return []
  return arr
    .map((item: any) => {
      if (typeof item === 'string') return item
      if (item && typeof item.text === 'string') return item.text
      if (item && Array.isArray(item.children)) return item.children.map((c: any) => c?.text || '').join('')
      return ''
    })
    .filter((s: string) => s.length > 0)
}

/* Les requetes PAR PAGE (homePage, serviceCity, services, blog) ont ete remplacees
 * par CONTENT_GRAPH_QUERY (plus bas): UNE lecture au build, deposee dans le payload
 * par le plugin 01.content, lue en synchrone par usePayload(). Les transforms
 * ci-dessous (transformHome/transformServiceCity/transformBlog) restent: ils sont
 * reutilises par transformGraph. */

/* ---------- Transformations ---------- */

interface CtaShape {
  label?: string
  href?: string
}

// Ramene les liens de soumission/estimation vers l'ancre de contact de l'accueil
// (il n'existe pas de page d'estimation dediee; le formulaire EST la soumission).
// Tolerant a la locale: #soumission, /estimation, /en/estimate, /estimate...
function normalizeHref(href: string | undefined, locale: Locale): string {
  if (!href) return '#contact'
  if (href === '#soumission' || /\/estimat(e|ion)$/.test(href)) return '#contact'
  return href
}

function cta(value: CtaShape | undefined, fallbackLabel: string, fallbackHref: string, locale: Locale): { label: string; href: string } {
  return {
    label: value?.label || fallbackLabel,
    href: normalizeHref(value?.href, locale) || fallbackHref
  }
}

export interface HomeContent {
  hero: HeroHomeBlock
  blocks: PageBlock[]
  seo: { title?: string; description?: string }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function transformHome(data: any, locale: Locale): HomeContent | null {
  if (!data || !data.hero) return null
  const p = prefix(locale)

  const hero: HeroHomeBlock = {
    _type: 'hero-home',
    _key: 'home-hero',
    kicker: data.hero.kicker,
    title: data.hero.title,
    lead: data.hero.lead,
    primaryCta: cta(data.hero.primaryCta, 'Appeler', 'tel:+14505550199', locale),
    secondaryCta: cta(data.hero.secondaryCta, 'Estimation', '#contact', locale),
    meta: (data.hero.meta || []).map((m: any) => ({ icon: m.icon, value: m.value, label: m.label })),
    visual: { ratio: '16/9', src: data.hero.visual?.src, alt: data.hero.visual?.alt || '', label: '', caption: '' },
    visualMobile: { ratio: '4/5', src: data.hero.visual?.src, alt: data.hero.visual?.alt || '', label: '', caption: '' }
  }

  const services = data.services || []
  const cities = data.cities || []
  const testimonials = data.testimonials || []
  const faq = data.faq || []
  const site = data.site || {}

  // Cle semantique stable par type: les ancres de section (#services, #contact...)
  // doivent etre coherentes avec la nav et les fixtures. Sanity stocke des _key
  // opaques (b1..b8); on les remappe pour que tout ancrage resolve sur le vrai site.
  const anchorKey: Record<string, string> = {
    trustBar: 'trust',
    servicesBlock: 'services',
    serviceCitiesBlock: 'cities',
    aboutBlock: 'about',
    testimonialsBlock: 'testimonials',
    faqBlock: 'faq',
    ctaBand: 'cta-band',
    contactBlock: 'contact'
  }
  const blocks: PageBlock[] = []
  for (const b of data.pageBuilder || []) {
    const key = anchorKey[b._type] || b._key
    switch (b._type) {
      case 'trustBar':
        blocks.push({ _type: 'trust-bar', _key: key, items: (b.items || []).map((i: any) => ({ icon: i.icon, value: i.value, label: i.label })) } as PageBlock)
        break
      case 'servicesBlock':
        blocks.push({
          _type: 'services', _key: key,
          eyebrow: b.eyebrow, heading: b.heading, lead: b.lead, ctaLabel: b.ctaLabel,
          // Le ctaHref est localise ici; on retire un prefixe de locale deja present
          // dans le contenu (ex. /en/services) pour ne jamais doubler (/en/en/...).
          ctaHref: b.ctaHref ? `${p}${b.ctaHref.replace(/^\/(en|fr)(?=\/)/, '')}` : undefined,
          items: services.map((s: any) => ({ icon: s.icon, title: s.title, body: s.body, featured: s.featured }))
        } as PageBlock)
        break
      case 'serviceCitiesBlock':
        blocks.push({
          _type: 'service-cities', _key: key,
          eyebrow: b.eyebrow, heading: b.heading, lead: b.lead, areaLabel: b.areaLabel, areaName: b.areaName, areaNote: b.areaNote,
          cities: cities.map((c: any) => ({ name: c.city, href: serviceCityPath(c.slug, locale), note: c.note, featured: c.featured }))
        } as PageBlock)
        break
      case 'aboutBlock':
        blocks.push({
          _type: 'about', _key: key,
          eyebrow: b.eyebrow, heading: b.heading, body: toParagraphs(b.body),
          photo: { src: b.photo?.src, alt: b.photo?.alt || '' },
          stats: (b.stats || []).map((s: any) => ({ value: s.value, label: s.label }))
        } as PageBlock)
        break
      case 'testimonialsBlock':
        blocks.push({
          _type: 'testimonials', _key: key,
          eyebrow: b.eyebrow, heading: b.heading,
          items: testimonials.map((t: any) => ({ quote: t.quote, name: t.name, city: t.city }))
        } as PageBlock)
        break
      case 'faqBlock':
        blocks.push({
          _type: 'faq', _key: key,
          eyebrow: b.eyebrow, heading: b.heading,
          items: faq.map((f: any) => ({ q: f.question, a: f.answer }))
        } as PageBlock)
        break
      case 'ctaBand':
        blocks.push({
          _type: 'cta-band', _key: key,
          title: b.title, subtitle: b.subtitle,
          primaryCta: cta(b.primaryCta, 'Appeler maintenant', 'tel:+14505550199', locale),
          secondaryCta: cta(b.secondaryCta, 'Obtenir une estimation', '#contact', locale)
        } as PageBlock)
        break
      case 'contactBlock': {
        // Formulaire et structure depuis la fixture (echafaudage); textes et
        // coordonnees surclasses par Sanity quand presents.
        const base = contactFixture(locale === 'en')
        const meta = base.meta.map((m) => {
          if (m.label.toLowerCase().includes('appel') || m.label.toLowerCase().includes('call')) {
            return { ...m, value: site.phoneDisplay || m.value, href: site.phoneHref || m.href }
          }
          if (m.label.toLowerCase().includes('écrire') || m.label.toLowerCase().includes('write') || m.label.toLowerCase().includes('courriel') || m.label.toLowerCase().includes('email')) {
            return { ...m, value: site.emailDisplay || m.value, href: site.emailHref || m.href }
          }
          if (m.label.toLowerCase().includes('zone') || m.label.toLowerCase().includes('area')) {
            return { ...m, lines: site.areaName ? [site.areaName] : m.lines }
          }
          return m
        })
        blocks.push({
          _type: 'contact', _key: key,
          eyebrow: b.eyebrow || base.eyebrow,
          heading: b.heading || base.heading,
          lead: b.lead || base.lead,
          meta,
          form: base.form
        } as PageBlock)
        break
      }
    }
  }

  return { hero, blocks, seo: { title: data.seoTitle, description: data.seoDescription } }
}

export interface ServiceCityPage {
  city: string
  region?: string
  heading?: string
  lead?: string
  body: string[]
  seo: { title?: string; description?: string }
  phoneHref?: string
  phoneDisplay?: string
  areaName?: string
  services: Array<{ icon?: string; title: string; body?: string }>
}

export function transformServiceCity(doc: any): ServiceCityPage | null {
  if (!doc) return null
  return {
    city: doc.city,
    region: doc.region,
    heading: doc.heading,
    lead: doc.lead,
    body: toParagraphs(doc.body),
    seo: { title: doc.seoTitle, description: doc.seoDescription },
    phoneHref: doc.site?.phoneHref,
    phoneDisplay: doc.site?.phoneDisplay,
    areaName: doc.site?.areaName,
    services: (doc.services || []).map((s: any) => ({ icon: s.icon, title: s.title, body: s.body }))
  }
}

/* ---------- Blog ---------- */

// Corps d'article Sanity -> blocs typés du contrat (mapping articleX -> _type court).
function transformArticleBody(body: any): ArticleBlock[] {
  if (!Array.isArray(body)) return []
  const out: ArticleBlock[] = []
  for (const b of body) {
    switch (b._type) {
      case 'articleLead':
        out.push({ _type: 'lead', _key: b._key, text: b.text } as ArticleBlock)
        break
      case 'articleRichText':
        out.push({ _type: 'rich-text', _key: b._key, value: b.body || [] } as ArticleBlock)
        break
      case 'articleImage':
        out.push({ _type: 'image', _key: b._key, image: { src: b.image?.src, alt: b.image?.alt || '', caption: b.caption } } as ArticleBlock)
        break
      case 'articleQuote':
        out.push({ _type: 'quote', _key: b._key, quote: b.quote, attribution: b.attribution } as ArticleBlock)
        break
      case 'articleGallery':
        out.push({ _type: 'gallery', _key: b._key, items: (b.items || []).map((i: any) => ({ src: i.src, alt: i.alt || '' })) } as ArticleBlock)
        break
      case 'articleCallout':
        out.push({ _type: 'callout', _key: b._key, tone: b.tone === 'warning' ? 'warning' : 'note', title: b.title, text: b.text } as ArticleBlock)
        break
      case 'articleInlineCta':
        out.push({ _type: 'inline-cta', _key: b._key, text: b.text, cta: { label: b.cta?.label, href: b.cta?.href } } as ArticleBlock)
        break
    }
  }
  return out
}

export interface BlogContent {
  articles: ArticleContent[]
  categories: CategoryContent[]
}

export function transformBlog(data: any): BlogContent | null {
  if (!data) return null
  const categories: CategoryContent[] = (data.categories || []).map((c: any) => ({
    title: c.title,
    slug: c.slug,
    description: c.description
  }))
  const articles: ArticleContent[] = (data.articles || []).map((a: any) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    cover: { src: a.cover?.src, alt: a.cover?.alt || '' },
    date: a.date,
    author: a.author || '',
    readingMinutes: a.readingMinutes || 0,
    category: a.category ? { title: a.category.title, slug: a.category.slug } : undefined,
    body: transformArticleBody(a.body)
  }))
  return { articles, categories }
}

/* ---------- Graphe de contenu unique (pipeline de payload, etape 5) ---------- */

/* UNE requete par langue: tout le contenu du site (accueil, identite, services,
 * villes, temoignages, faq, blog) en un seul appel au build. Le plugin
 * 01.content la lit, transforme via transformGraph, depose le ContentPayload dans
 * le payload Nuxt de la route -> usePayload() le lit en synchrone, AUCUN fetch
 * navigateur. Reutilise les memes projections que les requetes par page. */
export const CONTENT_GRAPH_QUERY = `{
  "home": *[_type == "homePage" && language == $lang][0]{
    seoTitle, seoDescription,
    hero{ kicker, title, lead, primaryCta, secondaryCta, meta[]{ _key, icon, value, label }, visual{ src, alt } },
    pageBuilder[]{ _key, _type, ... }
  },
  "site": *[_type == "siteSettings" && language == $lang][0]{ brandName, tagline, phoneDisplay, phoneHref, emailDisplay, emailHref, areaName, address{ streetAddress, addressLocality, addressRegion, postalCode, addressCountry } },
  "services": *[_type == "service" && language == $lang] | order(order asc, title asc){ _id, "slug": slug.current, icon, title, body, featured },
  "cities": *[_type == "serviceCity" && language == $lang] | order(order asc, city asc){ _id, "slug": slug.current, city, region, note, featured, heading, lead, body, seoTitle, seoDescription },
  "testimonials": *[_type == "testimonial" && language == $lang] | order(order asc){ _id, quote, name, city },
  "faq": *[_type == "faqItem" && language == $lang] | order(order asc){ _id, question, answer },
  "blog": {
    "categories": *[_type == "category" && language == $lang] | order(order asc, title asc){ "slug": slug.current, title, description },
    "articles": *[_type == "article" && language == $lang && defined(slug.current)] | order(date desc){
      "slug": slug.current, title, excerpt,
      "cover": cover{ src, alt },
      date, author, readingMinutes,
      "category": category->{ "slug": slug.current, title },
      body[]{
        _key, _type,
        _type == "articleLead" => { text },
        _type == "articleRichText" => { "body": body[]{ _key, _type, style, listItem, level, "children": children[]{ _key, text, marks }, "markDefs": markDefs[]{ _key, _type, href } } },
        _type == "articleImage" => { "image": image{ src, alt }, caption },
        _type == "articleQuote" => { quote, attribution },
        _type == "articleGallery" => { "items": items[]{ src, alt } },
        _type == "articleCallout" => { tone, title, text },
        _type == "articleInlineCta" => { text, "cta": cta{ label, href } }
      }
    }
  }
}`

/** Carte de service pour l'index /services. */
export interface ServiceIndexItem {
  slug?: string
  icon?: string
  title: string
  body?: string
  featured?: boolean
}

/** Le contenu complet du site pour une langue, lu en synchrone par les
 *  composables. Chaque champ peut etre null si Sanity est vide: le composable
 *  appelant retombe alors sur ses fixtures (le site ne casse jamais). */
export interface ContentPayload {
  home: HomeContent | null
  site: SiteIdentity | null
  servicesIndex: ServiceIndexItem[]
  serviceCities: Record<string, ServiceCityPage>
  blog: BlogContent | null
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function transformGraph(graph: any, locale: Locale): ContentPayload {
  if (!graph) {
    return { home: null, site: null, servicesIndex: [], serviceCities: {}, blog: null }
  }

  // L'accueil reutilise transformHome: on lui recompose la forme HOME_QUERY
  // (collections imbriquees) depuis les champs de tete du graphe.
  const home = transformHome(
    { ...graph.home, site: graph.site, services: graph.services, cities: graph.cities, testimonials: graph.testimonials, faq: graph.faq },
    locale
  )

  // Une page service-ville par slug, transformee avec l'identite + les services
  // partages (transformServiceCity attend doc.site et doc.services).
  const serviceCities: Record<string, ServiceCityPage> = {}
  for (const city of graph.cities || []) {
    if (!city?.slug) continue
    const page = transformServiceCity({ ...city, site: graph.site, services: graph.services })
    if (page) serviceCities[city.slug] = page
  }

  const servicesIndex: ServiceIndexItem[] = (graph.services || []).map((s: any) => ({
    slug: s.slug, icon: s.icon, title: s.title, body: s.body, featured: s.featured
  }))

  const site: SiteIdentity | null = graph.site
    ? {
        brandName: graph.site.brandName,
        tagline: graph.site.tagline,
        phoneDisplay: graph.site.phoneDisplay,
        phoneHref: graph.site.phoneHref,
        emailDisplay: graph.site.emailDisplay,
        emailHref: graph.site.emailHref,
        areaName: graph.site.areaName,
        // Adresse incluse seulement si les CINQ champs sont presents (« adresse
        // complete ou rien »). En GROQ, une projection address{...} renvoie null
        // pour chaque sous-champ absent du document: tester le seul streetAddress
        // laisserait passer un noeud PostalAddress a champs nuls. La fixture et le
        // seed sont toujours complets; un doc Sanity partiel est donc ignore.
        ...(graph.site.address
          && graph.site.address.streetAddress
          && graph.site.address.addressLocality
          && graph.site.address.addressRegion
          && graph.site.address.postalCode
          && graph.site.address.addressCountry
          ? {
              address: {
                streetAddress: graph.site.address.streetAddress,
                addressLocality: graph.site.address.addressLocality,
                addressRegion: graph.site.address.addressRegion,
                postalCode: graph.site.address.postalCode,
                addressCountry: graph.site.address.addressCountry
              }
            }
          : {})
      }
    : null

  return { home, site, servicesIndex, serviceCities, blog: transformBlog(graph.blog) }
}
