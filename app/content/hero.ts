/* Contrat de contenu du heros, miroir exact de ce que la transformation Sanity
 * produira et que les composants consomment. AUCUNE valeur design ici, que des
 * champs. Repris tel quel du systeme (technique partagee); la disposition Ancree
 * change, pas le contrat. */
import type { Crumb } from '~/config/route-map'

export interface HeroVisual {
  ratio: string // chaine aspect-ratio CSS, ex "4/5"
  src?: string // URL CDN deja resolue (jamais un objet asset Sanity); absente -> placeholder
  alt?: string
  label: string // libelle du placeholder quand src est absente
  caption: string // legende du placeholder
}

/* Visuel du heros full bleed: minimal (src + alt seulement). Cadrage en CODE
 * (object-fit cover), aucun ratio/label/caption. L'alt vient de l'asset. */
export interface HeroHomeVisual {
  src?: string // URL CDN deja resolue; absente -> placeholder
  alt?: string // lu sur l'asset (asset->altText)
}

export interface HeroProof {
  value: string // la preuve elle-meme, ex "Licencie RBQ"
  label: string // le qualificatif, ex "et entierement assure"
  icon?: string // icone line-art (Iconify), ex "lucide:shield-check"
}

export interface HeroContent {
  kicker?: string // marqueur d'ancrage local (zone de service)
  title: string
  lead: string
  primaryCta: { label: string; href: string } // le bouton d'appel
  secondaryCta: { label: string; href: string }
  meta: HeroProof[] // les preuves de confiance integrees (3)
  visual: HeroHomeVisual // image desktop (recadree plein ecran 16:9 en code)
  visualMobile?: HeroHomeVisual // image mobile optionnelle; absente -> desktop partout
}

/* Masthead des pages internes (hero-page): un bandeau de reperage, sobre et
 * tourne vers le texte, distinct du heros full bleed d'accueil. Fil d'Ariane
 * localise (du route-map), titre slab a l'axe gauche, accroche et appel optionnels
 * sur une mesure etroite a droite. Pas d'image: les pages simples (services, faq,
 * contact, a-propos) portent leur visuel dans le corps, pas dans le masthead. */
/* Visuel du masthead: src CDN deja resolu + alt (sur l'asset). Absent -> masthead
 * texte seul (mesure large, pas de colonne image). */
export interface HeroPageVisual {
  src: string
  alt?: string
}

export interface HeroPageContent {
  crumbs?: Crumb[] // fil d'Ariane localise (du route-map); absent -> non rendu
  eyebrow?: string // marqueur d'ancrage (casse normale, tick ambre)
  title: string
  lead?: string
  cta?: { label: string; href: string } // appel unique, optionnel
  image?: HeroPageVisual // image du masthead (split asymetrique); absente -> texte seul
}

/* Masthead d'un article (hero-article): meme grammaire posee que hero-page (fond
 * clair, titre slab a l'axe gauche, ligne d'horizon ambre), enrichie d'une puce
 * de categorie (lien vers l'archive), d'une meta de lecture (date, auteur, duree)
 * et d'une image de couverture posee au sol. Compose par la page, pas saisi au CMS. */
export interface HeroArticleContent {
  crumbs?: Crumb[] // fil d'Ariane localise (du route-map)
  category?: { label: string; href: string } // puce vers l'archive de categorie
  title: string
  excerpt?: string // accroche, sous le titre
  date: string // date ISO de publication
  dateLabel: string // date deja formatee dans la locale (transformation pure)
  author?: string
  readingTime?: number // duree de lecture estimee
  cover?: HeroVisual // image de couverture (posee sous le masthead)
}
