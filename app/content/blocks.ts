/* Contrats de contenu des blocs de la page-builder Ancree. Miroir de ce que la
 * transformation Sanity produira; AUCUNE valeur design ici. On garde l'esprit des
 * champs de Minimaliste (technique partagee), la disposition change. Le type
 * « projet » est remplace par « services par ville » (moteur SEO local). Aucun
 * champ de numerotation: jamais de numero affiche, site-wide. */

// Marqueur partage (SectionHead).
export interface SectionCta {
  label: string
  href: string
}

// Barre de confiance: bande pleine largeur sous le heros.
export interface TrustItem {
  icon: string // nom Iconify line-art (lucide)
  value: string
  label: string
}
export interface TrustBarContent {
  items: TrustItem[]
}

// Services: grille a colonnes variables, cartes arrondies, icones line-art.
export interface ServiceItem {
  icon: string
  title: string
  summary: string
  href?: string // present en multipage (page service), absent en one-pager
  featured?: boolean // carte vedette plus large (asymetrie posee)
}
export interface ServicesContent {
  eyebrow: string
  heading: string
  lead?: string
  ctaLabel?: string
  ctaHref?: string
  items: ServiceItem[]
}

// Services par ville: bloc signature, remplace le portfolio de projets.
export interface CityItem {
  name: string
  href: string // page service-ville, ex /villes/laval
  note?: string
  featured?: boolean
}
export interface ServiceCitiesContent {
  eyebrow: string
  heading: string
  lead?: string
  areaLabel: string // ex "Notre zone de service"
  areaName: string // ex "Rive-Nord de Montreal et Laval"
  areaNote?: string
  cities: CityItem[]
}
