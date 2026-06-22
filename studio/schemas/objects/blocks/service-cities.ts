import { defineType, defineField, defineArrayMember } from 'sanity'
import { PinIcon } from '@sanity/icons'

// Bloc intelligent: la resolution des villes de service vit en GROQ cote app.
// Mapping verrouille Ancree: refs vers serviceCity (jamais project). Peau
// d'Ancree (icone, libelles, champs de zone).
export const serviceCities = defineType({
  name: 'serviceCities',
  title: 'Services par ville',
  type: 'object',
  icon: PinIcon,
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
      name: 'areaLabel',
      title: 'Libelle de la zone',
      type: 'string',
    }),
    defineField({
      name: 'areaName',
      title: 'Nom de la zone',
      type: 'string',
    }),
    defineField({
      name: 'areaNote',
      title: 'Note de zone',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'mode',
      title: 'Mode de selection',
      type: 'string',
      options: {
        list: [
          { title: 'Villes vedettes', value: 'featured' },
          { title: 'Selection manuelle', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'featured',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'items',
      title: 'Villes choisies',
      type: 'array',
      hidden: ({ parent }) => parent?.mode !== 'manual',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'serviceCity' }],
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
            return 'Au moins une ville requise en mode manuel'
          }
          return true
        }),
    }),
    defineField({
      name: 'limit',
      title: 'Limite',
      type: 'number',
      hidden: ({ parent }) => parent?.mode === 'manual',
      validation: (R) => R.integer().positive(),
    }),
  ],
  preview: {
    select: { heading: 'heading', mode: 'mode', limit: 'limit' },
    prepare: ({ heading, mode, limit }) => ({
      title: heading || 'Services par ville',
      subtitle: 'Villes (' + mode + (limit ? ', ' + limit : '') + ')',
    }),
  },
})
