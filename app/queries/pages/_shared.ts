// Pièces partagées des requêtes scopées PAR-PAGE (preview uniquement).
//
// Chaque fichier de app/queries/pages/ compose ces helpers pour produire une
// requête qui retourne la MÊME forme que CONTENT_GRAPH_QUERY (`SanityGraph`),
// pour que `transformGraph` tourne sans changement de contrat — mais allégée à
// ce dont la route a besoin:
//   - les 9 singletons sont toujours présents (hero + seo); SEUL celui de la
//     route (`full`) reçoit son pageBuilder. blogPage garde toujours ses CTA,
//     faqPage ses sections (lus hors-route par transformGraph sans garde).
//   - les collections sortent en projection CARTE; l'item de détail courant
//     (`detail` + paramètre $slug) fusionne ses champs lourds via le `=>` GROQ.
//   - siteSettings + legalPages (globals) sont dans GLOBALS, présents partout.
//
// Imports RELATIFS seulement (cohérent avec documents.ts / fragments).

import { HERO_BLOCK_PROJECTION } from '../fragments/hero'
import { SEO_PROJECTION } from '../fragments/seo'
import { CTA_BAND_PROJECTION } from '../fragments/cta'
import { SITE_SETTINGS_PROJECTION } from '../fragments/site'
import { LEGAL_PROJECTION } from '../fragments/legal'
import { SERVICE_CARD_FIELDS, PROJECT_CARD_FIELDS, ARTICLE_CARD_FIELDS } from '../fragments/cards'
import { TRANSLATIONS_PROJECTION } from '../fragments/link'
import { SERVICE_DETAIL_PROJECTION, PROJECT_DETAIL_PROJECTION } from '../fragments/detail'
import { ARTICLE_BODY_PROJECTION } from '../fragments/article-body'
import { FIGURE_PROJECTION } from '../fragments/figure'
import { PAGE_BUILDER_PROJECTION } from '../blocks/page-builder'

/** Singleton qui reçoit son pageBuilder complet (la page fixe de la route). */
export type FullSingleton =
  | 'homePage' | 'servicesPage' | 'projectsPage' | 'aboutPage'
  | 'blogPage' | 'faqPage' | 'contactPage' | 'onePager'

/** Collection dont l'item courant (paramètre $slug) sort en FULL. */
export type DetailCollection = 'service' | 'project' | 'article'

/** Globals présents dans TOUTE requête scopée (chrome + pages légales). */
export const GLOBALS = /* groq */ `
  "siteSettings": *[_type == "siteSettings" && language == $language][0] ${SITE_SETTINGS_PROJECTION},
  "legalPages": *[_type == "legalPage" && language == $language] ${LEGAL_PROJECTION}`

// pageBuilder ajouté seulement au singleton « full » de la route courante.
const pb = (type: FullSingleton, full?: FullSingleton): string =>
  type === full ? `,\n    ${PAGE_BUILDER_PROJECTION}` : ''

/** Les 9 singletons en squelette (hero + seo); pageBuilder sur `full` seulement. */
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
  },${fixed('servicesPage')},${fixed('projectsPage')},${fixed('aboutPage')},
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
      "items": items[]->_id
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
  const serviceFull = detail === 'service'
    ? `,\n    (slug.current == $slug) => {\n      "detail": detail ${SERVICE_DETAIL_PROJECTION},\n      "translations": ${TRANSLATIONS_PROJECTION}\n    }`
    : ''
  const projectFull = detail === 'project'
    ? `,\n    (slug.current == $slug) => {\n      "gallery": gallery[] ${FIGURE_PROJECTION},\n      "detail": detail ${PROJECT_DETAIL_PROJECTION},\n      "translations": ${TRANSLATIONS_PROJECTION}\n    }`
    : ''
  const articleFull = detail === 'article'
    ? `,\n    (slug.current == $slug) => {\n      ${ARTICLE_BODY_PROJECTION},\n      "translations": ${TRANSLATIONS_PROJECTION}\n    }`
    : ''
  return /* groq */ `
  "services": *[_type == "service" && language == $language] | order(order asc){
    ${SERVICE_CARD_FIELDS}${serviceFull}
  },
  "projects": *[_type == "project" && language == $language] | order(order asc){
    ${PROJECT_CARD_FIELDS}${projectFull}
  },
  "articles": *[_type == "article" && language == $language] | order(date desc){
    ${ARTICLE_CARD_FIELDS}${articleFull}
  },
  "categories": *[_type == "category" && language == $language] | order(order asc){
    title,
    "slug": slug.current,
    description,
    "translations": ${TRANSLATIONS_PROJECTION}
  },
  "testimonials": *[_type == "testimonial" && language == $language] | order(order asc){
    _id,
    quote,
    name,
    context,
    "service": service->slug.current,
    "project": project->slug.current,
    featured
  },
  "faqItems": *[_type == "faqItem" && language == $language] | order(question asc){
    _id,
    question,
    answer,
    "theme": theme->slug.current
  }`
}
