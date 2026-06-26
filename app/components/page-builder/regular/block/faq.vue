<script setup lang="ts">
/* FAQ: desamorce les objections avant l'appel. Disposition signature Ancree, pas
 * un bloc Swiss contenu et centre: split asymetrique pose, une colonne d'entete
 * collante a gauche (zone calme, fond clair) et l'accordeon a droite, plus large,
 * sur fond alterne. Une carte d'appel en bleu nuit ferme la colonne d'entete:
 * « toujours une vraie personne au bout du fil ». L'accordeon est la primitive
 * accessible partagee; on mappe {q,a} vers {title,content}. AUCUNE numerotation. */
import type { BlockBase } from '~/types/blocks'
import type { FaqContent } from '~/content/faq'
// Page-builder hors auto-import: le serialiseur partage est importe explicitement
// (meme geste que l'editorial). Il rend la reponse Portable Text (liens internes
// inline en NuxtLink) dans le panneau de l'accordeon.
import PortableText from '~/components/page-builder/article/PortableText.vue'

type FaqBlock = BlockBase<'faq'> & FaqContent

const props = defineProps<FaqBlock>()
const { t } = useI18n()

// La primitive Accordion porte le titre (question); la reponse riche (Portable
// Text) passe par le slot `content`, indexe sur props.items.
const accordionItems = computed(() => props.items.map((item) => ({ title: item.q })))
</script>

<template>
  <section class="faq">
    <div class="wf-container">
      <div class="faq__layout section-grid">
        <div class="faq__head wf-col-full wf-span-6" data-reveal-stagger>
          <p v-if="eyebrow" class="faq__eyebrow wf-caption">
            <span class="faq__tick" aria-hidden="true" />{{ eyebrow }}
          </p>
          <h2 class="faq__heading wf-h2">{{ heading }}</h2>

          <div class="faq__call">
            <span class="faq__call-icon" aria-hidden="true">
              <Icon name="lucide:phone-call" />
            </span>
            <div class="faq__call-text">
              <p class="faq__call-title wf-h5">{{ t('faq.still_wondering_title') }}</p>
              <p class="faq__call-lead wf-body-3">{{ t('faq.still_wondering_lead') }}</p>
            </div>
          </div>
        </div>

        <div class="faq__panel wf-col-full wf-from-8 wf-to-end" data-reveal>
          <Accordion :items="accordionItems" mode="single" :default-open="[0]" :heading-level="3">
            <template #content="{ index }">
              <PortableText :value="props.items[index]?.a ?? []" />
            </template>
          </Accordion>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq {
  padding-block: var(--space-block-default);
  background: var(--bg-alt);
}
.faq__layout {
  align-items: start;
}

/* Colonne d'entete: zone calme, posee. Le trait ambre signature precede le
 * sur-titre en casse normale (jamais une etiquette majuscule traquee). */
.faq__head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.faq__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  margin-bottom: 1.6rem;
  color: var(--text-muted);
}
.faq__tick {
  display: inline-block;
  width: 2.6rem;
  height: 3px;
  border-radius: 2px;
  background: var(--accent-call);
}
.faq__heading {
  max-width: 16ch;
}

/* Carte d'appel: moment fort en bleu nuit, rappelle qu'il y a une vraie
 * personne a joindre. Pose au bas de la colonne d'entete. */
.faq__call {
  display: flex;
  align-items: center;
  gap: 1.6rem;
  margin-top: var(--space-head-content);
  padding: 2.2rem;
  background: var(--bg-deep);
  border-radius: var(--radius);
  box-shadow: var(--elev-mid);
}
.faq__call-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 4.4rem;
  height: 4.4rem;
  border-radius: var(--radius-sm);
  background: var(--accent-call);
  color: var(--text-oncall);
}
.faq__call-icon svg {
  width: 2.4rem;
  height: 2.4rem;
}
.faq__call-title {
  color: var(--text-ondeep);
}
.faq__call-lead {
  margin-top: 0.4rem;
  color: color-mix(in oklch, var(--text-ondeep) 76%, transparent);
}

.faq__panel {
  margin-top: var(--space-head-content);
}

@container site (min-width: 1024px) {
  .faq__head {
    position: sticky;
    top: calc(var(--header-height) + 3rem);
  }
  .faq__panel {
    margin-top: 0;
  }
}
</style>
