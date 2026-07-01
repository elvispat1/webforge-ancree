import { defineType, defineField, defineArrayMember } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons'
import { anchorField } from './_anchor-field'

/**
 * Bloc Points forts: « ce que vous obtenez », une série de bénéfices courts.
 * Auparavant le tableau service.benefits rendu en grille de trois tuiles à
 * pastille ambre, jumelle du processus. Recomposé en bloc distinct, au traitement
 * visuel propre (voir le composant), pour ne plus dédoubler la maille du processus.
 */
export const highlights = defineType({
  name: 'highlights',
  title: 'Points forts',
  type: 'object',
  icon: CheckmarkCircleIcon,
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
    }),
    defineField({
      name: 'items',
      title: 'Points forts',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'highlight',
          title: 'Point fort',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'body',
              title: 'Texte',
              type: 'text',
              rows: 3,
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: 'title' },
          },
        }),
      ],
      validation: (R) => R.required().min(1),
    }),
    anchorField,
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: ({ heading }) => ({
      title: heading || 'Points forts',
      subtitle: 'Points forts',
    }),
  },
})
