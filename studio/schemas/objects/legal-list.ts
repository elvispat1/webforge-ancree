import { defineType, defineField, defineArrayMember } from 'sanity'
import { UlistIcon } from '@sanity/icons'

export const legalList = defineType({
  name: 'legalList',
  title: 'Liste à puces',
  type: 'object',
  icon: UlistIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Éléments',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (R) => R.required().min(1),
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare: ({ items }) => ({
      title: items?.[0] || '(liste vide)',
      subtitle: 'Liste, ' + (items?.length ?? 0) + ' éléments',
    }),
  },
})
