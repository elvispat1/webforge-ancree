// Fragments GROQ de résolution de références: liens et traductions.
// Imports RELATIFS seulement (fermeture nuxt.config, cf. figure.ts).

/**
 * Lien (objet partagé `link`): la ref interne est déréférencée vers le strict
 * nécessaire au route-map (résolution en href string dans app/sanity/transform.ts):
 * `_type` du document, `_id` (routage des legalPage sans slug), `slug` et, pour
 * les articles, le slug de catégorie qui détermine le segment d'URL parent.
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
 * Traductions d'un document de collection (plugin @sanity/document-
 * internationalization): le document translation.metadata qui le référence
 * porte les versions de chaque langue. Projeté en { lang, slug, catSlug }
 * minimal: sert le switcher de langue et setI18nParams sur les pages détail.
 * catSlug ne résout que sur les articles (champ category), null ailleurs:
 * projection unique partagée, le transform normalise.
 *
 * Expression complète (pas une projection entre accolades): à interpoler tel
 * quel après une clé, ex. `"translations": ${TRANSLATIONS_PROJECTION}`.
 */
export const TRANSLATIONS_PROJECTION = /* groq */ `*[
  _type == "translation.metadata" && references(^._id)
][0].translations[]{
  "lang": _key,
  "slug": value->slug.current,
  "catSlug": value->category->slug.current
}`
