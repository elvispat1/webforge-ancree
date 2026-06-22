import { defineType, defineField } from 'sanity'
import { ImageIcon } from '@sanity/icons'

/**
 * Image réutilisée partout où le contenu a la shape
 * { ratio, image?, alt, label, caption }.
 *
 * Image NATIVE Sanity (champ `image` avec hotspot), qui remplace l'ancienne
 * paire { src, alt } en string du monolithe.
 *
 * L'alt vit ici, par usage, PAS sur l'asset: la même image peut servir
 * plusieurs contextes avec des descriptions différentes.
 *
 * `image` est optionnel: absent, le front rend un placeholder soigné
 * (jamais une 404).
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
    // Texte alternatif RECOMMANDÉ, jamais bloquant: validation .warning(). Au rendu,
    // l'attribut alt est TOUJOURS présent, vide au pire (alt=""). Un attribut absent
    // serait un échec WCAG, tandis qu'un alt vide marque correctement une image
    // décorative pour les lecteurs d'écran. D'où l'absence de champ « décorative »
    // distinct: une image décorative se déclare en laissant l'alt vide.
    //
    // DIVERGENCE ASSUMÉE vs Minimaliste (label + caption y sont required): dans la
    // peau Ancrée, label et caption restent OPTIONNELS. Les héros pleine image
    // n'affichent jamais de légende; exiger une légende partout forcerait du texte
    // jamais rendu. Posture fail-fast honnête: on exige ce qui est rendu.
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
      description: 'Courte mention affichée sur ou sous l\'image (ex. Intervention, traitement de la fourmi charpentière).',
      type: 'string',
    }),
    defineField({
      name: 'caption',
      title: 'Légende',
      description: 'Légende descriptive (ex. Inspection résidentielle, 4:5).',
      type: 'string',
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
