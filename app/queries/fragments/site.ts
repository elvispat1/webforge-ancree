// Fragment GROQ: siteSettings (le chrome global: marque, contact, nav, footer, seo).
// Extrait de la projection inline de CONTENT_GRAPH_QUERY pour être partagé entre
// la query de prod et la query scopée preview (siteSettings est consommé par
// Header/Footer sur 100% des routes, donc toujours FULL).
// Import RELATIF (fermeture nuxt.config).

import { LINK_PROJECTION } from './link'

export const SITE_SETTINGS_PROJECTION = /* groq */ `{
  brand{
    name,
    "logo": { "src": logo.asset->url },
    tagline,
    foundedYear,
    homeAriaLabel
  },
  contact{
    phone,
    email,
    address{ line1, cityProv, city, region, country, postal },
    areaServed,
    hours{ weekdays, weekend }
  },
  nav{
    landing{ "primary": primary[] ${LINK_PROJECTION} },
    multipage{ "primary": primary[] ${LINK_PROJECTION} }
  },
  footer{
    "primary": primary[] ${LINK_PROJECTION},
    "utility": utility[] ${LINK_PROJECTION},
    "pageLinks": pageLinks[] ${LINK_PROJECTION},
    copyright,
    credit{ label, studio, studioUrl, product }
  },
  socials[]{ platform, url },
  seo{
    titleSuffix,
    defaultDescription,
    "defaultOgImage": defaultOgImage.asset->url
  }
}`
