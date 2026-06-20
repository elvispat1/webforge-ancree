// Plugin de contenu: LE fetch Sanity unique par langue, avant tout rendu.
//
// useAsyncData(payloadKey(), fetch, { transform }) charge le graphe brut cote
// serveur et ne serialise QUE le resultat transforme (ContentPayload) dans le
// payload Nuxt de la route. A l'hydratation client, le payload est deja la:
// AUCUN fetch cote client en production, usePayload() le lit en synchrone.
// Remplace les useSanityBuildQuery par page (une lecture hydratee, pas N).
//
// Prefixe `01.` pour s'executer avant tout plugin consommateur eventuel.
//
// Comportement par environnement:
//   - generate: le prerender Nitro rend toutes les routes dans le meme process;
//     le cache module-scope (promesse memoisee par langue, garde par
//     import.meta.prerender) ramene a 1 fetch Sanity par langue par build.
//   - dev: pas de cache, contenu frais a chaque requete SSR.
//
// GRACIEUX (adaptation Ancree, vs le fail-fatal de Minimaliste): un fetch echoue
// n'arrete PAS le build. On laisse le payload vide; les composables retombent sur
// leurs fixtures (le site rend toujours). On signale par un avertissement.
//
// Purete statique: AUCUN import statique des composables @nuxtjs/sanity ici (ils
// trainent des marqueurs visual-editing dans le bundle client). Deux gardes de
// compilation eliminent les branches mortes:
//   - __WF_PREVIEW__ (vite.define): false en build statique de prod, la branche
//     preview disparait du bundle.
//   - import.meta.server: le client n'a jamais besoin du client Sanity (le
//     payload est serialise au rendu serveur).

import { CONTENT_GRAPH_QUERY, transformGraph } from '~/sanity/content'
import type { Locale } from '~/config/route-map'

// Cache au niveau module: une promesse par langue, partagee entre toutes les
// routes prerendues du meme process de generate.
const prerenderFetches = new Map<Locale, Promise<unknown>>()

export default defineNuxtPlugin(async (nuxtApp) => {
  // ── Branche preview (Worker preview, garde par Cloudflare Access) ──
  // SERVEUR seulement. Sert les BROUILLONS a chaque rendu (always-drafts; sur,
  // car le domaine preview est garde par Access). Meme cle, meme forme que la
  // base: usePayload() ne voit aucune difference. Le middleware 00.preview-content
  // re-fetch sur navigation cliente. Branche morte en statique (élaguée).
  if (__WF_PREVIEW__ && import.meta.server) {
    const { useSanityQuery } = await import('@nuxtjs/sanity/runtime/composables/useSanityQuery.js')
    const { useSanityVisualEditingState } = await import('@nuxtjs/sanity/runtime/composables/useSanityVisualEditingState.js')
    const visualEditingState = useSanityVisualEditingState()
    const locale = useWfLocale()
    // Cookie present (iframe Studio): le module pilote perspective + token + stega.
    // Cookie absent (onglet autonome): on force drafts + le token serveur.
    const previewOptions = visualEditingState?.enabled
      ? {}
      : { queryOptions: { perspective: 'drafts' as const, token: visualEditingState?.token } }
    const { data } = await useSanityQuery<unknown>(CONTENT_GRAPH_QUERY, { lang: locale }, previewOptions)
    if (data.value) {
      nuxtApp.payload.data[payloadKey(locale)] = transformGraph(data.value, locale)
    }
    return
  }

  // ── Branche statique/prod: fetch cote serveur SEULEMENT ──
  // Cote client il n'y a RIEN a faire: le graphe transforme arrive par le payload
  // de la route (inline en dev SSR, _payload.json au generate), usePayload() le lit.
  if (import.meta.server) {
    const { useSanity } = await import('@nuxtjs/sanity/runtime/composables/useSanity.js')
    const sanity = useSanity()

    const runFetch = (locale: Locale): Promise<unknown> => sanity.fetch<unknown>(CONTENT_GRAPH_QUERY, { lang: locale })

    const fetchGraph = (locale: Locale): Promise<unknown> => {
      if (!import.meta.prerender) return runFetch(locale)
      let pending = prerenderFetches.get(locale)
      if (!pending) {
        pending = runFetch(locale)
        prerenderFetches.set(locale, pending)
      }
      return pending
    }

    const locale = useWfLocale()
    const { error } = await useAsyncData(
      payloadKey(locale),
      () => fetchGraph(locale),
      // Le transform ne tourne qu'au fetch serveur: le client recoit la forme
      // finale, une seule copie serialisee par route.
      { transform: (raw: unknown) => transformGraph(raw, locale) }
    )

    // GRACIEUX: on n'arrete pas le build sur un fetch echoue (reseau coupe,
    // dataset injoignable). Le payload reste vide -> les composables servent les
    // fixtures. L'avertissement signale la degradation sans la masquer.
    if (error.value) {
      console.warn(`[webforge] Fetch du contenu Sanity (${locale}) echoue: repli sur les fixtures.`, error.value)
    }
  }
})
