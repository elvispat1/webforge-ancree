import { reveal } from '~/directives/reveal'

/* Enregistre la directive v-reveal globalement.
 *
 * Universel (pas de suffixe .client) pour que la directive soit résolue au
 * SSR/prerender sans warning « Failed to resolve directive ». Ses hooks
 * mounted/unmounted ne s'exécutent de toute façon qu'au client (Vue ne lance pas
 * les hooks de directive au rendu serveur). */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', reveal)
})
