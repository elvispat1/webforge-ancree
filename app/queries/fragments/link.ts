// Fragments GROQ de resolution de references: liens et traductions.
// Imports RELATIFS seulement (fermeture nuxt.config, cf. figure.ts).

/**
 * Lien (objet partage `link` du lot B): la ref interne est dereferencee vers le
 * strict necessaire au route-map (resolution en href string dans
 * app/sanity/transform.ts via docPath): `_type` du document, `_id` (routage des
 * legalPage sans slug), `slug` et, pour les articles, le slug de categorie qui
 * determine le segment d'URL parent. Aucune ref vers project (abandonne):
 * serviceCity prend sa place dans la cible des liens.
 */
export const LINK_PROJECTION = /* groq */ `{
  label,
  type,
  externalUrl,
  anchor,
  "internalRef": internalRef->{
    _type,
    _id,
    "slug": slug.current,
    "catSlug": category->slug.current
  }
}`

/**
 * markDefs d'un Portable Text riche (annotation `link`): meme forme que
 * LINK_PROJECTION, sans `label` (le texte du lien EST le span annote). Partagee par
 * le corps d'article ET les segments editoriaux. A interpoler apres une cle, ex.
 * `"markDefs": ${PT_LINK_MARKDEFS}`.
 */
export const PT_LINK_MARKDEFS = /* groq */ `markDefs[]{
  _key,
  _type,
  type,
  externalUrl,
  anchor,
  "internalRef": internalRef->{
    _type,
    _id,
    "slug": slug.current,
    "catSlug": category->slug.current
  }
}`

/**
 * Traductions d'un document de collection (plugin @sanity/document-
 * internationalization): le document translation.metadata qui le reference porte
 * les versions de chaque langue. Projete en { lang, slug, catSlug } minimal: sert
 * le switcher de langue et setI18nParams sur les pages detail. catSlug ne resout
 * que sur les articles (champ category), null ailleurs: projection unique
 * partagee, le transform normalise.
 *
 * Expression complete (pas une projection entre accolades): a interpoler tel
 * quel apres une cle, ex. `"translations": ${TRANSLATIONS_PROJECTION}`.
 */
export const TRANSLATIONS_PROJECTION = /* groq */ `*[
  _type == "translation.metadata" && references(^._id)
][0].translations[]{
  "lang": _key,
  "slug": value->slug.current,
  "catSlug": value->category->slug.current
}`
