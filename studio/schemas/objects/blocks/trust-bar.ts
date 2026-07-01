import { defineType, defineField, defineArrayMember } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons'
import { anchorField } from './_anchor-field'

/**
 * Barre de confiance: rangée de signaux de confiance posée sous le héros.
 * Forme propre à Ancrée (pas d'analogue Minimaliste): un tableau de l'objet
 * `proof`, deux à quatre entrées pour tenir la mise en page sur une ligne.
 * Conventions (defineField, validation .warning(), preview) alignées sur les
 * blocs Minimaliste.
 */
export const trustBar = defineType({
  name: 'trustBar',
  title: 'Barre de confiance',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'items',
      title: 'Signaux de confiance',
      description: 'De deux à quatre signaux pour tenir sur une seule rangée.',
      type: 'array',
      of: [defineArrayMember({ type: 'proof' })],
      validation: (R) => [
        R.required().min(2),
        R.max(4).warning('Quatre signaux maximum pour la mise en page de la barre'),
      ],
    }),
    anchorField,
  ],
  preview: {
    select: { first: 'items.0.value', count: 'items.length' },
    prepare: ({ first, count }) => ({
      title: first || 'Barre de confiance',
      subtitle: count ? 'Barre de confiance, ' + count + ' signaux' : 'Barre de confiance',
    }),
  },
})
