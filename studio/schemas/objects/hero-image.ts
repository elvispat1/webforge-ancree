import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

/**
 * Visuel du héros full bleed: minimal par dessein. Aucun champ étiquette, légende
 * ni ratio (le héros remplit l'écran en object-fit cover, le cadrage est géré en
 * CODE: 16:9 au desktop, plein écran portrait au mobile).
 *
 * Le TEXTE ALTERNATIF n'est PAS saisi ici: il vit sur l'image elle-même dans la
 * médiathèque (onglet Alt du plugin média). Une image = un alt, réglé une seule
 * fois. C'est l'inverse du choix « alt par usage » de l'objet `figure`, assumé
 * pour le visuel du héros.
 *
 * `desktop` est requise (il y a toujours un visuel de héros, fail-fast). `mobile`
 * est optionnelle: absente, le desktop est utilisé partout; présente, elle est
 * chargée sous le seuil pour un cadrage plein écran adapté au téléphone.
 */
export const heroImage = defineType({
  name: 'heroImage',
  title: 'Visuel',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'desktop',
      title: 'Image (desktop)',
      description:
        'Recadrée plein écran (16:9 au repère). Le texte alternatif se règle sur l\'image dans la médiathèque, pas ici.',
      type: 'image',
      options: { hotspot: true },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'mobile',
      title: 'Image (mobile, optionnelle)',
      description:
        'Cadrage plein écran portrait pour le téléphone. Sans elle, l\'image desktop est utilisée partout.',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { media: 'desktop', mobile: 'mobile' },
    prepare: ({ media, mobile }) => ({
      title: 'Visuel du héros',
      subtitle: mobile ? 'Desktop + mobile' : 'Desktop (mobile dérivé)',
      media,
    }),
  },
})
