// Plugin preview LIVE: le moteur du visual editing IN-PLACE. Il maintient un
// abonnement live (Comlink) a CONTENT_GRAPH_QUERY et alimente l'etat reactif
// livePayload, lu par usePayload() en mode preview.
//
// Flux: editer un champ dans le Studio pousse une mutation par Comlink ->
// @sanity/core-loader re-evalue la requete COTE CLIENT -> useSanityQuery reassigne
// son `data` ref -> notre watch re-derive transformGraph et reassigne livePayload.
// Les composables lisent usePayload() dans des computed -> mise a jour in-place.
//
// Adaptation Ancree (vs Minimaliste): graphe COMPLET (pas de query scopee par
// route): graphe petit (demo). Niveau demo.
//
// Purete statique: suffixe `.client` (jamais cote serveur) + garde __WF_PREVIEW__
// (constante de compilation) en tete -> corps mort en build statique, elague par
// Rollup (imports dynamiques @nuxtjs/sanity compris).

import { effectScope, watch } from 'vue'
import { CONTENT_GRAPH_QUERY, transformGraph, type ContentPayload } from '~/sanity/content'

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

  // (Re)etablit l'abonnement live. livePayload remis a null d'abord: usePayload()
  // retombe sur la base fraiche jusqu'au 1er snapshot live (meme donnee -> aucune
  // bascule visible). Le nouveau scope reste vivant; on arrete le precedent ensuite.
  const establish = () => {
    const previous = activeScope
    livePayload.value = null
    activeScope = effectScope(true)
    activeScope.run(() => {
      const { data } = useSanityQuery<unknown>(CONTENT_GRAPH_QUERY, { lang: locale })
      watch(data, (graph) => { if (graph) livePayload.value = transformGraph(graph, locale) }, { immediate: true })
    })
    previous?.stop()
  }

  // Route initiale (le middleware global ne tourne pas a l'hydratation client).
  establish()
  // afterEach hors contexte Nuxt: runWithContext le retablit pour useSanityQuery.
  router.afterEach(() => { nuxtApp.runWithContext(() => establish()) })
})
