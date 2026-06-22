import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const articleImage = defineType({
  name: 'articleImage',
  title: 'Article: image',
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
    select: { label: 'image.label', caption: 'image.caption', alt: 'image.alt', media: 'image.image' },
    prepare({ label, caption, alt, media }) {
      return {
        title: label || caption || alt || '(image sans etiquette)',
        subtitle: 'Article: image',
        media,
      }
    },
  },
})
