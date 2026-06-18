// FAQ — contrats de la banque + du bloc « faq » + de la copie de page.
//
// V2 (Sanity, actuel): la banque vit dans les documents `faqItem` (payload via
// useFaq, `id` = _id Sanity: les refs des blocs manuels pointent les mêmes
// ids). La copie du bloc vit dans les pageBuilders, le CTA de /faq dans le
// pageBuilder du document faqPage. Ce fichier ne garde que les CONTRATS.

import type { CtaBandContent } from './cta-band'

export interface FaqItem {
  id: string
  q: string
  a: string
  /** Slug du faqTheme référencé (clé de sélection de useFaq). Le titre affiché
   *  du thème vit sur les sections de la page FAQ (FaqPageSection.theme du
   *  payload). */
  theme?: string
}

// ── Bloc « faq » ────────────────────────────────────────────────────────────
export interface FaqContent {
  eyebrow: string
  heading: string
  items: Array<{ q: string; a: string }>
}

// ── Page /faq (multipage) ───────────────────────────────────────────────────
// Copie de page hors héros (le héros vit sur le document faqPage).
export interface FaqPageContent {
  cta: CtaBandContent
}
