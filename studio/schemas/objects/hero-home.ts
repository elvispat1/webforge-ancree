import { defineType, defineField, defineArrayMember } from 'sanity'
import { HomeIcon } from '@sanity/icons'

/**
 * Héros d'accueil (split full bleed): champ héros dédié de homePage ET onePager,
 * HORS pageBuilder. Forme propre à Ancrée (kicker d'ancrage, preuves intégrées,
 * visuel unique full bleed), conventions de fieldsets alignées sur Minimaliste.
 * Fieldsets et non groups: c'est un objet.
 */
export const heroHome = defineType({
  name: 'heroHome',
  title: 'Héros (split full bleed)',
  type: 'object',
  icon: HomeIcon,
  options: { collapsible: true, collapsed: true },
  fieldsets: [
    { name: 'content', title: 'Contenu textuel', options: { collapsible: false } },
    { name: 'actions', title: 'Boutons d\'action', options: { collapsible: true, collapsed: true } },
    { name: 'metrics', title: 'Preuves intégrées', options: { collapsible: true, collapsed: true } },
    { name: 'visual', title: 'Visuel', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: 'kicker',
      title: 'Pastille d\'ancrage',
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
      title: 'Accroche',
      type: 'text',
      rows: 3,
      fieldset: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'primaryCta',
      title: 'Bouton d\'appel',
      type: 'link',
      fieldset: 'actions',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Bouton secondaire',
      type: 'link',
      fieldset: 'actions',
    }),
    defineField({
      name: 'meta',
      title: 'Preuves intégrées',
      type: 'array',
      fieldset: 'metrics',
      of: [defineArrayMember({ type: 'proof' })],
      validation: (R) => [
        R.required().min(1),
        R.max(3).warning('Trois preuves maximum pour la mise en page du héros'),
      ],
    }),
    defineField({
      name: 'visual',
      title: 'Image',
      description: 'Visuel full bleed du héros (desktop requis, mobile optionnel).',
      type: 'heroImage',
      fieldset: 'visual',
    }),
  ],
  preview: {
    select: { title: 'title', kicker: 'kicker', media: 'visual.desktop' },
    prepare: ({ title, kicker, media }) => ({
      title: title || '(héros sans titre)',
      subtitle: kicker ? 'Héros d\'accueil, ' + kicker : 'Héros d\'accueil',
      media,
    }),
  },
})
