// Middleware preview: re-fetch SCOPÉ sur navigation client-side.
//
// Le plugin app/plugins/01.content.ts ne tourne qu'UNE fois (chargement d'app) et
// scope le PREMIER rendu (SSR, hydraté côté client). Mais le Presentation tool de
// Sanity navigue en CLIENT-SIDE: le plugin ne se redéclenche pas, et le payload
// scopé de la route précédente ne contient pas les données de la nouvelle route.
// Ce middleware re-fetch la query scopée de la route de DESTINATION et re-dépose
// sous la MÊME clé `payloadKey(locale)` AVANT le setup de la page de destination
// (seul hook pré-setup par-navigation). Les composables relisent la clé sans le
// savoir: aucune modification de la couche composable ni de la prod statique.
//
// Garde de compile `__WF_PREVIEW__`: false hors preview -> Rollup élimine tout le
// corps (zéro chunk visual-editing dans le build statique). Client-only: le
// premier rendu reste servi par le plugin (SSR), ce middleware ne couvre que les
// navigations client-side.

import { effectScope } from 'vue'
import { resolvePreviewQuery } from '~/queries/route-query-map'
import { transformGraph, type ContentPayload } from '~/sanity/transform'
import type { SanityGraph } from '~/types/sanity'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!__WF_PREVIEW__ || !import.meta.client) return

  // Always-preview sur le Worker preview (gardé par Access): on re-fetch à CHAQUE
  // nav client-side, sans gate sur le cookie sanity-preview. La base SSR initiale,
  // elle, est déjà servie en brouillons par le plugin 01.content.
  const { useSanityQuery } = await import(
    '@nuxtjs/sanity/runtime/composables/useSanityQuery.js'
  )
  const nuxtApp = useNuxtApp()
  const locale = useWfLocale()
  const { query, slug } = resolvePreviewQuery(to.path)

  // Le moteur live (plugin 02.preview-live) garde un livePayload par route. Sur nav,
  // on le remet à null AVANT le re-fetch ET le setup de la page de destination (ce
  // middleware tourne pré-setup): usePayload() lit alors la base fraîche déposée
  // ci-dessous (ou la base SSR), jamais le snapshot live PÉRIMÉ de la route
  // précédente — y compris si le fetch échoue (reset hors du try). Le plugin
  // ré-abonne la route ensuite (afterEach) et repose le livePayload courant.
  useState<ContentPayload | null>(livePayloadKey(locale), () => null).value = null

  // useSanityQuery installe des watchers (perspective, live mode): on l'exécute
  // dans un effectScope détaché qu'on jette après le fetch one-shot, pour ne pas
  // accumuler de watchers orphelins à chaque navigation. Dans l'iframe du Studio
  // (cookie actif), le fetch passe par le proxy serveur du module (token jamais
  // exposé) -> brouillons. Dans un onglet autonome (sans cookie), le client lit le
  // contenu PUBLIÉ pour la nouvelle route (le token ne sort jamais du serveur):
  // les brouillons d'une autre route ne s'obtiennent qu'au rechargement complet
  // (SSR), ce que fait un 2e écran.
  const fetchScope = effectScope(true)
  try {
    const result = await fetchScope.run(() =>
      useSanityQuery<SanityGraph>(query, {
        language: locale,
        slug
      })
    )
    const graph = result?.data?.value
    if (graph) {
      nuxtApp.payload.data[payloadKey(locale)] = transformGraph(graph, locale)
    }
  } finally {
    fetchScope.stop()
  }
})
