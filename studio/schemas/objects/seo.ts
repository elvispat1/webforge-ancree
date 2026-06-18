import { defineType, defineField } from 'sanity'
import { SearchIcon } from '@sanity/icons'

/**
 * SEO de page, présent UNIQUEMENT sur les pages fixes et onePager. Les
 * collections (service, projet, article, catégorie) dérivent leur SEO de
 * leurs champs via usePageSeo: pas d'objet seo dessus, zéro orphelin.
 *
 * Sémantique spéciale homePage et onePager: le code y neutralise le gabarit
 * de marque (titleTemplate: null), le champ `title` y porte donc le titre
 * COMPLET.
 */
export const seo = defineType({
  name: 'seo',
  title: 'SEO de la page',
  type: 'object',
  icon: SearchIcon,
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'title',
      title: 'Titre SEO',
      description:
        'Remplace le titre du héros dans la balise title. Le suffixe de marque est ajouté automatiquement, sauf sur l\'accueil et le one-pager.',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description SEO',
      type: 'text',
      rows: 2,
      validation: (R) => R.max(160).warning('Plus de 160 caractères: risque de troncature dans Google'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Image de partage',
      description: 'Affichée au partage sur les réseaux. Dimensions recommandées: 1200 x 630 px.',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
})
