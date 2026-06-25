/* Contrat de contenu du bloc « points forts » (ce que vous obtenez). Fichier
 * TYPE-ONLY: la transformation Sanity (app/sanity/transform.ts) produit cette
 * forme, aucune fonction de repli ici. Distinct du processus (qui est une
 * progression posée sur une ligne d'horizon): les points forts sont une série de
 * bénéfices, au traitement visuel propre. AUCUNE valeur design ni de contenu ici,
 * que des champs. */

export interface HighlightItem {
  title: string
  body: string
}

export interface HighlightsContent {
  eyebrow?: string
  heading?: string
  items: HighlightItem[]
}
