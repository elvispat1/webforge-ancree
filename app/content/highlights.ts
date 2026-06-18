// Bloc « highlights » — CONTRAT.
//
// V2 (Sanity, actuel): le contenu vit dans les pageBuilders. Interface
// consommée par types/blocks.ts, le composant et le transform.

export interface HighlightsContent {
  // Surtitre optionnel (wf-caption). À mériter, souvent omis.
  eyebrow?: string
  heading?: string
  lead?: string
  // 3 à 4 différenciateurs/engagements. icon = nom Iconify lucide (ex: 'lucide:trees').
  items: Array<{ icon?: string; title: string; body: string }>
}
