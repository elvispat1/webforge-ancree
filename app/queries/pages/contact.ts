// Requête scopée — Contact (/contact). contactPage FULL (le bloc contact est
// autonome, pas de collection requise). Param: $language.
import { GLOBALS, singletons, collections } from './_shared'

export const CONTACT_QUERY = /* groq */ `{${GLOBALS},${singletons('contactPage')},${collections()}}`
