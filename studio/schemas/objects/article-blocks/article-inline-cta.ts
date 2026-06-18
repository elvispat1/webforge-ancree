import { defineType, defineField } from 'sanity'
import { LaunchIcon } from '@sanity/icons'

export const articleInlineCta = defineType({
  name: 'articleInlineCta',
  title: 'Article: appel à l\'action',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({
      name: 'text',
      title: 'Texte',
      type: 'text',
      rows: 2,
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'cta',
      title: 'Bouton',
      type: 'link',
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { text: 'text', label: 'cta.label' },
    prepare({ text, label }) {
      return {
        title: text ? text.slice(0, 60) : '(texte vide)',
        subtitle: label ? 'CTA: ' + label : 'Article: appel à l\'action',
      }
    },
  },
})
