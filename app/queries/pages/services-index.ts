// Requête scopée — Services (/services). servicesPage FULL; collections en
// cartes (bloc services + autres blocs). Param: $language.
import { GLOBALS, singletons, collections } from './_shared'

export const SERVICES_INDEX_QUERY = /* groq */ `{${GLOBALS},${singletons('servicesPage')},${collections()}}`
