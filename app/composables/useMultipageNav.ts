/* Source unique de la navigation MULTIPAGE (liens de route), partagee par l'en-tete,
 * le menu mobile et le pied de page. En mode multipage la nav pointe vers des
 * routes (et non les ancres du one-pager, qui vivent dans useSiteNav).
 *
 * `blog` est volontairement ABSENT tant que la page /blog n'existe pas: une page
 * doit exister avant d'etre liee, sinon le link checker casse. On la rajoutera
 * ici en meme temps que la page blog. `about` est une vraie page, donc presente. */
import { routePath, routeLabel, type RouteKey } from '~/config/route-map'

export const MULTIPAGE_NAV_KEYS: readonly RouteKey[] = ['services', 'about', 'faq', 'contact']

export interface RouteNavLink {
  to: string
  label: string
}

export function useMultipageNav(): ComputedRef<RouteNavLink[]> {
  const { locale } = useI18n()
  return computed(() =>
    MULTIPAGE_NAV_KEYS.map((key) => ({
      to: routePath(key, locale.value as 'fr' | 'en'),
      label: routeLabel(key, locale.value as 'fr' | 'en')
    }))
  )
}
