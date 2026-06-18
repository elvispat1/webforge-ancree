// Config consent par site — quelles catégories de témoins existent sur CE site,
// et version de la politique. Distinct de la COPIE (générique, via i18n): ici
// c'est la structure propre au site, par-site, façon content/site.ts. En V2
// Sanity, useContent() remplacera la source; la shape reste.
//
// Principe CAI: ne lister que les catégories correspondant à une techno
// réellement installée (jamais de faux choix). Base WebForge vitrine =
// Nécessaires (implicite, toujours verrouillé) + Analytique (opt-in, éteint).
//
// Écart assumé sur ce démo (D19, audit du 9 juin 2026): aucun analytique n'est
// branché (stub GA4 dans stores/consent.ts), mais la catégorie reste offerte
// pour démontrer la bannière. En contrepartie, la politique de confidentialité
// parle des témoins de mesure au conditionnel (cf. content/legal.ts).

export interface ConsentCategory {
  /* Identifiant stable. Sert de clé de stockage ET de clé i18n
   * (consent.categories.<id>.label / .description). */
  id: string
  /* État par défaut d'une catégorie opt-in: toujours false côté conformité.
   * Explicité ici pour porter l'intention dans la config. */
  default: boolean
}

export interface ConsentConfig {
  /* Incrémenté dès que la liste de catégories change. Un enregistrement dont la
   * version diffère est traité comme périmé (la bannière se ré-affiche). */
  policyVersion: number
  categories: ConsentCategory[]
}

export const CONSENT_CONFIG: ConsentConfig = {
  policyVersion: 1,
  categories: [
    { id: 'analytics', default: false }
    // La catégorie « Nécessaires » est IMPLICITE: toujours verrouillée, jamais
    // stockée, jamais dans ce tableau. Pour ajouter une catégorie (ex:
    // { id: 'marketing', default: false }): l'ajouter ici, incrémenter
    // policyVersion, et ajouter les clés i18n consent.categories.marketing.*.
    // Le composant l'affiche sans aucune refonte.
  ]
}
