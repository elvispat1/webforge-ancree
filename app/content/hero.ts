// Héros d'accueil — CONTRATS.
//
// V2 (Sanity, actuel): le contenu vit sur les documents homePage et onePager
// (champ hero, payload via useHeroContent). Ce fichier ne garde que les
// interfaces, consommées par components/hero/block/home.vue et le transform.

export interface HeroVisual {
  ratio: string
  src?: string
  alt?: string
  label: string
  caption: string
}

/** Image d'un héros dérivé d'une collection (détail projet/service, article).
 *  Même forme que HeroVisual mais avec alt requis (les images de collection
 *  portent toujours un texte alternatif significatif). */
export interface HeroFigure {
  ratio: string
  src?: string
  alt: string
  label: string
  caption: string
}

export interface HeroContent {
  kicker?: string
  title: string
  lead: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  meta: Array<{ label: string; value: string }>
  /* Art direction: deux cadrages distincts (deux champs image au Studio,
   * desktop portrait et mobile paysage). La résolution asset -> URL string se
   * fait dans la couche de données (transform), jamais dans le héros. */
  visual: HeroVisual
  visualMobile: HeroVisual
}
