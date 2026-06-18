import { defineType, defineField } from 'sanity'
import { BlockContentIcon } from '@sanity/icons'

export const legalParagraph = defineType({
  name: 'legalParagraph',
  title: 'Paragraphe',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Texte',
      type: 'text',
      rows: 4,
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { text: 'text' },
    prepare: ({ text }) => ({
      title: text ? text.slice(0, 80) : '(paragraphe vide)',
      subtitle: 'Paragraphe',
    }),
  },
})
