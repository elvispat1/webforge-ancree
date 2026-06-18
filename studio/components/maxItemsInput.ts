import type { ArrayOfObjectsInputProps } from 'sanity'

/**
 * Fabrique d'input array qui MASQUE le bouton « Ajouter un élément » dès que le
 * tableau atteint `max` éléments. Sanity ne plafonne pas l'ajout via la
 * validation seule (elle ne fait que signaler une erreur après coup); ce
 * composant supprime carrément l'action d'ajout une fois le maximum atteint.
 *
 * Réutilisable partout où un array a un maximum dur (ex. les champs `hero`,
 * verrouillés à 1 bloc). La validation reste la source de vérité publiée; ceci
 * n'est que l'amélioration d'UX côté Studio.
 *
 * Usage dans un schéma:
 *   defineField({
 *     name: 'hero', type: 'array', of: [...],
 *     validation: (R) => R.required().length(1),
 *     components: { input: maxItemsInput(1) },
 *   })
 */
export function maxItemsInput(max: number) {
  return function MaxItemsArrayInput(props: ArrayOfObjectsInputProps) {
    const atMax = (props.value?.length ?? 0) >= max
    // Au max: on rejoue le rendu par défaut mais avec un composant de fonctions
    // d'array qui ne rend rien -> plus de bouton « Ajouter un élément ».
    if (atMax) {
      return props.renderDefault({ ...props, arrayFunctions: HiddenArrayFunctions })
    }
    return props.renderDefault(props)
  }
}

function HiddenArrayFunctions() {
  return null
}
