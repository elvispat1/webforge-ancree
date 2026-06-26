// Requete GROQ du graphe de contenu COMPLET (prod statique).
//
// Une seule requete par langue retourne TOUT le contenu du site (graphe), fetchee
// une fois par le plugin app/plugins/01.content.ts au build/dev, transformee vers
// le modele Vue par app/sanity/transform.ts, puis lue en synchrone par les
// composables. Les requetes scopees par-route (preview) vivent dans
// app/queries/pages/ (via route-query-map) et composent les MEMES fragments.
//
// Piege fermeture: ce fichier est importe par nuxt.config.ts (ROUTE_SLUGS_QUERY,
// SITE_TITLE_SUFFIX_QUERY), donc typecheke aussi par le projet TS node. Imports
// RELATIFS seulement, aucun alias ~, aucun auto-import Nuxt.
//
// Famille Ancree (decisions Charles): pas de doc-type project; serviceCity (les
// villes desservies) est le moteur SEO local et remplace la collection projects.
// La page villesPage remplace projectsPage. Le parametre de langue est $language
// PARTOUT (jamais $lang). Les 8 blocs d'Ancree seulement (via PAGE_BUILDER_PROJECTION).

import { FIGURE_PROJECTION } from './fragments/figure'
import { SEO_PROJECTION } from './fragments/seo'
import { HERO_BLOCK_PROJECTION } from './fragments/hero'
import { CTA_BAND_PROJECTION } from './fragments/cta'
import { ARTICLE_BODY_PROJECTION } from './fragments/article-body'
import { TRANSLATIONS_PROJECTION } from './fragments/link'
import { SITE_SETTINGS_PROJECTION } from './fragments/site'
import { LEGAL_PROJECTION } from './fragments/legal'
import { PAGE_BUILDER_PROJECTION } from './blocks/page-builder'

/**
 * Le graphe de contenu complet d'une langue. Parametre: `$language` ('fr' | 'en').
 * Resultat brut typo par `SanityGraph` (app/types/sanity.ts), transforme en
 * `ContentPayload` (modele Vue) par `transformGraph`.
 *
 * Les collections sortent deja triees par GROQ (`order asc`, `date desc`).
 * Exception: la banque `faqItem` n'a PAS de champ order, elle sort
 * `question asc` (tri stable du desk); l'ordre d'affichage appartient aux
 * consommateurs (faqPage.sections pour la page FAQ, refs des blocs faq).
 *
 * Les 8 singletons fixes recoivent hero + pageBuilder + seo. blogPage garde ses
 * CTA (listCta/categoryCta/articleCta) et related; faqPage ses sections.
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
  "villesPage": *[_type == "villesPage" && language == $language][0]{
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
      "refs": items[]->_id
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
    "slug": slug.current,
    icon,
    title,
    summary,
    "image": image ${FIGURE_PROJECTION},
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    ${PAGE_BUILDER_PROJECTION},
    "seo": seo ${SEO_PROJECTION},
    featured,
    order,
    "translations": ${TRANSLATIONS_PROJECTION}
  },
  "serviceCities": *[_type == "serviceCity" && language == $language] | order(order asc){
    _id,
    "slug": slug.current,
    city,
    region,
    note,
    "hero": coalesce(hero[0], hero) ${HERO_BLOCK_PROJECTION},
    ${PAGE_BUILDER_PROJECTION},
    "seo": seo ${SEO_PROJECTION},
    featured,
    order,
    "translations": ${TRANSLATIONS_PROJECTION}
  },
  "articles": *[_type == "article" && language == $language] | order(date desc){
    _id,
    "slug": slug.current,
    title,
    excerpt,
    "cover": cover ${FIGURE_PROJECTION},
    "category": category->{ "slug": slug.current, title },
    date,
    author,
    readingTime,
    "seo": seo ${SEO_PROJECTION},
    ${ARTICLE_BODY_PROJECTION},
    "translations": ${TRANSLATIONS_PROJECTION}
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
    answer,
    "theme": theme->slug.current
  }
}`

/**
 * Suffixe des titres (siteSettings.seo.titleSuffix), minimal pour la fermeture
 * de nuxt.config.ts: alimente le gabarit de titre du module @nuxtjs/seo.
 * Parametre: `$language`. Resultat: string | null.
 */
export const SITE_TITLE_SUFFIX_QUERY = /* groq */ `
  *[_type == "siteSettings" && language == $language][0].seo.titleSuffix
`

/**
 * Slugs des routes dynamiques, minimal pour la fermeture de nuxt.config.ts
 * (PRERENDER_ROUTES + sitemap). Parametre: `$language`. Resultat typo par
 * `RouteSlugs` (app/types/sanity.ts).
 *
 * `translations` (par doc): slugs de l'autre langue, pour les alternatives
 * hreflang du sitemap. Meme source que le prerendu: aucune divergence possible
 * entre les pages generees et celles listees au sitemap. Pas de `projects`:
 * `serviceCities` prend sa place (slug partage fr/en, segment parent localise).
 */
export const ROUTE_SLUGS_QUERY = /* groq */ `{
  "services": *[_type == "service" && language == $language]{
    "slug": slug.current,
    "translations": ${TRANSLATIONS_PROJECTION}
  },
  "serviceCities": *[_type == "serviceCity" && language == $language]{
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
