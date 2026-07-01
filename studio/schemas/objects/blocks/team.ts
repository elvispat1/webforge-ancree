import { defineType, defineField, defineArrayMember } from 'sanity'
import { UsersIcon } from '@sanity/icons'
import { anchorField } from './_anchor-field'

/**
 * Bloc Équipe: techniciens nommés, avec rôle, certifications individuelles, bio
 * courte et portrait. Le cœur de l'autorité individuelle (Experience et Expertise
 * nominatives) de la page À propos. Distinct du bloc « à propos » (récit + chiffres,
 * une seule photo d'équipe) et des témoignages (clients). Forme propre: une grille
 * de cartes portrait, jamais une grille de tuiles jumelle du processus ou des points
 * forts. Le portrait porte son texte alternatif sur l'ASSET (médiathèque), comme
 * toute figure; le ratio est décidé à l'usage. Aucune numérotation.
 */
export const team = defineType({
  name: 'team',
  title: 'Équipe',
  type: 'object',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Surtitre',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'string',
    }),
    defineField({
      name: 'lead',
      title: 'Texte d\'amorce',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'members',
      title: 'Membres de l\'équipe',
      description: 'Personnes de la banque, dans l\'ordre d\'affichage. Même langue que la page.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'person' }],
          options: {
            filter: ({ document }) => ({
              filter: 'language == $language',
              params: { language: (document as { language?: string })?.language ?? 'fr' },
            }),
          },
        }),
      ],
      validation: (R) => R.required().min(1),
    }),
    anchorField,
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: ({ heading }) => ({
      title: heading || 'Équipe',
      subtitle: 'Équipe',
    }),
  },
})
