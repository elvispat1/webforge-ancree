import { defineType, defineField } from 'sanity'
import { TagIcon } from '@sanity/icons'

export const category = defineType({
  name: 'category',
  title: 'Catégorie',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      description: 'Archive accessible à /blog/<slug>.',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        documentInternationalization: { exclude: true },
      },
      validation: (R) =>
        R.required().custom((slug) =>
          slug?.current === 'page'
            ? 'Le segment « page » est réservé à la pagination du blogue'
            : true,
        ),
    }),
    defineField({
      name: 'description',
      title: 'Description (archive)',
      description: 'Texte d\'amorce de l\'archive de catégorie.',
      type: 'text',
      rows: 3,
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'order',
      title: 'Ordre',
      description: 'Position dans le filtre de catégories du blogue (1 = premier).',
      type: 'number',
      validation: (R) => R.required().integer().positive(),
    }),
  ],
  orderings: [
    { title: 'Ordre de la collection', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', language: 'language' },
    prepare: ({ title, slug, language }) => ({
      title: title || '(sans titre)',
      subtitle: '/blog/' + (slug || '?') + (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
