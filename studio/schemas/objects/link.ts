import { defineType, defineField } from 'sanity'
import { LinkIcon } from '@sanity/icons'

/**
 * Lien réutilisable: tous les CTA et liens de navigation passent par cet objet.
 *
 * Calqué sur la référence nuxt-sanity-test, SANS le type `file` (aucun
 * téléchargement dans le démo, pas de champ orphelin). Le comportement
 * « nouvel onglet » est dérivé du type au front (internal/anchor = même
 * onglet, external = nouvel onglet): pas de champ openInNewTab.
 *
 * Pour `anchor`, `internalRef` est OPTIONNEL: vide = ancre sur la page courante.
 */
export const link = defineType({
  name: 'link',
  title: 'Lien',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'label',
      title: 'Libellé',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type de lien',
      type: 'string',
      options: {
        list: [
          { title: 'Page interne (référence)', value: 'internal' },
          { title: 'URL externe', value: 'external' },
          { title: 'Ancre (#section)', value: 'anchor' },
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'internalRef',
      title: 'Page interne',
      description: 'Pour le type Ancre, laisser vide signifie page courante.',
      type: 'reference',
      to: [
        { type: 'homePage' },
        { type: 'servicesPage' },
        { type: 'projectsPage' },
        { type: 'aboutPage' },
        { type: 'blogPage' },
        { type: 'faqPage' },
        { type: 'contactPage' },
        { type: 'onePager' },
        { type: 'service' },
        { type: 'project' },
        { type: 'article' },
        { type: 'category' },
        { type: 'legalPage' },
      ],
      hidden: ({ parent }) => parent?.type !== 'internal' && parent?.type !== 'anchor',
      options: {
        filter: ({ document }) => ({
          filter: 'language == $language',
          params: { language: (document as { language?: string })?.language ?? 'fr' },
        }),
        documentInternationalization: { exclude: true },
      },
      validation: (R) =>
        R.custom((value, ctx) => {
          const parent = ctx.parent as { type?: string } | undefined
          if (parent?.type === 'internal' && !value) return 'Référence requise'
          // Pour 'anchor', internalRef est optionnel (vide = page courante).
          return true
        }),
    }),
    defineField({
      name: 'externalUrl',
      title: 'URL externe',
      type: 'url',
      hidden: ({ parent }) => parent?.type !== 'external',
      validation: (R) =>
        R.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }).custom((value, ctx) => {
          const parent = ctx.parent as { type?: string } | undefined
          if (parent?.type === 'external' && !value) return 'URL requise'
          return true
        }),
    }),
    defineField({
      name: 'anchor',
      title: 'Ancre',
      description: 'Sans le #, ex: contact',
      type: 'string',
      hidden: ({ parent }) => parent?.type !== 'anchor',
      validation: (R) =>
        R.custom((value, ctx) => {
          const parent = ctx.parent as { type?: string } | undefined
          if (parent?.type !== 'anchor') return true
          if (!value) return 'Ancre requise'
          if (!/^[a-z0-9][a-z0-9-]*$/.test(value)) {
            return 'Ancre invalide: minuscules, chiffres et traits d\'union, sans # ni espace'
          }
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'type',
      external: 'externalUrl',
      anchor: 'anchor',
    },
    prepare: ({ title, subtitle, external, anchor }) => ({
      title: title || '(sans libellé)',
      subtitle:
        subtitle === 'external'
          ? 'Vers ' + (external || '')
          : subtitle === 'anchor'
            ? 'Vers #' + (anchor || '')
            : 'Vers page interne',
    }),
  },
})
