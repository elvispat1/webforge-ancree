// Accès au contenu d'un héros de page de niveau 2.
// Homogène avec useHeroContent() (accueil); V2 (Sanity, actuel): le héros vit
// sur le document de page fixe correspondant, lu via le payload. Signature
// inchangée depuis V1.

import { computed, type ComputedRef } from 'vue'
import type { PageHeroKey } from '~/content/page-heroes'
import type { HeroPageBlock } from '~/types/blocks'

// computed: le héros de page de niveau 2 se met à jour in-place en preview
// (template auto-unwrap; useFixedPage -> usePayload lit le store live).
export function usePageHero(key: PageHeroKey): ComputedRef<HeroPageBlock> {
  return computed(() => useFixedPage(key).hero)
}
