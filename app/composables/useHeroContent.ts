// useHeroContent — accès au contenu du héros d'accueil, homogène avec
// useContent() et useOnePagerBlocks(): la page n'importe jamais le contenu en dur.
//
// Le héros n'est PAS un bloc (composant imposé par le type de page), il a donc
// son propre accès plutôt que de transiter par le page-builder.
//
// V2 (Sanity, actuel) — deux documents portent un héros d'accueil: homePage
// (CTA en routes, mode multipage) et onePager (CTA en ancres). Le paramètre
// `source` (optionnel, rétrocompatible: défaut 'home') choisit le document.
// Les CTA sortent du transform déjà résolus en href: les pages ne les
// réécrivent plus.

import { computed, type ComputedRef } from 'vue'
import type { HeroHomeBlock } from '~/types/blocks'

// computed: le héros d'accueil/one-pager se met à jour in-place en preview (le
// template auto-unwrap le ref; usePayload() lit le store live).
export function useHeroContent(source: 'home' | 'one-pager' = 'home'): ComputedRef<HeroHomeBlock> {
  return computed(() => {
    const heroes = usePayload().heroes
    return source === 'one-pager' ? heroes.onePager : heroes.home
  })
}
