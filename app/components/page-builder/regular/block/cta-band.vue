<script setup lang="ts">
/* Bandeau d'appel (cta-band): LE moment fort de la page. Bande pleine largeur en
 * bleu nuit, posee et ancree au sol, qui pousse au geste de conversion. Reprend
 * le motif de couverture radial (anneaux ambre) de service-cities pour la
 * coherence du langage local. Disposition posee et asymetrique: le titre et la
 * rassurance a gauche, le panneau d'action a droite (sur desktop), empile au plus
 * etroit. Le bouton d'appel respire (pulse). Texte clair sur navy. Aucune
 * numerotation. */
import type { BlockBase } from '~/types/blocks'
import type { CtaBandContent, CtaLink } from '~/content/cta-band'

type CtaBandBlock = BlockBase<'cta-band'> & CtaBandContent

defineProps<CtaBandBlock>()

function linkKind(href: string): 'internal' | 'external' | 'anchor' {
  if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return 'anchor'
  if (href.startsWith('http')) return 'external'
  return 'internal'
}
</script>

<template>
  <section class="ctaband">
    <div class="wf-container">
      <div class="ctaband__panel">
        <svg class="ctaband__rings" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
          <circle cx="100" cy="100" r="92" />
          <circle cx="100" cy="100" r="66" />
          <circle cx="100" cy="100" r="40" />
          <circle cx="100" cy="100" r="16" />
        </svg>

        <div class="ctaband__layout" data-reveal-stagger>
          <div class="ctaband__lede">
            <p class="ctaband__eyebrow wf-caption">
              <span class="ctaband__tick" aria-hidden="true" />
              <Icon name="lucide:shield-check" class="ctaband__eyebrow-icon" aria-hidden="true" />
            </p>
            <h2 class="ctaband__title wf-h2">{{ title }}</h2>
            <p v-if="subtitle" class="ctaband__subtitle wf-body-1">{{ subtitle }}</p>
          </div>

          <div class="ctaband__actions">
            <Button
              :href="primaryCta.href"
              :kind="linkKind(primaryCta.href)"
              variant="call"
              icon="lucide:phone"
              :pulse="true"
              class="ctaband__primary"
            >
              {{ primaryCta.label }}
            </Button>
            <Button
              v-if="secondaryCta"
              :href="(secondaryCta as CtaLink).href"
              :kind="linkKind((secondaryCta as CtaLink).href)"
              variant="ghost"
              tone="ondark"
              :icon="false"
            >
              {{ (secondaryCta as CtaLink).label }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ctaband {
  padding-block: var(--space-block-loose);
  background: var(--bg-base);
}

/* Panneau bleu nuit, pose et ancre, avec une grande respiration interne. Le motif
 * radial deborde dans un coin (le local comme motif), discret. */
.ctaband__panel {
  position: relative;
  overflow: hidden;
  padding: 4rem 3.2rem;
  border-radius: var(--radius-lg);
  background: var(--bg-deep);
  color: var(--text-ondeep);
  box-shadow: var(--elev-high);
}
.ctaband__rings {
  position: absolute;
  bottom: -8rem;
  right: -8rem;
  width: 34rem;
  height: 34rem;
  opacity: 0.45;
  pointer-events: none;
}
.ctaband__rings circle {
  fill: none;
  stroke: color-mix(in oklch, var(--accent-call) 55%, transparent);
  stroke-width: 1;
}

.ctaband__layout {
  position: relative;
  display: grid;
  gap: 3.2rem;
}

.ctaband__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  margin-bottom: 1.6rem;
  color: color-mix(in oklch, var(--text-ondeep) 80%, transparent);
}
.ctaband__tick {
  display: inline-block;
  width: 2.6rem;
  height: 3px;
  border-radius: 2px;
  background: var(--accent-call);
}
.ctaband__eyebrow-icon {
  width: 2rem;
  height: 2rem;
  color: var(--accent-call);
}
.ctaband__title {
  color: var(--text-ondeep);
  max-width: 22ch;
}
.ctaband__subtitle {
  margin-top: var(--space-title-lead);
  max-width: 52ch;
  color: color-mix(in oklch, var(--text-ondeep) 82%, transparent);
}

.ctaband__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.4rem;
}
.ctaband__primary {
  flex: 0 0 auto;
}

@container site (min-width: 640px) {
  .ctaband__panel {
    padding: 5.6rem 5.6rem;
  }
}

/* Desktop: asymetrie posee. La rassurance prend la majeure partie, le panneau
 * d'action se cale a droite, aligne au bas (les pieds au sol). */
@container site (min-width: 1024px) {
  .ctaband__panel {
    padding: 6.4rem 7.2rem;
  }
  .ctaband__layout {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    align-items: end;
    gap: 4rem;
  }
  .ctaband__lede {
    grid-column: 1 / span 7;
  }
  .ctaband__actions {
    grid-column: 8 / -1;
    flex-direction: column;
    align-items: flex-start;
  }
  .ctaband__actions :deep(.btn) {
    width: 100%;
  }
}
</style>
