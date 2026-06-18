/* GET /api/exit-preview — sortie custom du mode preview Sanity (plan T2c,
 * pattern copié de la référence nuxt-sanity-test).
 *
 * Pourquoi pas le /preview/disable natif du module @nuxtjs/sanity: son 302
 * serveur s'est avéré pollué par certains pipelines edge (vérifié sur Netlify
 * dans la référence: la query du request original est réinjectée dans l'URL
 * finale, l'éditeur atterrit sur `/foo?redirect=/foo`). Solution robuste et
 * indépendante du host: AUCUN redirect serveur. L'endpoint supprime le cookie
 * et répond 204; la navigation se fait côté client (PreviewBanner.vue fait
 * $fetch puis window.location.assign).
 *
 * deleteCookie reprend les MÊMES options que le set du module (sameSite none +
 * secure en prod parce que le cookie est cross-site dans l'iframe du
 * Presentation tool, lax en dev, httpOnly, path /): sans cette correspondance
 * exacte, le navigateur refuse la suppression en prod.
 *
 * En statique pur (preset static), les routes serveur ne sont pas bundlées:
 * ce fichier est INERTE en production. Il sert le dev local maintenant et la
 * future branche preview déployée en SSR (décision tranchée #4 du contrat §17).
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
  // Pas de body, pas de redirect: le client navigue lui-même.
})
