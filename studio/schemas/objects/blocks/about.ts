import { defineType, defineField, defineArrayMember } from 'sanity'
import { UsersIcon } from '@sanity/icons'

/**
 * Bloc À propos: surtitre, titre, paragraphes, photo d'équipe et chiffres de
 * confiance. Forme propre à Ancrée (champ `stats` de l'objet `stat`, et non les
 * `diffs`/`figcaption` de Minimaliste), conventions alignées sur l'analogue
 * Minimaliste (objects/blocks/about.ts).
 */
export const about = defineType({
  name: 'about',
  title: 'Bloc: à propos',
  type: 'object',
  icon: UsersIcon,
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
      name: 'body',
      title: 'Paragraphes',
      type: 'array',
      of: [defineArrayMember({ type: 'text', rows: 4 })],
    }),
    defineField({
      name: 'photo',
      title: 'Photo d\'équipe',
      type: 'figure',
    }),
    defineField({
      name: 'stats',
      title: 'Chiffres de confiance',
      type: 'array',
      of: [defineArrayMember({ type: 'stat' })],
      validation: (R) => R.max(4).warning('Quatre chiffres maximum pour la mise en page'),
    }),
  ],
  preview: {
    select: { heading: 'heading', media: 'photo.image' },
    prepare: ({ heading, media }) => ({
      title: heading || '(sans titre)',
      subtitle: 'Bloc: à propos',
      media,
    }),
  },
})
