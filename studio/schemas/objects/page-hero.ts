import { defineType, defineField } from 'sanity'
import { StarIcon } from '@sanity/icons'

/**
 * Héros de page: champ héros dédié des pages fixes de niveau 2. Le fil
 * d'Ariane n'est PAS stocké (dérivé du route-map au rendu). Les héros detail
 * et article dérivent des documents de collection: aucun schéma héros pour eux.
 * Fieldsets et non groups: c'est un objet.
 */
export const pageHero = defineType({
  name: 'pageHero',
  title: 'Héros de page',
  type: 'object',
  icon: StarIcon,
  options: { collapsible: true, collapsed: false },
  fieldsets: [
    { name: 'content', title: 'Contenu textuel', options: { collapsible: false } },
    { name: 'visual', title: 'Visuel', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
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
    }),
    defineField({
      name: 'cta',
      title: 'Bouton (optionnel)',
      type: 'link',
      fieldset: 'content',
    }),
    defineField({
      name: 'image',
      title: 'Image phare',
      description: 'Absente: héros texte seul, colonne large. Ratio recommandé 2:1.',
      type: 'figure',
      fieldset: 'visual',
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({
      title: title || '(héros sans titre)',
      subtitle: 'Héros de page',
    }),
  },
})
