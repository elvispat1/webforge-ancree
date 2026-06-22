import { defineType, defineField, defineArrayMember } from 'sanity'
import { StarIcon } from '@sanity/icons'

// Bloc intelligent: la resolution des temoignages vit en GROQ cote app.
// Mapping verrouille Ancree: le mode « par ville » reference serviceCity (jamais
// project). Peau d'Ancree (icone, libelles).
export const testimonials = defineType({
  name: 'testimonials',
  title: 'Temoignages',
  type: 'object',
  icon: StarIcon,
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
      name: 'mode',
      title: 'Mode de selection',
      type: 'string',
      options: {
        list: [
          { title: 'Vedettes', value: 'featured' },
          { title: 'Par service', value: 'service' },
          { title: 'Par ville', value: 'city' },
          { title: 'Selection manuelle', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'featured',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{ type: 'service' }],
      hidden: ({ parent }) => parent?.mode !== 'service',
      options: {
        filter: ({ document }) => ({
          filter: 'language == $language',
          params: { language: (document as { language?: string })?.language ?? 'fr' },
        }),
        documentInternationalization: { exclude: true },
      },
      validation: (R) =>
        R.custom((value, context) => {
          const parent = context.parent as { mode?: string } | undefined
          if (parent?.mode === 'service' && !value) return 'Service requis en mode Par service'
          return true
        }),
    }),
    defineField({
      name: 'city',
      title: 'Ville',
      type: 'reference',
      to: [{ type: 'serviceCity' }],
      hidden: ({ parent }) => parent?.mode !== 'city',
      options: {
        filter: ({ document }) => ({
          filter: 'language == $language',
          params: { language: (document as { language?: string })?.language ?? 'fr' },
        }),
        documentInternationalization: { exclude: true },
      },
      validation: (R) =>
        R.custom((value, context) => {
          const parent = context.parent as { mode?: string } | undefined
          if (parent?.mode === 'city' && !value) return 'Ville requise en mode Par ville'
          return true
        }),
    }),
    defineField({
      name: 'items',
      title: 'Temoignages choisis',
      type: 'array',
      hidden: ({ parent }) => parent?.mode !== 'manual',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'testimonial' }],
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
            return 'Au moins un temoignage requis en mode manuel'
          }
          return true
        }),
    }),
    defineField({
      name: 'limit',
      title: 'Limite',
      type: 'number',
      validation: (R) => R.integer().positive(),
    }),
  ],
  preview: {
    select: { heading: 'heading', mode: 'mode' },
    prepare: ({ heading, mode }) => ({
      title: heading || 'Temoignages',
      subtitle: 'Temoignages (' + mode + ')',
    }),
  },
})
