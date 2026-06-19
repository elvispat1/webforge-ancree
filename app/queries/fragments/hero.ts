// Fragment GROQ: bloc héros (accueil/one-pager et page de niveau 2).
// Imports RELATIFS (fermeture nuxt.config).

import { FIGURE_PROJECTION } from './figure'
import { LINK_PROJECTION } from './link'

// Bloc héros (objet actuel OU 1er élément du tableau migré, résolu par coalesce
// dans les requêtes). Discrimine par _type; le transform mappe vers _type kebab.
export const HERO_BLOCK_PROJECTION = /* groq */ `{
  _type,
  _key,
  _type == "heroHome" => {
    kicker, title, lead,
    "primaryCta": primaryCta ${LINK_PROJECTION},
    "secondaryCta": secondaryCta ${LINK_PROJECTION},
    meta[]{ label, value },
    "visual": visual ${FIGURE_PROJECTION},
    "visualMobile": visualMobile ${FIGURE_PROJECTION}
  },
  _type == "pageHero" => {
    title, lead,
    "cta": cta ${LINK_PROJECTION},
    "image": image ${FIGURE_PROJECTION}
  }
}`
