import { defineType, defineField } from 'sanity'
import { PlayIcon } from '@sanity/icons'

export const videoYoutube = defineType({
  name: 'videoYoutube',
  title: 'Bloc: vidéo YouTube',
  type: 'object',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'source',
      title: 'Vidéo YouTube (URL ou identifiant)',
      description:
        'Collez l\'URL de la vidéo (youtube.com/watch, youtu.be, /shorts, /embed) ou directement l\'identifiant.',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'posterMode',
      title: 'Affiche avant lecture',
      description:
        'Vignette YouTube = l\'image fournie par YouTube. Image personnalisée = votre propre visuel, plus soigné.',
      type: 'string',
      options: {
        list: [
          { title: 'Vignette YouTube', value: 'youtube' },
          { title: 'Image personnalisée', value: 'custom' },
        ],
        layout: 'radio',
      },
      initialValue: 'youtube',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'poster',
      title: 'Image personnalisée',
      description:
        'Affiche montrée à la place de la vignette YouTube, avec un bouton de lecture par-dessus.',
      type: 'figure',
      hidden: ({ parent }) => parent?.posterMode !== 'custom',
      validation: (R) =>
        R.custom((value, ctx) => {
          const p = ctx.parent as { posterMode?: string }
          const v = value as { image?: { asset?: unknown } } | undefined
          if (p?.posterMode === 'custom' && !v?.image?.asset) {
            return 'Ajoutez une image personnalisée, ou choisissez la vignette YouTube.'
          }
          return true
        }),
    }),
    defineField({
      name: 'title',
      title: 'Titre / légende',
      description:
        'Optionnel: légende sous la vidéo et étiquette du bouton de lecture (utile si plusieurs vidéos).',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'title', source: 'source', media: 'poster.image' },
    prepare: ({ title, source, media }) => ({
      title: title || 'Vidéo YouTube',
      subtitle: source ? 'YouTube, ' + source : 'Bloc: vidéo YouTube',
      media,
    }),
  },
})
