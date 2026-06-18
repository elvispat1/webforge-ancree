import { defineType, defineField, defineArrayMember } from 'sanity'
import { CommentIcon } from '@sanity/icons'

// Bloc intelligent: la résolution des témoignages vit en GROQ côté app (Temps 2).
// Le paramètre pad (compléter avec des vedettes jusqu'à la limite) reste un
// paramètre d'assemblage code des pages de détail, non stocké.
export const testimonials = defineType({
  name: 'testimonials',
  title: 'Bloc: témoignages',
  type: 'object',
  icon: CommentIcon,
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
      name: 'mode',
      title: 'Mode de sélection',
      type: 'string',
      options: {
        list: [
          { title: 'Vedettes', value: 'featured' },
          { title: 'Par service', value: 'service' },
          { title: 'Par projet', value: 'project' },
          { title: 'Sélection manuelle', value: 'manual' },
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
      name: 'project',
      title: 'Projet',
      type: 'reference',
      to: [{ type: 'project' }],
      hidden: ({ parent }) => parent?.mode !== 'project',
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
          if (parent?.mode === 'project' && !value) return 'Projet requis en mode Par projet'
          return true
        }),
    }),
    defineField({
      name: 'items',
      title: 'Témoignages choisis',
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
            return 'Au moins un témoignage requis en mode manuel'
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
      title: heading || '(sans titre)',
      subtitle: 'Bloc: témoignages (' + mode + ')',
    }),
  },
})
