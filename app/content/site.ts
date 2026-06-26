// Contenu global du site (brand, nav, footer, coordonnées) — CONTRAT.
//
// V2 (Sanity, actuel): la source de vérité est le document `siteSettings`
// (payload via useContent('site')). Ce fichier ne garde que l'interface,
// miroir exact du schéma Sanity siteSettings après transformation (liens
// résolus en ancres/routes string).
//
// Nav mode-aware: deux jeux distincts. `landing` (ancres) sert le one-pager
// (/one-pager), `multipage` (routes) sert le site multipage (/). Les items
// diffèrent d'un mode à l'autre, d'où deux listes plutôt qu'une seule à double
// cible. Le Header/Footer/MobileMenu choisissent selon leur prop `mode`.

import type { SocialPlatform } from '../config/socials'

/** SEO éditable d'un document-page (objet `seo` du Studio: titre/description/image
 *  de partage), projeté en { title, description, image }. Tous optionnels: un champ
 *  vide retombe sur la dérivation propre à la page (titre, accroche, couverture),
 *  puis sur les replis globaux de usePageSeo. Partagé par les pages-collections
 *  (article, catégorie, page légale) qui gardent leur dérivation Schema.org. */
export interface SeoOverride {
  title?: string
  description?: string
  image?: string
}

export interface SiteContent {
  brand: {
    name: string
    /** Logo d'entête et de pied (asset Sanity résolu en URL, SVG pour le démo).
     *  `src` absent: aucun pictogramme rendu, le nom texte porte seul la marque.
     *  `alt` reste vide en pratique: le lien porte homeAriaLabel. */
    logo: { src?: string; alt?: string }
    tagline: string
    foundedYear: number
    homeAriaLabel: string
  }
  contact: {
    phone: string
    /** Format machine (liens tel:, Schema.org), DÉRIVÉ de `phone` au transform
     *  (spec 12.13): jamais stocké dans Sanity. */
    phoneE164: string
    email: string
    address: {
      line1: string
      /** Affichage (footer, bloc contact). */
      cityProv: string
      /** Champs structurés (PostalAddress Schema.org via usePageSeo). */
      city: string
      region: string
      country: string
      postal: string
    }
    /** Zone desservie (noms de lieux), nœud LocalBusiness de l'accueil. */
    areaServed: string[]
    hours: {
      weekdays: string
      weekend: string
    }
  }
  nav: {
    landing: {
      primary: Array<{ label: string; anchor: string }>
    }
    multipage: {
      primary: Array<{ label: string; route: string }>
    }
  }
  footer: {
    /** Liens principaux du pied de page: liste dédiée (siteSettings.footer.primary),
     *  indépendante de la nav multipage depuis l'amendement 6.1 de la spec. */
    primary: Array<{ label: string; href: string }>
    // Liens utilitaires propres au multipage (FAQ): rôle SEO et maillage, rangés
    // au pied avec les légales plutôt que dans la nav principale.
    utility: Array<{ href: string; label: string }>
    pageLinks: Array<{ href: string; label: string }>
    /** Garde son jeton {year} (remplacé par Footer.vue, année courante au build). */
    copyright: string
    credit: {
      label: string
      studio: string
      studioUrl: string
      product: string
    }
  }
  /** Réseaux sociaux (top-level, hors footer): l'éditeur choisit une plateforme
   *  dans une liste fermée et saisit l'URL; l'icône (`icon`) et le libellé
   *  accessible (`label`) sont dérivés en code (app/config/socials.ts). Une
   *  plateforme sans URL est exclue au transform. */
  socials: Array<{ platform: SocialPlatform; url: string; icon: string; label: string }>
  /** SEO globaux (spec 12.10): suffixe du gabarit de titre + replis quand la
   *  page n'a pas sa propre description ou image de partage. */
  seo: {
    titleSuffix: string
    defaultDescription?: string
    /** URL CDN de l'image de partage par défaut (repli avant /og/og-default.jpg). */
    defaultOgImage?: string
  }
}
