<script setup lang="ts">
/* Accordeon partage, accessible (WAI-ARIA). Chaque entete est un vrai <button>
 * dans un titre (niveau configurable), couple a son panneau par aria-controls /
 * aria-labelledby. Le panneau ferme sort de l'ordre de tabulation
 * (visibility: hidden) et son hauteur s'anime (grid-template-rows), coupee par le
 * kill-switch reduced-motion. Signature Ancree: matiere chaude (cartes arrondies,
 * filets doux), accent ambre sur l'entree ouverte, chevron qui pivote en se
 * posant. mode 'single' (un seul panneau a la fois) ou 'multiple'. AUCUNE
 * numerotation, jamais (pas de compteur, pas d'option de numero). */
interface AccordionItem {
  title: string
  // Contenu texte simple (repli). Pour du texte riche (Portable Text), le
  // consommateur fournit le slot `content` et peut omettre ce champ.
  content?: string
}

const props = withDefaults(
  defineProps<{
    items: AccordionItem[]
    mode?: 'single' | 'multiple'
    defaultOpen?: number[]
    headingLevel?: 2 | 3 | 4 | 5 | 6
  }>(),
  {
    mode: 'single',
    defaultOpen: () => [],
    headingLevel: 3
  }
)

// Etat d'ouverture: un Set d'index. Initialise depuis defaultOpen; en mode single
// on ne garde que la premiere valeur fournie (un seul panneau ouvert a la fois).
const open = ref<Set<number>>(
  new Set(props.mode === 'single' ? props.defaultOpen.slice(0, 1) : props.defaultOpen)
)

function isOpen(i: number): boolean {
  return open.value.has(i)
}

function toggle(i: number): void {
  const next = new Set(open.value)
  if (next.has(i)) {
    next.delete(i)
  } else {
    if (props.mode === 'single') next.clear()
    next.add(i)
  }
  open.value = next
}

// Titre semantique configurable (h2..h6) sans casser le typage de :is.
const headingTag = computed(() => `h${props.headingLevel}` as const)

// Identifiants uniques et stables (SSR-safe) pour le couplage trigger/panel.
const uid = useId()
function triggerId(i: number): string {
  return `${uid}-acc-trigger-${i}`
}
function panelId(i: number): string {
  return `${uid}-acc-panel-${i}`
}
</script>

<template>
  <div class="acc">
    <div v-for="(item, i) in items" :key="item.title" class="acc__item" :class="{ 'acc__item--open': isOpen(i) }">
      <component :is="headingTag" class="acc__heading">
        <button
          :id="triggerId(i)"
          type="button"
          class="acc__trigger"
          :aria-expanded="isOpen(i)"
          :aria-controls="panelId(i)"
          @click="toggle(i)"
        >
          <span class="acc__title wf-h5">{{ item.title }}</span>
          <span class="acc__chevron" aria-hidden="true">
            <Icon name="lucide:chevron-down" />
          </span>
        </button>
      </component>

      <div
        :id="panelId(i)"
        role="region"
        :aria-labelledby="triggerId(i)"
        class="acc__panel"
        :hidden="!isOpen(i)"
      >
        <div class="acc__panel-inner">
          <div class="acc__content wf-body-2 wf-text-muted">
            <slot name="content" :item="item" :index="i">{{ item.content }}</slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.acc {
  display: grid;
  gap: 1.6rem;
}

/* Chaque entree: une carte chaude, arrondie, posee (ombre douce). */
.acc__item {
  background: var(--bg-lift);
  border: var(--line-width) solid transparent;
  border-radius: var(--radius);
  box-shadow: var(--elev-low);
  overflow: hidden;
  transition:
    box-shadow var(--motion-duration-hover) var(--motion-ease-settle),
    border-color var(--motion-duration-hover) var(--motion-ease-settle);
}
.acc__item:hover {
  box-shadow: var(--elev-mid);
}

/* L'entree ouverte se distingue par un filet ambre complet, un fond chaud tres
 * leger et une elevation (pas de bande laterale: bordure pleine + chevron ambre). */
.acc__item--open {
  border-color: color-mix(in oklch, var(--accent-call) 55%, transparent);
  background: color-mix(in oklch, var(--accent-call) 6%, var(--bg-lift));
  box-shadow: var(--elev-mid);
}

.acc__heading {
  margin: 0;
  font: inherit;
}

.acc__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
  padding: 2.4rem 2.8rem;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: var(--text-base);
  transition: color var(--motion-duration-hover) var(--motion-ease-settle);
}
.acc__trigger:hover {
  color: var(--accent-trust);
}
.acc__trigger:focus-visible {
  outline: var(--line-width) solid var(--accent-trust);
  outline-offset: -0.4rem;
  border-radius: var(--radius);
}

.acc__title {
  margin: 0;
  flex: 1 1 auto;
}
.acc__item--open .acc__title {
  color: var(--text-base);
}

/* Chevron: pastille douce qui pivote en se posant a l'ouverture. */
.acc__chevron {
  display: grid;
  place-items: center;
  flex: none;
  width: 3.6rem;
  height: 3.6rem;
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, var(--text-base) 5%, transparent);
  color: var(--text-muted);
  transition:
    transform var(--motion-duration-expand) var(--motion-ease-settle),
    background-color var(--motion-duration-hover) var(--motion-ease-settle),
    color var(--motion-duration-hover) var(--motion-ease-settle);
}
.acc__chevron svg {
  width: 2rem;
  height: 2rem;
}
.acc__trigger:hover .acc__chevron {
  background: color-mix(in oklch, var(--accent-trust) 12%, transparent);
  color: var(--accent-trust);
}
.acc__item--open .acc__chevron {
  transform: rotate(180deg);
  background: var(--accent-call);
  color: var(--text-oncall);
}

/* Panneau: hauteur animee via grid-template-rows (0fr -> 1fr). Ferme, il sort de
 * l'ordre de tabulation (visibility: hidden) et de la mesure (hauteur nulle). */
.acc__panel {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows var(--motion-duration-expand) var(--motion-ease-settle);
}
.acc__panel[hidden] {
  display: grid;
  grid-template-rows: 0fr;
  visibility: hidden;
}
.acc__panel-inner {
  min-height: 0;
  overflow: hidden;
}
.acc__content {
  padding: 0 2.4rem 2.4rem;
  max-width: 64ch;
}

/* Kill-switch local: les utilisateurs sensibles au mouvement obtiennent une
 * bascule instantanee (pas d'animation de hauteur ni de chevron). */
@media (prefers-reduced-motion: reduce) {
  .acc__panel,
  .acc__chevron {
    transition: none;
  }
}
</style>
