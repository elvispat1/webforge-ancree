/**
 * Source unique du mode preview Sanity (terrain de l'etape 5; pattern adapte de
 * webforge-minimaliste). Plain TS, AUCUN import: importable de partout (app,
 * server, futur Studio).
 *
 * Le module @nuxtjs/sanity pose un cookie quand l'editeur valide un secret via
 * `/preview/enable` (route fournie par le module, active SEULEMENT quand
 * sanity.visualEditing est configure, donc jamais en statique pur). Consommateurs:
 *   - server/api/exit-preview.get.ts : deleteCookie + 204
 *
 * NOTE: l'activation du preview (gating par branche WORKERS_CI_BRANCH + token +
 * studioUrl, config sanity.visualEditing, bascule du preset SSR) est l'etape 6/7
 * (deploiement). Ici on prepare le TERRAIN: les fichiers + le gating __WF_PREVIEW__.
 */

export const PREVIEW_COOKIE_NAME = 'sanity-preview-id'

/** Endpoints. `/preview/enable` et `/preview/disable` viennent de @nuxtjs/sanity.
 *  `/api/exit-preview` est l'override custom (pas de redirect serveur). */
export const PREVIEW_ENABLE_PATH = '/preview/enable'
export const PREVIEW_DISABLE_PATH = '/preview/disable'
export const EXIT_PREVIEW_PATH = '/api/exit-preview'

/**
 * Sortie cross-domaine preview -> prod. Le domaine preview sert des brouillons;
 * « Quitter la previsualisation » doit ramener au site PUBLIE, au MEME chemin, sur
 * le domaine de prod. Derivation par convention de nommage des Workers
 * (`<worker>-preview.<zone>` -> `<worker>.<zone>`): on retire le suffixe `-preview`
 * du PREMIER segment de l'hote. Portable sans config par repo de famille.
 *
 * Retourne `null` si l'hote n'est PAS un hote preview (dev local, ou le domaine
 * prod lui-meme): le caller garde alors une navigation relative.
 */
export function prodHostFromPreviewHost(host: string): string | null {
  const prodHost = host.replace(/^([^.]+)-preview\./, '$1.')
  return prodHost === host ? null : prodHost
}
