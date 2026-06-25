import { defineField } from 'sanity'

/**
 * Identifiant d'ancre d'une section de page-builder. Partagé par tous les blocs
 * ancrables: permet de cibler ce bloc précis depuis un lien d'ancre (#<ancre>),
 * y compris quand un même TYPE de bloc apparaît plusieurs fois sur une page.
 *
 * OPTIONNEL: vide, le front retombe sur l'identifiant par défaut du type de bloc
 * (services, about, contact, ...). Language-INDÉPENDANT: mettre la MÊME valeur en
 * français et en anglais (un lien d'ancre porte une seule valeur, pour les deux
 * langues). Stable: indépendant du titre (renommer le titre ne casse pas l'ancre).
 *
 * Le front normalise (slug: minuscules, accents retirés, espaces -> tirets) côté
 * section ET côté lien, donc on peut y coller le titre: « Nos services » et
 * « nos-services » donnent la même ancre.
 */
export const anchorField = defineField({
  name: 'anchor',
  title: 'Ancre (identifiant de section)',
  description:
    'Optionnel. Pour cibler cette section depuis un lien d\'ancre (ex. services-residentiels). Vide = identifiant par défaut du type de bloc. Mettre la même valeur en français et en anglais.',
  type: 'string',
})
