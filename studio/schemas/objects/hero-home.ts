import { defineType, defineField, defineArrayMember } from 'sanity'
import { SparklesIcon } from '@sanity/icons'

/**
 * Héros d'accueil: champ héros dédié de homePage ET onePager, HORS pageBuilder.
 * Fieldsets et non groups: c'est un objet.
 */
export const heroHome = defineType({
  name: 'heroHome',
  title: 'Héros d\'accueil',
  type: 'object',
  icon: SparklesIcon,
  options: { collapsible: true, collapsed: true },
  fieldsets: [
    { name: 'content', title: 'Contenu textuel', options: { collapsible: false } },
    { name: 'actions', title: 'Boutons d\'action', options: { collapsible: true, collapsed: true } },
    { name: 'metrics', title: 'Repères chiffrés', options: { collapsible: true, collapsed: true } },
    { name: 'visual', title: 'Visuels', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: 'kicker',
      title: 'Surtitre',
      type: 'string',
      fieldset: 'content',
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      fieldset: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'lead',
      title: 'Texte d\'amorce',
      type: 'text',
      rows: 3,
      fieldset: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'primaryCta',
      title: 'Bouton principal',
      type: 'link',
      fieldset: 'actions',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Bouton secondaire',
      type: 'link',
      fieldset: 'actions',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'meta',
      title: 'Repères',
      type: 'array',
      fieldset: 'metrics',
      of: [
        defineArrayMember({
          name: 'heroMetaItem',
          title: 'Repère',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Libellé',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'value',
              title: 'Valeur',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        }),
      ],
      validation: (R) => [
        R.required().min(1),
        R.max(3).warning('Trois repères maximum pour la mise en page du héros'),
      ],
    }),
    defineField({
      name: 'visual',
      title: 'Visuel (bureau, portrait)',
      description: 'Cadrage portrait 4:5 affiché en écran large.',
      type: 'figure',
      fieldset: 'visual',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'visualMobile',
      title: 'Visuel (mobile, paysage)',
      description:
        'Cadrage paysage 4:3 affiché en mobile (art direction D23). Peut pointer la même image avec un autre ratio.',
      type: 'figure',
      fieldset: 'visual',
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { title: 'title', kicker: 'kicker' },
    prepare: ({ title, kicker }) => ({
      title: title || '(héros sans titre)',
      subtitle: kicker ? 'Héros d\'accueil, ' + kicker : 'Héros d\'accueil',
    }),
  },
})
