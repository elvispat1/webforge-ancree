import { defineField, defineArrayMember } from 'sanity'

/**
 * Helper pageBuilder partagé pour Ancrée.
 *
 * NOTE D'ARCHITECTURE: Minimaliste déclare son pageBuilder INLINE dans chaque
 * singleton de page (homePage, etc.), avec la même config insertMenu répétée.
 * Pour Ancrée, on factorise en un helper réutilisable: chaque page importe
 * `pageBuilderField` plutôt que de recopier le tableau et l'insertMenu.
 *
 * Si une page a besoin d'un sous-ensemble de blocs ou d'options propres, elle
 * peut soit utiliser ce champ tel quel, soit appeler `pageBuilderField` puis
 * surcharger `group`/`of` à la déclaration. Le `group` par défaut est 'content'
 * (la convention des singletons Minimaliste).
 *
 * Les 8 blocs d'Ancrée listés par leur `name`:
 *   trustBar, services, serviceCities, about,
 *   testimonials, faq, ctaBand, contact.
 *
 * insertMenu: replique EXACTEMENT la config de Minimaliste (vues grid + list,
 * aperçus SVG sous /static/block-previews/<typeName>.svg, filtre actif).
 */
export const pageBuilderField = defineField({
  name: 'pageBuilder',
  title: 'Sections de la page',
  type: 'array',
  group: 'content',
  options: {
    insertMenu: {
      views: [
        { name: 'grid', previewImageUrl: (typeName) => `/static/block-previews/${typeName}.svg` },
        { name: 'list' },
      ],
      filter: true,
    },
  },
  of: [
    defineArrayMember({ type: 'trustBar' }),
    defineArrayMember({ type: 'services' }),
    defineArrayMember({ type: 'serviceCities' }),
    defineArrayMember({ type: 'about' }),
    defineArrayMember({ type: 'testimonials' }),
    defineArrayMember({ type: 'faq' }),
    defineArrayMember({ type: 'ctaBand' }),
    defineArrayMember({ type: 'contact' }),
    defineArrayMember({ type: 'editorial' }),
    defineArrayMember({ type: 'highlights' }),
    defineArrayMember({ type: 'process' }),
    defineArrayMember({ type: 'team' }),
  ],
})
