import { defineType, defineField, defineArrayMember } from 'sanity'
import { TrendUpwardIcon } from '@sanity/icons'
import { anchorField } from './_anchor-field'

/**
 * Bloc Processus: le déroulement d'un mandat, en étapes posées. Promu en bloc de
 * page-builder de plein droit (auparavant un sous-objet figé de service.detail).
 * Le numéro d'étape est dérivé de la position au rendu (zéro numérotation saisie
 * à la main). Forme distincte du bloc Points forts pour éviter deux grilles de
 * tuiles jumelles.
 */
export const process = defineType({
  name: 'process',
  title: 'Processus',
  type: 'object',
  icon: TrendUpwardIcon,
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
      title: 'Texte d\'amorce',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'steps',
      title: 'Étapes',
      description: 'Le numéro d\'étape est dérivé de la position au rendu.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processStep',
          title: 'Étape',
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
      title: heading || 'Processus',
      subtitle: 'Processus',
    }),
  },
})
