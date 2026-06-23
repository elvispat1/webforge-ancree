// useLinkResolver: resolution des liens Sanity cote composants.
//
//   - setLink(ref, targetLocale?): URL d'une reference interne resolue. Le
//     `targetLocale` optionnel force la langue (le lang-switcher s'en sert pour
//     batir l'URL de la version traduite du document courant);
//   - linkHref(link): URL d'un objet `link` (internal | external | anchor);
//   - helpers par page fixe (home(), services(), villes(), ...), langue courante.
//
// Couche MINCE au-dessus du route-map (app/config/route-map.ts) et de la resolution
// du transform (docPath / resolveLink de app/sanity/transform.ts): AUCUNE
// duplication du mapping _type -> route ici. Les segments d'URL sont configurables
// PAR LOCALE dans ROUTES et DOC_ROUTES: changer un segment la-bas se repercute ici
// sans retouche. Jamais de route project (abandonne): serviceCity (villes) prend sa
// place.
//
// Posture d'erreur, differente du transform a dessein: au build, un lien irresoluble
// interrompt le generate (jamais de lien mort silencieux); cote composant, on degrade
// en `undefined`, le caller decide. Porte de Minimaliste.

import { routePath, onePagerPath, type RouteKey } from '~/config/route-map'
import { docPath, resolveLink, type WfLocale } from '~/sanity/transform'
import type { SanityLink, SanityLinkRef } from '~/types/sanity'

export const useLinkResolver = () => {
  const locale = useWfLocale()
  // Numero d'appel (source unique) pour resoudre les liens de type 'tel' cote composant,
  // comme le chrome. Le href tel: est derive, jamais saisi.
  const site = useContent('site')

  /**
   * URL frontend d'une reference interne Sanity resolue (LINK_PROJECTION: _type,
   * _id, slug, catSlug). Retourne `undefined` si la reference est irresoluble (ref
   * absente, slug manquant, type inconnu). Avec l'i18n par document, la ref pointe
   * DEJA la version de la bonne langue: `targetLocale` ne sert qu'a forcer l'arbre
   * d'URL (lang-switcher).
   */
  const setLink = (
    ref?: SanityLinkRef | null,
    targetLocale?: WfLocale
  ): string | undefined => {
    if (!ref) return undefined
    try {
      return docPath(ref, targetLocale ?? locale)
    } catch (error) {
      if (import.meta.dev) console.warn('[useLinkResolver] reference irresoluble:', error)
      return undefined
    }
  }

  /**
   * URL d'un objet `link` Sanity (label rendu separement par le caller): internal =
   * route du doc reference (via setLink), anchor = `#ancre` (ou `/route#ancre` si une
   * page est referencee), external = URL telle quelle.
   */
  const linkHref = (link?: SanityLink | null): string | undefined => {
    if (!link) return undefined
    try {
      return resolveLink(link, locale, site.value.contact.phoneE164)
    } catch (error) {
      if (import.meta.dev) console.warn('[useLinkResolver] lien irresoluble:', error)
      return undefined
    }
  }

  /** Helpers des pages fixes (memes cles que ROUTES), langue courante. */
  const pagePath = (key: RouteKey): string => routePath(key, locale)
  const home = () => pagePath('home')
  const services = () => pagePath('services')
  const villes = () => pagePath('villes')
  const about = () => pagePath('about')
  const blog = () => pagePath('blog')
  const faq = () => pagePath('faq')
  const contact = () => pagePath('contact')
  const onePager = () => onePagerPath('index', locale)

  return { setLink, linkHref, home, services, villes, about, blog, faq, contact, onePager }
}
