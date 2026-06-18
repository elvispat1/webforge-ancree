// Fragment GROQ: SEO de page fixe. Import RELATIF (fermeture nuxt.config).

/** SEO de page fixe: l'image de partage sort en URL CDN directement. */
export const SEO_PROJECTION = /* groq */ `{
  title,
  description,
  "ogImage": ogImage.asset->url
}`
