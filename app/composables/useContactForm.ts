/* useContactForm — mécanique de soumission réutilisable par n'importe quel
 * formulaire (contact, devis, infolettre…). Gère la machine à états de la
 * soumission, le jeton Turnstile et le honeypot, puis poste le payload vers
 * l'endpoint serveur.
 *
 * La VALIDATION des champs et les messages d'erreur restent dans le composant
 * appelant: ils dépendent du contenu (discipline contenu de webforge). Ce
 * composable ne s'occupe que du transport et de l'état.
 *
 * Usage:
 *   const { status, turnstileToken, honeypot, submit } = useContactForm()
 *   await submit({ name, email, phone, message })
 */

export type ContactStatus = 'idle' | 'loading' | 'success' | 'error'

export function useContactForm(endpoint = '/api/contact') {
  const status = ref<ContactStatus>('idle')
  const turnstileToken = ref('')
  const honeypot = ref('')

  /* Mode démo (site généré en statique pur): aucun backend, le succès est simulé
   * côté client. C'est cohérent avec le mode démo serveur précédent (qui simulait
   * déjà le succès sans clé Resend), juste déplacé côté client puisqu'il n'y a
   * plus de route /api/contact en statique. Les VRAIS sites clients laissent ce
   * flag à false: submit() poste alors vers l'endpoint serveur (Resend + Turnstile).
   * Le honeypot est honoré dans les deux cas. */
  const demo = useRuntimeConfig().public.contactDemo === true

  async function submit(payload: Record<string, string>) {
    status.value = 'loading'

    if (demo) {
      // Latence réaliste, puis succès. Honeypot rempli = bot: même issue visible
      // (succès silencieux), aucun envoi de toute façon en démo.
      await new Promise((resolve) => setTimeout(resolve, 600))
      status.value = 'success'
      return
    }

    /* Poste le payload accompagné des champs anti-bot. success → état succès;
     * toute erreur (réseau, validation serveur, refus Turnstile) → état erreur,
     * le composant affiche alors sa bannière depuis le contenu. */
    try {
      const res = await $fetch<{ success: boolean }>(endpoint, {
        method: 'POST',
        body: {
          ...payload,
          website: honeypot.value, // honeypot: rempli = bot
          'cf-turnstile-response': turnstileToken.value
        }
      })
      status.value = res?.success ? 'success' : 'error'
    } catch {
      status.value = 'error'
    }
  }

  return { status, turnstileToken, honeypot, submit }
}
