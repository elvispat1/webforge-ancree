import { defineType, defineField, defineArrayMember } from 'sanity'
import { ImagesIcon } from '@sanity/icons'

export const project = defineType({
  name: 'project',
  title: 'Projet',
  type: 'document',
  icon: ImagesIcon,
  groups: [
    { name: 'content', title: 'Contenu', default: true },
    { name: 'caseStudy', title: 'Étude de cas' },
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
      name: 'title',
      title: 'Titre',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      description: 'Accessible à /projets/<slug>.',
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
      name: 'excerpt',
      title: 'Extrait',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (R) => [
        R.required(),
        R.max(280).warning('Plus de 280 caractères: extrait trop long pour les cartes'),
      ],
    }),
    defineField({
      name: 'cover',
      title: 'Couverture',
      type: 'figure',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Galerie',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'figure' })],
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: 'location',
      title: 'Lieu',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'year',
      title: 'Année',
      type: 'string',
      group: 'content',
      validation: (R) => R.required().regex(/^\d{4}$/),
    }),
    defineField({
      name: 'challenge',
      title: 'Défi',
      type: 'text',
      rows: 4,
      group: 'caseStudy',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'solution',
      title: 'Solution',
      type: 'text',
      rows: 4,
      group: 'caseStudy',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'result',
      title: 'Résultat',
      type: 'text',
      rows: 4,
      group: 'caseStudy',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'stats',
      title: 'Chiffres du projet',
      type: 'array',
      group: 'caseStudy',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'projectStat',
          title: 'Chiffre',
          fields: [
            defineField({
              name: 'label',
              title: 'Libellé',
              type: 'string',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'value',
              title: 'Valeur',
              type: 'string',
              validation: (R) => R.required(),
            }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        }),
      ],
    }),
    // La copie de la page de détail vit sur CHAQUE projet (plus de gabarit
    // partagé sur projectsPage): préremplie par initialValue avec la copie FR
    // V1, ajustable document par document.
    defineField({
      name: 'detail',
      title: 'Page de détail',
      description:
        'Copie de la page /projets/<slug> de ce projet. Préremplie à la création, ajustable section par section.',
      type: 'object',
      group: 'detail',
      validation: (R) => R.required(),
      fields: [
        defineField({
          name: 'gallery',
          title: 'Section galerie',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Titre',
              type: 'string',
              initialValue: 'En images',
              validation: (R) => R.required(),
            }),
          ],
        }),
        defineField({
          name: 'caseStudy',
          title: 'Étude de cas',
          type: 'object',
          fields: [
            defineField({
              name: 'eyebrow',
              title: 'Surtitre',
              type: 'string',
              initialValue: 'L\'étude de cas',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'heading',
              title: 'Titre',
              type: 'string',
              initialValue: 'Le défi, la solution, le résultat',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'challengeLabel',
              title: 'Libellé du volet défi',
              type: 'string',
              initialValue: 'Le défi',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'solutionLabel',
              title: 'Libellé du volet solution',
              type: 'string',
              initialValue: 'La solution',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'resultLabel',
              title: 'Libellé du volet résultat',
              type: 'string',
              initialValue: 'Le résultat',
              validation: (R) => R.required(),
            }),
          ],
        }),
        defineField({
          name: 'testimonial',
          title: 'Section témoignage',
          type: 'object',
          fields: [
            defineField({
              name: 'eyebrow',
              title: 'Surtitre',
              type: 'string',
              initialValue: 'Témoignages',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'heading',
              title: 'Titre',
              type: 'string',
              initialValue: 'Le mot du client',
              validation: (R) => R.required(),
            }),
          ],
        }),
        defineField({
          name: 'similar',
          title: 'Section projets similaires',
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
              initialValue: 'Projets similaires',
              validation: (R) => R.required(),
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
              initialValue: {
                _type: 'link',
                label: 'Tous les projets',
                type: 'internal',
                internalRef: { _type: 'reference', _ref: 'projectsPage-fr' },
              },
            }),
          ],
        }),
        // Réutilise le type bloc ctaBand tel quel.
        defineField({
          name: 'cta',
          title: 'Bandeau CTA de fin',
          type: 'ctaBand',
          initialValue: {
            _type: 'ctaBand',
            title: 'Un projet comme celui-ci?',
            subtitle: 'Chaque pièce est unique. Parlons de la vôtre.',
            primaryCta: {
              _type: 'link',
              label: 'Démarrer un projet',
              type: 'internal',
              internalRef: { _type: 'reference', _ref: 'contactPage-fr' },
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      group: 'relations',
      to: [{ type: 'service' }],
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
      name: 'testimonial',
      title: 'Témoignage associé',
      type: 'reference',
      group: 'relations',
      to: [{ type: 'testimonial' }],
      options: {
        filter: ({ document }) => ({
          filter: 'language == $language',
          params: { language: (document as { language?: string })?.language ?? 'fr' },
        }),
        documentInternationalization: { exclude: true },
      },
    }),
    defineField({
      name: 'featured',
      title: 'Projet vedette',
      description: 'Sélectionné par les blocs aperçu de projets en mode vedettes.',
      type: 'boolean',
      group: 'relations',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Ordre',
      description: 'Position dans la grille des projets (1 = premier).',
      type: 'number',
      group: 'relations',
      validation: (R) => R.required().integer().positive(),
    }),
  ],
  orderings: [
    { title: 'Ordre de la collection', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Année (plus récent)', name: 'yearDesc', by: [{ field: 'year', direction: 'desc' }] },
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      location: 'location',
      language: 'language',
      media: 'cover.image',
    },
    prepare: ({ title, year, location, language, media }) => ({
      title: title || '(sans titre)',
      subtitle:
        [year, location].filter(Boolean).join(', ') +
        (language ? ' (' + language.toUpperCase() + ')' : ''),
      media,
    }),
  },
})
