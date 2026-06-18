import { defineType, defineField, defineArrayMember } from 'sanity'
import { EnvelopeIcon } from '@sanity/icons'
import { maxItemsInput } from '../../components/maxItemsInput'

export const contactPage = defineType({
  name: 'contactPage',
  title: 'Contact',
  type: 'document',
  icon: EnvelopeIcon,
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
      // Verrouillé à un seul bloc héros (mini-builder): on choisit/échange le héros,
      // jamais plus d'un. Les variantes futures s'ajoutent à `of`.
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
        defineArrayMember({ type: 'about' }),
        defineArrayMember({ type: 'services' }),
        defineArrayMember({ type: 'testimonials' }),
        defineArrayMember({ type: 'faq' }),
        defineArrayMember({ type: 'contact' }),
        defineArrayMember({ type: 'mediaText' }),
        defineArrayMember({ type: 'ctaBand' }),
        defineArrayMember({ type: 'process' }),
        defineArrayMember({ type: 'stats' }),
        defineArrayMember({ type: 'highlights' }),
        defineArrayMember({ type: 'logos' }),
        defineArrayMember({ type: 'projectsPreview' }),
        defineArrayMember({ type: 'blogPreview' }),
        defineArrayMember({ type: 'iframe' }),
        defineArrayMember({ type: 'videoYoutube' }),
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
      title: 'Contact' + (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
