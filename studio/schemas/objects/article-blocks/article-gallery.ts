import { defineType, defineField, defineArrayMember } from 'sanity'
import { ImagesIcon } from '@sanity/icons'

export const articleGallery = defineType({
  name: 'articleGallery',
  title: 'Article: galerie',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      description: 'Pour une seule image, utiliser le bloc Article: image.',
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
        subtitle: 'Article: galerie',
        media,
      }
    },
  },
})
