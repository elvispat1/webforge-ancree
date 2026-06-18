// Accès à la collection de services (adressable par slug).
// V2 (Sanity, actuel): lit la collection du payload (déjà triée `order asc`
// par la query). Signature inchangée depuis V1; retour élargi ADDITIVEMENT:
// les items portent `translations` (slugs de l'autre langue, T2b) et `detail`
// (copie de LEUR page de détail, spec 6.10 et 12.16, consommée par
// useServiceBlocks). Tout appelant V1 reste valide.

import type { ServiceWithMeta } from '~/sanity/transform'

export function useServices(): ServiceWithMeta[] {
  return usePayload().collections.services
}

export function useService(slug: string): ServiceWithMeta | undefined {
  return useServices().find((s) => s.slug === slug)
}
