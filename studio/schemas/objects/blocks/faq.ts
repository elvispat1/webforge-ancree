import { defineType, defineField, defineArrayMember } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons'

// Sélection manuelle PURE: pas de champ mode ni limit (la page FAQ a sa propre
// liste ordonnée, spec §6.7). La résolution des refs vit en GROQ côté app
// (Temps 2). Le flag faqSchema (émission du JSON-LD FAQPage) reste un flag
// d'assemblage côté code, pas un champ.
export const faq = defineType({
  name: 'faq',
  title: 'Bloc: FAQ',
  type: 'object',
  icon: HelpCircleIcon,
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
      name: 'items',
      title: 'Questions choisies',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'faqItem' }],
          options: {
            filter: ({ document }) => ({
              filter: 'language == $language',
              params: { language: (document as { language?: string })?.language ?? 'fr' },
            }),
            documentInternationalization: { exclude: true },
          },
        }),
      ],
      validation: (R) => R.required().min(1).unique(),
    }),
  ],
  preview: {
    select: { heading: 'heading', items: 'items' },
    prepare: ({ heading, items }) => ({
      title: heading || '(sans titre)',
      subtitle: 'Bloc: FAQ, ' + (items?.length ?? 0) + ' questions',
    }),
  },
})
