// Middleware preview: re-fetch du contenu sur navigation cliente.
//
// Le plugin app/plugins/01.content.ts ne tourne qu'UNE fois (chargement d'app) et
// sert le PREMIER rendu (SSR, hydrate). Mais le Presentation tool de Sanity navigue
// en CLIENT-SIDE: le plugin ne se redeclenche pas. Ce middleware re-fetch le graphe
// (CONTENT_GRAPH_QUERY) de la route de DESTINATION et le redepose sous la MEME cle
// payloadKey(locale) AVANT le setup de la page de destination. Les composables
// relisent la cle sans le savoir: aucune modification de la couche composable ni de
// la prod statique.
//
// Adaptation Ancree (vs Minimaliste): graphe COMPLET re-fetche (pas de query scopee
// par route): le graphe est petit (demo), une lecture suffit. Niveau demo.
//
// Garde de compile __WF_PREVIEW__: false hors preview -> Rollup elimine tout le
// corps (zero chunk visual-editing dans le build statique). Client-only.

import { effectScope } from 'vue'
import { CONTENT_GRAPH_QUERY, transformGraph, type ContentPayload } from '~/sanity/content'

export default defineNuxtRouteMiddleware(async () => {
  if (!__WF_PREVIEW__ || !import.meta.client) return

  const { useSanityQuery } = await import('@nuxtjs/sanity/runtime/composables/useSanityQuery.js')
  const nuxtApp = useNuxtApp()
  const locale = useWfLocale()

  // Le moteur live (plugin 02.preview-live) garde un livePayload par route. On le
  // remet a null AVANT le re-fetch ET le setup de destination (ce middleware tourne
  // pre-setup): usePayload() lit alors la base fraiche deposee ci-dessous (ou la
  // base SSR), jamais le snapshot live PERIME de la route precedente.
  useState<ContentPayload | null>(livePayloadKey(locale), () => null).value = null

  // useSanityQuery installe des watchers: on l'execute dans un effectScope detache
  // qu'on jette apres le fetch one-shot (pas de watchers orphelins par navigation).
  const fetchScope = effectScope(true)
  try {
    const result = await fetchScope.run(() => useSanityQuery<unknown>(CONTENT_GRAPH_QUERY, { lang: locale }))
    const graph = result?.data?.value
    if (graph) {
      nuxtApp.payload.data[payloadKey(locale)] = transformGraph(graph, locale)
    }
  } finally {
    fetchScope.stop()
  }
})
