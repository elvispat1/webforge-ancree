// Sélection et regroupement dans la banque FAQ.
// V2 (Sanity, actuel): la banque vient du payload (ids = _id Sanity); le
// filtrage reste local, signatures et retours inchangés depuis V1.
//   - useFaq({ ids }): sélections manuelles (bloc faq), résolues dans l'ORDRE
//     des refs (12.8), pas l'ordre de la banque;
//   - useFaq({ theme }): theme = SLUG du document faqTheme (plus le libellé);
//   - useFaqByTheme(): listing de la page /faq depuis faqPage.sections, une
//     section par thème dans l'ordre des sections (spec 6.7, 12.15).

import { computed, type ComputedRef } from 'vue'
import type { FaqItem } from '~/content/faq'

export interface FaqQuery {
  ids?: string[]
  /** Slug du faqTheme (l'identité du thème, plus son libellé affiché). */
  theme?: string
  limit?: number
}

export function useFaq(query: FaqQuery = {}): FaqItem[] {
  let out = usePayload().collections.faqItems
  if (query.ids) {
    // L'ordre des refs fait foi (sélection manuelle du bloc faq, 12.8); une
    // ref brisée (id absent de la banque) est écartée sans trou.
    const byId = new Map(out.map((f) => [f.id, f]))
    out = query.ids
      .map((id) => byId.get(id))
      .filter((f): f is FaqItem => f !== undefined)
  }
  if (query.theme) out = out.filter((f) => f.theme === query.theme)
  if (typeof query.limit === 'number') out = out.slice(0, query.limit)
  return out
}

export interface FaqThemeGroup {
  /** Titre affiché du thème (faqTheme.title). */
  theme: string
  /** Ancre du groupe: slug du document faqTheme (id du groupe + cible du rail). */
  slug: string
  items: FaqItem[]
}

// Slug d'ancre de REPLI (section sans thème seulement, cas Studio dégradé):
// minuscules sans accents, non-alphanumériques en traits d'union. Les thèmes
// réels portent leur propre slug (faqTheme.slug), jamais une dérivation du
// libellé.
function fallbackSlug(label: string): string {
  return label
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Listing de la page /faq: un groupe par section de faqPage.sections, dans
// l'ordre des sections (la composition se gère au Studio, spec 6.7, 12.15).
// Items par mode: auto = TOUTES les questions du thème, triées alphabétiquement
// sur la question (localeCompare de la locale courante du payload); manual =
// les refs résolues dans leur ordre (useFaq écarte les refs brisées sans trou).
// computed: la page /faq se met à jour in-place en preview (template auto-unwrap;
// usePayload/useFaq lisent le store live). useFaq(query) reste plain (feuille).
export function useFaqByTheme(): ComputedRef<FaqThemeGroup[]> {
  return computed(() => {
    const { $i18n } = useNuxtApp()
    const locale = useWfLocale()
    // Libellé de repli d'une section sans thème (cas Studio dégradé: le schéma
    // exige le thème sur chaque section); en auto, son pool = les questions
    // sans thème de la banque.
    const noThemeLabel = $i18n.t('ui.faq.no_theme')
    return usePayload().pages.faq.sections.map((section) => {
      let items: FaqItem[]
      if (section.mode === 'auto') {
        const pool = section.theme
          ? useFaq({ theme: section.theme.slug })
          : usePayload().collections.faqItems.filter((f) => !f.theme)
        items = [...pool].sort((a, b) => a.q.localeCompare(b.q, locale))
      } else {
        items = useFaq({ ids: section.refs })
      }
      return {
        theme: section.theme?.title ?? noThemeLabel,
        slug: section.theme?.slug ?? fallbackSlug(noThemeLabel),
        items
      }
    })
  })
}
