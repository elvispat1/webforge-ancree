// Fragment GROQ: bloc Éditorial. Projection complète entre accolades, réutilisée
// par le page-builder (PAGE_BUILDER_PROJECTION), donc disponible sur toute page
// composée, dont les pages de détail service et ville. Imports RELATIFS
// (fermeture nuxt.config, cf. figure.ts).
//
// Le Portable Text des segments est projeté RICHE (style, listItem, level,
// children avec marks). Les markDefs portent l'annotation `link` avec le TYPE et la
// référence interne DÉRÉFÉRENCÉE (vers _type/_id/slug/catSlug, le strict nécessaire
// au route-map): le transform résout chaque lien en href string localisé
// (docPath/resolveLink), le sérialiseur PortableText.vue rend interne -> NuxtLink,
// externe -> <a> sûr.

import { FIGURE_PROJECTION } from '../fragments/figure'

export const EDITORIAL_FIELDS = /* groq */ `{
  eyebrow,
  heading,
  lead,
  segments[]{
    "body": body[]{
      _key,
      _type,
      style,
      listItem,
      level,
      "children": children[]{ _key, text, marks },
      "markDefs": markDefs[]{
        _key,
        _type,
        type,
        externalUrl,
        anchor,
        "internalRef": internalRef->{
          _type,
          _id,
          "slug": slug.current,
          "catSlug": category->slug.current
        }
      }
    },
    "media": media[] ${FIGURE_PROJECTION},
    mediaSide
  }
}`
