// Bloc « about » — CONTRAT.
//
// V2 (Sanity, actuel): le contenu vit dans les pageBuilders (bloc about des
// documents aboutPage et onePager). Interface consommée par types/blocks.ts
// et le transform.

export interface AboutContent {
  eyebrow: string
  heading: string
  body: string[]
  photo: {
    ratio: string
    /** URL string (CDN Sanity), résolue dans la couche de données. */
    src?: string
    alt?: string
    label: string
    caption: string
  }
  figcaption: string
  diffs: Array<{ n: string; title: string; body: string }>
}
