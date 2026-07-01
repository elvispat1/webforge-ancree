import { defineType, defineField } from 'sanity'
import { BlockquoteIcon } from '@sanity/icons'

export const articleQuote = defineType({
  name: 'articleQuote',
  title: 'Citation',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Citation',
      type: 'text',
      rows: 3,
      // Le front n'impose pas de limite dure: avertissement, pas erreur.
      validation: (R) => [
        R.required(),
        R.max(500).warning('Au-dela de 500 caracteres: citation tres longue pour la mise en page'),
      ],
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
    }),
  ],
  preview: {
    select: { quote: 'quote', attribution: 'attribution' },
    prepare({ quote, attribution }) {
      return {
        title: quote ? quote.slice(0, 80) : '(citation vide)',
        subtitle: attribution ? 'Citation de ' + attribution : 'Citation',
      }
    },
  },
})
