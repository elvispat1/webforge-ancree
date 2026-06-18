// Fragments GROQ CARD: listes de champs LÉGÈRES des collections, pour la query
// scopée preview UNIQUEMENT (jamais la prod). Imports RELATIFS (fermeture nuxt.config).
//
// Principe (cf. analyse de tolérance du transform): la carte = la projection FULL
// MOINS les seuls gros sous-arbres lourds, qui sont aussi ceux qui font gonfler
// le payload preview à ~4.7 Mo:
//   - service: on retire `detail` (copie de page) et `translations`;
//   - project: on retire `gallery`, `detail` et `translations`;
//   - article: on retire `body` (Portable Text) et `translations`.
// Tout le reste (intro, benefits, challenge/solution/result, stats, author,
// readingTime…) est léger et reste présent: ça évite de relâcher des dizaines de
// types de sortie, le gain de poids venant entièrement des 3 sous-arbres retirés.
//
// Ce sont des LISTES DE CHAMPS (pas des projections entre accolades): à déposer
// DANS une projection `*[...]{ ${SERVICE_CARD_FIELDS}, (cond) => { ...full } }`,
// pour que l'item de DÉTAIL courant fusionne ses champs lourds via le `=>` GROQ.
// Pas de virgule finale: le `,` avant le conditionnel est ajouté à l'appel.

import { FIGURE_PROJECTION } from './figure'

/** Champs carte service: FULL moins `detail` + `translations`. */
export const SERVICE_CARD_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  summary,
  meta,
  "image": image ${FIGURE_PROJECTION},
  intro,
  benefits[]{ title, body },
  "related": related[]->slug.current`

/** Champs carte projet: FULL moins `gallery` + `detail` + `translations`. */
export const PROJECT_CARD_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "cover": cover ${FIGURE_PROJECTION},
  location,
  year,
  challenge,
  solution,
  result,
  stats[]{ label, value },
  "service": service->slug.current,
  "testimonial": testimonial->_id,
  featured`

/** Champs carte article: FULL moins `body` + `translations`. */
export const ARTICLE_CARD_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "cover": cover ${FIGURE_PROJECTION},
  "category": category->slug.current,
  date,
  author,
  readingTime`
