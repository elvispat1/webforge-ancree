// Bloc « stats » — CONTRAT.
//
// V2 (Sanity, actuel): le contenu vit dans les pageBuilders. Interface
// consommée par types/blocks.ts, le composant et le transform.

export interface StatsContent {
  // Surtitre optionnel (wf-caption). Omis par défaut: la bande de chiffres
  // se passe d'eyebrow, le titre porte le contexte.
  eyebrow?: string
  // Titre de bloc optionnel. Omis = bande de chiffres seule, pleine largeur.
  heading?: string
  // 2 à 4 chiffres clés. value = nombre formaté (string libre: « 140+ », « 200 km »).
  items: Array<{ value: string; label: string }>
}
