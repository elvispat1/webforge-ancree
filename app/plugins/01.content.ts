// Plugin de contenu: LE fetch Sanity unique par langue, avant tout rendu.
//
// useAsyncData(payloadKey(), fetch, { transform }) charge le graphe brut côté
// serveur et ne sérialise QUE le résultat transformé (ContentPayload) dans le
// payload Nuxt de la route. À l'hydratation client, le payload est déjà là:
// aucun fetch côté client en production, usePayload() le lit en synchrone
// (useNuxtData lit payload.data directement).
//
// Préfixe `01.` pour s'exécuter avant tout plugin consommateur éventuel.
//
// Comportement par environnement:
//   - generate: le prerender Nitro rend toutes les routes dans le même process;
//     le cache module-scope (promesse mémoïsée par langue, gardé par
//     import.meta.prerender) ramène à 1 fetch Sanity par langue par build.
//   - dev: pas de cache, contenu frais à chaque requête SSR.
//
// Mode preview (T2c, amendé 16 juin): ALWAYS-DRAFTS sur le Worker preview. Le
// domaine preview étant gardé par Cloudflare Access (seuls des éditeurs
// authentifiés y accèdent), on sert les brouillons à CHAQUE rendu SSR, sans
// dépendre du cookie sanity-preview (posé dans l'iframe du Studio, cloisonné/
// tiers, donc invisible à un onglet autonome ouvert en 2e écran). Le fetch
// bascule sur useSanityQuery du module et le résultat passe par le MÊME
// transformGraph sous la MÊME clé payload: usePayload() et les composables ne
// voient aucune différence. Deux régimes (cf. branche ci-dessous):
//   - cookie présent (iframe Presentation): on ne force rien, le module pilote
//     perspective (respecte le sélecteur Published/Drafts du Studio) + token +
//     stega/overlays. Identique à avant le relâchement (zéro régression Studio).
//   - cookie absent (onglet autonome): on force perspective 'drafts' + le token
//     serveur, car resolveFetchOptions ne l'attache QUE si le cookie est actif.
// Preview reload-based (décision R2): les composables synchrones snapshotent au
// setup, recharger l'onglet montre les drafts; AUCUN remount par page-key.
//
// Pureté statique (gate T2c): AUCUN import statique des composables du module
// @nuxtjs/sanity ici. Le plugin est bundlé dans l'entrée client, et la chaîne
// useSanity -> createQueryStore -> @sanity/core-loader (strings du protocole
// « visual-editing » du comlink) comme useSanityVisualEditingState (useState
// « sanity-preview ») laisseraient leurs marqueurs dans .output/public. Les
// deux gardes ci-dessous sont des constantes de compilation: Rollup élimine
// les branches mortes, imports dynamiques compris.
//   - __WF_PREVIEW__ (vite.define, cf. nuxt.config): false en build statique
//     de production, la branche preview disparaît entièrement du bundle.
//   - import.meta.server: le client n'a jamais besoin du client Sanity (le
//     payload est sérialisé au rendu serveur), la chaîne useSanity disparaît
//     du bundle client.

import { CONTENT_GRAPH_QUERY } from '~/queries/documents'
import { resolvePreviewQuery } from '~/queries/route-query-map'
import { transformGraph, type WfLocale } from '~/sanity/transform'
import type { SanityGraph } from '~/types/sanity'

// Cache au niveau module: une promesse par langue, partagée entre toutes les
// routes prérendues du même process de generate.
const prerenderFetches = new Map<WfLocale, Promise<SanityGraph>>()

export default defineNuxtPlugin(async (nuxtApp) => {
  // ── Branche preview (Worker preview, gardé par Cloudflare Access) ──
  // SERVEUR seulement. Le premier rendu (SSR, ou hydratation depuis le payload
  // SSR) est servi ici, scopé à la route courante; la navigation client-side du
  // Presentation tool passe par le middleware 00.preview-content (le plugin ne se
  // redéclenche pas par nav).
  //
  // ALWAYS-DRAFTS: on ne gate plus sur le cookie (`enabled`) — le domaine preview
  // sert les brouillons à chaque requête, ce qui débloque l'onglet autonome (2e
  // écran) où le cookie sanity-preview de l'iframe Studio est cloisonné/invisible.
  // SÉCURITÉ: sûr UNIQUEMENT parce que Cloudflare Access garde ce domaine; sans
  // Access, ce serait une fuite de brouillons en clair (couplage à préserver).
  if (__WF_PREVIEW__ && import.meta.server) {
    const { useSanityVisualEditingState } = await import('@nuxtjs/sanity/runtime/composables/useSanityVisualEditingState.js')
    const { useSanityQuery } = await import('@nuxtjs/sanity/runtime/composables/useSanityQuery.js')
    const visualEditingState = useSanityVisualEditingState()
    const locale = useWfLocale()
    // Scope par-route: au lieu du graphe complet (~4.7 Mo, source du 1102), on
    // résout la requête de la route courante (app/queries/pages/ via
    // route-query-map) — page courante + collections en cartes + item de détail
    // courant en FULL. Le middleware preview re-fetch sur nav client-side.
    const { query, slug } = resolvePreviewQuery(useRoute().path)
    // Cookie présent (iframe Presentation): on ne force rien, le module pilote
    // perspective (respecte le sélecteur Published/Drafts du Studio) + token +
    // stega. Cookie absent (onglet autonome): on force perspective 'drafts' + le
    // token serveur, sans quoi resolveFetchOptions ne l'attache pas (il le gate
    // sur le cookie) -> fetch drafts sans token -> échec. Le token reste serveur
    // (branche import.meta.server, jamais sérialisé dans le payload).
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
        statusMessage: `Échec du chargement du contenu Sanity en mode preview (${locale})${error.value ? `: ${error.value.message}` : ''}`,
        cause: error.value ?? undefined,
        fatal: true
      })
    }
    // Même clé, même forme: dépôt direct dans le payload Nuxt (ce que
    // useAsyncData fait sous le capot), lu en synchrone par usePayload().
    // useSanityQuery garde sa propre entrée useAsyncData (clé hashée): la
    // double sérialisation est tolérée ici, le mode preview est du SSR interne.
    nuxtApp.payload.data[payloadKey(locale)] = transformGraph(data.value, locale)
    return
  }

  // ── Branche statique/prod: fetch côté serveur SEULEMENT ──
  // Côté client il n'y a RIEN à faire: le graphe transformé arrive par le
  // payload de la route (inline en dev SSR, _payload.json extrait au generate)
  // et usePayload() le lit tel quel.
  if (import.meta.server) {
    const { useSanity } = await import('@nuxtjs/sanity/runtime/composables/useSanity.js')
    const sanity = useSanity()

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

    // Locale de la route en cours de rendu, lue de l'instance i18n posée par le
    // plugin du module (enforce pre, donc déjà résolue ici); useWfLocale lit
    // $i18n via useNuxtApp, pas useI18n() (réservé au setup des composants).
    // PIÈGE documenté (plan T2b): un plugin tourne UNE fois par chargement
    // d'app, le payload de l'autre langue n'existe donc pas en navigation client
    // cross-locale. Le switcher de langue navigue en PLEIN CHARGEMENT (élément
    // a, pas NuxtLink): correct sur un site statique, et aucun fetch runtime
    // vers cdn.sanity.io.
    const locale = useWfLocale()

    const { error } = await useAsyncData(
      payloadKey(locale),
      () => fetchGraph(locale),
      // Le transform ne tourne qu'au fetch serveur: le client reçoit la forme
      // finale, une seule copie sérialisée par route.
      { transform: (raw: SanityGraph) => transformGraph(raw, locale) }
    )

    // Un generate sans contenu doit ÉCHOUER, jamais produire un site vide:
    // l'erreur (réseau, dataset incomplet, transformation) est rendue fatale.
    if (error.value) {
      throw createError({
        statusCode: 500,
        statusMessage: `Échec du chargement du contenu Sanity (${locale}): ${error.value.message}`,
        cause: error.value,
        fatal: true
      })
    }
  }
})
