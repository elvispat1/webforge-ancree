import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const articleImage = defineType({
  name: 'articleImage',
  title: 'Image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'figure',
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { label: 'image.label', caption: 'image.caption', media: 'image.image' },
    prepare({ label, caption, media }) {
      return {
        title: label || caption || '(image sans etiquette)',
        subtitle: 'Image',
        media,
      }
    },
  },
})
