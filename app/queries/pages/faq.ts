// Requête scopée — FAQ (/faq). faqPage FULL (+ sections, déjà dans le squelette);
// la banque faqItems complète (filtrage par thème côté client). Param: $language.
import { GLOBALS, singletons, collections } from './_shared'

export const FAQ_QUERY = /* groq */ `{${GLOBALS},${singletons('faqPage')},${collections()}}`
