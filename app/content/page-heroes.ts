// Héros de pages de niveau 2 (héros « page ») — CONTRATS.
//
// V2 (Sanity, actuel): la copie vit sur le document de chaque page fixe
// (champ hero), lue par usePageHero via le payload. Ce fichier garde le
// contrat PageHero et la liste fermée des pages fixes qui portent un tel
// héros (PageHeroKey).
//
// Le fil d'Ariane n'est PAS stocké: il se dérive du route-map au rendu. Les
// héros « detail » (service/projet) et « article » sont construits depuis les
// collections, pas d'ici.

export interface PageHero {
  title: string
  lead?: string
  cta?: { label: string; href: string }
  /** Image phare optionnelle (split desktop, empilée en mobile). Absente = héros
   *  texte seul, colonne large. Même forme que l'image du héros détail. */
  image?: { ratio: string; src?: string; alt: string; label: string; caption: string }
}

/** Pages fixes qui portent un héros « page » (l'accueil et le one-pager ont un
 *  héros home; les pages de détail dérivent le leur des collections). */
export type PageHeroKey = 'services' | 'projects' | 'about' | 'blog' | 'faq' | 'contact'
