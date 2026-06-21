/* Contrat de contenu du bloc « processus » (comment on intervient). Miroir de ce
 * que la transformation Sanity produira; AUCUNE valeur design ici, que des champs.
 * Les etapes sont reliees visuellement par une ligne d'horizon (signature « s'ancre
 * au sol »), JAMAIS numerotees (regle dure site-wide): l'ordre se lit, il ne se
 * chiffre pas. Voix Ancree: directe, rassurante, on s'adresse au client. */

export interface ProcessStep {
  icon: string // nom Iconify line-art (lucide)
  title: string
  body: string
}

export interface ProcessContent {
  eyebrow: string
  heading: string
  lead?: string
  steps: ProcessStep[]
}

/* Fixture bilingue de la demo Rempart Extermination (fictif). Trois temps clairs,
 * du premier regard a la garantie. */
export function processFixture(isEn: boolean): ProcessContent {
  if (isEn) {
    return {
      eyebrow: 'How we work',
      heading: 'A clear method, from the first call to the guarantee',
      lead: 'No mystery, no pressure. We look first, we treat what needs treating, and we stay on it until the problem is gone for good.',
      steps: [
        {
          icon: 'lucide:search',
          title: 'We inspect',
          body: 'We identify the pest, how far it has spread and where it gets in. You know exactly what you are dealing with before we touch anything.'
        },
        {
          icon: 'lucide:shield-check',
          title: 'We treat',
          body: 'A targeted treatment, safe for your family and pets, applied by a certified technician. Nothing more than what the situation calls for.'
        },
        {
          icon: 'lucide:badge-check',
          title: 'We guarantee',
          body: 'We come back if needed and the result is guaranteed in writing. The problem stays solved, not just pushed down the road.'
        }
      ]
    }
  }

  return {
    eyebrow: 'Comment on intervient',
    heading: 'Une méthode claire, du premier appel à la garantie',
    lead: 'Pas de mystère ni de pression. On regarde d’abord, on traite ce qu’il faut, et on reste là tant que le problème n’est pas réglé pour de bon.',
    steps: [
      {
        icon: 'lucide:search',
        title: 'On inspecte',
        body: 'On identifie le nuisible, l’ampleur et les points d’entrée. Vous savez exactement à quoi vous faites face avant qu’on touche à quoi que ce soit.'
      },
      {
        icon: 'lucide:shield-check',
        title: 'On traite',
        body: 'Un traitement ciblé, sûr pour la famille et les animaux, appliqué par un technicien certifié. Rien de plus que ce que la situation demande.'
      },
      {
        icon: 'lucide:badge-check',
        title: 'On garantit',
        body: 'On revient au besoin et le résultat est garanti par écrit. Le problème reste réglé, pas seulement repoussé.'
      }
    ]
  }
}
