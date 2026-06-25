// Fragment GROQ: bloc heros (accueil/one-pager et page de niveau 2).
// Imports RELATIFS (fermeture nuxt.config).

import { FIGURE_PROJECTION } from './figure'
import { LINK_PROJECTION } from './link'

/**
 * Heros d'Ancree, discrimine par `_type` (le transform mappe vers _type kebab):
 *   - heroHome (objet `heroHome`, champ dedie de homePage et onePager, HORS
 *     pageBuilder): kicker d'ancrage, titre, accroche, deux CTA (objet link),
 *     preuves integrees (objet `proof`: icon/value/label) et visuel full bleed.
 *   - pageHero (objet `pageHero`, heros des pages fixes de niveau 2): titre,
 *     accroche, CTA optionnel (objet link) et image phare.
 *   - detailHero (objet `detailHero`, masthead des collections service/serviceCity):
 *     surtitre, titre, accroche, CTA optionnel (objet link). Pas d'image (masthead
 *     solide). Le transform le mappe aussi vers _type kebab 'hero-page'.
 */
export const HERO_BLOCK_PROJECTION = /* groq */ `{
  _type,
  _key,
  _type == "heroHome" => {
    kicker,
    title,
    lead,
    "primaryCta": primaryCta ${LINK_PROJECTION},
    "secondaryCta": secondaryCta ${LINK_PROJECTION},
    meta[]{ icon, value, label },
    "visual": visual{
      "src": desktop.asset->url,
      "alt": select($language == "en" => desktop.asset->altText.en, desktop.asset->altText.fr),
      "mobileSrc": mobile.asset->url,
      "mobileAlt": select($language == "en" => mobile.asset->altText.en, mobile.asset->altText.fr)
    }
  },
  _type == "pageHero" => {
    title,
    lead,
    "cta": cta ${LINK_PROJECTION},
    "image": image ${FIGURE_PROJECTION}
  },
  _type == "detailHero" => {
    eyebrow,
    title,
    lead,
    "cta": cta ${LINK_PROJECTION},
    "image": image ${FIGURE_PROJECTION}
  }
}`
