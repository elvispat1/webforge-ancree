// Requête scopée — Article (/blog/<catégorie>/<slug> ou /blog/<slug>) ET archive
// de catégorie (/blog/<slug>). L'article courant ($slug = dernier segment) sort
// en FULL (body + translations). Si $slug est en fait une catégorie, aucun
// article ne matche -> tous en cartes (correct pour l'archive de catégorie).
// blogPage (CTA/related) et catégories restent disponibles. Params: $language, $slug.
import { GLOBALS, singletons, collections } from './_shared'

export const ARTICLE_DETAIL_QUERY = /* groq */ `{${GLOBALS},${singletons()},${collections('article')}}`
