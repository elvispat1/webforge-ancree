// useFixedPage — accès SYNCHRONE au document d'une page fixe du payload:
// héros, pageBuilder semi-résolu, SEO (replis 12.10 déjà faits au transform)
// et champs propres (CTA du blogue, sections de la FAQ).
//
// Composable interne ADDITIF (T2a, aucun rail touché): sert usePageHero, les
// appels usePageSeo des pages et les gabarits des pages de détail.

import type { ContentPayload } from '~/sanity/transform'
import type { BlogPageContent } from '~/content/blog-page'

export function useFixedPage<K extends keyof ContentPayload['pages']>(
  key: K
): ContentPayload['pages'][K] {
  return usePayload().pages[key]
}

/** Copie des pages du blogue (CTA des trois sorties de conversion + en-tête
 *  des articles reliés). Même interface qu'en V1, liens déjà résolus en href. */
export function useBlogPageContent(): BlogPageContent {
  return useFixedPage('blog')
}
