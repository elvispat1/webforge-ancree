import { defineType, defineField } from 'sanity'
import { TextIcon } from '@sanity/icons'

export const articleLead = defineType({
  name: 'articleLead',
  title: 'Article: amorce',
  type: 'object',
  icon: TextIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Texte d\'amorce',
      type: 'text',
      rows: 3,
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { text: 'text' },
    prepare({ text }) {
      return {
        title: text ? text.slice(0, 80) : '(amorce vide)',
        subtitle: 'Article: amorce',
      }
    },
  },
})
