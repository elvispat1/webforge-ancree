import { defineType, defineField, defineArrayMember } from 'sanity'
import { WrenchIcon } from '@sanity/icons'
import { maxItemsInput } from '../../components/maxItemsInput'

/**
 * Page Services (singleton de niveau 2, un document par langue).
 *
 * Patron porté de Minimaliste: champ `hero` verrouillé à un seul bloc `pageHero`
 * (mini-builder à un élément), suivi du `pageBuilder` libre, puis du bloc `seo`.
 *
 * i18n document-level via le plugin document-internationalization: le champ
 * `language` est piloté par le plugin (caché, en lecture seule), jamais saisi à
 * la main. Le slug est partagé entre les versions de langue.
 */
export const servicesPage = defineType({
  name: 'servicesPage',
  title: 'Page Services',
  type: 'document',
  icon: WrenchIcon,
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
      // Verrouillé à un seul bloc héros (mini-builder): on choisit ou échange le
      // héros, jamais plus d'un. Les variantes futures s'ajoutent à `of`.
      validation: (R) => R.required().length(1),
      components: { input: maxItemsInput(1) },
    }),
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
      title: 'Page Services' + (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
