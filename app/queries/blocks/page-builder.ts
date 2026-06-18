// Agrégateur GROQ du page-builder: 15 blocs discriminés par `_type`, composés à
// partir des fragments transverses. C'est le point d'entrée unique du contenu de
// page composé au Studio. Imports RELATIFS (fermeture nuxt.config).

import { FIGURE_PROJECTION } from '../fragments/figure'
import { LINK_PROJECTION } from '../fragments/link'
import { CTA_BAND_PROJECTION, PROCESS_PROJECTION } from '../fragments/cta'

/**
 * Page builder (15 blocs discriminés par `_type`).
 *
 * Blocs intelligents (services, testimonials, faq, projectsPreview, blogPreview):
 * on ne projette QUE les paramètres de sélection, jamais les items résolus.
 *   - refs de services et projets → slugs (les collections V1 sont indexées par
 *     slug, useServices/useProjects requêtent par slug);
 *   - refs de témoignages et questions FAQ → _id (les ids V1 sont les _id Sanity);
 *   - le bloc faq est en sélection manuelle PURE (spec 4.4): refs seulement,
 *     résolues dans l'ordre de l'array (12.8), plus de mode ni de limit.
 * La résolution des items vit dans resolveBlocks (couche composable), qui
 * réutilise les requêtes existantes sur les collections du payload.
 */
export const PAGE_BUILDER_PROJECTION = /* groq */ `pageBuilder[]{
  _key,
  _type,
  _type == "about" => {
    eyebrow,
    heading,
    body,
    "photo": photo ${FIGURE_PROJECTION},
    figcaption,
    diffs[]{ title, body }
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
  _type == "testimonials" => {
    eyebrow,
    heading,
    mode,
    "service": service->slug.current,
    "project": project->slug.current,
    "refs": items[]->_id,
    limit
  },
  _type == "faq" => {
    eyebrow,
    heading,
    "refs": items[]->_id
  },
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
  },
  _type == "mediaText" => {
    eyebrow,
    heading,
    body,
    mediaSide,
    "image": image ${FIGURE_PROJECTION},
    "cta": cta ${LINK_PROJECTION}
  },
  _type == "ctaBand" => ${CTA_BAND_PROJECTION},
  _type == "process" => ${PROCESS_PROJECTION},
  _type == "stats" => {
    eyebrow,
    heading,
    items[]{ value, label }
  },
  _type == "highlights" => {
    eyebrow,
    heading,
    lead,
    items[]{ icon, title, body }
  },
  _type == "logos" => {
    eyebrow,
    heading,
    items[]{ label }
  },
  _type == "projectsPreview" => {
    eyebrow,
    heading,
    lead,
    "cta": cta ${LINK_PROJECTION},
    mode,
    "service": service->slug.current,
    "refs": items[]->slug.current,
    limit
  },
  _type == "blogPreview" => {
    eyebrow,
    heading,
    lead,
    "cta": cta ${LINK_PROJECTION},
    limit
  },
  _type == "iframe" => {
    url,
    title,
    ratio,
    caption
  },
  _type == "videoYoutube" => {
    source,
    posterMode,
    "poster": poster ${FIGURE_PROJECTION},
    title
  }
}`
