import { defineType, defineField, defineArrayMember } from 'sanity'
import { BugIcon } from '@sanity/icons'

/**
 * Service: une prestation de la collection, rendue en carte sur la page Services
 * et en page de détail à /services/<slug>.
 *
 * i18n document-level (plugin document-internationalization): un document par
 * langue, champ `language` géré par le plugin (lecture seule, masqué), slug
 * PARTAGÉ entre les langues via documentInternationalization: { exclude: true }.
 *
 * Champs métier hérités du monolithe (icon, title, summary, featured, order),
 * enrichis vers le patron de collection riche: résumé, repère, image, intro,
 * bénéfices, page de détail composée et services par ville reliés.
 */
export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: BugIcon,
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'detail', title: 'Page de détail' },
    { name: 'relations', title: 'Relations et tri' },
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
      name: 'icon',
      title: 'Icône (Iconify lucide)',
      description: 'Nom Iconify, ex. lucide:bug. Affichée sur la carte du service.',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      description: 'Accessible à /services/<slug>. Partagé entre les langues.',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
        documentInternationalization: { exclude: true },
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Résumé',
      description: 'Texte court affiché sur la carte de la grille des services.',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (R) => [
        R.required(),
        R.max(280).warning('Plus de 280 caractères: la carte de la grille devient trop dense'),
      ],
    }),
    defineField({
      name: 'meta',
      title: 'Repère',
      description: 'Mention courte affichée sur la carte et le héros de détail, ex. Traitement et suivi.',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'Ratio 4:3 dans la grille et le détail.',
      type: 'figure',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Paragraphes d\'introduction',
      description: 'Rendus dans le bloc texte et image de la page de détail.',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'text', rows: 4 })],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'benefits',
      title: 'Bénéfices',
      description: 'Rendus en points forts sur la page de détail.',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceBenefit',
          title: 'Bénéfice',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'body',
              title: 'Texte',
              type: 'text',
              rows: 3,
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: 'title' },
          },
        }),
      ],
      validation: (R) => R.required().min(1),
    }),
    // La copie de la page de détail vit sur CHAQUE service: composée section par
    // section. Requise (fail-fast): en prod statique, chaque service porte sa copie.
    defineField({
      name: 'detail',
      title: 'Page de détail',
      description:
        'Copie de la page /services/<slug> de ce service, composée section par section.',
      type: 'object',
      group: 'detail',
      validation: (R) => R.required(),
      fields: [
        defineField({
          name: 'benefits',
          title: 'Section bénéfices',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Titre',
              type: 'string',
              initialValue: 'Ce que vous obtenez',
            }),
            defineField({
              name: 'cta',
              title: 'Bouton',
              type: 'link',
            }),
          ],
        }),
        defineField({
          name: 'included',
          title: 'Section inclusions',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Titre',
              type: 'string',
              initialValue: 'Inclus dans chaque mandat',
            }),
          ],
        }),
        // Processus modélisé en place: Ancrée n'a pas de type process partagé.
        // Le numéro d'étape est dérivé de la position au rendu (zéro numérotation
        // saisie à la main).
        defineField({
          name: 'process',
          title: 'Section processus',
          description:
            'Déroulement affiché sur la page de détail de ce service.',
          type: 'object',
          fields: [
            defineField({
              name: 'eyebrow',
              title: 'Surtitre',
              type: 'string',
            }),
            defineField({
              name: 'heading',
              title: 'Titre',
              type: 'string',
            }),
            defineField({
              name: 'lead',
              title: 'Texte d\'amorce',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'cta',
              title: 'Bouton (optionnel)',
              type: 'link',
            }),
            defineField({
              name: 'steps',
              title: 'Étapes',
              description: 'Le numéro d\'étape est dérivé de la position au rendu.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'processStep',
                  title: 'Étape',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Titre',
                      type: 'string',
                      validation: (R) => R.required(),
                    }),
                    defineField({
                      name: 'body',
                      title: 'Texte',
                      type: 'text',
                      rows: 3,
                      validation: (R) => R.required(),
                    }),
                  ],
                  preview: {
                    select: { title: 'title' },
                  },
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: 'serviceCities',
          title: 'Section villes reliées',
          description: 'Les items viennent des services par ville reliés.',
          type: 'object',
          fields: [
            defineField({
              name: 'eyebrow',
              title: 'Surtitre',
              type: 'string',
            }),
            defineField({
              name: 'heading',
              title: 'Titre',
              type: 'string',
              initialValue: 'Ce service, près de chez vous',
            }),
            defineField({
              name: 'lead',
              title: 'Texte d\'amorce',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'cta',
              title: 'Bouton (optionnel)',
              type: 'link',
            }),
          ],
        }),
        defineField({
          name: 'testimonials',
          title: 'Section témoignages',
          type: 'object',
          fields: [
            defineField({
              name: 'eyebrow',
              title: 'Surtitre',
              type: 'string',
            }),
            defineField({
              name: 'heading',
              title: 'Titre',
              type: 'string',
              initialValue: 'Ce qu\'en disent nos clients',
            }),
          ],
        }),
        // Réutilise le bloc ctaBand tel quel pour le bandeau de fin de page.
        defineField({
          name: 'cta',
          title: 'Bandeau d\'appel de fin',
          type: 'ctaBand',
        }),
      ],
    }),
    defineField({
      name: 'related',
      title: 'Villes reliées',
      description: 'Services par ville mis en avant sur la page de détail.',
      type: 'array',
      group: 'relations',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'serviceCity' }],
          options: {
            filter: ({ document }) => ({
              filter: 'language == $language',
              params: { language: (document as { language?: string })?.language ?? 'fr' },
            }),
            documentInternationalization: { exclude: true },
          },
        }),
      ],
      validation: (R) => R.unique(),
    }),
    defineField({
      name: 'featured',
      title: 'Mis en vedette',
      description: 'Met le service en avant sur la page d\'accueil et la grille.',
      type: 'boolean',
      group: 'relations',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Ordre',
      description:
        'Position dans la collection (1 = premier). Détermine l\'ordre d\'affichage de la grille.',
      type: 'number',
      group: 'relations',
      validation: (R) => R.required().integer().positive(),
    }),
  ],
  orderings: [
    { title: 'Ordre de la collection', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', language: 'language', media: 'image.image' },
    prepare: ({ title, slug, language, media }) => ({
      title: title || '(sans titre)',
      subtitle: '/services/' + (slug || '?') + (language ? ' (' + language.toUpperCase() + ')' : ''),
      media,
    }),
  },
})
