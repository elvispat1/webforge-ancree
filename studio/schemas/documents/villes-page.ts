import { defineType, defineField, defineArrayMember } from 'sanity'
import { PinIcon } from '@sanity/icons'
import { maxItemsInput } from '../../components/maxItemsInput'

export const villesPage = defineType({
  name: 'villesPage',
  title: 'Page Villes',
  type: 'document',
  icon: PinIcon,
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      group: 'content',
    }),
    defineField({
      name: 'hero',
      title: 'Héros de page',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'pageHero' })],
      // Verrouillé à un seul bloc héros (mini-builder): on choisit ou on échange le
      // héros, jamais plus d'un. Les variantes futures s'ajoutent à `of`.
      validation: (R) => R.required().length(1),
      components: { input: maxItemsInput(1) },
    }),
    // La grille des villes (serviceCity) est rendue par la page, hors builder.
    defineField({
      name: 'pageBuilder',
      title: 'Sections de la page',
      type: 'array',
      group: 'content',
      options: {
        insertMenu: {
          views: [
            { name: 'grid', previewImageUrl: (typeName) => `/static/block-previews/${typeName}.svg` },
            { name: 'list' },
          ],
          filter: true,
        },
      },
      of: [
        defineArrayMember({ type: 'trustBar' }),
        defineArrayMember({ type: 'services' }),
        defineArrayMember({ type: 'serviceCities' }),
        defineArrayMember({ type: 'about' }),
        defineArrayMember({ type: 'testimonials' }),
        defineArrayMember({ type: 'faq' }),
        defineArrayMember({ type: 'ctaBand' }),
        defineArrayMember({ type: 'contact' }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO de la page',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    select: { language: 'language' },
    prepare: ({ language }) => ({
      title: 'Page Villes' + (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
