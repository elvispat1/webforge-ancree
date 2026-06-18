import { defineType, defineField, defineArrayMember } from 'sanity'
import { WrenchIcon } from '@sanity/icons'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  icon: WrenchIcon,
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
      name: 'title',
      title: 'Titre',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      description: 'Accessible à /services/<slug>.',
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
      title: 'Repère (délai)',
      description: 'Affiché sur la carte et le héros de détail, ex. 6 à 16 semaines.',
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
    // La copie de la page de détail vit sur CHAQUE service (plus de gabarit
    // partagé sur servicesPage): préremplie par initialValue avec la copie FR
    // V1, ajustable document par document.
    defineField({
      name: 'detail',
      title: 'Page de détail',
      description:
        'Copie de la page /services/<slug> de ce service. Préremplie à la création, ajustable section par section.',
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
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'cta',
              title: 'Bouton',
              type: 'link',
              initialValue: {
                _type: 'link',
                label: 'Demander un devis',
                type: 'internal',
                internalRef: { _type: 'reference', _ref: 'contactPage-fr' },
              },
              validation: (R) => R.required(),
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
              validation: (R) => R.required(),
            }),
          ],
        }),
        // Réutilise le type bloc process tel quel (même pattern que cta avec ctaBand).
        // Rendu sur la page /services/[slug] par la composition code (useServiceBlocks).
        defineField({
          name: 'process',
          title: 'Bloc processus',
          description:
            'Processus affiché sur la page de détail de ce service. La page Services a son propre bloc processus dans ses sections.',
          type: 'process',
          initialValue: {
            _type: 'process',
            eyebrow: 'Le déroulement',
            heading: 'Comment se déroule un mandat',
            lead: 'Du premier appel à la pose finale, un seul interlocuteur: moi.',
            cta: {
              _type: 'link',
              label: 'Me contacter',
              type: 'internal',
              internalRef: { _type: 'reference', _ref: 'contactPage-fr' },
            },
            steps: [
              {
                _type: 'processStep',
                _key: 'step-1',
                title: 'La rencontre',
                body: "Une heure ensemble, à l'atelier ou chez vous, pour comprendre votre projet et votre espace. Gratuite et sans engagement.",
              },
              {
                _type: 'processStep',
                _key: 'step-2',
                title: 'Le devis et le dessin',
                body: 'Un devis écrit et ferme dans la semaine: essences, dimensions, échéancier. On fige le dessin ensemble avant que je scie quoi que ce soit.',
              },
              {
                _type: 'processStep',
                _key: 'step-3',
                title: 'La fabrication',
                body: "Je débite, j'assemble et je finis à l'atelier de Chambly. Je vous tiens au courant aux étapes clés, parfois avec une photo.",
              },
              {
                _type: 'processStep',
                _key: 'step-4',
                title: 'La livraison et la pose',
                body: "Je livre et j'installe moi-même. Ajustements et finitions sur place. Le solde n'est dû qu'une fois la pièce en place.",
              },
            ],
          },
        }),
        defineField({
          name: 'projects',
          title: 'Section projets reliés',
          description: 'Les items viennent des projets reliés du service.',
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
              initialValue: 'Réalisations dans ce service',
              validation: (R) => R.required(),
            }),
            defineField({
              name: 'lead',
              title: 'Texte d\'amorce',
              type: 'text',
              rows: 2,
              initialValue: 'Des pièces récentes livrées dans ce service, du croquis à la pose.',
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
        defineField({
          name: 'testimonials',
          title: 'Section témoignages',
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
              initialValue: 'Ce qu\'en disent mes clients',
              validation: (R) => R.required(),
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
            title: 'Discutons de votre projet',
            subtitle: 'Un devis détaillé et honnête, sans engagement.',
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
      name: 'related',
      title: 'Projets reliés',
      type: 'array',
      group: 'relations',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'project' }],
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
      name: 'order',
      title: 'Ordre',
      description:
        'Position dans la collection (1 = premier). Détermine l\'ordre d\'affichage et le compteur S/01 dérivé au rendu.',
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
