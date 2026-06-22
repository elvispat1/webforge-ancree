<script setup lang="ts">
/* Corps partage des pages legales (conditions, confidentialite), pilote par
 * Sanity. Rend les dates de mise en vigueur et de derniere mise a jour, puis les
 * sections titrees: chaque bloc est un paragraphe, une liste a puces, ou une zone
 * a completer ({ todo }, encadree, nettement detachee de l'ossature pour que le
 * redacteur voie ce qui reste a remplir). Aucun texte legal en dur: tout vient du
 * document (useContent('legal') cote page). La mesure de lecture reste sobre, sur
 * la moitie gauche de la grille. */
import type { LegalDoc, LegalBlock } from '~/content/legal'

defineProps<{ doc: LegalDoc }>()

const { t } = useI18n()

// LegalBlock est une union: paragraphe = string nue, sinon { list } ou { todo }.
function isList(block: LegalBlock): block is { list: string[] } {
  return typeof block === 'object' && 'list' in block
}
function isTodo(block: LegalBlock): block is { todo: string } {
  return typeof block === 'object' && 'todo' in block
}
</script>

<template>
  <div class="wf-container legal">
    <div class="legal__col">
      <p class="legal__meta wf-caption wf-text-muted">
        {{ t('legal.effective', { date: doc.effective }) }} {{ t('legal.updated', { date: doc.updated }) }}
      </p>

      <div class="legal__body">
        <section v-for="section in doc.sections" :key="section.title" class="legal__section">
          <h2 class="wf-h3 legal__heading">{{ section.title }}</h2>
          <template v-for="(block, i) in section.body" :key="i">
            <ul v-if="isList(block)" class="legal__list wf-body-1">
              <li v-for="(item, j) in block.list" :key="j">{{ item }}</li>
            </ul>
            <p v-else-if="isTodo(block)" class="legal__todo wf-body-1">{{ block.todo }}</p>
            <p v-else class="legal__paragraph wf-body-1 wf-text-muted">{{ block }}</p>
          </template>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.legal {
  padding-block: var(--space-block-default);
}
.legal__col {
  max-width: 68ch;
}
.legal__meta {
  margin-bottom: 3.2rem;
}
.legal__section + .legal__section {
  margin-top: 3.6rem;
}
.legal__heading {
  margin-bottom: 1.4rem;
}
.legal__paragraph + .legal__paragraph,
.legal__paragraph + .legal__list,
.legal__list + .legal__paragraph {
  margin-top: 1.4rem;
}
.legal__list {
  display: grid;
  gap: 0.8rem;
  padding-left: 2.2rem;
  list-style: disc;
  color: var(--text-muted);
}
/* Zone a completer: encadree et detachee, pour que le redacteur voie nettement ce
   qui reste a remplir avant la mise en ligne. */
.legal__todo {
  margin-top: 1.4rem;
  padding: 1.6rem 2rem;
  border: var(--line-soft);
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--accent-call) 8%, transparent);
  color: var(--text-base);
}
</style>
