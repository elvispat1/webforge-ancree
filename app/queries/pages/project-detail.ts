// Requête scopée — Détail projet (/projets/<slug>). Le projet courant ($slug)
// sort en FULL (gallery + detail + translations); projets similaires + témoignage
// lisent les collections en cartes. Params: $language, $slug.
import { GLOBALS, singletons, collections } from './_shared'

export const PROJECT_DETAIL_QUERY = /* groq */ `{${GLOBALS},${singletons()},${collections('project')}}`
