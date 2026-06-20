/* GET /api/exit-preview — sortie custom du mode preview Sanity (terrain de l'etape
 * 5; pattern adapte de webforge-minimaliste).
 *
 * Pourquoi pas le /preview/disable natif du module @nuxtjs/sanity: son 302 serveur
 * peut etre pollue par certains pipelines edge (la query du request original
 * reinjectee dans l'URL finale). Solution robuste, independante du host: AUCUN
 * redirect serveur. L'endpoint supprime le cookie et repond 204; la navigation se
 * fait cote client.
 *
 * deleteCookie reprend les MEMES options que le set du module (sameSite none +
 * secure en prod parce que le cookie est cross-site dans l'iframe du Presentation
 * tool, lax en dev, httpOnly, path /): sans cette correspondance exacte, le
 * navigateur refuse la suppression en prod.
 *
 * En statique pur (preset static), les routes serveur ne sont pas bundlees: ce
 * fichier est INERTE en production. Il sert le dev local et la future branche
 * preview deployee en SSR (etape 6/7).
 */
import { PREVIEW_COOKIE_NAME } from '~/config/preview'

export default defineEventHandler((event) => {
  deleteCookie(event, PREVIEW_COOKIE_NAME, {
    path: '/',
    sameSite: import.meta.dev ? 'lax' : 'none',
    secure: !import.meta.dev,
    httpOnly: true
  })

  setResponseStatus(event, 204)
  // Pas de body, pas de redirect: le client navigue lui-meme.
})
