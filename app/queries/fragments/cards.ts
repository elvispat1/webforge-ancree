// Fragments GROQ CARD: listes de champs LEGERES des collections, pour la query
// scopee preview UNIQUEMENT (jamais la prod). Imports RELATIFS (fermeture
// nuxt.config).
//
// Principe (cf. analyse de tolerance du transform): la carte = la projection FULL
// MOINS les seuls gros sous-arbres lourds, qui sont aussi ceux qui font gonfler
// le payload preview:
//   - service: on retire `detail` (copie de page) et `translations`;
//   - serviceCity: on retire `body` (corps de page) et `translations`;
//   - article: on retire `body` (Portable Text) et `translations`.
// Tout le reste (meta, intro, benefits, note, region, author, readingMinutes...)
// est leger et reste present: ca evite de relacher des dizaines de types de
// sortie, le gain de poids venant entierement des sous-arbres retires.
//
// Ce sont des LISTES DE CHAMPS (pas des projections entre accolades): a deposer
// DANS une projection `*[...]{ ${SERVICE_CARD_FIELDS}, (cond) => { ...full } }`,
// pour que l'item de DETAIL courant fusionne ses champs lourds via le `=>` GROQ.
// Pas de virgule finale: le `,` avant le conditionnel est ajoute a l'appel.
//
// SERVICE_CITY_CARD_FIELDS remplace le PROJECT_CARD_FIELDS de Minimaliste: les
// projets sont abandonnes, les services par ville sont le moteur SEO local.

import { FIGURE_PROJECTION } from './figure'

/** Champs carte service: FULL moins `detail` + `translations`. */
export const SERVICE_CARD_FIELDS = /* groq */ `
  _id,
  "slug": slug.current,
  icon,
  title,
  summary,
  meta,
  "image": image ${FIGURE_PROJECTION},
  intro,
  benefits[]{ title, body },
  "related": related[]->slug.current,
  featured,
  order`

/** Champs carte service-ville: FULL moins `body` + `translations`. */
export const SERVICE_CITY_CARD_FIELDS = /* groq */ `
  _id,
  "slug": slug.current,
  city,
  region,
  note,
  heading,
  lead,
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
  readingMinutes`
