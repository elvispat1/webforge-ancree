// Services — contrats de la collection + du bloc « services ».
//
// V2 (Sanity, actuel): la collection vit dans les documents `service` (payload
// via useServices), la copie du bloc dans les pageBuilders des documents de
// page. Ce fichier ne garde que les CONTRATS (interfaces importées par
// types/blocks.ts, le transform et les composants) et la dérivation
// serviceImage (image phare des pages détail).

export interface Service {
  /** Clé d'URL stable (anglais kebab), sert /services/[slug]. */
  slug: string
  /** Compteur d'affichage (ex. 'S/01'), synthétisé de l'ordre de la collection. */
  n: string
  title: string
  /** Résumé court: carte de la grille + lead du détail. */
  summary: string
  /** Délai indicatif. */
  meta: string
  /** Visuel principal (carte + héros détail). URL string (CDN Sanity en V2). */
  image: string
  /** Méta de la figure Sanity (alt/label/caption autorés au Studio), renseignée
   *  par le transform. Additif: serviceImage retombe sur un dérivé du titre si
   *  la méta est absente. */
  imageMeta?: { alt: string; label: string; caption: string }
  /** Détail: 1 à 2 paragraphes d'introduction. */
  intro: string[]
  /** Bénéfices / inclus (bloc highlights sur le détail). */
  benefits: Array<{ title: string; body: string }>
  /** Slugs de projets liés (projects-preview filtré sur le détail). */
  related: string[]
}

// Image phare d'un service (héros detail + media-text du détail): dérivée du
// visuel de la collection. L'alt/label/caption autorés au Studio (imageMeta)
// priment; repli V1 (dérivé du titre) si la méta est absente ou vide.
export function serviceImage(s: Service) {
  return {
    ratio: '4/3',
    src: s.image,
    alt: s.imageMeta?.alt || s.title,
    label: s.imageMeta?.label || s.title,
    caption: s.imageMeta?.caption || s.title
  }
}

// ── Bloc « services » (carte-grille) ────────────────────────────────────────
// L'item porte un href optionnel: présent en multipage (lien vers le détail),
// absent en one-pager (cartes non cliquables). La décision est prise en CODE
// (useOnePagerBlocks retire le href), jamais par un champ Studio.

export interface ServicesContent {
  eyebrow: string
  heading: string
  lead: string
  ctaLabel: string
  ctaHref: string
  items: Array<{
    n: string
    title: string
    body: string
    meta: string
    image: string
    href?: string
  }>
}
