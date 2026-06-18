import { routePath, type Locale } from '../config/route-map'

export interface CtaBandContent {
  title: string
  // Sous-titre optionnel: une ligne de relance sous le titre, rendue en lead muted.
  subtitle?: string
  // CTA principal: toujours présent, rendu en bouton primary. href = route interne (/...).
  primaryCta: { label: string; href: string }
  // CTA secondaire optionnel: rendu en bouton ghost à côté du principal (style hero).
  secondaryCta?: { label: string; href: string }
}

/** Fonction de traduction minimale (clé -> chaîne), compatible avec useI18n().t. */
type Tr = (key: string) => string

/** Échantillon de démonstration du bloc cta-band pour la vitrine /showcase
 * (jamais consommé en production). Texte via i18n (showcase.samples.cta_band.*),
 * hrefs via routePath localisé (F2: la vitrine reste un exemple propre de la
 * discipline i18n, /contact et /projets en FR, /en/contact et /en/projects en EN). */
export function ctaBandSample(t: Tr, locale: Locale): CtaBandContent {
  return {
    title: t('showcase.samples.cta_band.title'),
    subtitle: t('showcase.samples.cta_band.subtitle'),
    primaryCta: { label: t('showcase.samples.cta_band.primary_cta_label'), href: routePath('contact', locale) },
    secondaryCta: { label: t('showcase.samples.cta_band.secondary_cta_label'), href: routePath('projects', locale) }
  }
}
