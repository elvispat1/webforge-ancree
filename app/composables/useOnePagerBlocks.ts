// useOnePagerBlocks — assemble la séquence de blocs du one-pager de ce site.
//
// V2 (Sanity, actuel) — le document onePager porte le pageBuilder; resolveBlocks
// (usePageBlocks.ts) résout les items des blocs intelligents contre les
// collections du payload. La signature n'a pas changé, la page ne bouge pas,
// les blocs ne bougent pas.
//
// Le héros n'en fait PAS partie: ce n'est pas un bloc, la page le rend
// explicitement (<HeroHome>) avant le page-builder. Voir mémoire projet.
//
// faqSchema: flag d'ASSEMBLAGE code (spec 4.4), jamais stocké au Studio. Le
// one-pager est un site palier 1 autonome: son bloc FAQ est sa FAQ canonique
// (seule instance balisée FAQPage de ce site).

import { computed, type ComputedRef } from 'vue'
import type { PageBlock } from '~/types/blocks'

// computed: les blocs du one-pager se mettent à jour in-place en preview (template
// auto-unwrap; resolveBlocks/useFixedPage -> usePayload lisent le store live).
export function useOnePagerBlocks(): ComputedRef<PageBlock[]> {
  return computed(() =>
    resolveBlocks(useFixedPage('onePager').pageBuilder).map((block) => {
      // faqSchema: seule FAQ balisée du site palier 1 (drapeau d'assemblage code).
      if (block._type === 'faq') return { ...block, faqSchema: true }
      // Pas de pages de détail sur le one-pager: cartes services non cliquables.
      // Décision contextuelle EN CODE (jamais un champ Studio), comme faqSchema.
      if (block._type === 'services') {
        return { ...block, items: block.items.map((it) => ({ ...it, href: undefined })) }
      }
      return block
    })
  )
}
