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

      <AccordionPanel :open="isOpen(i)" :panel-id="panelId(i)" :labelledby="triggerId(i)">
        <slot name="content" :item="item" :index="i">{{ item.content }}</slot>
      </AccordionPanel>
    </div>
  </div>
</template>

<style scoped>
.acc {
  display: grid;
  gap: 1.6rem;
  /* Rythme du tiroir cote CSS: synchronise le pivot du chevron et le fondu de
   * l'ambre sur l'ouverture du panneau (la HAUTEUR, elle, est animee en JS par
   * AccordionPanel, car la transition CSS de grid-template-rows n'anime pas de
   * facon fiable selon les navigateurs). Courbe in-out delicate (depart ET fin
   * doux) et duree posee, miroir de MOTION.{duration,ease}.drawer. */
  --acc-drawer-dur: 460ms;
  --acc-drawer-ease: cubic-bezier(0.45, 0, 0.15, 1);
}

/* Chaque entree: une carte chaude, arrondie, posee (ombre douce). */
.acc__item {
  background: var(--bg-lift);
  border: var(--line-width) solid transparent;
  border-radius: var(--radius);
  box-shadow: var(--elev-low);
  overflow: hidden;
  /* Bordure et fond ambre fondent au RYTHME du tiroir (ils naissent a l'ouverture),
   * l'ombre suit le tempo rapide du survol. */
  transition:
    box-shadow var(--motion-duration-hover) var(--motion-ease-out),
    border-color var(--acc-drawer-dur) var(--acc-drawer-ease),
    background-color var(--acc-drawer-dur) var(--acc-drawer-ease);
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
  transition: color var(--motion-duration-hover) var(--motion-ease-out);
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
    transform var(--acc-drawer-dur) var(--acc-drawer-ease),
    background-color var(--motion-duration-hover) var(--motion-ease-out),
    color var(--motion-duration-hover) var(--motion-ease-out);
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

/* Le panneau (hauteur, repli, a11y) vit dans AccordionPanel: sa hauteur est animee
 * en JS (GSAP), pas par une transition CSS. */

/* Kill-switch local: les utilisateurs sensibles au mouvement obtiennent une
 * bascule instantanee du chevron (la hauteur est deja instantanee cote JS via
 * motionDisabled dans AccordionPanel). */
@media (prefers-reduced-motion: reduce) {
  .acc__chevron {
    transition: none;
  }
}
</style>
