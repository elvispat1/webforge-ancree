import { portableLinkAnnotation } from '../portable-link'

/**
 * Configuration Portable Text RESTREINTE de la réponse d'une question (faqItem).
 * Décision Charles no 6: réponse en Portable Text restreint pour le maillage interne
 * inline (vers services et villes) tout en alimentant le JSON-LD FAQPage (extraction
 * texte au transform). L'annotation `link` est PARTAGÉE avec le corps d'article et le
 * bloc éditorial (objets/portable-link), résolue au transform et rendue par le
 * sérialiseur partagé PortableText.vue.
 *
 * Plus restreint que l'éditorial: pas de sous-titre (une réponse est du corps), pas
 * de liste numérotée (numérotation interdite site-wide), juste paragraphes, liste à
 * puces, gras, italique et liens. Comme articlePortableText/editorialPortableText,
 * ce n'est PAS un type enregistré: la valeur est réutilisée dans le `of: [...]` du
 * champ answer.
 */
export const faqAnswerPortableText = {
  type: 'block' as const,
  styles: [{ title: 'Paragraphe', value: 'normal' }],
  lists: [{ title: 'Liste a puces', value: 'bullet' }],
  marks: {
    decorators: [
      { title: 'Gras', value: 'strong' },
      { title: 'Italique', value: 'em' },
    ],
    annotations: [portableLinkAnnotation],
  },
}
