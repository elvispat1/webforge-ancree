import { defineType, defineField } from 'sanity'
import { BookIcon } from '@sanity/icons'

// Bloc intelligent: toujours les derniers billets par date décroissante,
// pas de mode. La résolution vit en GROQ côté app (Temps 2).
export const blogPreview = defineType({
  name: 'blogPreview',
  title: 'Bloc: aperçu du blogue',
  type: 'object',
  icon: BookIcon,
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
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'lead',
      title: 'Texte d\'amorce',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'cta',
      title: 'Lien de section',
      type: 'link',
    }),
    defineField({
      name: 'limit',
      title: 'Nombre de billets',
      type: 'number',
      initialValue: 3,
      validation: (R) => R.required().integer().positive(),
    }),
  ],
  preview: {
    select: { heading: 'heading', limit: 'limit' },
    prepare: ({ heading, limit }) => ({
      title: heading || '(sans titre)',
      subtitle: 'Bloc: aperçu du blogue, ' + (limit ?? 3) + ' billets',
    }),
  },
})
