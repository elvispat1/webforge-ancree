import { defineType, defineField } from 'sanity'
import { CommentIcon } from '@sanity/icons'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Témoignage',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'quote',
      title: 'Citation',
      type: 'text',
      rows: 4,
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'name',
      title: 'Nom',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'context',
      title: 'Contexte',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'service',
      title: 'Service associé',
      type: 'reference',
      to: [{ type: 'service' }],
      options: {
        filter: ({ document }) => ({
          filter: 'language == $language',
          params: { language: (document as { language?: string })?.language ?? 'fr' },
        }),
        documentInternationalization: { exclude: true },
      },
    }),
    // Les références service et projet peuvent coexister.
    defineField({
      name: 'project',
      title: 'Projet associé',
      type: 'reference',
      to: [{ type: 'project' }],
      options: {
        filter: ({ document }) => ({
          filter: 'language == $language',
          params: { language: (document as { language?: string })?.language ?? 'fr' },
        }),
        documentInternationalization: { exclude: true },
      },
    }),
    defineField({
      name: 'featured',
      title: 'Témoignage vedette',
      description: 'Sélectionné par les blocs témoignages en mode vedettes.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Ordre',
      type: 'number',
      validation: (R) => R.required().integer().positive(),
    }),
  ],
  orderings: [
    { title: 'Ordre de la collection', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { name: 'name', context: 'context', featured: 'featured', language: 'language' },
    prepare: ({ name, context, featured, language }) => ({
      title: name || '(sans nom)',
      subtitle:
        (featured ? 'Vedette, ' : '') +
        (context || '') +
        (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
