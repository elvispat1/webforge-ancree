import { defineType, defineField, defineArrayMember } from 'sanity'
import { BarChartIcon } from '@sanity/icons'

export const stats = defineType({
  name: 'stats',
  title: 'Bloc: chiffres clés',
  type: 'object',
  icon: BarChartIcon,
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
      name: 'items',
      title: 'Chiffres',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'statItem',
          title: 'Chiffre',
          fields: [
            defineField({
              name: 'value',
              title: 'Valeur',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'label',
              title: 'Libellé',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        }),
      ],
      validation: (R) => R.required().min(1),
    }),
  ],
  preview: {
    select: { heading: 'heading', items: 'items' },
    prepare: ({ heading, items }) => ({
      title: heading || 'Chiffres clés',
      subtitle: 'Bloc: chiffres clés, ' + (items?.length ?? 0) + ' items',
    }),
  },
})
