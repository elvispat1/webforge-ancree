// usePayload: accès SYNCHRONE au graphe de contenu transformé (interne).
//
// Le fetch unique (par langue) vit dans app/plugins/01.content.ts: useAsyncData
// y dépose le ContentPayload sous la clé payloadKey(). Ici on ne fait que LIRE
// ce cache (useNuxtData), jamais fetcher: les composables publics (useContent,
// useServices, etc.) gardent ainsi leurs signatures synchrones inchangées.
//
// Une seule forme sérialisée par route: on lit le payload.data de useAsyncData,
// AUCUNE recopie dans un useState (éviter la double sérialisation).

import type { ContentPayload, WfLocale } from '~/sanity/transform'

/** Locale de contenu courante, dérivée de l'instance i18n de l'app (lecture
 *  par $i18n, pas useI18n: appelable des plugins et des composables non setup).
 *  Les codes configurés dans nuxt.config sont exactement 'fr' | 'en'. */
export function useWfLocale(): WfLocale {
  return useNuxtApp().$i18n.locale.value as WfLocale
}

/** Clé du payload dans le cache Nuxt, par langue (T2b): wf-content-<locale>.
 *  Sans argument: la locale i18n courante. */
export function payloadKey(locale: WfLocale = useWfLocale()): string {
  return `wf-content-${locale}`
}

/** Clé de l'état live (mode preview), par langue: wf-live-payload-<locale>.
 *  Alimenté par le plugin 02.preview-live (client) à chaque snapshot live, lu par
 *  usePayload() ci-dessous. Distinct de payloadKey: la base SSR (payloadKey) reste la
 *  source d'hydratation; le live n'override qu'après le handshake Comlink, côté client
 *  (parité SSR/hydratation, voir 02.preview-live.client.ts). */
export function livePayloadKey(locale: WfLocale = useWfLocale()): string {
  return `wf-live-payload-${locale}`
}

/** Le graphe de contenu de la langue courante. Lecture synchrone: le plugin
 *  01.content a déjà chargé (ou échoué fort) avant tout setup de page. */
export function usePayload(): ContentPayload {
  // Mode preview (client): si le moteur live (plugin 02.preview-live) a un snapshot, il
  // prime sur la base SSR. Réassigné à chaque édition; en Phase 2 les composables liront
  // usePayload() dans des computed -> mise à jour in-place. Gardes __WF_PREVIEW__
  // (constante de compilation) + import.meta.client: branche morte en statique/SSR,
  // Rollup l'élague -> aucune trace live dans le build de prod.
  if (__WF_PREVIEW__ && import.meta.client) {
    const live = useState<ContentPayload | null>(livePayloadKey(), () => null)
    if (live.value) return live.value
  }
  const { data } = useNuxtData<ContentPayload>(payloadKey())
  if (!data.value) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Contenu Sanity non chargé (plugin 01.content)'
    })
  }
  return data.value
}
