// Plugin preview LIVE: le moteur du visual editing IN-PLACE. Il maintient un
// abonnement live (Comlink) a la requete SCOPEE de la route courante et alimente
// l'etat reactif livePayload, lu par usePayload() en mode preview.
//
// Flux: editer un champ dans le Studio pousse une mutation par Comlink ->
// @sanity/core-loader re-evalue la requete scopee COTE CLIENT -> useSanityQuery
// reassigne son `data` ref -> notre watch re-derive transformGraph et reassigne
// livePayload. Les composables lisent usePayload() dans des computed -> mise a
// jour in-place.
//
// Contact: le bloc contact porte ses propres libelles + message de succes au
// Studio (1:1 Minimaliste); transformGraph ne prend que (graph, locale).
//
// Purete statique: suffixe `.client` (jamais cote serveur) + garde __WF_PREVIEW__
// (constante de compilation) en tete -> corps mort en build statique, elague par
// Rollup (imports dynamiques @nuxtjs/sanity compris).

import { effectScope, watch, reactive } from 'vue'
import { resolvePreviewQuery } from '~/queries/route-query-map'
import { transformGraph, type ContentPayload, type SanityGraph } from '~/sanity/transform'

export default defineNuxtPlugin(async (nuxtApp) => {
  if (!__WF_PREVIEW__ || import.meta.server) return

  // L'etat preview (cookie valide par le plugin serveur du module) est la source de
  // verite. Hors session preview active (domaine preview sans le Studio), on
  // n'abonne RIEN: le visiteur voit le contenu publie, comme en statique.
  const { useSanityVisualEditingState } = await import('@nuxtjs/sanity/runtime/composables/useSanityVisualEditingState.js')
  const visualEditingState = useSanityVisualEditingState()
  if (!visualEditingState?.enabled) return

  const { useSanityQuery } = await import('@nuxtjs/sanity/runtime/composables/useSanityQuery.js')

  const locale = useWfLocale()
  const livePayload = useState<ContentPayload | null>(livePayloadKey(locale), () => null)
  const router = useRouter()

  let activeScope: ReturnType<typeof effectScope> | null = null

  // (Re)etablit l'abonnement live pour `path`. livePayload remis a null d'abord:
  // usePayload() retombe sur la base fraiche jusqu'au 1er snapshot live (meme
  // donnee -> aucune bascule visible). Le nouveau scope reste vivant; on arrete le
  // precedent ensuite.
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

  // Route initiale (le middleware global ne tourne pas a l'hydratation client).
  establish(router.currentRoute.value.path)
  // afterEach hors contexte Nuxt: runWithContext le retablit pour useSanityQuery.
  router.afterEach((to) => {
    nuxtApp.runWithContext(() => establish(to.path))
  })
})
