// Plugin preview LIVE: le moteur du visual editing IN-PLACE (mode
// 'live-visual-editing'). Il maintient un abonnement live (Comlink) à la requête
// SCOPÉE de la route courante et alimente un état réactif livePayload, lu par
// usePayload() en mode preview.
//
// Flux: éditer un champ dans le Studio pousse une mutation par Comlink ->
// @sanity/core-loader ré-évalue la requête scopée CÔTÉ CLIENT (zéro fetch serveur,
// zéro CPU Worker -> le fix 1102 du SSR reste intact) -> useSanityQuery réassigne son
// `data` ref -> notre watch re-dérive transformGraph et réassigne livePayload.
//
// Phase 1 (CE moteur seul): livePayload est alimenté, mais les composables lisent
// encore du PLAIN au setup, donc rien ne re-rend ENCORE. La Phase 2 rendra les
// composables réactifs (computed sur usePayload) et l'édition deviendra visible
// in-place, sans flash et sans rechargement.
//
// Cycle de vie (verrouillé après durcissement adversarial):
//   - Le fetcher live du module s'installe via un watch(_inPresentation) INTERNE qui
//     attend le handshake Comlink (asynchrone, useIsSanityPresentationTool null tant
//     que l'iframe n'est pas « connected »). Il faut donc un scope qui VIT toute la
//     durée de la route (contrairement au middleware one-shot qui jette son scope).
//   - Sur navigation client-side, on RÉ-ÉTABLIT la requête de la route de destination
//     (la query change selon la page) dans un nouveau scope, en arrêtant le précédent.
//     Après le 1er handshake, inPresentation est déjà true -> le fetcher se réinstalle
//     aussitôt.
//   - État client SEULEMENT (useState lu sous import.meta.client, écrit ici dans un
//     plugin .client): aucun ref/scope au niveau module (qui fuirait entre requêtes sur
//     l'isolate du Worker SSR preview).
//
// Pureté statique: suffixe `.client` (jamais dans le bundle serveur) + garde
// __WF_PREVIEW__ (constante de compilation) en tête -> tout le corps est mort en build
// statique de prod, Rollup l'élague (imports dynamiques de @nuxtjs/sanity compris).
// Même stratégie d'imports que app/plugins/01.content.ts et app/middleware/00.preview-content.

import { effectScope, watch, reactive } from 'vue'
import { resolvePreviewQuery } from '~/queries/route-query-map'
import { transformGraph, type ContentPayload } from '~/sanity/transform'
import type { SanityGraph } from '~/types/sanity'

export default defineNuxtPlugin(async (nuxtApp) => {
  if (!__WF_PREVIEW__ || import.meta.server) return

  // L'état preview (cookie validé par le plugin serveur du module) est la source de
  // vérité. Hors session preview active (domaine preview ouvert sans le Studio), on
  // n'abonne RIEN: le visiteur voit le contenu publié, comme en statique.
  const { useSanityVisualEditingState } = await import(
    '@nuxtjs/sanity/runtime/composables/useSanityVisualEditingState.js'
  )
  const visualEditingState = useSanityVisualEditingState()
  if (!visualEditingState?.enabled) return

  const { useSanityQuery } = await import(
    '@nuxtjs/sanity/runtime/composables/useSanityQuery.js'
  )

  const locale = useWfLocale()
  const livePayload = useState<ContentPayload | null>(livePayloadKey(locale), () => null)
  const router = useRouter()

  let activeScope: ReturnType<typeof effectScope> | null = null

  // (Ré)établit l'abonnement live pour `path`. On remet livePayload à null d'abord:
  // usePayload() retombe alors sur la base fraîche (SSR au 1er rendu, middleware sur
  // nav) jusqu'au 1er snapshot live, qui porte la MÊME donnée -> aucune bascule visible
  // (parité d'hydratation préservée). Le nouveau scope reste vivant; on arrête le
  // précédent une fois le nouveau monté.
  const establish = (path: string) => {
    const previous = activeScope
    livePayload.value = null
    activeScope = effectScope(true)
    activeScope.run(() => {
      const { query, slug } = resolvePreviewQuery(path)
      const { data } = useSanityQuery<SanityGraph>(query, reactive({ language: locale, slug }))
      watch(
        data,
        (graph) => {
          if (graph) livePayload.value = transformGraph(graph, locale)
        },
        { immediate: true }
      )
    })
    previous?.stop()
  }

  // Route initiale (le middleware global ne tourne pas à l'hydratation client).
  establish(router.currentRoute.value.path)

  // afterEach s'exécute hors contexte Nuxt: runWithContext le rétablit pour
  // useSanityQuery/useAsyncData appelés dans establish.
  router.afterEach((to) => {
    nuxtApp.runWithContext(() => establish(to.path))
  })
})
