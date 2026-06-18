// Requête scopée — Pages légales (/conditions-utilisation, /politique-confidentialite
// et leurs variantes one-pager) ET repli des routes inconnues. Aucun singleton
// full, aucun item de détail: seulement le chrome global (siteSettings + legalPages
// dans GLOBALS) + les squelettes. Param: $language.
import { GLOBALS, singletons, collections } from './_shared'

export const LEGAL_QUERY = /* groq */ `{${GLOBALS},${singletons()},${collections()}}`
