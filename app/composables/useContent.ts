// Accesseurs de contenu: lecture SYNCHRONE du payload unique (plugin 01.content),
// repli sur les fixtures quand le payload est absent (le site ne casse jamais).
//
// Chaque accesseur rend un computed: les consommateurs qui le RENDENT se mettent
// a jour in-place en mode preview (usePayload() lira alors le store live, et le
// computed re-derive). En <script>, passer par `.value`.
//
// Remplace les useSanityBuildQuery par page: les pages lisent ces composables au
// lieu de fetcher leur propre requete.

import { toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import type { HomeContent, ServiceCityPage, ServiceIndexItem } from '~/sanity/content'
import { siteFixture, type SiteIdentity } from '~/content/site'

/** Contenu de l'accueil (heros + blocs + seo), payload sinon fixtures i18n. */
export function useHome(): ComputedRef<HomeContent> {
  const heroFallback = useHeroContent()
  const blocksFallback = useHomeBlocks()
  return computed<HomeContent>(() => {
    const home = usePayload()?.home
    if (home && home.hero) return home
    return { hero: heroFallback.value, blocks: blocksFallback, seo: {} }
  })
}

/** Identite du site (siteSettings), payload sinon fixture. */
export function useSiteIdentity(): ComputedRef<SiteIdentity> {
  const { locale } = useI18n()
  const isEn = computed(() => locale.value === 'en')
  return computed<SiteIdentity>(() => usePayload()?.site ?? siteFixture(isEn.value))
}

/** Cartes de services pour l'index /services, payload sinon items du bloc de fixtures. */
export function useServicesIndex(): ComputedRef<ServiceIndexItem[]> {
  const blocksFallback = useHomeBlocks()
  return computed<ServiceIndexItem[]>(() => {
    const p = usePayload()
    if (p && p.servicesIndex.length) return p.servicesIndex
    const block = blocksFallback.find((b) => b._type === 'services') as { items?: ServiceIndexItem[] } | undefined
    return block?.items ?? []
  })
}

/** Page service-ville par slug (reactif: ref/getter/chaine), ou null si absente
 *  du payload (l'appelant derive alors un repli generique depuis le slug, jamais
 *  de 404). Reactif au parametre de route pour la navigation cliente. */
export function useServiceCity(slug: MaybeRefOrGetter<string>): ComputedRef<ServiceCityPage | null> {
  return computed<ServiceCityPage | null>(() => usePayload()?.serviceCities[toValue(slug)] ?? null)
}
