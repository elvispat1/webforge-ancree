import { defineField } from 'sanity'

/**
 * Identifiant d'ancre d'une section de page-builder. Partagé par tous les blocs
 * ancrables: permet de cibler ce bloc précis depuis un lien d'ancre (#<ancre>),
 * y compris quand un même TYPE de bloc apparaît plusieurs fois sur une page.
 *
 * OPTIONNEL: vide, le front retombe sur l'identifiant par défaut du type de bloc
 * (services, about, contact, ...). Stable: indépendant du titre (renommer le titre
 * ne casse pas l'ancre).
 *
 * PAR LANGUE: ce champ et l'ancre du lien vivent tous deux dans des documents par
 * langue. Il suffit que, DANS UNE MÊME LANGUE, l'ancre du lien corresponde à l'ancre
 * de sa section cible. Le français et l'anglais sont indépendants: l'id peut différer
 * d'une langue à l'autre (rien n'oblige à le garder identique).
 *
 * Le front normalise (slug: minuscules, accents retirés, espaces -> tirets) côté
 * section ET côté lien, donc on peut y coller le titre: « Nos services » et
 * « nos-services » donnent la même ancre.
 */
export const anchorField = defineField({
  name: 'anchor',
  title: 'Ancre (identifiant de section)',
  description:
    'Optionnel. Pour cibler cette section depuis un lien d\'ancre (ex. services-residentiels). Vide = identifiant par défaut du type de bloc. Doit correspondre à l\'ancre saisie dans le lien (même langue); peut différer entre le français et l\'anglais.',
  type: 'string',
})
