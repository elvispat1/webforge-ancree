import { defineType, defineField, defineArrayMember } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons'

// Selection manuelle PURE: pas de champ mode ni limit (la page FAQ porte sa
// propre liste ordonnee). La resolution des refs vit en GROQ cote app. Peau
// d'Ancree (icone, libelles).
export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Sur-titre',
      type: 'string',
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
      title: heading || 'FAQ',
      subtitle: 'FAQ, ' + (items?.length ?? 0) + ' questions',
    }),
  },
})
