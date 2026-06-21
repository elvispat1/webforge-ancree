/* Identite du site (siteSettings Sanity), miroir du contenu que la transformation
 * produira. Sert le graphe SEO de l'accueil (noeud LocalBusiness: NAP + zone
 * desservie) avec repli fixtures quand le dataset est vide, pour que le build ne
 * casse jamais. La pipeline de payload unique (etape 5) remplacera ce fetch par
 * une lecture hydratee partagee avec le Header/Footer. AUCUNE valeur design ici.
 *
 * REPLI-MIROIR du seed: le telephone, le courriel et la zone desservie
 * apparaissent aussi dans contactFixture (content/contact.ts) et l'i18n;
 * l'adresse postale, elle, ne vit que dans cette fixture et dans siteSettings
 * Sanity (miroir du seed). Toutes sont des replis de la MEME verite a
 * l'execution, Sanity siteSettings. La marque elle-meme n'est PAS
 * lue d'ici pour le SEO: le nom de l'entreprise (Organization + LocalBusiness)
 * vient de site.name (nuxt.config, fetch Sanity de brandName), source unique. Le
 * champ brandName ci-dessous reste informatif (forme complete du document). */

export interface SiteIdentity {
  brandName: string
  tagline?: string
  phoneDisplay?: string
  phoneHref?: string // tel:+1...
  emailDisplay?: string
  emailHref?: string // mailto:...
  areaName?: string // zone desservie (nom de lieu), motif SEO local
  // Adresse postale du siege, forme Schema.org (noeud LocalBusiness de l'accueil).
  // Fictive comme le reste de la NAP; reste identique entre langues (adresse du
  // Quebec, non traduite). Optionnelle: absente -> le LocalBusiness omet l'adresse.
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
}

/* Adresse du siege (fictive, partagee fr/en). Source unique du bloc address des
 * deux fixtures ci-dessous, repli de siteSettings.address (Sanity). */
const DEMO_ADDRESS = {
  streetAddress: '1450, boulevard Industriel',
  addressLocality: 'Terrebonne',
  addressRegion: 'QC',
  postalCode: 'J6Y 1W8',
  addressCountry: 'CA'
} as const

/* Identite de demonstration (Rempart Extermination, fictif), bilingue. Memes
 * coordonnees que la fixture de contact (source unique = Sanity siteSettings a
 * terme). Coordonnees fictives. */
export function siteFixture(isEn: boolean): SiteIdentity {
  if (isEn) {
    return {
      brandName: 'Rempart Extermination',
      tagline: "Residential and commercial pest control, rooted on Montreal's North Shore.",
      phoneDisplay: '450 555 0199',
      phoneHref: 'tel:+14505550199',
      emailDisplay: 'bonjour@rempart-extermination.ca',
      emailHref: 'mailto:bonjour@rempart-extermination.ca',
      areaName: 'North Shore of Montreal and Laval',
      address: { ...DEMO_ADDRESS }
    }
  }
  return {
    brandName: 'Rempart Extermination',
    tagline: 'Extermination résidentielle et commerciale, ancrée sur la Rive-Nord de Montréal.',
    phoneDisplay: '450 555 0199',
    phoneHref: 'tel:+14505550199',
    emailDisplay: 'bonjour@rempart-extermination.ca',
    emailHref: 'mailto:bonjour@rempart-extermination.ca',
    areaName: 'Rive-Nord de Montréal et Laval',
    address: { ...DEMO_ADDRESS }
  }
}
