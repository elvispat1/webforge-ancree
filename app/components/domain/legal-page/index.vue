<script setup lang="ts">
/* LegalPage — gabarit partagé des pages légales (conditions, confidentialité).
 *
 * Page de second plan: pas de héros, pas de fil d'Ariane, en-tête sobre
 * (titre + date de mise en vigueur), sections titrées, contenu posé sur la
 * moitié gauche de la grille (6 colonnes sur 12) pour une mesure de lecture
 * confortable. Le footer vient du layout. Le bloc contact se construit depuis
 * `site.contact` pour éviter de dupliquer courriel et adresse.
 *
 * Un bloc de contenu est soit un paragraphe (string), soit une liste à puces
 * ({ list }), soit une zone à remplir par le client ({ todo }). Les zones todo
 * sont rendues isolées et encadrées (.wf-legal-todo-block), nettement séparées
 * de l'ossature, pour que le client voie exactement ce qu'il doit compléter.
 *
 * Aucune valeur design en dur: tout passe par les classes wf-legal-* et les
 * tokens de global.css. Contenu via props, jamais de HTML en dur dans les données.
 */
import type { LegalDoc, LegalBlock } from '~/content/legal'

defineProps<{ doc: LegalDoc }>()

const site = useContent('site')

/* Découpe un texte en segments en isolant les passages [entre crochets]
   (utilisé pour la date de mise en vigueur encore à fixer). */
function inlineParts(text: string): Array<{ text: string; todo: boolean }> {
  const parts: Array<{ text: string; todo: boolean }> = []
  const re = /\[[^\]]+\]/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), todo: false })
    parts.push({ text: match[0], todo: true })
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push({ text: text.slice(last), todo: false })
  return parts
}

function isList(block: LegalBlock): block is { list: string[] } {
  return typeof block === 'object' && block !== null && 'list' in block
}
function isTodo(block: LegalBlock): block is { todo: string } {
  return typeof block === 'object' && block !== null && 'todo' in block
}
</script>

<template>
  <article class="wf-legal-article">
    <div class="wf-container">
      <div class="section-grid">
        <div class="wf-legal-col">
          <header class="wf-legal-head">
            <h1 class="wf-h2 wf-legal-h1">{{ doc.title }}</h1>
            <p class="wf-legal-meta">En vigueur depuis le <template v-for="(seg, k) in inlineParts(doc.effective)" :key="`e${k}`"><span v-if="seg.todo" class="wf-legal-todo">{{ seg.text }}</span><template v-else>{{ seg.text }}</template></template>. Dernière mise à jour le <template v-for="(seg, k) in inlineParts(doc.updated)" :key="`u${k}`"><span v-if="seg.todo" class="wf-legal-todo">{{ seg.text }}</span><template v-else>{{ seg.text }}</template></template>.</p>
          </header>

          <div class="wf-legal-body">
            <section v-for="section in doc.sections" :key="section.title">
              <h2 class="wf-h3 wf-legal-h2">{{ section.title }}</h2>
              <template v-for="(block, i) in section.body" :key="i">
                <ul v-if="isList(block)" class="wf-legal-list">
                  <li v-for="(item, j) in block.list" :key="j">{{ item }}</li>
                </ul>
                <p v-else-if="isTodo(block)" class="wf-legal-todo-block">{{ block.todo }}</p>
                <p v-else>{{ block }}</p>
              </template>
            </section>

            <!-- Sections additionnelles non rédactionnelles (ex: catégories de
                 témoins pilotées par la config sur la page de confidentialité),
                 posées juste avant le bloc contact. -->
            <slot name="after-sections" />

            <section class="wf-legal-contact">
              <p>
                Pour toute question relative à ce document, écrivez à
                <a :href="`mailto:${site.contact.email}`">{{ site.contact.email }}</a>
                ou par la poste au {{ site.contact.address.line1 }},
                {{ site.contact.address.cityProv }} {{ site.contact.address.postal }}.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
