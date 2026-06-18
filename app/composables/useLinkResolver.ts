// useLinkResolver — résolution des liens Sanity côté composants.
//
// API calquée sur la référence nuxt-sanity-test
// (app/composables/useLinkResolver.ts):
//   - setLink(ref, targetLocale?): URL d'une référence interne résolue. Le
//     `targetLocale` optionnel force la langue (le lang-switcher s'en sert
//     pour bâtir l'URL de la version traduite du document courant);
//   - linkHref(link): URL d'un objet `link` (internal | external | anchor);
//   - helpers par page fixe (home(), services(), ...), langue courante.
//
// Couche MINCE au-dessus du route-map (app/config/route-map.ts) et de la
// résolution du transform (docPath / resolveLink de app/sanity/transform.ts):
// AUCUNE duplication du mapping _type -> route ici. Les segments d'URL des
// hubs sont entièrement configurables PAR LOCALE dans ROUTES (/services,
// /projets vs /projects, /a-propos vs /about, /blog, /faq, /contact, segments
// légaux traduits) et dans DOC_ROUTES pour les patterns de détail
// (/projets/[slug] vs /projects/[slug]): changer un segment là-bas se
// répercute ici sans retouche.
//
// Posture d'erreur, différente du transform à dessein: au build, un lien
// irrésoluble interrompt le generate (jamais de lien mort silencieux); côté
// composant, on dégrade en `undefined` (comme la référence), le caller décide.

import { routePath, onePagerPath, type RouteKey } from '~/config/route-map'
import { docPath, resolveLink, type WfLocale } from '~/sanity/transform'
import type { SanityLink, SanityLinkRef } from '~/types/sanity'

export const useLinkResolver = () => {
  const locale = useWfLocale()

  /**
   * URL frontend d'une référence interne Sanity résolue (projection
   * LINK_PROJECTION: _type, _id, slug, catSlug). Retourne `undefined` si la
   * référence est irrésoluble (ref absente, slug manquant, type inconnu).
   * Avec l'i18n par document, la ref pointe DÉJÀ la version de la bonne
   * langue: `targetLocale` ne sert qu'à forcer l'arbre d'URL (lang-switcher).
   */
  const setLink = (
    ref?: SanityLinkRef | null,
    targetLocale?: WfLocale
  ): string | undefined => {
    if (!ref) return undefined
    try {
      return docPath(ref, targetLocale ?? locale)
    } catch (error) {
      if (import.meta.dev) console.warn('[useLinkResolver] référence irrésoluble:', error)
      return undefined
    }
  }

  /**
   * URL d'un objet `link` Sanity (label rendu séparément par le caller):
   * internal = route du doc référencé (via setLink), anchor = `#ancre` (ou
   * `/route#ancre` si une page est référencée), external = URL telle quelle.
   */
  const linkHref = (link?: SanityLink | null): string | undefined => {
    if (!link) return undefined
    try {
      return resolveLink(link, locale)
    } catch (error) {
      if (import.meta.dev) console.warn('[useLinkResolver] lien irrésoluble:', error)
      return undefined
    }
  }

  /** Helpers des pages fixes (mêmes clés que ROUTES), langue courante. */
  const pagePath = (key: RouteKey): string => routePath(key, locale)
  const home = () => pagePath('home')
  const services = () => pagePath('services')
  const projects = () => pagePath('projects')
  const about = () => pagePath('about')
  const blog = () => pagePath('blog')
  const faq = () => pagePath('faq')
  const contact = () => pagePath('contact')
  const onePager = () => onePagerPath('index', locale)

  return { setLink, linkHref, home, services, projects, about, blog, faq, contact, onePager }
}
