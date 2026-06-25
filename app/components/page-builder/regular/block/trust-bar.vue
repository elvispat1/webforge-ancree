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
      <dl class="trust__row section-grid" data-reveal-stagger>
        <div v-for="item in items" :key="item.value" class="trust__item">
          <span class="trust__chip" aria-hidden="true">
            <Icon :name="item.icon" class="trust__icon" />
          </span>
          <div class="trust__text">
            <dt class="trust__value wf-h5">{{ item.value }}</dt>
            <dd class="trust__label wf-caption">{{ item.label }}</dd>
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
  padding-block: var(--space-block-band);
}
/* La rangee se cale sur les pistes de page (.section-grid): 4 colonnes au mobile,
 * 16 au desktop. Les signaux tombent sur les pistes, pas sur une grille a part. */
/* Au mobile les signaux s'empilent: l'ecart vertical reprend le rythme
 * d'espacement du site (4.8rem, le meme palier que l'en-tete vers contenu). */
.trust__row {
  margin: 0;
  row-gap: var(--space-head-content);
}
/* Mobile: une seule colonne, les signaux s'empilent l'un sous l'autre
 * (span 4 = pleine largeur des 4 pistes mobiles). */
.trust__item {
  grid-column: span 4;
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
/* Echelle reprise de wf-h5 (display) sur le <dt>. On reimpose seulement la
 * couleur claire: wf-h5 force --text-base (illisible sur fond sombre). */
.trust__value {
  color: var(--text-ondeep);
  text-wrap: balance;
}
/* Echelle reprise de wf-caption (1.4rem) sur le <dd>. On garde l'opacite
 * tokenisee du qualificatif sur fond sombre et la remise a zero de marge. */
.trust__label {
  margin: 0;
  color: color-mix(in oklch, var(--text-ondeep) 74%, transparent);
  text-wrap: balance;
}

@container site (min-width: 1024px) {
  /* 16 pistes, quatre signaux d'egale largeur (span 4 chacun) sur une rangee. */
  .trust__item {
    grid-column: span 4;
  }
  .trust__item + .trust__item {
    padding-left: 3rem;
    border-left: var(--line-ondeep);
  }
}
</style>
