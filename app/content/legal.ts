// Pages légales (conditions d'utilisation, politique de confidentialité) — CONTRATS.
//
// V2 (Sanity, actuel): le contenu vit dans les documents `legalPage` (payload
// via useContent('legal')). Ce fichier garde les interfaces (contrat de
// <LegalPage> et du transform) et la doctrine du gabarit ci-dessous, qui
// gouverne le contenu seedé et tout futur site client.
//
// LE CONTENU LÉGAL EST UN GABARIT RÉUTILISABLE D'UN SITE À L'AUTRE.
//   - Le texte en clair (paragraphe, liste) est l'OSSATURE: constant pour tous
//     les sites WebForge (stack technique, formulations Loi 25). Patoine Studio
//     l'atteste, il se copie tel quel.
//   - Les blocs { todo } sont les ZONES À REMPLIR PAR LE CLIENT. Le composant
//     les rend isolés et encadrés, séparés de l'ossature. Ils marquent ce que
//     Patoine Studio ne peut pas écrire à la place du client (fins de collecte,
//     conservation, accès interne, responsable, clauses commerciales). À
//     remplir, puis à faire valider par un conseiller juridique avant
//     publication. Patoine Studio n'est pas responsable du contenu juridique.
//   - L'identité (nom, courriel, adresse, domaine) vient de siteSettings; au
//     moment de copier ce gabarit vers un nouveau client, on ajuste les
//     globales et les quelques mentions du nom dans le corps.
//
// Outils tiers: on reste sur des CATÉGORIES (la CAI permet « les noms ou les
// catégories »), pas de fournisseur nommé. Plus stable d'un client à l'autre.
//
// Analytique: une mesure d'audience est installée par défaut sur les sites
// WebForge. Cela implique des témoins non essentiels, donc une bannière de
// consentement obligatoire (Loi 25), en blocage dur (aucun témoin de mesure
// tant que le visiteur n'a pas accepté). Si un site n'a aucun analytique,
// retirer les mentions de mesure d'audience, les témoins de mesure et la bannière.
//
// ÉCART ASSUMÉ SUR CE DÉMO (D19, audit du 9 juin 2026): aucun témoin de mesure
// n'est réellement installé (stores/consent.ts garde un stub GA4, branchement
// reporté au premier vrai client), mais la bannière reste affichée parce
// qu'elle est une pièce maîtresse de la vitrine. Pour respecter le principe de
// véracité (« jamais de faux choix », cf. content/consent.ts), les mentions de
// mesure d'audience de la politique sont rédigées AU CONDITIONNEL: elles
// décrivent ce qui se passerait si un tel outil était activé. Au branchement
// réel d'un analytique, les repasser au présent.
//
// À PRÉVOIR (publicité ciblée): par défaut, les sites WebForge ne font aucun
// profilage publicitaire. Le jour où un client fait du remarketing Google Ads
// ou installe le pixel Meta (Facebook/Instagram), ajouter une section
// conditionnelle qui divulgue le profilage et les témoins publicitaires
// (consentement requis, désactivés par défaut, art. 8.1 Loi 25) et qui nomme le
// partage de données avec Google et Meta. Ne pas l'inscrire tant que le client
// ne le fait pas réellement.
//
// CONDITIONS D'UTILISATION: contrairement à la politique de confidentialité,
// elles portent sur le site lui-même (propriété, responsabilité, liens externes,
// droit applicable). Elles sont donc entièrement de l'ossature, sans zone { todo }:
// Patoine Studio les atteste, elles se copient telles quelles, seuls le nom et le
// domaine changent. La décharge sur les liens externes vit ici, jamais dans la
// politique de confidentialité. Les modalités commerciales (devis, acompte,
// remboursement) ne vont PAS ici: elles appartiennent au contrat de service signé
// avec le client, distinct des présentes conditions.
//
// À PRÉVOIR (paiements en ligne ou sur place): par défaut, les sites WebForge
// vitrines ne traitent aucun paiement. Si un client encaisse des paiements (par
// exemple par un terminal tiers ou un module de paiement en ligne), ajouter une
// section conditionnelle « Paiements » avec une zone { todo } pour ses propres
// modalités: autorisation d'utiliser le moyen de paiement, exactitude des
// informations fournies, droit de refuser ou d'annuler une demande, politique de
// remboursement. Ces modalités relèvent du client. Ne pas l'inscrire tant que le
// client ne traite pas réellement de paiements.

/** Un bloc de contenu: paragraphe, liste à puces, ou zone à remplir par le client. */
export type LegalBlock = string | { list: string[] } | { todo: string }

export interface LegalSection {
  title: string
  body: LegalBlock[]
}

export interface LegalDoc {
  /** Titre H1 de la page. */
  title: string
  /** Date d'entrée en vigueur, formatée (ex: « 1er janvier 2026 »). */
  effective: string
  /** Date de la dernière mise à jour (identique à l'entrée en vigueur au lancement). */
  updated: string
  sections: LegalSection[]
}

export interface LegalContent {
  conditions: LegalDoc
  confidentialite: LegalDoc
}
