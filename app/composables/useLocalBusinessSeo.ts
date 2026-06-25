import type { PageSeoLocalBusiness } from './usePageSeo'

/* Source UNIQUE du nœud LocalBusiness (NAP complet, PostalAddress structuré,
 * sameAs vers les réseaux sociaux), construite depuis siteSettings (useContent).
 * Consommée par les DEUX surfaces NAP que Google privilégie: l'accueil et la page
 * Contact. Le visuel est optionnel (passé par la page: héros de l'accueil, image
 * de la page Contact). Discipline 3: aucune valeur en dur, tout vient du payload.
 * cityProv sert l'affichage; city/region/country/postal sont les champs structurés
 * du PostalAddress (voir transformSiteSettings). */
export function useLocalBusinessSeo(image?: string): PageSeoLocalBusiness {
  const site = useContent('site').value
  return {
    name: site.brand.name,
    telephone: site.contact.phoneE164,
    email: site.contact.email,
    address: {
      streetAddress: site.contact.address.line1,
      addressLocality: site.contact.address.city,
      addressRegion: site.contact.address.region,
      postalCode: site.contact.address.postal,
      addressCountry: site.contact.address.country
    },
    areaServed: site.contact.areaServed,
    ...(image ? { image } : {}),
    foundingDate: String(site.brand.foundedYear),
    ...(site.socials.length ? { sameAs: site.socials.map((s) => s.url) } : {})
  }
}
