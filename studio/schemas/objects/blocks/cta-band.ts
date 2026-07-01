import { defineType, defineField } from 'sanity'
import { MobileDeviceIcon } from '@sanity/icons'
import { anchorField } from './_anchor-field'

/**
 * Bloc bandeau d'appel: titre, sous-titre et deux boutons (objet `link`).
 * Forme propre à Ancrée (icône MobileDeviceIcon de la démo Rempart),
 * conventions alignées sur l'analogue Minimaliste (objects/blocks/cta-band.ts).
 */
export const ctaBand = defineType({
  name: 'ctaBand',
  title: 'Bandeau d\'appel',
  type: 'object',
  icon: MobileDeviceIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Sous-titre',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'primaryCta',
      title: 'Bouton d\'appel',
      type: 'link',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Bouton secondaire',
      type: 'link',
    }),
    anchorField,
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({
      title: title || '(sans titre)',
      subtitle: 'Bandeau d\'appel',
    }),
  },
})
