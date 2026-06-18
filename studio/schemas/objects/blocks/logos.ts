import { defineType, defineField, defineArrayMember } from 'sanity'
import { ThLargeIcon } from '@sanity/icons'

// Le champ image de logo par item (TODO documenté en V1) n'est pas ajouté:
// aucun consommateur front. À ajouter le jour où le composant le rend.
export const logos = defineType({
  name: 'logos',
  title: 'Bloc: mentions',
  type: 'object',
  icon: ThLargeIcon,
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
      title: 'Mentions',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'logoItem',
          title: 'Mention',
          fields: [
            defineField({
              name: 'label',
              title: 'Libellé',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: 'label' },
          },
        }),
      ],
      validation: (R) => R.required().min(1),
    }),
  ],
  preview: {
    select: { heading: 'heading', items: 'items' },
    prepare: ({ heading, items }) => ({
      title: heading || 'Mentions',
      subtitle: 'Bloc: mentions, ' + (items?.length ?? 0) + ' items',
    }),
  },
})
