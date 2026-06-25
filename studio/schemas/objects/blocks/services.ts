import { defineType, defineField, defineArrayMember } from 'sanity'
import { BugIcon } from '@sanity/icons'
import { anchorField } from './_anchor-field'

// Bloc intelligent: stocke la copie et les parametres de selection, la
// resolution des items vit en GROQ cote app. Peau d'Ancree (icone, libelles).
export const services = defineType({
  name: 'services',
  title: 'Services',
  type: 'object',
  icon: BugIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Sur-titre',
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
      title: 'Accroche',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'cta',
      title: 'Lien de section',
      type: 'link',
    }),
    defineField({
      name: 'mode',
      title: 'Mode de selection',
      type: 'string',
      options: {
        list: [
          { title: 'Toute la banque (ordre de la collection)', value: 'auto' },
          { title: 'Selection manuelle', value: 'manual' },
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
    anchorField,
  ],
  preview: {
    select: { heading: 'heading', mode: 'mode', limit: 'limit' },
    prepare: ({ heading, mode, limit }) => ({
      title: heading || 'Services',
      subtitle:
        'Services (' + (mode === 'manual' ? 'manuel' : limit ? 'auto, ' + limit : 'auto') + ')',
    }),
  },
})
