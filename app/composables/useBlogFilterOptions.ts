// Options de la barre de filtre du blog (FilterBar): « Tous » (collection nue)
// en tête, puis une option par catégorie, chacune avec son compteur d'articles
// (statique, résolu au build) et son archive crawlable (filtre route-based).
//
// Extrait de BlogListSection pour respecter le contrat des vues de collection
// (« la page calcule options/active/total », cf. FilterBar/ProjectGrid): les
// PAGES appellent ce composable et passent le résultat en props, le composant
// reste une vue pure. La requête de collection vit derrière la frontière à
// signature stable du swap Sanity V2 (useCategories/useArticles), jamais un
// import direct de CATEGORIES.

import { computed, type ComputedRef } from 'vue'
import { routePath } from '~/config/route-map'

export interface BlogFilterOption {
  /** 'all' pour la collection nue, sinon le slug de catégorie. */
  slug: string
  label: string
  count: number
  href: string
}

// computed: la barre de filtre rend des LIBELLÉS de catégories (éditables) et des
// compteurs; elle se met à jour in-place en preview. useI18n() est hoisté hors du
// computed (composable setup-only); useArticles/useCategories/useWfLocale, eux,
// sont lus DANS le computed (réactifs au store live).
export function useBlogFilterOptions(): ComputedRef<BlogFilterOption[]> {
  const { t } = useI18n()
  return computed(() => {
    // Base localisée (T2b): /blog en FR, /en/blog en EN (préfixe via route-map).
    const base = routePath('blog', useWfLocale())
    return [
      { slug: 'all', label: t('a11y.filter_all'), count: useArticles().length, href: base },
      ...useCategories().map((c) => ({
        slug: c.slug,
        label: c.title,
        count: useArticles({ category: c.slug }).length,
        href: `${base}/${c.slug}`
      }))
    ]
  })
}
