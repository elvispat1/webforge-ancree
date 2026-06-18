import { defineType, defineField, defineArrayMember } from 'sanity'
import { UserIcon } from '@sanity/icons'

export const about = defineType({
  name: 'about',
  title: 'Bloc: à propos',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Surtitre',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'body',
      title: 'Paragraphes',
      type: 'array',
      of: [defineArrayMember({ type: 'text', rows: 4 })],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'figure',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'figcaption',
      title: 'Légende sous la photo',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'diffs',
      title: 'Différenciateurs',
      description: 'Le numéro 01, 02 est dérivé de la position au rendu.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'aboutDiff',
          title: 'Différenciateur',
          fields: [
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
    select: { heading: 'heading', media: 'photo.image' },
    prepare: ({ heading, media }) => ({
      title: heading || '(sans titre)',
      subtitle: 'Bloc: à propos',
      media,
    }),
  },
})
