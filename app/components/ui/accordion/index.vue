<script setup lang="ts">
/* Accordion — composant réutilisable, accessible et agnostique du contenu.
 * Vit dans l'app pour l'instant; conçu pour être copié de projet en projet
 * (consomme uniquement des tokens de famille, aucun style en dur).
 *
 * Usage:
 *   <Accordion :items="items" />
 *   <Accordion :items="faq.items" mode="multiple" :default-open="[0]"
 *              numbered faq-schema :heading-level="3" />
 *
 * Props:
 *   - items        → [{ title, content }]. `content` est rendu en texte simple
 *                    par défaut; passer le slot #content pour du contenu riche.
 *   - mode         → 'single' (un seul ouvert à la fois) ou 'multiple' (libre).
 *   - defaultOpen  → index ouverts au montage (ex: [0] = premier ouvert).
 *   - headingLevel → niveau du titre qui enveloppe chaque bouton (h2..h6).
 *                    Le bouton EST le titre (pattern accordéon WAI-ARIA APG).
 *   - numbered     → affiche un compteur 01, 02… (décoratif, aria-hidden).
 *   - faqSchema    → ajoute les microdonnées schema.org FAQPage (SEO). Tout
 *                    accordéon n'est pas une FAQ, d'où le drapeau.
 *
 * Slots (optionnels, pour du contenu riche): #title et #content, qui reçoivent
 * { item, index }.
 *
 * Accessibilité:
 *   - bouton natif (Entrée/Espace + focus gratuits), nom accessible = le titre
 *     (le numéro est aria-hidden, aucun aria-label générique qui l'écraserait);
 *   - chaque bouton est enveloppé d'un vrai titre <hN> (navigation par titres);
 *   - le panneau est un role=region nommé par son bouton (aria-labelledby);
 *   - le contenu fermé sort de l'arbre d'accessibilité et du tab order
 *     (visibility:hidden, cf. styles), au lieu d'être seulement masqué visuellement;
 *   - animations désactivées sous prefers-reduced-motion (cf. styles).
 */

interface AccordionItem {
  title: string
  content: string
}

const props = withDefaults(defineProps<{
  items: AccordionItem[]
  mode?: 'single' | 'multiple'
  defaultOpen?: number[]
  headingLevel?: 2 | 3 | 4 | 5 | 6
  numbered?: boolean
  faqSchema?: boolean
}>(), {
  mode: 'single',
  defaultOpen: () => [],
  headingLevel: 3,
  numbered: false,
  faqSchema: false
})

const uid = useId()
const triggerId = (i: number) => `${uid}-trigger-${i}`
const panelId = (i: number) => `${uid}-panel-${i}`

const headingTag = computed(() => `h${props.headingLevel}`)

const openSet = ref(new Set<number>(props.defaultOpen))
const isOpen = (i: number) => openSet.value.has(i)

function toggle(i: number) {
  if (openSet.value.has(i)) {
    openSet.value.delete(i)
    return
  }
  if (props.mode === 'single') openSet.value.clear()
  openSet.value.add(i)
}
</script>

<template>
  <ol
    class="wf-accordion"
    :class="{ 'wf-accordion--numbered': numbered }"
    :itemscope="faqSchema || undefined"
    :itemtype="faqSchema ? 'https://schema.org/FAQPage' : undefined"
  >
    <li
      v-for="(item, i) in items"
      :key="i"
      class="wf-accordion__item"
      :class="{ 'is-open': isOpen(i) }"
      :itemscope="faqSchema || undefined"
      :itemprop="faqSchema ? 'mainEntity' : undefined"
      :itemtype="faqSchema ? 'https://schema.org/Question' : undefined"
    >
      <component :is="headingTag" class="wf-accordion__heading">
        <button
          :id="triggerId(i)"
          type="button"
          class="wf-accordion__trigger"
          :aria-expanded="isOpen(i)"
          :aria-controls="panelId(i)"
          @click="toggle(i)"
        >
          <span v-if="numbered" class="wf-accordion__n" aria-hidden="true">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <span class="wf-accordion__title" :itemprop="faqSchema ? 'name' : undefined">
            <slot name="title" :item="item" :index="i">{{ item.title }}</slot>
          </span>
          <span class="wf-accordion__icon" aria-hidden="true">
            <svg viewBox="0 0 12 12" width="12" height="12">
              <path
                d="M2 4 L6 8 L10 4"
                stroke="currentColor"
                stroke-width="1.5"
                fill="none"
                stroke-linecap="square"
              />
            </svg>
          </span>
        </button>
      </component>

      <div
        :id="panelId(i)"
        class="wf-accordion__panel"
        role="region"
        :aria-labelledby="triggerId(i)"
        :itemscope="faqSchema || undefined"
        :itemprop="faqSchema ? 'acceptedAnswer' : undefined"
        :itemtype="faqSchema ? 'https://schema.org/Answer' : undefined"
      >
        <div class="wf-accordion__panel-inner">
          <slot name="content" :item="item" :index="i">
            <p class="wf-accordion__content" :itemprop="faqSchema ? 'text' : undefined">{{ item.content }}</p>
          </slot>
        </div>
      </div>
    </li>
  </ol>
</template>
