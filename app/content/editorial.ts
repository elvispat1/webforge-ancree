/* Contrat de contenu du bloc Éditorial. Miroir de ce que la transformation Sanity
 * produit; AUCUNE valeur design ici. Un bloc = des SEGMENTS répétables, chacun avec
 * du texte riche (Portable Text, liens internes/externes déjà résolus en href) et 0,
 * 1 ou 2 images (deux = elles s'emboîtent au rendu). Le côté de l'image alterne par
 * défaut. Aucune numerotation. */

import type { PortableTextBlock } from './article-blocks'

// Image d'un segment: URL CDN déjà résolue (jamais un objet asset), légende option.
// `src` vide -> le fragment <Image> rend son placeholder soigné (jamais une 404).
export interface EditorialImage {
  src: string
  alt: string
  caption?: string
}

// Côté de l'image au desktop: `auto` alterne en zigzag d'un segment à l'autre.
export type EditorialMediaSide = 'auto' | 'left' | 'right'

export interface EditorialSegment {
  body: PortableTextBlock[]
  media: EditorialImage[]
  mediaSide: EditorialMediaSide
}

export interface EditorialContent {
  eyebrow?: string
  heading?: string
  lead?: string
  segments: EditorialSegment[]
}
