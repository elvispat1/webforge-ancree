// Copie des pages du blogue — CONTRAT.
//
// V2 (Sanity, actuel): la copie vit sur le document blogPage (héros, trois
// sorties de conversion et en-tête des reliés), lue par useBlogPageContent()
// depuis le payload. Les articles vivent dans les documents `article`.

import type { CtaBandContent } from './cta-band'

export interface BlogPageContent {
  /** Bande CTA de la liste (/blog et /blog/page/[n], même copie). */
  listCta: CtaBandContent
  /** Bande CTA des archives de catégorie. */
  categoryCta: CtaBandContent
  /** Bande CTA au pied d'un article. */
  articleCta: CtaBandContent
  /** En-tête de la section des articles reliés. */
  related: { heading: string }
}
