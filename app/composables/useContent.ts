// useContent — point d'accès unique au contenu **transverse** du site.
//
// Expose le contenu qui ne vit pas dans un bloc de page-builder:
//   - `site`    : brand, nav, footer, coordonnées (Header, Footer, Logo).
//   - `legal`   : pages légales (conditions, confidentialité), consommées par <LegalPage>.
//   - `consent` : config de consentement aux témoins (catégories + policyVersion),
//                 consommée par <Consent> et le store consent.
// Les contenus des blocs (Hero, About, etc.) ne passent plus par ici depuis
// l'introduction du page-builder typé.
//
// V2 (Sanity, actuel) — `site` et `legal` viennent du payload (fetch unique du
// plugin 01.content, lecture synchrone via usePayload). `consent` reste du
// code: c'est la config par site (catégories de témoins réellement
// installées), pas du contenu éditorial. Signature inchangée depuis V1.

import { computed, type ComputedRef } from 'vue'
import type { SiteContent } from '~/content/site'
import type { LegalContent } from '~/content/legal'
import { CONSENT_CONFIG, type ConsentConfig } from '~/content/consent'

type ContentSources = {
  site: SiteContent
  legal: LegalContent
  consent: ConsentConfig
}

// Retourne un computed (et non la valeur plain) pour que les consommateurs qui le
// RENDENT (Header, Footer, Logo, pages légales) se mettent à jour IN-PLACE en mode
// preview: usePayload() lit alors le store live, et le computed re-dérive à chaque
// édition. Le contrat de lecture ne change pas dans les templates (auto-unwrap du
// ref); seuls les usages en <script> doivent passer par `.value`.
// `consent` reste une constante de code (catégories de témoins installées, jamais
// éditorial): le computed la renvoie telle quelle, sans toucher au payload.
export function useContent<K extends keyof ContentSources>(key: K): ComputedRef<ContentSources[K]> {
  return computed(() => {
    if (key === 'consent') {
      return CONSENT_CONFIG as ContentSources[K]
    }
    const payload = usePayload()
    const sources: ContentSources = {
      site: payload.site,
      legal: payload.legal,
      consent: CONSENT_CONFIG
    }
    return sources[key]
  })
}
