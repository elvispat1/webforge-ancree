import { defineType, defineField, defineArrayMember } from 'sanity'
import { OlistIcon } from '@sanity/icons'

// Le const exporté s'appelle process: aucune référence à process.env dans ce
// fichier, le shadowing du global Node est sans effet.
export const process = defineType({
  name: 'process',
  title: 'Bloc: processus',
  type: 'object',
  icon: OlistIcon,
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
      name: 'cta',
      title: 'Bouton (optionnel)',
      type: 'link',
    }),
    defineField({
      name: 'steps',
      title: 'Étapes',
      description: 'Le numéro d\'étape est dérivé de la position au rendu.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processStep',
          title: 'Étape',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'body',
              title: 'Texte',
              type: 'text',
              rows: 3,
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: 'title' },
          },
        }),
      ],
      validation: (R) => R.required().min(1),
    }),
  ],
  preview: {
    select: { heading: 'heading', steps: 'steps' },
    prepare: ({ heading, steps }) => ({
      title: heading || 'Processus',
      subtitle: 'Bloc: processus, ' + (steps?.length ?? 0) + ' étapes',
    }),
  },
})
