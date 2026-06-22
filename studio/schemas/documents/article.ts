import { defineType, defineField, defineArrayMember } from 'sanity'
import { DocumentTextIcon } from '@sanity/icons'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'meta', title: 'Métadonnées' },
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
      name: 'title',
      title: 'Titre',
      type: 'string',
      group: 'content',
      // Le front n'impose pas de limite dure: avertissement, pas erreur.
      validation: (R) => [
        R.required(),
        R.max(120).warning('Plus de 120 caractères: titre long pour les cartes et la balise title'),
      ],
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      description: 'Accessible à /blog/<slug> ou /blog/<catégorie>/<slug>.',
      type: 'slug',
      group: 'content',
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
      name: 'excerpt',
      title: 'Accroche',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (R) => [
        R.required(),
        R.max(280).warning('Plus de 280 caractères: accroche trop longue pour les cartes'),
      ],
    }),
    defineField({
      name: 'cover',
      title: 'Couverture',
      type: 'figure',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      description: 'Détermine le segment d\'URL parent. Sans catégorie: /blog/<slug>.',
      type: 'reference',
      group: 'content',
      to: [{ type: 'category' }],
      // Une catégorie de la MÊME langue que l'article (i18n document-level).
      options: {
        filter: ({ document }) => ({
          filter: 'language == $language',
          params: { language: (document as { language?: string })?.language ?? 'fr' },
        }),
        documentInternationalization: { exclude: true },
      },
    }),
    defineField({
      name: 'body',
      title: 'Corps de l\'article',
      type: 'array',
      group: 'content',
      options: {
        insertMenu: {
          views: [
            { name: 'grid', previewImageUrl: (typeName) => `/static/block-previews/${typeName}.svg` },
            { name: 'list' },
          ],
          filter: true,
        },
      },
      of: [
        defineArrayMember({ type: 'articleLead' }),
        defineArrayMember({ type: 'articleRichText' }),
        defineArrayMember({ type: 'articleImage' }),
        defineArrayMember({ type: 'articleQuote' }),
        defineArrayMember({ type: 'articleGallery' }),
        defineArrayMember({ type: 'articleCallout' }),
        defineArrayMember({ type: 'articleInlineCta' }),
      ],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'date',
      title: 'Date de publication',
      type: 'date',
      group: 'meta',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'author',
      title: 'Auteur',
      type: 'string',
      group: 'meta',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'readingTime',
      title: 'Durée de lecture (min)',
      description: 'Affichée au héros d\'article.',
      type: 'number',
      group: 'meta',
      validation: (R) => R.required().integer().positive(),
    }),
  ],
  orderings: [
    {
      title: 'Date de publication (plus récent)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      categoryTitle: 'category.title',
      language: 'language',
      media: 'cover.image',
    },
    prepare: ({ title, date, categoryTitle, language, media }) => {
      const formattedDate = date
        ? new Date(date).toLocaleDateString('fr-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'Brouillon'
      return {
        title: title || '(sans titre)',
        subtitle:
          formattedDate +
          (categoryTitle ? ', ' + categoryTitle : '') +
          (language ? ' (' + language.toUpperCase() + ')' : ''),
        media,
      }
    },
  },
})
