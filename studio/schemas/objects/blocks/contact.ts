import { defineType, defineField } from 'sanity'
import { EnvelopeIcon } from '@sanity/icons'

// Les coordonnées affichées (téléphone, courriel, atelier, heures) ne sont pas
// stockées ici: join sur siteSettings.contact à la résolution (Temps 2). Seuls
// les libellés des coordonnées et la copie du formulaire vivent dans le bloc.
// Les flags required des champs du formulaire restent en code.
export const contact = defineType({
  name: 'contact',
  title: 'Bloc: contact',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Surtitre',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Titre',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'lead',
      title: 'Texte d\'amorce',
      type: 'text',
      rows: 3,
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'metaLabels',
      title: 'Libellés des coordonnées',
      description: 'Les valeurs (numéro, courriel, adresse, heures) viennent des Globales.',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'phone',
          title: 'Libellé téléphone',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'email',
          title: 'Libellé courriel',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'address',
          title: 'Libellé atelier',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'hours',
          title: 'Libellé heures',
          type: 'string',
          validation: (R) => R.required(),
        }),
      ],
    }),
    defineField({
      name: 'form',
      title: 'Formulaire',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'labels',
          title: 'Libellés des champs',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Nom',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'email',
              title: 'Courriel',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'phone',
              title: 'Téléphone',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'message',
              title: 'Message',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
        }),
        defineField({
          name: 'errors',
          title: 'Messages d\'erreur',
          type: 'object',
          fields: [
            defineField({
              name: 'nameRequired',
              title: 'Nom requis',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'emailInvalid',
              title: 'Courriel invalide',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'privacyRequired',
              title: 'Consentement requis',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
        }),
        defineField({
          name: 'submit',
          title: 'Bouton d\'envoi',
          type: 'object',
          fields: [
            defineField({
              name: 'idle',
              title: 'Libellé au repos',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'loading',
              title: 'Libellé pendant l\'envoi',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
        }),
        defineField({
          name: 'errorBanner',
          title: 'Bandeau d\'échec',
          type: 'object',
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
              description: 'Le jeton {email} est remplacé par le courriel des Globales.',
              type: 'text',
              rows: 2,
              validation: (R) => R.required(),
            }),
          ],
        }),
        defineField({
          name: 'privacy',
          title: 'Consentement',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Texte avant le lien',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'link',
              title: 'Lien vers la politique de confidentialité',
              type: 'link',
              validation: (R) => R.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'success',
      title: 'Message de succès',
      type: 'object',
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
          rows: 2,
          validation: (R) => R.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: { heading: 'heading' },
    prepare: ({ heading }) => ({
      title: heading || '(sans titre)',
      subtitle: 'Bloc: contact',
    }),
  },
})
