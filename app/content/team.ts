/* Contrat de contenu du bloc « équipe » (team). Fichier TYPE-ONLY: la
 * transformation Sanity (app/sanity/transform.ts) produit cette forme, aucune
 * fonction de repli ici. Met un visage et un nom sur l'autorité de l'entreprise:
 * techniciens nommés, leur rôle, leurs certifications individuelles et leur photo.
 * Distinct du bloc « à propos » (récit + chiffres, une seule photo d'équipe) et des
 * témoignages (clients, pas l'équipe). AUCUNE valeur design ni de contenu ici, que
 * des champs. Aucune numérotation: l'équipe se nomme, elle ne se chiffre pas. */

// Portrait d'un membre (URL CDN déjà résolue, jamais un objet asset Sanity).
export interface TeamPhoto {
  src: string
  alt: string
}

export interface TeamMember {
  name: string
  role: string
  /** Certifications individuelles, étiquettes courtes (rendues en chips). */
  credentials?: string[]
  /** Bio courte, une à deux phrases. */
  bio?: string
  photo: TeamPhoto
}

export interface TeamContent {
  eyebrow?: string
  heading?: string
  lead?: string
  members: TeamMember[]
}
