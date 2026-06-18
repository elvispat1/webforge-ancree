// Query GROQ du graphe de contenu COMPLET (prod statique).
//
// Une seule requête par langue retourne TOUT le contenu du site (graphe), fetchée
// une fois par le plugin app/plugins/01.content.ts au build/dev, transformée vers
// le modèle V1 par app/sanity/transform.ts, puis lue en synchrone par les
// composables. Les requêtes scopées par-route (preview) vivent dans
// app/queries/pages/ (via route-query-map) et composent les MÊMES fragments.
//
// Piège fermeture: ce fichier est importé par nuxt.config.ts (ROUTE_SLUGS_QUERY,
// SITE_TITLE_SUFFIX_QUERY), donc typechecké aussi par le projet TS node. Imports
// RELATIFS seulement, aucun alias ~, aucun auto-import Nuxt.

import { FIGURE_PROJECTION } from './fragments/figure'
import { SEO_PROJECTION } from './fragments/seo'
import { HERO_BLOCK_PROJECTION } from './fragments/hero'
import { CTA_BAND_PROJECTION } from './fragments/cta'
import { SERVICE_DETAIL_PROJECTION, PROJECT_DETAIL_PROJECTION } from './fragments/detail'
import { ARTICLE_BODY_PROJECTION } from './fragments/article-body'
import { TRANSLATIONS_PROJECTION } from './fragments/link'
import { SITE_SETTINGS_PROJECTION } from './fragments/site'
import { LEGAL_PROJECTION } from './fragments/legal'
import { PAGE_BUILDER_PROJECTION } from './blocks/page-builder'

/**
 * Le graphe de contenu complet d'une langue. Paramètre: `$language` ('fr' | 'en').
 * Résultat brut typé par `SanityGraph` (app/types/sanity.ts), transformé en
 * `ContentPayload` (modèle V1 exact) par `transformGraph`.
 *
 * Les collections sortent déjà triées par GROQ (`order asc`, `date desc`):
 * les numérotations dérivées (S/01, etc.) se synthétisent sur l'index.
 * Exception: la banque `faqItem` n'a PAS de champ order (spec 6.15), elle sort
 * `question asc` (tri stable du desk); l'ordre d'affichage appartient aux
 * consommateurs (faqPage.sections pour la page FAQ, refs des blocs faq).
 */
export const CONTENT_GRAPH_QUERY = /* groq */ `{
  "siteSettings": *[_type == "siteSettings" && language == $language][0] ${SITE_SETTINGS_PROJECTION},
  "homePage": *[_type == "homePage" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    ${PAGE_BUILDER_PROJECTION},
    "seo": seo ${SEO_PROJECTION}
  },
  "servicesPage": *[_type == "servicesPage" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    ${PAGE_BUILDER_PROJECTION},
    "seo": seo ${SEO_PROJECTION}
  },
  "projectsPage": *[_type == "projectsPage" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    ${PAGE_BUILDER_PROJECTION},
    "seo": seo ${SEO_PROJECTION}
  },
  "aboutPage": *[_type == "aboutPage" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    ${PAGE_BUILDER_PROJECTION},
    "seo": seo ${SEO_PROJECTION}
  },
  "blogPage": *[_type == "blogPage" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    "listCta": listCta ${CTA_BAND_PROJECTION},
    "categoryCta": categoryCta ${CTA_BAND_PROJECTION},
    "articleCta": articleCta ${CTA_BAND_PROJECTION},
    related{ heading },
    ${PAGE_BUILDER_PROJECTION},
    "seo": seo ${SEO_PROJECTION}
  },
  "faqPage": *[_type == "faqPage" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    "sections": sections[]{
      "theme": theme->{ title, "slug": slug.current },
      mode,
      "items": items[]->_id
    },
    ${PAGE_BUILDER_PROJECTION},
    "seo": seo ${SEO_PROJECTION}
  },
  "contactPage": *[_type == "contactPage" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    ${PAGE_BUILDER_PROJECTION},
    "seo": seo ${SEO_PROJECTION}
  },
  "onePager": *[_type == "onePager" && language == $language][0]{
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    ${PAGE_BUILDER_PROJECTION},
    "seo": seo ${SEO_PROJECTION}
  },
  "legalPages": *[_type == "legalPage" && language == $language] ${LEGAL_PROJECTION},
  "services": *[_type == "service" && language == $language] | order(order asc){
    _id,
    title,
    "slug": slug.current,
    summary,
    meta,
    "image": image ${FIGURE_PROJECTION},
    intro,
    benefits[]{ title, body },
    "detail": detail ${SERVICE_DETAIL_PROJECTION},
    "related": related[]->slug.current,
    "translations": ${TRANSLATIONS_PROJECTION}
  },
  "projects": *[_type == "project" && language == $language] | order(order asc){
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "cover": cover ${FIGURE_PROJECTION},
    "gallery": gallery[] ${FIGURE_PROJECTION},
    location,
    year,
    challenge,
    solution,
    result,
    stats[]{ label, value },
    "detail": detail ${PROJECT_DETAIL_PROJECTION},
    "service": service->slug.current,
    "testimonial": testimonial->_id,
    featured,
    "translations": ${TRANSLATIONS_PROJECTION}
  },
  "articles": *[_type == "article" && language == $language] | order(date desc){
    _id,
    title,
    "slug": slug.current,
    excerpt,
    "cover": cover ${FIGURE_PROJECTION},
    "category": category->slug.current,
    date,
    author,
    readingTime,
    ${ARTICLE_BODY_PROJECTION},
    "translations": ${TRANSLATIONS_PROJECTION}
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
  }
}`

/**
 * Suffixe des titres (siteSettings.seo.titleSuffix), minimal pour la fermeture
 * de nuxt.config.ts: alimente le gabarit de titre du module @nuxtjs/seo
 * (spec 12.10). Paramètre: `$language`. Résultat: string | null.
 */
export const SITE_TITLE_SUFFIX_QUERY = /* groq */ `
  *[_type == "siteSettings" && language == $language][0].seo.titleSuffix
`

/**
 * Slugs des routes dynamiques, minimal pour la fermeture de nuxt.config.ts
 * (PRERENDER_ROUTES + assertBlogCollections + sitemap). Paramètre: `$language`.
 * Résultat typé par `RouteSlugs` (app/types/sanity.ts).
 *
 * `translations` (par doc): slugs de l'autre langue, pour les alternatives
 * hreflang du sitemap (MAJ-02). Même source que le prérendu: aucune divergence
 * possible entre les pages générées et celles listées au sitemap.
 */
export const ROUTE_SLUGS_QUERY = /* groq */ `{
  "services": *[_type == "service" && language == $language]{
    "slug": slug.current,
    "translations": ${TRANSLATIONS_PROJECTION}
  },
  "projects": *[_type == "project" && language == $language]{
    "slug": slug.current,
    "translations": ${TRANSLATIONS_PROJECTION}
  },
  "articles": *[_type == "article" && language == $language]{
    "slug": slug.current,
    "category": category->slug.current,
    "translations": ${TRANSLATIONS_PROJECTION}
  },
  "categories": *[_type == "category" && language == $language]{
    "slug": slug.current,
    "translations": ${TRANSLATIONS_PROJECTION}
  }
}`
