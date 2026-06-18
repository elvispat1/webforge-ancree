import { defineType, defineField } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons'

// PAS de champ order (exception assumée, spec §1.13): l'ordre d'affichage
// appartient aux consommateurs (faqPage.sections pour la page FAQ, l'ordre
// des refs items pour les blocs faq). Le desk trie question asc (spec §7).
export const faqItem = defineType({
  name: 'faqItem',
  title: 'Question FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Réponse',
      type: 'text',
      rows: 4,
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'theme',
      title: 'Thème',
      description: 'Regroupe les questions sur la page FAQ.',
      type: 'reference',
      to: [{ type: 'faqTheme' }],
      options: {
        filter: ({ document }) => ({
          filter: 'language == $language',
          params: { language: (document as { language?: string })?.language ?? 'fr' },
        }),
        documentInternationalization: { exclude: true },
      },
    }),
  ],
  preview: {
    select: { question: 'question', theme: 'theme.title', language: 'language' },
    prepare: ({ question, theme, language }) => ({
      title: question || '(sans question)',
      subtitle: (theme || 'Sans thème') + (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
