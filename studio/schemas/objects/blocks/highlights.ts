import { defineType, defineField, defineArrayMember } from 'sanity'
import { SparklesIcon } from '@sanity/icons'

export const highlights = defineType({
  name: 'highlights',
  title: 'Bloc: points forts',
  type: 'object',
  icon: SparklesIcon,
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
      name: 'items',
      title: 'Points forts',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'highlightItem',
          title: 'Point fort',
          fields: [
            defineField({
              name: 'icon',
              title: 'Icône',
              description: 'Nom Iconify lucide, ex. lucide:ruler',
              type: 'string',
            }),
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
    select: { heading: 'heading', items: 'items' },
    prepare: ({ heading, items }) => ({
      title: heading || 'Points forts',
      subtitle: 'Bloc: points forts, ' + (items?.length ?? 0) + ' items',
    }),
  },
})
