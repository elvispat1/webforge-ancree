import { defineType, defineField } from 'sanity'
import { BulbOutlineIcon } from '@sanity/icons'

export const articleCallout = defineType({
  name: 'articleCallout',
  title: 'Article: encadré',
  type: 'object',
  icon: BulbOutlineIcon,
  fields: [
    defineField({
      name: 'tone',
      title: 'Ton',
      type: 'string',
      options: {
        list: [
          { title: 'Note', value: 'note' },
          { title: 'Avertissement', value: 'warning' },
        ],
        layout: 'radio',
      },
      initialValue: 'note',
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Texte',
      type: 'text',
      rows: 3,
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { title: 'title', text: 'text', tone: 'tone' },
    prepare({ title, text, tone }) {
      return {
        title: title || (text ? text.slice(0, 60) : '(encadré vide)'),
        subtitle: tone === 'warning' ? 'Encadré: avertissement' : 'Encadré: note',
      }
    },
  },
})
