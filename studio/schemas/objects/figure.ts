import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

/**
 * Image réutilisée partout où le contenu a la shape { image }. Image NATIVE Sanity
 * (champ `image` avec hotspot), résolue en URL CDN à la query (FIGURE_PROJECTION).
 *
 * Tout le reste se dérive de l'ASSET, réglé une seule fois dans la médiathèque,
 * comme le visuel du héros:
 *   - le TEXTE ALTERNATIF vient de l'asset (onglet « Alt Text », bilingue { fr, en });
 *   - la LÉGENDE vient de la description de l'asset (onglet « Description », bilingue).
 * Plus de champ étiquette/légende/ratio par usage: une image porte son texte une
 * seule fois, traduit, partout, et le ratio est décidé par l'emplacement au rendu
 * (pas par le contenu).
 *
 * `image` est optionnel: absent, le front rend un placeholder soigné (jamais une 404).
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
      description:
        'Optionnelle: sans image, le site affiche un placeholder soigné. Le texte alternatif et la légende se règlent sur l\'image dans la médiathèque (Alt Text, Description).',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { media: 'image', filename: 'image.asset.originalFilename' },
    prepare: ({ media, filename }) => ({
      title: filename || 'Image',
      media,
    }),
  },
})
