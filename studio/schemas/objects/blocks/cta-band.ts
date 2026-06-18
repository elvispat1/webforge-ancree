import { defineType, defineField } from 'sanity'
import { LaunchIcon } from '@sanity/icons'

export const ctaBand = defineType({
  name: 'ctaBand',
  title: 'Bloc: bandeau CTA',
  type: 'object',
  icon: LaunchIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Sous-titre',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'primaryCta',
      title: 'Bouton principal',
      type: 'link',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Bouton secondaire',
      type: 'link',
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({
      title: title || '(sans titre)',
      subtitle: 'Bloc: bandeau CTA',
    }),
  },
})
