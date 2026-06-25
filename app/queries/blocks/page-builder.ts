// Agregateur GROQ du page-builder: les 8 blocs d'Ancree discrimines par `_type`,
// composes a partir des fragments transverses. C'est le point d'entree unique du
// contenu de page compose au Studio. Imports RELATIFS (fermeture nuxt.config).
//
// Les 8 blocs d'Ancree (et UNIQUEMENT ceux-la, pas de bloc Minimaliste absent):
//   trustBar, services, serviceCities, about,
//   testimonials, faq, ctaBand, contact.
//
// Blocs intelligents (services, serviceCities, testimonials,
// faq): on ne projette QUE les parametres de selection, jamais les items
// resolus. La resolution des items vit dans resolveBlocks (couche composable),
// qui reutilise les collections du payload.
//   - refs de services et de villes -> slugs (collections indexees par slug);
//   - refs de temoignages et de questions FAQ -> _id (les ids de sortie = _id
//     Sanity);
//   - le bloc faq est en selection manuelle PURE: refs seulement, resolues dans
//     l'ordre de l'array, plus de mode ni de limit.
//
// Le `_key` opaque du Studio est conserve: le transform le remappe vers une cle
// semantique stable par type (anchorKey) pour que les ancres #services...#contact
// resolvent sur la nav.
//
// Le contact porte ses libelles (metaLabels, form, success) editables au
// Studio; les VALEURS des coordonnees (NAP) sont jointes depuis siteSettings.contact
// au transform. La privacy.link est resolue via LINK_PROJECTION (route de la
// politique de confidentialite).

import { FIGURE_PROJECTION } from '../fragments/figure'
import { LINK_PROJECTION } from '../fragments/link'
import { CTA_BAND_PROJECTION } from '../fragments/cta'

export const PAGE_BUILDER_PROJECTION = /* groq */ `pageBuilder[]{
  _key,
  _type,
  anchor,
  _type == "trustBar" => {
    items[]{ icon, value, label }
  },
  _type == "services" => {
    eyebrow,
    heading,
    lead,
    "cta": cta ${LINK_PROJECTION},
    mode,
    "refs": items[]->slug.current,
    limit
  },
  _type == "serviceCities" => {
    eyebrow,
    heading,
    lead,
    areaLabel,
    areaName,
    areaNote,
    mode,
    "refs": items[]->slug.current,
    limit
  },
  _type == "about" => {
    eyebrow,
    heading,
    body,
    "photo": photo ${FIGURE_PROJECTION},
    stats[]{ value, label }
  },
  _type == "testimonials" => {
    eyebrow,
    heading,
    mode,
    "service": service->slug.current,
    "city": city->slug.current,
    "refs": items[]->_id,
    limit
  },
  _type == "faq" => {
    eyebrow,
    heading,
    "refs": items[]->_id
  },
  _type == "ctaBand" => ${CTA_BAND_PROJECTION},
  _type == "contact" => {
    eyebrow,
    heading,
    lead,
    metaLabels{ phone, email, address, hours },
    form{
      labels{ name, email, phone, message },
      errors{ nameRequired, emailInvalid, privacyRequired },
      submit{ idle, loading },
      errorBanner{ title, body },
      privacy{ text, "link": link ${LINK_PROJECTION} }
    },
    success{ title, body }
  }
}`
