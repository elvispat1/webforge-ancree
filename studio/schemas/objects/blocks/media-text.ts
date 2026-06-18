import { defineType, defineField, defineArrayMember } from 'sanity'
import { SplitHorizontalIcon } from '@sanity/icons'

export const mediaText = defineType({
  name: 'mediaText',
  title: 'Bloc: texte et image',
  type: 'object',
  icon: SplitHorizontalIcon,
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
      name: 'mediaSide',
      title: 'Côté du média',
      type: 'string',
      options: {
        list: [
          { title: 'À gauche', value: 'left' },
          { title: 'À droite', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'right',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'figure',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'cta',
      title: 'Bouton (optionnel)',
      type: 'link',
    }),
  ],
  preview: {
    select: { heading: 'heading', eyebrow: 'eyebrow', media: 'image.image' },
    prepare: ({ heading, eyebrow, media }) => ({
      title: heading || '(sans titre)',
      subtitle: eyebrow ? 'Bloc: texte et image, ' + eyebrow : 'Bloc: texte et image',
      media,
    }),
  },
})
