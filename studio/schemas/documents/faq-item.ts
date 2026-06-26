import { defineType, defineField } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons'
import { faqAnswerPortableText } from '../objects/blocks/faq-answer-portable-text'

// Pas de champ order: l'ordre d'affichage appartient aux consommateurs
// (faqPage.sections pour la page FAQ, l'ordre des refs items pour les blocs faq).
// Le desk trie par question croissante.
export const faqItem = defineType({
  name: 'faqItem',
  title: 'Question (FAQ)',
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
      description: 'Texte riche restreint: paragraphes, liste à puces, gras, liens internes (maillage vers services et villes).',
      type: 'array',
      of: [faqAnswerPortableText],
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
