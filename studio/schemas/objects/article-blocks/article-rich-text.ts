import { defineType, defineField } from 'sanity'
import { BlockContentIcon } from '@sanity/icons'
import { articlePortableText } from './article-portable-text'

export const articleRichText = defineType({
  name: 'articleRichText',
  title: 'Texte riche',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'body',
      title: 'Contenu',
      description: 'Paragraphes, titres de section, listes, gras, italique et liens.',
      type: 'array',
      of: [articlePortableText],
      validation: (R) => R.required().min(1),
    }),
  ],
  preview: {
    select: { body: 'body' },
    prepare({ body }) {
      const text = body?.[0]?.children
        ?.map((c: { text?: string }) => c.text)
        .join('')
      return {
        title: text ? text.slice(0, 60) : '(texte vide)',
        subtitle: 'Texte riche',
      }
    },
  },
})
