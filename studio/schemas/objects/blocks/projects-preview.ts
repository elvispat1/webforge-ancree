import { defineType, defineField, defineArrayMember } from 'sanity'
import { ImagesIcon } from '@sanity/icons'

// Bloc intelligent: la résolution des projets vit en GROQ côté app (Temps 2).
// L'exclusion du projet courant (pages de détail) n'est pas stockée: paramètre code.
export const projectsPreview = defineType({
  name: 'projectsPreview',
  title: 'Bloc: aperçu de projets',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Surtitre',
      type: 'string',
    }),
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'lead',
      title: 'Texte d\'amorce',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'cta',
      title: 'Lien de section',
      type: 'link',
    }),
    defineField({
      name: 'mode',
      title: 'Mode de sélection',
      type: 'string',
      options: {
        list: [
          { title: 'Projets vedettes', value: 'featured' },
          { title: 'Par service', value: 'service' },
          { title: 'Sélection manuelle', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'featured',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: [{ type: 'service' }],
      hidden: ({ parent }) => parent?.mode !== 'service',
      options: {
        filter: ({ document }) => ({
          filter: 'language == $language',
          params: { language: (document as { language?: string })?.language ?? 'fr' },
        }),
        documentInternationalization: { exclude: true },
      },
      validation: (R) =>
        R.custom((value, context) => {
          const parent = context.parent as { mode?: string } | undefined
          if (parent?.mode === 'service' && !value) return 'Service requis en mode Par service'
          return true
        }),
    }),
    defineField({
      name: 'items',
      title: 'Projets choisis',
      type: 'array',
      hidden: ({ parent }) => parent?.mode !== 'manual',
      of: [
        defineArrayMember({
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
      ],
      validation: (R) =>
        R.unique().custom((value, context) => {
          const parent = context.parent as { mode?: string } | undefined
          if (parent?.mode === 'manual' && (!value || value.length === 0)) {
            return 'Au moins un projet requis en mode manuel'
          }
          return true
        }),
    }),
    defineField({
      name: 'limit',
      title: 'Limite',
      type: 'number',
      initialValue: 3,
      validation: (R) => R.integer().positive(),
    }),
  ],
  preview: {
    select: { heading: 'heading', mode: 'mode', limit: 'limit' },
    prepare: ({ heading, mode, limit }) => ({
      title: heading || '(sans titre)',
      subtitle: 'Bloc: aperçu de projets (' + mode + (limit ? ', ' + limit : '') + ')',
    }),
  },
})
