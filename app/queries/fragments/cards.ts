// Fragments GROQ CARD: listes de champs LEGERES des collections, pour la query
// scopee preview UNIQUEMENT (jamais la prod). Imports RELATIFS (fermeture
// nuxt.config).
//
// Principe: la carte = l'identite de listing seulement. Les sous-arbres lourds de
// la page de detail (masthead, pageBuilder, seo) ne sortent QUE pour l'item de
// detail courant, fusionnes via le `=>` GROQ (voir _shared.ts):
//   - service: la carte porte icon/title/summary/image/order/featured; hero +
//     pageBuilder + seo + translations arrivent sur l'item courant;
//   - serviceCity: la carte porte city/region/note/order/featured; idem;
//   - article: la carte porte ses champs legers; body + translations sur l'item.
//
// Ce sont des LISTES DE CHAMPS (pas des projections entre accolades): a deposer
// DANS une projection `*[...]{ ${SERVICE_CARD_FIELDS}, (cond) => { ...full } }`,
// pour que l'item de DETAIL courant fusionne ses champs lourds via le `=>` GROQ.
// Pas de virgule finale: le `,` avant le conditionnel est ajoute a l'appel.
//
// SERVICE_CITY_CARD_FIELDS remplace le PROJECT_CARD_FIELDS de Minimaliste: les
// projets sont abandonnes, les services par ville sont le moteur SEO local.

import { FIGURE_PROJECTION } from './figure'

/** Champs carte service: identite de listing (sans hero/pageBuilder/seo/translations). */
export const SERVICE_CARD_FIELDS = /* groq */ `
  _id,
  "slug": slug.current,
  icon,
  title,
  summary,
  "image": image ${FIGURE_PROJECTION},
  featured,
  order`

/** Champs carte service-ville: identite de listing (sans hero/pageBuilder/seo/translations). */
export const SERVICE_CITY_CARD_FIELDS = /* groq */ `
  _id,
  "slug": slug.current,
  city,
  region,
  note,
  featured,
  order`

/** Champs carte article: FULL moins `body` + `translations`. */
export const ARTICLE_CARD_FIELDS = /* groq */ `
  _id,
  "slug": slug.current,
  title,
  excerpt,
  "cover": cover ${FIGURE_PROJECTION},
  "category": category->{ "slug": slug.current, title },
  date,
  author,
  readingTime`
