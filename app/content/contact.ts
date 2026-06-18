// Bloc « contact » — CONTRAT.
//
// V2 (Sanity, actuel): le contenu vit dans les pageBuilders (bloc contact des
// documents contactPage et onePager). Le bloc Sanity ne stocke que les
// libellés: les valeurs des coordonnées (numéro, courriel, adresse, heures)
// viennent de siteSettings.contact, jointes au transform (un seul point
// d'édition). Interface consommée par types/blocks.ts et le transform.

export interface ContactContent {
  eyebrow: string
  heading: string
  lead: string
  meta: Array<{
    label: string
    value?: string
    href?: string
    lines?: string[]
  }>
  form: {
    fields: {
      name: { label: string; required: true }
      email: { label: string; required: true }
      phone: { label: string; required: false }
      message: { label: string; required: false }
    }
    errors: {
      nameRequired: string
      emailInvalid: string
      privacyRequired: string
    }
    submit: { idle: string; loading: string }
    errorBanner: { title: string; body: string }
    privacy: { text: string; linkText: string; href: string }
  }
  success: {
    title: string
    body: string
  }
}
