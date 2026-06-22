import { defineType, defineField, defineArrayMember } from 'sanity'
import { BookIcon } from '@sanity/icons'
import { maxItemsInput } from '../../components/maxItemsInput'

// Le listing, les filtres et la pagination sont rendus par le code.
// Les trois bandeaux CTA sont des champs dédiés parce qu'ils servent trois
// gabarits de route différents (liste, archive de catégorie, article) qui
// partagent ce document.
export const blogPage = defineType({
  name: 'blogPage',
  title: 'Page Blogue',
  type: 'document',
  icon: BookIcon,
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
      name: 'listCta',
      title: 'Bandeau CTA (liste du blogue)',
      type: 'ctaBand',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'categoryCta',
      title: 'Bandeau CTA (archives de catégorie)',
      type: 'ctaBand',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'articleCta',
      title: "Bandeau CTA (fin d'article)",
      type: 'ctaBand',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'related',
      title: 'Section articles reliés',
      type: 'object',
      group: 'content',
      fields: [
        defineField({
          name: 'heading',
          title: 'Titre',
          type: 'string',
          validation: (R) => R.required(),
        }),
      ],
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
      title: 'Page Blogue' + (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
