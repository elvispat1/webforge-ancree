import { defineType, defineField } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons'
import { LucideIconInput } from '../../components/lucideIconInput'

/**
 * Preuve de confiance: petit trio { icon, value, label } réutilisé dans les
 * preuves intégrées du héros et dans la barre de confiance. Propre à Ancrée
 * (pas d'analogue Minimaliste).
 */
export const proof = defineType({
  name: 'proof',
  title: 'Preuve de confiance',
  type: 'object',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'icon',
      title: 'Icône (Iconify lucide)',
      type: 'string',
      components: { input: LucideIconInput },
    }),
    defineField({
      name: 'value',
      title: 'Valeur',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'label',
      title: 'Qualificatif',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'value', subtitle: 'label' },
    prepare: ({ title, subtitle }) => ({
      title: title || '(preuve sans valeur)',
      subtitle: subtitle || 'Preuve de confiance',
    }),
  },
})
