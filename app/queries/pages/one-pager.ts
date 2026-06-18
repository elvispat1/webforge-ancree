// Requête scopée — One-Pager (/one-pager). onePager FULL; mêmes collections en
// cartes que l'accueil (services/projets/témoignages/faq/blog selon les blocs).
// Param: $language.
import { GLOBALS, singletons, collections } from './_shared'

export const ONE_PAGER_QUERY = /* groq */ `{${GLOBALS},${singletons('onePager')},${collections()}}`
