<script setup lang="ts">
/* Barre de confiance: bande pleine largeur en bleu nuit, posee juste sous le
 * heros. Casse le rythme et ancre (DESIGN.md). Licencie, avis, garantie, annees.
 * Disposition propre a Ancree: une rangee de signaux sur fond contraste, icones
 * line-art ambre, filets clairs entre les items. */
import type { TrustBarBlock } from '~/types/blocks'

defineProps<TrustBarBlock>()
</script>

<template>
  <section class="trust">
    <div class="wf-container">
      <dl class="trust__row">
        <div v-for="item in items" :key="item.value" class="trust__item">
          <span class="trust__chip" aria-hidden="true">
            <Icon :name="item.icon" class="trust__icon" />
          </span>
          <div class="trust__text">
            <dt class="trust__value">{{ item.value }}</dt>
            <dd class="trust__label">{{ item.label }}</dd>
          </div>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.trust {
  background: var(--bg-deep);
  color: var(--text-ondeep);
  padding-block: clamp(2.6rem, 4vh, 3.6rem);
}
.trust__row {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2.4rem 2rem;
}
.trust__item {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
/* Puce de matiere sous l'icone: meme traitement que la carte vedette navy des
 * services (lift clair, icone ambre). Lie les surfaces navy et casse le plat. */
.trust__chip {
  display: grid;
  place-items: center;
  width: 4.2rem;
  height: 4.2rem;
  flex: none;
  border-radius: var(--radius-sm);
  background: color-mix(in oklch, white 8%, transparent);
}
.trust__icon {
  width: 2.4rem;
  height: 2.4rem;
  color: var(--accent-call);
}
.trust__value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.8rem;
  line-height: 1.15;
}
.trust__label {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.3;
  color: color-mix(in oklch, var(--text-ondeep) 74%, transparent);
}

@container site (min-width: 1024px) {
  .trust__row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 3rem;
  }
  .trust__item + .trust__item {
    padding-left: 3rem;
    border-left: var(--line-ondeep);
  }
}
</style>
