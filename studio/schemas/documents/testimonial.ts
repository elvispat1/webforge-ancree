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
      title: 'Nom du client',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'context',
      title: 'Contexte',
      description: 'Mention de lieu affichée sous le nom, par exemple Propriétaire à Laval.',
      type: 'string',
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
    // Les références service et ville peuvent coexister.
    defineField({
      name: 'city',
      title: 'Ville associée',
      type: 'reference',
      to: [{ type: 'serviceCity' }],
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
    select: { name: 'name', quote: 'quote', featured: 'featured', language: 'language' },
    prepare: ({ name, quote, featured, language }) => ({
      title: name || '(sans nom)',
      subtitle:
        (featured ? 'Vedette, ' : '') +
        (quote ? quote.slice(0, 60) : '') +
        (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
