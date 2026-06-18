import { defineField } from 'sanity'

/**
 * Config Portable Text des articles (pattern simpleBlock de la référence,
 * étendu aux titres et listes). PAS un type enregistré: réutilisé dans les
 * of: [...] des blocs riches, absent de index.ts.
 */
export const articlePortableText = {
  type: 'block' as const,
  styles: [
    { title: 'Paragraphe', value: 'normal' },
    { title: 'Titre de section', value: 'h2' },
    { title: 'Sous-titre', value: 'h3' },
  ],
  lists: [
    { title: 'Liste à puces', value: 'bullet' },
    { title: 'Liste numérotée', value: 'number' },
  ],
  marks: {
    decorators: [
      { title: 'Gras', value: 'strong' },
      { title: 'Italique', value: 'em' },
    ],
    annotations: [
      {
        name: 'link',
        type: 'object' as const,
        title: 'Lien',
        fields: [
          defineField({
            name: 'href',
            title: 'URL',
            type: 'url',
            validation: (R) =>
              R.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
          }),
        ],
      },
    ],
  },
}
