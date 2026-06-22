// useContent: point d'acces unique au contenu TRANSVERSE du site.
//
// Expose le contenu qui ne vit pas dans un bloc de page-builder:
//   - `site`    : identite/NAP de la marque (Header, Footer, Logo, graphe SEO).
//   - `legal`   : pages legales (conditions, confidentialite), consommees par
//                 le gabarit legal-page.
//   - `consent` : config de consentement aux temoins (categories + version de
//                 politique), consommee par le bandeau de consentement et son store.
//
// V2 (Sanity, fail-fast): `site` et `legal` viennent du payload (fetch unique du
// plugin 01.content, lecture synchrone via usePayload). `consent` reste du CODE:
// c'est la config par site (categories de temoins reellement installees), pas du
// contenu editorial. Porte 1:1 de Minimaliste.
//
// Chaque accesseur rend un computed: les consommateurs qui le RENDENT (Header,
// Footer, Logo, pages legales) se mettent a jour IN-PLACE en mode preview
// (usePayload() lit alors le store live, et le computed re-derive a chaque
// edition). En <script>, passer par `.value`.

import { computed, type ComputedRef } from 'vue'
import type { LegalContent } from '~/sanity/transform'
import type { SiteContent } from '~/content/site'
import { CONSENT_CONFIG, type ConsentConfig } from '~/content/consent'

type ContentSources = {
  site: SiteContent
  legal: LegalContent
  consent: ConsentConfig
}

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
