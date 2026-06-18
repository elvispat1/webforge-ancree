export interface IframeContent {
  // URL à intégrer dans le cadre. Valeur de LOGIQUE (devient le src de l'iframe):
  // nettoyée du stega au transform, comme les href.
  url: string
  // Titre accessible de l'iframe. Obligatoire: un iframe DOIT porter un title qui
  // décrit son contenu (carte, formulaire, calendrier…) pour les lecteurs d'écran.
  title: string
  // Ratio CSS du cadre (ex: '16/9'). Défaut 16/9 appliqué au transform; nettoyé du
  // stega (même piège que le ratio des figures, valeur CSS aspect-ratio).
  ratio: string
  // Légende optionnelle sous le cadre (wf-figcap).
  caption?: string
}

/** Fonction de traduction minimale (clé -> chaîne), compatible avec useI18n().t. */
type Tr = (key: string) => string

/** Échantillon de démonstration du bloc iframe pour la vitrine /showcase
 * (jamais consommé en production). Texte via i18n (showcase.samples.iframe.*),
 * scaffolding technique inline. Carte OpenStreetMap (sans clé ni traceur). */
export function iframeSample(t: Tr): IframeContent {
  return {
    url: 'https://www.openstreetmap.org/export/embed.html?bbox=-73.31%2C45.43%2C-73.26%2C45.46&layer=mapnik&marker=45.4458%2C-73.2886',
    title: t('showcase.samples.iframe.title'),
    ratio: '16/9',
    caption: t('showcase.samples.iframe.caption')
  }
}
