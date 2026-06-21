/* Formulaire de contact: etat de soumission, validation cote client, et transport
 * vers l'endpoint serveur. Plomberie portee/adaptee de webforge-minimaliste (voir
 * server/api/contact.post.ts), NIVEAU DEMO/TERRAIN.
 *
 * Le contrat reste {status, values, errors, validate, submit, reset}, enrichi du
 * jeton Turnstile et du honeypot anti-bot. La VALIDATION des champs et ses messages
 * restent ici (couples au contenu i18n de la vue), conformement a la discipline.
 *
 * EN STATIQUE PUR (demo): runtimeConfig.public.contactDemo === true -> submit()
 * simule le succes cote client apres une courte latence, AUCUNE requete reseau (la
 * route /api/contact n'est pas bundlee). Un vrai site client met contactDemo a
 * false: submit() poste alors vers l'endpoint (Resend + Turnstile cote serveur).
 *
 * Le garde status === 'loading' bloque la double soumission sans jamais desactiver
 * le bouton (regle d'accessibilite du geste d'appel). La validation retourne la cle
 * du premier champ invalide pour que la vue y replace le focus. */
import { reactive, ref, type Ref } from 'vue'

export type ContactStatus = 'idle' | 'loading' | 'success' | 'error'

/* Cles de champ stables, decouplees des libelles (qui viennent du contenu i18n). */
export type ContactField = 'name' | 'contact' | 'message'

export interface ContactValues {
  name: string
  contact: string
  message: string
}

export interface UseContactForm {
  status: Ref<ContactStatus>
  values: ContactValues
  errors: Record<ContactField, string>
  /* Jeton Turnstile (vide tant que le widget n'a pas valide; absent en demo). */
  turnstileToken: Ref<string>
  /* Honeypot anti-bot: rempli = robot. Lie a un champ hors ecran de la vue. */
  honeypot: Ref<string>
  /* Renvoie la cle du premier champ invalide, ou null si tout est valide. */
  validate: () => ContactField | null
  /* Garde la double soumission, valide, puis poste (ou simule en demo). Le rappel
   * optionnel recoit la cle du premier champ en faute pour replacer le focus. */
  submit: (onInvalid?: (firstInvalid: ContactField) => void) => Promise<void>
  reset: () => void
}

/* Delai simule de l'envoi en demo. Tokenise ici (pas une valeur design): assez
 * long pour montrer l'etat de chargement, assez court pour ne pas agacer. */
const FAKE_LATENCY_MS = 700

/* Validateurs minimaux: presence pour les champs requis, et une heuristique souple
 * courriel ou telephone pour le champ de coordonnee (ni l'un ni l'autre format
 * n'est impose). Les messages sont remis par la vue (i18n); ici on ne pose qu'un
 * drapeau de cle d'erreur non vide. */
function looksLikeContact(raw: string): boolean {
  const v = raw.trim()
  if (v.length < 5) return false
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const digits = v.replace(/\D/g, '')
  const isPhone = digits.length >= 10
  return isEmail || isPhone
}

export function useContactForm(
  messages: Record<ContactField, string>,
  endpoint = '/api/contact'
): UseContactForm {
  const status = ref<ContactStatus>('idle')
  const turnstileToken = ref('')
  const honeypot = ref('')

  /* Demo (statique pur): pas de backend, le succes est simule cote client. Lu une
   * fois a l'init; un vrai site client pose ce flag a false dans runtimeConfig. */
  const demo = useRuntimeConfig().public.contactDemo === true

  const values = reactive<ContactValues>({
    name: '',
    contact: '',
    message: ''
  })

  const errors = reactive<Record<ContactField, string>>({
    name: '',
    contact: '',
    message: ''
  })

  function clearError(field: ContactField): void {
    errors[field] = ''
  }

  function validate(): ContactField | null {
    let firstInvalid: ContactField | null = null

    // Nom: requis.
    if (!values.name.trim()) {
      errors.name = messages.name
      firstInvalid = firstInvalid ?? 'name'
    } else {
      clearError('name')
    }

    // Coordonnee: requise, et doit ressembler a un courriel ou un telephone.
    if (!looksLikeContact(values.contact)) {
      errors.contact = messages.contact
      firstInvalid = firstInvalid ?? 'contact'
    } else {
      clearError('contact')
    }

    // Message: optionnel, jamais en faute.
    clearError('message')

    return firstInvalid
  }

  /* Compteur de soumission: un reset() en cours de vol l'incremente, ce qui
   * invalide l'ecriture d'etat d'une requete deja partie (pas de status fantome). */
  let generation = 0

  async function submit(onInvalid?: (firstInvalid: ContactField) => void): Promise<void> {
    // Garde la double soumission sans desactiver le bouton.
    if (status.value === 'loading') return

    const firstInvalid = validate()
    if (firstInvalid) {
      onInvalid?.(firstInvalid)
      return
    }

    const gen = ++generation
    status.value = 'loading'

    // Demo: latence realiste puis succes, aucune requete. Honeypot rempli = robot;
    // meme issue visible (succes silencieux), rien n'est envoye de toute facon.
    if (demo) {
      await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS))
      if (gen === generation) status.value = 'success'
      return
    }

    // Reel: poste le payload accompagne des champs anti-bot. success -> succes;
    // toute erreur (reseau, validation serveur, refus Turnstile) -> erreur, la vue
    // affiche alors sa banniere depuis le contenu.
    try {
      const res = await $fetch<{ success: boolean }>(endpoint, {
        method: 'POST',
        body: {
          name: values.name,
          contact: values.contact,
          message: values.message,
          website: honeypot.value, // honeypot: rempli = robot
          'cf-turnstile-response': turnstileToken.value
        }
      })
      if (gen === generation) status.value = res?.success ? 'success' : 'error'
    } catch {
      if (gen === generation) status.value = 'error'
    }
  }

  function reset(): void {
    generation++ // invalide toute soumission encore en vol
    status.value = 'idle'
    values.name = ''
    values.contact = ''
    values.message = ''
    turnstileToken.value = ''
    honeypot.value = ''
    clearError('name')
    clearError('contact')
    clearError('message')
  }

  return { status, values, errors, turnstileToken, honeypot, validate, submit, reset }
}
