// Requête scopée — Projets (/projets). projectsPage FULL; la grille de projets
// + les blocs lisent les collections en cartes. Param: $language.
import { GLOBALS, singletons, collections } from './_shared'

export const PROJECTS_INDEX_QUERY = /* groq */ `{${GLOBALS},${singletons('projectsPage')},${collections()}}`
