/**
 * Source unique pour tout ce qui concerne le mode preview Sanity (plan T2c,
 * pattern copié de la référence nuxt-sanity-test).
 *
 * Le module `@nuxtjs/sanity` pose un cookie quand l'éditeur valide un secret
 * via `/preview/enable` (route fournie par le module, active seulement quand
 * `sanity.visualEditing` est configuré, donc jamais en statique pur). Deux
 * consommateurs lisent ces constantes:
 *   - server/api/exit-preview.get.ts                  : deleteCookie + 204
 *   - app/components/layout/PreviewBanner.vue          : sortie (-> accueil prod)
 *
 * Si le module change le nom du cookie, on touche un seul fichier. Plain TS,
 * aucun import: importable de partout (app, server, futur Studio).
 */

export const PREVIEW_COOKIE_NAME = 'sanity-preview-id'

/**
 * Endpoints. `/preview/enable` et `/preview/disable` sont fournis par
 * `@nuxtjs/sanity`. `/api/exit-preview` est l'override custom (cf.
 * server/api/exit-preview.get.ts pour le pourquoi).
 */
export const PREVIEW_ENABLE_PATH = '/preview/enable'
export const PREVIEW_DISABLE_PATH = '/preview/disable'
export const EXIT_PREVIEW_PATH = '/api/exit-preview'

/**
 * Sortie cross-domaine preview vers prod. Le domaine preview sert des
 * brouillons; « Quitter la prévisualisation » doit ramener au site PUBLIÉ, au
 * MÊME chemin, sur le domaine de prod (pas rester sur le domaine preview).
 *
 * Dérivation par convention de nommage des Workers (`<worker>-preview.<zone>`):
 * prod = `webforge-minimaliste.patoinestudio.ca`, preview =
 * `webforge-minimaliste-preview.patoinestudio.ca`. On retire le suffixe
 * `-preview` du PREMIER segment de l'hôte. Portable sans config dans chaque
 * repo de famille (webforge-cinematique-preview -> webforge-cinematique).
 *
 * Retourne `null` si l'hôte n'est PAS un hôte preview (dev local sur localhost,
 * ou le domaine prod lui-même): le caller garde alors une navigation relative,
 * comportement inchangé hors preview.
 */
export function prodHostFromPreviewHost(host: string): string | null {
  const prodHost = host.replace(/^([^.]+)-preview\./, '$1.')
  return prodHost === host ? null : prodHost
}
