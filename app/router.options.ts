import type { RouterConfig } from '@nuxt/schema'
import { useRuntimeConfig } from '#app'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, localePrefix, type Locale } from '~/config/route-map'

// Comportement de défilement à la navigation. Réplique le défaut (haut de page,
// ancre, restauration au retour) SAUF pour le filtrage/pagination du blog: au lieu
// de remonter au héros à chaque changement de catégorie ou de page, on reste au
// niveau de la liste (barre de filtre + résultats), ancre #blog-list.

// Locale dérivée du CHEMIN (préfixe /en de prefix_except_default), jamais de
// l'instance i18n: scrollBehavior n'a pas besoin d'elle et le parsing pur reste
// déterministe (plan T2b, étape 4).
function pathLocale(path: string): Locale {
  for (const locale of SUPPORTED_LOCALES) {
    const prefix = localePrefix(locale)
    if (prefix && (path === prefix || path.startsWith(`${prefix}/`))) return locale
  }
  return DEFAULT_LOCALE
}

/** Retire le préfixe de locale du chemin ('/en/blog' -> '/blog', '/en' -> '/'). */
function stripLocalePrefix(path: string, locale: Locale): string {
  const prefix = localePrefix(locale)
  if (!prefix) return path
  const stripped = path.slice(prefix.length)
  return stripped === '' ? '/' : stripped
}

// Vue de LISTE du blog: /blog, /blog/page/N, ou /blog/<categorie> (page de
// catégorie), chemin SANS préfixe de locale. Un article catégorisé est
// /blog/<categorie>/<slug> (2 segments): exclu. Les slugs de catégories de la
// langue viennent de Sanity, injectés PAR LOCALE au build dans
// runtimeConfig.public.wf par nuxt.config.ts (plan T2, V4). Ils sont passés en
// paramètre: useRuntimeConfig se lit DANS scrollBehavior (contexte d'app Nuxt
// disponible), jamais au top-level de ce module (pas de contexte là).
function isBlogList(path: string, categorySlugs: string[]): boolean {
  const segs = path.replace(/\/+$/, '').split('/').filter(Boolean)
  const [first, second] = segs
  if (first !== 'blog') return false
  if (segs.length === 1) return true
  if (segs.length === 3 && second === 'page') return true
  if (segs.length === 2 && second !== undefined) return categorySlugs.includes(second)
  return false
}

// Hauteur du header fixe, en px, dérivée du token --header-height (rem) et de la
// taille de police racine courante (robuste à la fluidité double-clamp).
function headerOffset(): number {
  if (typeof window === 'undefined') return 0
  const root = getComputedStyle(document.documentElement)
  const rem = parseFloat(root.fontSize) || 16
  const h = parseFloat(root.getPropertyValue('--header-height')) || 0
  return h * rem
}

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: headerOffset() }
    // Navigation INTERNE au blog vers une vue de liste (filtre, pagination, ou
    // retour d'un article vers sa liste): rester au niveau de la liste. Arriver sur
    // le blog depuis l'extérieur (nav) garde le défaut (haut de page, héros visible).
    // Le switcher de langue navigue en plein chargement (jamais par le router):
    // from et to partagent toujours la même locale ici.
    const locale = pathLocale(to.path)
    if (stripLocalePrefix(from.path, pathLocale(from.path)).startsWith('/blog')) {
      const { categorySlugs } = useRuntimeConfig().public.wf
      if (isBlogList(stripLocalePrefix(to.path, locale), categorySlugs[locale])) {
        return { el: '#blog-list', top: headerOffset() }
      }
    }
    return { top: 0 }
  }
}
