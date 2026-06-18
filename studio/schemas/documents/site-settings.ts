import { defineType, defineField, defineArrayMember } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Globales',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'brand', title: 'Marque', default: true },
    { name: 'contact', title: 'Coordonnées' },
    { name: 'nav', title: 'Navigation' },
    { name: 'footer', title: 'Pied de page' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      group: 'brand',
    }),

    defineField({
      name: 'brand',
      title: 'Marque',
      type: 'object',
      group: 'brand',
      fields: [
        defineField({
          name: 'name',
          title: 'Nom',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'logo',
          title: 'Logo',
          description: 'Logo affiché dans l\'entête et le pied de page.',
          type: 'image',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'homeAriaLabel',
          title: 'Libellé d\'accessibilité du lien logo',
          description: 'Lu par les lecteurs d\'écran sur le lien de retour à l\'accueil.',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'tagline',
          title: 'Devise',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'foundedYear',
          title: 'Année de fondation',
          type: 'number',
          validation: (R) => R.required().integer(),
        }),
      ],
    }),

    defineField({
      name: 'contact',
      title: 'Coordonnées',
      type: 'object',
      group: 'contact',
      fields: [
        // Le format E.164 n'est PAS stocké: dérivé en code depuis phone (spec §12.13).
        defineField({
          name: 'phone',
          title: 'Téléphone affiché, ex. 450 555 0188',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'email',
          title: 'Courriel',
          type: 'string',
          validation: (R) => R.required().email(),
        }),
        defineField({
          name: 'address',
          title: 'Adresse',
          type: 'object',
          fields: [
            defineField({
              name: 'line1',
              title: 'Adresse (ligne 1)',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'cityProv',
              title: 'Ville et province affichées',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'city',
              title: 'Ville',
              description: 'Champs structurés pour le Schema.org PostalAddress.',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'region',
              title: 'Province',
              description: 'Champs structurés pour le Schema.org PostalAddress.',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'country',
              title: 'Pays',
              description: 'Champs structurés pour le Schema.org PostalAddress.',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'postal',
              title: 'Code postal',
              description: 'Champs structurés pour le Schema.org PostalAddress.',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
        }),
        defineField({
          name: 'areaServed',
          title: 'Zone desservie',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          validation: (R) => R.required().min(1),
        }),
        defineField({
          name: 'hours',
          title: 'Horaires',
          type: 'object',
          fields: [
            defineField({
              name: 'weekdays',
              title: 'Semaine',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'weekend',
              title: 'Fin de semaine',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'nav',
      title: 'Navigation',
      type: 'object',
      group: 'nav',
      fields: [
        defineField({
          name: 'landing',
          title: 'Nav du one-pager',
          type: 'object',
          fields: [
            defineField({
              name: 'primary',
              title: 'Liens principaux',
              description: 'Liens de type Ancre, scrollspy du one-pager.',
              type: 'array',
              of: [defineArrayMember({ type: 'link' })],
              validation: (R) => R.required().min(1),
            }),
            defineField({
              name: 'cta',
              title: 'Bouton d\'appel',
              type: 'link',
              validation: (R) => R.required(),
            }),
          ],
        }),
        defineField({
          name: 'multipage',
          title: 'Nav du multipage',
          type: 'object',
          fields: [
            defineField({
              name: 'primary',
              title: 'Liens principaux',
              type: 'array',
              of: [defineArrayMember({ type: 'link' })],
              validation: (R) => R.required().min(1),
            }),
            defineField({
              name: 'cta',
              title: 'Bouton d\'appel',
              type: 'link',
              validation: (R) => R.required(),
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'footer',
      title: 'Pied de page',
      type: 'object',
      group: 'footer',
      fields: [
        // Le Footer ne lit PLUS nav.multipage.primary: liens propres au pied de page.
        defineField({
          name: 'primary',
          title: 'Liens primaires',
          description: 'Liens principaux du pied de page.',
          type: 'array',
          of: [defineArrayMember({ type: 'link' })],
          validation: (R) => R.required().min(1),
        }),
        defineField({
          name: 'socials',
          title: 'Réseaux sociaux',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'socialLink',
              title: 'Lien social',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Libellé',
                  type: 'string',
                  validation: (R) => R.required(),
                }),
                defineField({
                  name: 'href',
                  title: 'URL',
                  type: 'url',
                  validation: (R) => R.required(),
                }),
                defineField({
                  name: 'icon',
                  title: 'Icône',
                  description: 'Nom Iconify, ex. ri:instagram-fill.',
                  type: 'string',
                  validation: (R) => R.required(),
                }),
              ],
              preview: {
                select: { title: 'label', subtitle: 'href' },
                prepare: ({ title, subtitle }) => ({
                  title: title || '(sans libellé)',
                  subtitle: subtitle || '(sans URL)',
                }),
              },
            }),
          ],
          validation: (R) => R.required().min(1).unique(),
        }),
        // Optionnels: vides ou absents, normalisés en [] à la résolution (spec §12.12).
        defineField({
          name: 'utility',
          title: 'Liens utilitaires, ex. FAQ',
          type: 'array',
          of: [defineArrayMember({ type: 'link' })],
        }),
        defineField({
          name: 'pageLinks',
          title: 'Liens légaux',
          type: 'array',
          of: [defineArrayMember({ type: 'link' })],
        }),
        defineField({
          name: 'copyright',
          title: 'Mention de copyright',
          description: 'Le jeton {year} est remplacé par l\'année courante au build.',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'credit',
          title: 'Crédit studio',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Libellé',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'studio',
              title: 'Studio',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'product',
              title: 'Produit',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'studioUrl',
              title: 'URL du studio',
              type: 'url',
              validation: (R) => R.required(),
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({
          name: 'titleSuffix',
          title: 'Suffixe des titres',
          description:
            'Ajouté à la fin du titre de chaque page, sauf l\'accueil et le one-pager qui portent leur titre complet.',
          type: 'string',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'defaultDescription',
          title: 'Description par défaut',
          description: 'Repli quand la page n\'a pas de description.',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'defaultOgImage',
          title: 'Image de partage par défaut',
          description: 'Repli og:image global. Dimensions recommandées: 1200 x 630 px.',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
    }),
  ],
  preview: {
    select: { name: 'brand.name', language: 'language' },
    prepare: ({ name, language }) => ({
      title: 'Globales' + (language ? ' (' + language.toUpperCase() + ')' : ''),
      subtitle: name || 'Configuration du site',
    }),
  },
})
