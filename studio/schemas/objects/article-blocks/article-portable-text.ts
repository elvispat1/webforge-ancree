import { defineField } from 'sanity'

/**
 * Configuration Portable Text des articles (patron simpleBlock de la
 * reference, etendu aux titres et aux listes). Ce n'est PAS un type
 * enregistre: la valeur est reutilisee dans les of: [...] des blocs riches
 * et reste absente du registre index.ts.
 */
export const articlePortableText = {
  type: 'block' as const,
  styles: [
    { title: 'Paragraphe', value: 'normal' },
    { title: 'Titre de section', value: 'h2' },
    { title: 'Sous-titre', value: 'h3' },
  ],
  lists: [
    { title: 'Liste a puces', value: 'bullet' },
    { title: 'Liste numerotee', value: 'number' },
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
            // Pas de scheme 'tel': aucun numero saisi a la main, meme dans le corps
            // d'article. Un appel passe par un bloc CTA en type « Appel (téléphone) ».
            validation: (R) =>
              R.required().uri({ scheme: ['http', 'https', 'mailto'] }),
          }),
        ],
      },
    ],
  },
}
