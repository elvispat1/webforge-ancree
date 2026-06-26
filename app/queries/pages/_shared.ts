// Pieces partagees des requetes scopees PAR-PAGE (preview uniquement).
//
// Chaque fichier de app/queries/pages/ compose ces helpers pour produire une
// requete qui retourne la MEME forme que CONTENT_GRAPH_QUERY (`SanityGraph`),
// pour que `transformGraph` tourne sans changement de contrat, mais allegee a
// ce dont la route a besoin:
//   - les 8 singletons sont toujours presents (hero + seo); SEUL celui de la
//     route (`full`) recoit son pageBuilder. blogPage garde toujours ses CTA,
//     faqPage ses sections (lus hors-route par transformGraph sans garde).
//   - les collections sortent en projection CARTE; l'item de detail courant
//     (`detail` + parametre $slug) fusionne ses champs lourds via le `=>` GROQ.
//   - siteSettings + legalPages (globals) sont dans GLOBALS, presents partout.
//
// Famille Ancree: pas de doc-type project; serviceCity (les villes) remplace
// projects, sa page est villesPage. Parametre de langue $language PARTOUT.
//
// Imports RELATIFS seulement (coherent avec documents.ts / fragments).

import { HERO_BLOCK_PROJECTION } from '../fragments/hero'
import { SEO_PROJECTION } from '../fragments/seo'
import { CTA_BAND_PROJECTION } from '../fragments/cta'
import { SITE_SETTINGS_PROJECTION } from '../fragments/site'
import { LEGAL_PROJECTION } from '../fragments/legal'
import { SERVICE_CARD_FIELDS, SERVICE_CITY_CARD_FIELDS, ARTICLE_CARD_FIELDS } from '../fragments/cards'
import { TRANSLATIONS_PROJECTION, PT_LINK_MARKDEFS } from '../fragments/link'
import { ARTICLE_BODY_PROJECTION } from '../fragments/article-body'
import { PAGE_BUILDER_PROJECTION } from '../blocks/page-builder'

/** Singleton qui recoit son pageBuilder complet (la page fixe de la route). */
export type FullSingleton =
  | 'homePage' | 'servicesPage' | 'villesPage' | 'aboutPage'
  | 'blogPage' | 'faqPage' | 'contactPage' | 'onePager'

/** Collection dont l'item courant (parametre $slug) sort en FULL. */
export type DetailCollection = 'service' | 'serviceCity' | 'article'

/** Globals presents dans TOUTE requete scopee (chrome + pages legales). */
export const GLOBALS = /* groq */ `
  "siteSettings": *[_type == "siteSettings" && language == $language][0] ${SITE_SETTINGS_PROJECTION},
  "legalPages": *[_type == "legalPage" && language == $language] ${LEGAL_PROJECTION}`

// pageBuilder ajoute seulement au singleton « full » de la route courante.
const pb = (type: FullSingleton, full?: FullSingleton): string =>
  type === full ? `,\n    ${PAGE_BUILDER_PROJECTION}` : ''

/** Les 8 singletons en squelette (hero + seo); pageBuilder sur `full` seulement. */
export function singletons(full?: FullSingleton): string {
  const fixed = (type: FullSingleton): string => /* groq */ `
  "${type}": *[_type == "${type}" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    "seo": seo ${SEO_PROJECTION}${pb(type, full)}
  }`
  return /* groq */ `
  "homePage": *[_type == "homePage" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    "seo": seo ${SEO_PROJECTION}${pb('homePage', full)}
  },${fixed('servicesPage')},${fixed('villesPage')},${fixed('aboutPage')},
  "blogPage": *[_type == "blogPage" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    "listCta": listCta ${CTA_BAND_PROJECTION},
    "categoryCta": categoryCta ${CTA_BAND_PROJECTION},
    "articleCta": articleCta ${CTA_BAND_PROJECTION},
    related{ heading },
    "seo": seo ${SEO_PROJECTION}${pb('blogPage', full)}
  },
  "faqPage": *[_type == "faqPage" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    "sections": sections[]{
      "theme": theme->{ title, "slug": slug.current },
      mode,
      "refs": items[]->_id
    },
    "seo": seo ${SEO_PROJECTION}${pb('faqPage', full)}
  },${fixed('contactPage')},
  "onePager": *[_type == "onePager" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    "seo": seo ${SEO_PROJECTION}${pb('onePager', full)}
  }`
}

/** Les 6 collections en carte; l'item courant de `detail` en FULL via $slug. */
export function collections(detail?: DetailCollection): string {
  const detailFull = `,\n    (slug.current == $slug) => {\n      "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},\n      ${PAGE_BUILDER_PROJECTION},\n      "seo": seo ${SEO_PROJECTION},\n      "translations": ${TRANSLATIONS_PROJECTION}\n    }`
  const serviceFull = detail === 'service' ? detailFull : ''
  const serviceCityFull = detail === 'serviceCity' ? detailFull : ''
  const articleFull = detail === 'article'
    ? `,\n    (slug.current == $slug) => {\n      ${ARTICLE_BODY_PROJECTION},\n      "seo": seo ${SEO_PROJECTION},\n      "translations": ${TRANSLATIONS_PROJECTION}\n    }`
    : ''
  return /* groq */ `
  "services": *[_type == "service" && language == $language] | order(order asc){
    ${SERVICE_CARD_FIELDS}${serviceFull}
  },
  "serviceCities": *[_type == "serviceCity" && language == $language] | order(order asc){
    ${SERVICE_CITY_CARD_FIELDS}${serviceCityFull}
  },
  "articles": *[_type == "article" && language == $language] | order(date desc){
    ${ARTICLE_CARD_FIELDS}${articleFull}
  },
  "categories": *[_type == "category" && language == $language] | order(order asc){
    title,
    "slug": slug.current,
    description,
    "seo": seo ${SEO_PROJECTION},
    "translations": ${TRANSLATIONS_PROJECTION}
  },
  "testimonials": *[_type == "testimonial" && language == $language] | order(order asc){
    _id,
    quote,
    name,
    context,
    "service": service->slug.current,
    "city": city->slug.current,
    featured
  },
  "faqItems": *[_type == "faqItem" && language == $language] | order(question asc){
    _id,
    question,
    "answer": answer[]{
      _key,
      _type,
      style,
      listItem,
      level,
      "children": children[]{ _key, text, marks },
      "markDefs": ${PT_LINK_MARKDEFS}
    },
    "theme": theme->slug.current
  }`
}
