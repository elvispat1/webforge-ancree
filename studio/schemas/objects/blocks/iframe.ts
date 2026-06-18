import { defineType, defineField } from 'sanity'
import { EarthGlobeIcon } from '@sanity/icons'

export const iframe = defineType({
  name: 'iframe',
  title: 'Bloc: intégration (iframe)',
  type: 'object',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'url',
      title: 'URL à intégrer',
      description:
        'Adresse de la page ou du service à afficher dans le cadre (carte, formulaire, calendrier…).',
      type: 'url',
      validation: (R) => R.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'title',
      title: 'Titre accessible',
      description:
        'Décrit le contenu intégré pour les lecteurs d\'écran (obligatoire). N\'est pas affiché à l\'écran.',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'ratio',
      title: 'Ratio du cadre',
      description: 'Vide: 16:9 par défaut.',
      type: 'string',
      options: {
        list: [
          { title: '16:9 (large)', value: '16/9' },
          { title: '4:3 (paysage)', value: '4/3' },
          { title: '1:1 (carré)', value: '1/1' },
          { title: '3:4 (portrait)', value: '3/4' },
          { title: '2:1 (panoramique)', value: '2/1' },
        ],
        layout: 'dropdown',
      },
      initialValue: '16/9',
    }),
    defineField({
      name: 'caption',
      title: 'Légende',
      description: 'Optionnelle: courte légende affichée sous le cadre.',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'title', url: 'url' },
    prepare: ({ title, url }) => ({
      title: title || '(sans titre)',
      subtitle: url ? 'Iframe, ' + url : 'Bloc: intégration (iframe)',
    }),
  },
})
