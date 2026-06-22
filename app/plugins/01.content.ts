// Plugin de contenu: LE fetch Sanity unique par langue, avant tout rendu.
//
// useAsyncData(payloadKey(), fetch, { transform }) charge le graphe brut cote
// serveur et ne serialise QUE le resultat transforme (ContentPayload) dans le
// payload Nuxt de la route. A l'hydratation client, le payload est deja la:
// AUCUN fetch cote client en production, usePayload() le lit en synchrone.
//
// Prefixe `01.` pour s'executer avant tout plugin consommateur eventuel.
//
// Comportement par environnement:
//   - generate: le prerender Nitro rend toutes les routes dans le meme process;
//     le cache module-scope (promesse memoisee par langue, garde par
//     import.meta.prerender) ramene a 1 fetch Sanity par langue par build.
//   - dev: pas de cache, contenu frais a chaque requete SSR.
//
// FAIL-FAST (arrimage sur Minimaliste, vs l'ancien repli gracieux): un fetch ou
// une transformation qui echoue rend createError fatal. Un generate sans contenu
// doit ECHOUER, jamais produire un site vide. Aucun repli fixtures runtime.
//
// Contact: depuis l'arrimage 1:1 Minimaliste, le bloc contact porte ses propres
// libelles (etiquettes NAP, champs du formulaire, bouton, banniere, consentement)
// et son message de succes, tous editables au Studio. Le transform les lit du bloc
// (plus d'injection i18n): transformGraph ne prend que (raw, locale).
//
// Purete statique: AUCUN import statique des composables @nuxtjs/sanity ici (ils
// trainent des marqueurs visual-editing dans le bundle client). Deux gardes de
// compilation eliminent les branches mortes:
//   - __WF_PREVIEW__ (vite.define): false en build statique de prod, la branche
//     preview disparait du bundle.
//   - import.meta.server: le client n'a jamais besoin du client Sanity (le
//     payload est serialise au rendu serveur).

import { CONTENT_GRAPH_QUERY } from '~/queries/documents'
import { resolvePreviewQuery } from '~/queries/route-query-map'
import { transformGraph, type WfLocale } from '~/sanity/transform'
import type { SanityGraph } from '~/types/sanity'

// Cache au niveau module: une promesse par langue, partagee entre toutes les
// routes prerendues du meme process de generate.
const prerenderFetches = new Map<WfLocale, Promise<SanityGraph>>()

export default defineNuxtPlugin(async (nuxtApp) => {
  // ── Branche preview (Worker preview, garde par Cloudflare Access) ──
  // SERVEUR seulement. Sert les BROUILLONS a chaque rendu (always-drafts; sur,
  // car le domaine preview est garde par Access). Requete SCOPEE de la route
  // courante (resolvePreviewQuery), meme cle/forme que la base: usePayload() ne
  // voit aucune difference. Le middleware 00.preview-content re-fetch sur
  // navigation cliente. Branche morte en statique (elaguee).
  if (__WF_PREVIEW__ && import.meta.server) {
    const { useSanityQuery } = await import('@nuxtjs/sanity/runtime/composables/useSanityQuery.js')
    const { useSanityVisualEditingState } = await import('@nuxtjs/sanity/runtime/composables/useSanityVisualEditingState.js')
    const visualEditingState = useSanityVisualEditingState()
    const locale = useWfLocale()
    const { query, slug } = resolvePreviewQuery(useRoute().path)
    // Cookie present (iframe Studio): le module pilote perspective + token + stega.
    // Cookie absent (onglet autonome): on force drafts + le token serveur.
    const previewOptions = visualEditingState?.enabled
      ? {}
      : { queryOptions: { perspective: 'drafts' as const, token: visualEditingState?.token } }
    const { data, error } = await useSanityQuery<SanityGraph>(
      query,
      { language: locale, slug },
      previewOptions
    )
    if (error.value || !data.value) {
      throw createError({
        statusCode: 500,
        statusMessage: `Echec du chargement du contenu Sanity en mode preview (${locale})${error.value ? `: ${error.value.message}` : ''}`,
        cause: error.value ?? undefined,
        fatal: true
      })
    }
    nuxtApp.payload.data[payloadKey(locale)] = transformGraph(data.value, locale)
    return
  }

  // ── Branche statique/prod: fetch cote serveur SEULEMENT ──
  // Cote client il n'y a RIEN a faire: le graphe transforme arrive par le payload
  // de la route (inline en dev SSR, _payload.json au generate), usePayload() le lit.
  if (import.meta.server) {
    // Client Sanity dedie au build/SSR, importe dynamiquement (elimine du bundle
    // client par la garde import.meta.server). Token de lecture server-only depuis
    // la config PRIVEE: indispensable pour lire translation.metadata (non expose en
    // lecture publique sur ce dataset) et resoudre les alternates hreflang. Sans
    // token: lecture publique (degrade). projectId/dataset/apiVersion = config
    // publique du module @nuxtjs/sanity.
    const { createClient } = await import('@sanity/client')
    const config = useRuntimeConfig()
    const pub = config.public.sanity as { projectId: string; dataset: string; apiVersion: string }
    const sanity = createClient({
      projectId: pub.projectId,
      dataset: pub.dataset,
      apiVersion: pub.apiVersion,
      useCdn: false,
      perspective: 'published',
      token: (config.sanityReadToken as string) || undefined
    })

    const runFetch = (locale: WfLocale): Promise<SanityGraph> =>
      sanity.fetch<SanityGraph>(CONTENT_GRAPH_QUERY, { language: locale })

    const fetchGraph = (locale: WfLocale): Promise<SanityGraph> => {
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
      { transform: (raw: SanityGraph) => transformGraph(raw, locale) }
    )

    // Un generate sans contenu doit ECHOUER, jamais produire un site vide:
    // l'erreur (reseau, dataset incomplet, transformation) est rendue fatale.
    if (error.value) {
      throw createError({
        statusCode: 500,
        statusMessage: `Echec du chargement du contenu Sanity (${locale}): ${error.value.message}`,
        cause: error.value,
        fatal: true
      })
    }
  }
})
