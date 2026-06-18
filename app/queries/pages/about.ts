// Requête scopée — À propos (/a-propos). aboutPage FULL; collections en cartes
// (témoignages et autres blocs éventuels). Param: $language.
import { GLOBALS, singletons, collections } from './_shared'

export const ABOUT_QUERY = /* groq */ `{${GLOBALS},${singletons('aboutPage')},${collections()}}`
