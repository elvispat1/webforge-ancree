import { defineType, defineField, defineArrayMember } from 'sanity'
import { ListIcon } from '@sanity/icons'

export const legalSection = defineType({
  name: 'legalSection',
  title: 'Section',
  type: 'object',
  icon: ListIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de section',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      of: [
        defineArrayMember({ type: 'legalParagraph' }),
        defineArrayMember({ type: 'legalList' }),
        defineArrayMember({ type: 'legalTodo' }),
      ],
      validation: (R) => R.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'title', body: 'body' },
    prepare: ({ title, body }) => ({
      title: title || '(section sans titre)',
      subtitle: (body?.length ?? 0) + ' éléments',
    }),
  },
})
