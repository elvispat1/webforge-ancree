import { defineType, defineField, defineArrayMember } from 'sanity'
import { PinIcon } from '@sanity/icons'

export const serviceCity = defineType({
  name: 'serviceCity',
  title: 'Service par ville',
  type: 'document',
  icon: PinIcon,
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'page', title: 'Page de détail' },
    { name: 'seo', title: 'Référencement' },
    { name: 'relations', title: 'Relations et tri' },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      group: 'content',
    }),
    defineField({
      name: 'city',
      title: 'Ville',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      description: 'Accessible à /villes/<slug>.',
      type: 'slug',
      group: 'content',
      options: {
        source: 'city',
        maxLength: 96,
        documentInternationalization: { exclude: true },
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'region',
      title: 'Région',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'note',
      title: 'Note (carte)',
      description: 'Courte mention affichée sur la carte de la ville.',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'heading',
      title: 'Titre de la page',
      type: 'string',
      group: 'page',
    }),
    defineField({
      name: 'lead',
      title: 'Accroche de la page',
      type: 'text',
      rows: 3,
      group: 'page',
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'array',
      group: 'page',
      of: [defineArrayMember({ type: 'text' })],
    }),
    defineField({
      name: 'seo',
      title: 'Référencement',
      type: 'seo',
      group: 'seo',
    }),
    defineField({
      name: 'featured',
      title: 'Mise en vedette',
      description: 'Sélectionnée par les blocs aperçu de villes en mode vedettes.',
      type: 'boolean',
      group: 'relations',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Ordre',
      description: 'Position dans la grille des villes (1 = premier).',
      type: 'number',
      group: 'relations',
      validation: (R) => R.required().integer().positive(),
    }),
  ],
  orderings: [
    { title: 'Ordre de la collection', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Ville (A vers Z)', name: 'cityAsc', by: [{ field: 'city', direction: 'asc' }] },
  ],
  preview: {
    select: {
      title: 'city',
      region: 'region',
      language: 'language',
    },
    prepare: ({ title, region, language }) => ({
      title: title || '(sans ville)',
      subtitle:
        (region ? region : 'Ville') +
        (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
