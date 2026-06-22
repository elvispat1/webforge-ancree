/* Plugin consent — s'exécute tôt côté client. Lit l'enregistrement de
 * consentement et applique le blocage dur AVANT le rendu utile: rien de mesure
 * ne se charge tant que l'analytique n'a pas été consentie (et l'enregistrement
 * valide). La décision vit dans le store; le plugin l'amorce.
 *
 * Suffixe .client: jamais exécuté au build/SSR (localStorage n'existe pas côté
 * serveur). @pinia/nuxt enregistre Pinia avant les plugins applicatifs, donc le
 * store est résolvable ici.
 */
export default defineNuxtPlugin(() => {
  const consent = useConsentStore()
  consent.hydrate()
  consent.applyConsent()
})
