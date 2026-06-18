import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

/**
 * Image réutilisée partout où le contenu a la shape
 * { ratio, src?, alt, label, caption }.
 *
 * L'alt vit ici, par usage, PAS sur l'asset: divergence assumée avec la
 * référence nuxt-sanity-test (la même image peut servir plusieurs contextes
 * avec des descriptions différentes).
 *
 * `image` est optionnel: absent, le front rend le placeholder soigné du
 * fragment <Image> (jamais une 404), exactement comme `src?` absent en V1.
 */
export const figure = defineType({
  name: 'figure',
  title: 'Image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Fichier image',
      description: 'Optionnelle: sans image, le site affiche un placeholder soigné.',
      type: 'image',
      options: { hotspot: true },
    }),
    // Texte alternatif RECOMMANDÉ, jamais bloquant: validation .warning() (et non
    // .required() comme label et caption). Choix délibéré, sur l'avis d'une
    // spécialiste en accessibilité, qui s'écarte de la reco d'audit. Au rendu,
    // l'attribut alt est TOUJOURS présent, vide au pire (alt=""): un attribut
    // absent serait un échec WCAG, tandis qu'un alt vide marque correctement une
    // image décorative pour les lecteurs d'écran. D'où l'absence de champ
    // « décorative » distinct: une image décorative se déclare en laissant alt
    // vide. Convention gravée dans docs/CONVENTIONS-CONTRACT.md (section 8, Image).
    defineField({
      name: 'alt',
      title: 'Texte alternatif',
      description: 'Décrit l\'image pour les lecteurs d\'écran. Défini ici, par usage. Laisser vide si l\'image est purement décorative.',
      type: 'string',
      validation: (R) =>
        R.custom((alt, ctx) => {
          const p = ctx.parent as { image?: { asset?: unknown } }
          if (p?.image?.asset && !alt) return 'Texte alternatif recommandé quand une image est présente'
          return true
        }).warning(),
    }),
    defineField({
      name: 'label',
      title: 'Étiquette',
      description: 'Courte mention affichée sur ou sous l\'image (ex. Atelier, plan de travail en frêne).',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Légende',
      description: 'Légende descriptive (ex. Photo atelier, 4:5).',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'ratio',
      title: 'Ratio d\'affichage',
      description: 'Vide: le site applique le ratio par défaut de l\'emplacement.',
      type: 'string',
      options: {
        list: [
          { title: '4:5 (portrait)', value: '4/5' },
          { title: '3:4 (portrait)', value: '3/4' },
          { title: '4:3 (paysage)', value: '4/3' },
          { title: '3:2 (paysage)', value: '3/2' },
          { title: '16:9 (large)', value: '16/9' },
          { title: '2:1 (panoramique)', value: '2/1' },
        ],
        layout: 'dropdown',
      },
    }),
  ],
  preview: {
    select: {
      label: 'label',
      caption: 'caption',
      ratio: 'ratio',
      media: 'image',
    },
    prepare: ({ label, caption, ratio, media }) => ({
      title: label || caption || '(image sans étiquette)',
      subtitle: ratio ? 'Ratio ' + ratio : 'Ratio par défaut du bloc',
      media,
    }),
  },
})
