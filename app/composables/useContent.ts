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

/** Categorie de temoins reellement installee sur ce site (config de code, jamais
 *  editorial). Forme minimale: identifiant + drapeau « requise » (les requises ne
 *  sont pas refusables, ex temoins strictement necessaires). */
export interface ConsentCategory {
  id: string
  required: boolean
}
export interface ConsentConfig {
  /** Version de la politique: un bump force un nouveau consentement. */
  policyVersion: string
  categories: ConsentCategory[]
}

/** Config de consentement de CE site (categories de temoins installees). Constante
 *  de code, jamais du contenu Sanity: elle decrit l'infrastructure du site, pas un
 *  texte editable. La demo Rempart n'installe aucun temoin non essentiel. */
export const CONSENT_CONFIG: ConsentConfig = {
  policyVersion: '2026-01',
  categories: [{ id: 'necessary', required: true }]
}

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
