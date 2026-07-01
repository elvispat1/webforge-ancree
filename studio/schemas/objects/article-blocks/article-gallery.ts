import { defineType, defineField, defineArrayMember } from 'sanity'
import { ImagesIcon } from '@sanity/icons'

export const articleGallery = defineType({
  name: 'articleGallery',
  title: 'Galerie',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      description: 'Pour une seule image, utiliser le bloc Image.',
      type: 'array',
      of: [defineArrayMember({ type: 'figure' })],
      validation: (R) => R.required().min(2),
    }),
  ],
  preview: {
    select: { images: 'images', media: 'images.0.image' },
    prepare({ images, media }) {
      return {
        title: 'Galerie, ' + (images?.length ?? 0) + ' images',
        subtitle: 'Galerie',
        media,
      }
    },
  },
})
