<script setup lang="ts">
/* SectionHead — en-tête de section réutilisable (famille Minimaliste).
 *
 * Surtitre + titre + description + CTA. La disposition est choisie selon le
 * contenu, pas par une prop:
 *   - split: titre (+ surtitre) à gauche, description + CTA à droite, dès qu'il
 *     y a une description OU au moins un CTA;
 *   - titre seul élargi: quand il n'y a ni description ni CTA (le titre prend
 *     plus de place, cf. en-têtes du one-pager).
 * Toujours posé sur .section-grid, donc aligné à la grille de page.
 *
 * Règle CTA: 1 CTA = lien à filet (wf-rule-link); 2 CTA = boutons style héros
 * (primary + ghost). Les CTA internes naviguent en SPA (NuxtLink).
 *
 * Remplace les en-têtes bespoke (services, process, projects-preview) et l'empilé
 * sur grille (wf-section-head-grid); la base wf-section-head subsiste (faq,
 * MediaGallery, articles connexes). Candidat webforge-minimaliste. */
interface SectionCta {
  /** Libellé du CTA. */
  label: string
  /** Cible: route interne (/...), ancre (#...) ou URL externe. */
  href: string
}

const props = withDefaults(
  defineProps<{
    eyebrow?: string
    heading: string
    lead?: string
    /** 0, 1 ou 2 CTA. 1 -> lien à filet; 2 -> boutons (primary + ghost). */
    ctas?: SectionCta[]
  }>(),
  {
    eyebrow: undefined,
    lead: undefined,
    ctas: () => []
  }
)

/* Colonne droite (split) dès qu'il y a une description ou au moins un CTA;
 * sinon titre seul, élargi. */
const hasAside = computed(() => Boolean(props.lead) || props.ctas.length > 0)
const ctaMode = computed(() =>
  props.ctas.length >= 2 ? 'buttons' : props.ctas.length === 1 ? 'rule' : 'none'
)
/* CTA unique du mode filet, rétréci en amont (noUncheckedIndexedAccess: ctas[0]
 * serait possiblement undefined dans le template). */
const ruleCta = computed(() => (props.ctas.length === 1 ? props.ctas[0] : undefined))

/* Lien à filet route-aware: NuxtLink pour une route interne, <a> pour ancre ou
 * URL externe (cf. Logo: une chaîne dans :is ne se résout pas en composant). */
const NuxtLink = resolveComponent('NuxtLink')
function ctaKind(href: string): 'internal' | 'anchor' | 'external' {
  if (href.startsWith('#')) return 'anchor'
  if (href.startsWith('/')) return 'internal'
  return 'external'
}
</script>

<template>
  <header class="section-grid wf-shead" :class="{ 'wf-shead--split': hasAside }">
    <div class="wf-shead-main" data-reveal-stagger>
      <div v-if="eyebrow" class="wf-caption">{{ eyebrow }}</div>
      <h2 class="wf-h2">{{ heading }}</h2>
    </div>

    <div v-if="hasAside" class="wf-shead-aside" data-reveal-stagger>
      <p v-if="lead" class="wf-body-2 wf-text-muted">{{ lead }}</p>

      <component
        v-if="ruleCta"
        :is="ctaKind(ruleCta.href) === 'internal' ? NuxtLink : 'a'"
        v-bind="ctaKind(ruleCta.href) === 'internal' ? { to: ruleCta.href } : { href: ruleCta.href }"
        class="wf-rule-link"
      >
        <span class="wf-rule-link-label">{{ ruleCta.label }}</span>
        <Icon name="lucide:chevron-right" class="wf-rule-link-arrow" aria-hidden="true" />
      </component>

      <div v-else-if="ctaMode === 'buttons'" class="wf-shead-ctas">
        <Button
          v-for="(c, i) in ctas"
          :key="c.href"
          :href="c.href"
          :kind="ctaKind(c.href)"
          :variant="i === 0 ? 'primary' : 'ghost'"
          :icon="i === 0 ? 'lucide:chevron-right' : false"
        >{{ c.label }}</Button>
      </div>
    </div>
  </header>
</template>
