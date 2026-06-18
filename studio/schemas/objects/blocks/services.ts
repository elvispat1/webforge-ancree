import { defineType, defineField, defineArrayMember } from 'sanity'
import { WrenchIcon } from '@sanity/icons'

// Bloc intelligent: stocke copie + paramètres de sélection, la résolution
// des items vit en GROQ côté app (Temps 2).
export const services = defineType({
  name: 'services',
  title: 'Bloc: services',
  type: 'object',
  icon: WrenchIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Surtitre',
      type: 'string',
      validation: (R) => R.required(),
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
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'cta',
      title: 'Lien de section',
      type: 'link',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'mode',
      title: 'Mode de sélection',
      type: 'string',
      options: {
        list: [
          { title: 'Toute la banque (ordre de la collection)', value: 'auto' },
          { title: 'Sélection manuelle', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'items',
      title: 'Services choisis',
      type: 'array',
      hidden: ({ parent }) => parent?.mode !== 'manual',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'service' }],
          options: {
            filter: ({ document }) => ({
              filter: 'language == $language',
              params: { language: (document as { language?: string })?.language ?? 'fr' },
            }),
            documentInternationalization: { exclude: true },
          },
        }),
      ],
      validation: (R) =>
        R.unique().custom((value, context) => {
          const parent = context.parent as { mode?: string } | undefined
          if (parent?.mode === 'manual' && (!value || value.length === 0)) {
            return 'Au moins un service requis en mode manuel'
          }
          return true
        }),
    }),
    defineField({
      name: 'limit',
      title: 'Limite',
      description: 'Vide: tous les services.',
      type: 'number',
      hidden: ({ parent }) => parent?.mode === 'manual',
      validation: (R) => R.integer().positive(),
    }),
  ],
  preview: {
    select: { heading: 'heading', mode: 'mode', limit: 'limit' },
    prepare: ({ heading, mode, limit }) => ({
      title: heading || '(sans titre)',
      subtitle:
        'Bloc: services (' + (mode === 'manual' ? 'manuel' : limit ? 'auto, ' + limit : 'auto') + ')',
    }),
  },
})
