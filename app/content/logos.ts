// Bloc « logos » — CONTRAT.
//
// V2 (Sanity, actuel): le contenu vit dans les pageBuilders. Interface
// consommée par types/blocks.ts, le composant et le transform.

export interface LogosContent {
  // En-tête optionnel (surtitre + titre). Les deux se méritent.
  eyebrow?: string
  heading?: string
  // 3 à 6 entrées. Chaque entrée est un libellé texte (certification,
  // guilde, affiliation), rendu dans une rangée à filets.
  //
  // À FAIRE (prochaine itération): supporter de vrais logos en fichiers image.
  // Ajouter un champ optionnel `logo?: { src: string; alt: string }` à l'item; le
  // composant rend l'image quand `logo` est fourni, sinon retombe sur `label`.
  //   Format des fichiers logo (pour ne PAS casser le layout des cellules):
  //   - PNG à fond transparent (ou SVG monochrome), jamais un fond blanc plein;
  //   - la cellule fait ~100px de haut: viser un logo qui se pose dans une boîte
  //     d'environ 40px de haut max, largeur libre, en object-fit: contain;
  //   - exporter en 2x (densité Retina) pour rester net sur grand écran;
  //   - teinte neutre/sombre pour s'accorder au traitement muted de la bande,
  //     pas de couleur criarde qui jure avec la sobriété du bloc.
  items: Array<{ label: string }>
}
