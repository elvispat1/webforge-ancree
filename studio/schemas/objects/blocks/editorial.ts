import { defineType, defineField, defineArrayMember } from 'sanity'
import { BlockContentIcon } from '@sanity/icons'
import { anchorField } from './_anchor-field'
import { editorialPortableText } from './editorial-portable-text'

/**
 * Bloc Éditorial: du contenu long et riche, en SEGMENTS répétables. Chaque segment
 * porte du texte riche (titres, listes, gras/italique, liens internes inline) et,
 * optionnellement, une ou deux images. Deux images = elles s'emboîtent (superposition
 * de plans, le langage « matière et profondeur » d'Ancrée). Le côté de l'image
 * alterne (zigzag) par défaut, ou se force à gauche/droite par segment. Un segment
 * sans image = pleine mesure de lecture.
 *
 * Réutilisable: disponible dans le page-builder des pages composées ET branché sur
 * la page de détail d'un service (champ service.detail.editorial).
 */
export const editorial = defineType({
  name: 'editorial',
  title: 'Éditorial',
  type: 'object',
  icon: BlockContentIcon,
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
      name: 'lead',
      title: 'Accroche',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'segments',
      title: 'Segments',
      description:
        'Chaque segment: du texte riche et, optionnellement, une ou deux images (deux = elles s\'emboîtent).',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'editorialSegment',
          title: 'Segment',
          fields: [
            defineField({
              name: 'body',
              title: 'Contenu',
              type: 'array',
              of: [editorialPortableText],
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'media',
              title: 'Images',
              description:
                'Aucune: le texte prend la pleine mesure. Deux: elles s\'emboîtent en débord.',
              type: 'array',
              of: [defineArrayMember({ type: 'figure' })],
              validation: (R) => R.max(2).warning('Deux images maximum par segment'),
            }),
            defineField({
              name: 'disposition',
              title: 'Disposition',
              description:
                'Comment le visuel se pose. « Auto » suit le nombre d\'images. Une image: à côté, en débord ou en bandeau pleine mesure. Deux images: emboîtées ou en diptyque décalé. Sans image: texte pleine mesure.',
              type: 'string',
              options: {
                list: [
                  { title: 'Auto (selon le nombre d\'images)', value: 'auto' },
                  { title: 'Texte pleine mesure', value: 'text' },
                  { title: 'Image à côté', value: 'aside' },
                  { title: 'Image en débord', value: 'overhang' },
                  { title: 'Bandeau pleine mesure', value: 'band' },
                  { title: 'Paire emboîtée', value: 'nested' },
                  { title: 'Diptyque décalé', value: 'duo' },
                ],
                layout: 'dropdown',
              },
              initialValue: 'auto',
            }),
            defineField({
              name: 'mediaSide',
              title: 'Côté de l\'image',
              description:
                'Côté du visuel au desktop (ignoré par « texte » et « bandeau », qui prennent la pleine mesure).',
              type: 'string',
              options: {
                list: [
                  { title: 'Alterné (zigzag)', value: 'auto' },
                  { title: 'À gauche', value: 'left' },
                  { title: 'À droite', value: 'right' },
                ],
                layout: 'radio',
              },
              initialValue: 'auto',
            }),
          ],
          preview: {
            select: { body: 'body', media: 'media.0.image' },
            prepare: ({ body, media }) => {
              const first =
                Array.isArray(body) && body[0]?.children?.[0]?.text
                  ? String(body[0].children[0].text)
                  : ''
              return {
                title: first || 'Segment',
                subtitle: media ? 'Segment avec image' : 'Segment de texte',
                media,
              }
            },
          },
        }),
      ],
      validation: (R) => R.required().min(1),
    }),
    anchorField,
  ],
  preview: {
    select: { heading: 'heading', media: 'segments.0.media.0.image' },
    prepare: ({ heading, media }) => ({
      title: heading || 'Éditorial',
      subtitle: 'Éditorial',
      media,
    }),
  },
})
