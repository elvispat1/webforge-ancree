// Bloc « process » — CONTRAT.
//
// V2 (Sanity, actuel): le contenu vit dans les pageBuilders ET dans le champ
// dédié detail.process de chaque document service (même type réutilisé,
// spec 6.10). Interface consommée par types/blocks.ts, le composant et le
// transform.

export interface ProcessContent {
  eyebrow?: string
  heading?: string
  lead?: string
  /** CTA unique optionnel: rendu en lien à filet par <SectionHead>. */
  cta?: { label: string; href: string }
  // 3 à 5 étapes numérotées. `n` est le compteur affiché (string pour garder le
  // zéro de tête, ex. '01'), synthétisé de l'index au transform, jamais stocké.
  steps: Array<{ n: string; title: string; body: string }>
}
