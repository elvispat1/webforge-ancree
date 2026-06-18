// Requête scopée — Accueil (/). homePage FULL (pageBuilder); collections en
// cartes (pour les blocs intelligents); aucun item de détail. Param: $language.
import { GLOBALS, singletons, collections } from './_shared'

export const HOME_QUERY = /* groq */ `{${GLOBALS},${singletons('homePage')},${collections()}}`
