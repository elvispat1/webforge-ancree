import { defineType, defineField, defineArrayMember, type Path } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons'
import { maxItemsInput } from '../../components/maxItemsInput'

/**
 * Résout la valeur portée par `document` à un chemin Sanity (segments string,
 * index numérique ou `{ _key }` pour les membres d'array).
 */
const valueAtPath = (root: unknown, path: Path): unknown =>
  path.reduce<unknown>((value, segment) => {
    if (value == null) return undefined
    if (typeof segment === 'string') return (value as Record<string, unknown>)[segment]
    if (typeof segment === 'number') return (value as unknown[])[segment]
    if (Array.isArray(value)) {
      return value.find((item) => (item as { _key?: string } | null)?._key === segment._key)
    }
    return undefined
  }, root)

// La page est composée de sections par thème: chaque section pointe un
// faqTheme et choisit ses questions (mode automatique ou sélection manuelle).
// Le rendu reste groupé par thème, dans l'ordre des sections (spec §12.15).
export const faqPage = defineType({
  name: 'faqPage',
  title: 'Page FAQ',
  type: 'document',
  icon: HelpCircleIcon,
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
      name: 'sections',
      title: 'Questions par thème',
      description: 'La page FAQ se compose ici, une section par thème.',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqSection',
          title: 'Section',
          fields: [
            defineField({
              name: 'theme',
              title: 'Thème',
              type: 'reference',
              to: [{ type: 'faqTheme' }],
              options: {
                filter: ({ document }) => ({
                  filter: 'language == $language',
                  params: { language: (document as { language?: string })?.language ?? 'fr' },
                }),
                documentInternationalization: { exclude: true },
              },
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'mode',
              title: 'Mode de sélection',
              type: 'string',
              options: {
                list: [
                  {
                    title: 'Automatique: toutes les questions du thème, ordre alphabétique',
                    value: 'auto',
                  },
                  { title: 'Sélection manuelle', value: 'manual' },
                ],
                layout: 'radio',
              },
              initialValue: 'manual',
              validation: (R) => R.required(),
            }),
            // La garde sur le thème est obligatoire: mode naît à 'manual',
            // sans elle la liste serait visible dès la création de la section
            // et la recherche de référence s'exécuterait avec $themeId
            // undefined (param GROQ référencé mais non fourni, requête en
            // erreur). Le required() sur theme guide le bon ordre de saisie.
            defineField({
              name: 'items',
              title: 'Questions choisies',
              type: 'array',
              hidden: ({ parent }) =>
                (parent as { mode?: string; theme?: { _ref?: string } } | undefined)?.mode !==
                  'manual' ||
                !(parent as { theme?: { _ref?: string } } | undefined)?.theme?._ref,
              of: [
                defineArrayMember({
                  type: 'reference',
                  to: [{ type: 'faqItem' }],
                  options: {
                    // Pour une reference membre d'array, `parent` EST l'array
                    // items: la section porteuse se résout dans `document` au
                    // parentPath amputé de son dernier segment.
                    filter: ({ document, parentPath }) => {
                      const section = valueAtPath(document, parentPath.slice(0, -1)) as
                        | { theme?: { _ref?: string } }
                        | undefined
                      return {
                        filter: 'language == $language && theme._ref == $themeId',
                        params: {
                          language: (document as { language?: string })?.language ?? 'fr',
                          themeId: section?.theme?._ref ?? '',
                        },
                      }
                    },
                    documentInternationalization: { exclude: true },
                  },
                }),
              ],
              validation: (R) =>
                R.unique().custom((items, ctx) => {
                  const parent = ctx.parent as { mode?: string } | undefined
                  if (parent?.mode === 'manual' && (!items || items.length === 0)) {
                    return 'Au moins une question est requise en mode manuel'
                  }
                  return true
                }),
            }),
          ],
          preview: {
            select: { theme: 'theme.title', mode: 'mode', items: 'items' },
            prepare: ({ theme, mode, items }) => {
              const n = items?.length ?? 0
              return {
                title: theme || '(sans thème)',
                subtitle: mode === 'auto' ? 'Automatique' : n + (n === 1 ? ' question' : ' questions'),
              }
            },
          },
        }),
      ],
      // R.unique() n'a pas de sens sur des objets inline: le custom compare
      // les theme._ref (deux sections ne peuvent pas pointer le même thème).
      validation: (R) =>
        R.required()
          .min(1)
          .custom((sections) => {
            const refs = ((sections as { theme?: { _ref?: string } }[] | undefined) ?? [])
              .map((section) => section.theme?._ref)
              .filter((ref): ref is string => Boolean(ref))
            return refs.length === new Set(refs).size
              ? true
              : 'Deux sections ne peuvent pas pointer le même thème'
          }),
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
      title: 'Page FAQ' + (language ? ' (' + language.toUpperCase() + ')' : ''),
    }),
  },
})
