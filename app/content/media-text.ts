import { routePath, type Locale } from '../config/route-map'

export interface MediaTextContent {
  // Surtitre optionnel (wf-caption). À mériter, souvent omis.
  eyebrow?: string
  heading: string
  // Paragraphes du corps. Le dernier est traité en lead muted (cf. About).
  body: string[]
  // Côté de l'image en desktop. L'ordre DOM reste constant (copy puis figure);
  // le flip est purement CSS via grid-column.
  mediaSide: 'left' | 'right'
  image: {
    ratio: string
    // V1: chemin string. V2: asset Sanity résolu en URL dans la couche d'assemblage.
    src?: string
    alt: string
    label: string
    caption: string
  }
  // CTA unique optionnel: route interne rendue en lien à filet (cf. pattern CTA).
  cta?: { label: string; href: string }
}

/** Fonction de traduction minimale (clé -> chaîne), compatible avec useI18n().t. */
type Tr = (key: string) => string

/** Échantillon de démonstration du bloc media-text pour la vitrine /showcase
 * (jamais consommé en production). Texte via i18n (showcase.samples.media_text.*),
 * href via routePath localisé (F2: /a-propos en FR, /en/about en EN). */
export function mediaTextSample(t: Tr, locale: Locale): MediaTextContent {
  return {
    heading: t('showcase.samples.media_text.heading'),
    body: [
      t('showcase.samples.media_text.body_1'),
      t('showcase.samples.media_text.body_2')
    ],
    mediaSide: 'right',
    image: {
      ratio: '4/5',
      src: '/images/about.jpg',
      alt: t('showcase.samples.media_text.image_alt'),
      label: t('showcase.samples.media_text.image_label'),
      caption: t('showcase.samples.media_text.image_caption')
    },
    cta: {
      label: t('showcase.samples.media_text.cta_label'),
      href: routePath('about', locale)
    }
  }
}
