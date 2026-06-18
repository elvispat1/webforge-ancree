// Requête scopée — Blogue (/blog, /blog/page/<n>). blogPage FULL; articles +
// catégories en cartes (listing paginé + compteurs de filtre côté client).
// Param: $language.
import { GLOBALS, singletons, collections } from './_shared'

export const BLOG_INDEX_QUERY = /* groq */ `{${GLOBALS},${singletons('blogPage')},${collections()}}`
