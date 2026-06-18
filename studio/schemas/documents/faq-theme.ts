import { defineType, defineField } from 'sanity'
import { BookmarkIcon } from '@sanity/icons'

// Banque des thèmes FAQ: regroupe les questions sur la page FAQ, rangée sous
// le dossier FAQ du desk (spec §7). Localisée comme tous les documents.
export const faqTheme = defineType({
  name: 'faqTheme',
  title: 'Thème FAQ',
  type: 'document',
  icon: BookmarkIcon,
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
      title: 'Slug (ancre)',
      description: 'Sert d\'ancre sur la page FAQ.',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        documentInternationalization: { exclude: true },
      },
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', language: 'language' },
    prepare: ({ title, slug, language }) => ({
      title: title || '(sans titre)',
      subtitle: '#' + (slug || '?') + (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
