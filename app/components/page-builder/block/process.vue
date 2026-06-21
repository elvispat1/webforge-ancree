<script setup lang="ts">
/* Processus (comment on intervient): trois temps poses sur une meme ligne
 * d'horizon, signature « s'ancre au sol » de la famille. L'ordre se LIT de gauche
 * a droite (et de haut en bas au plus etroit), il n'est JAMAIS numerote (regle dure
 * site-wide): la ligne qui relie les pastilles porte la progression, pas des
 * chiffres. Fond en alternance tres subtile (jamais beige) pour le rythme entre la
 * grille de services et la suite. Asymetrie posee via SectionHead. */
import type { BlockBase } from '~/types/blocks'
import type { ProcessContent } from '~/content/process'

type ProcessBlock = BlockBase<'process'> & ProcessContent

defineProps<ProcessBlock>()
</script>

<template>
  <section class="process">
    <div class="wf-container">
      <SectionHead :eyebrow="eyebrow" :heading="heading" :lead="lead" />

      <ul class="process__steps" data-reveal-stagger>
        <li v-for="step in steps" :key="step.title" class="process__step">
          <span class="process__pastille" aria-hidden="true">
            <Icon :name="step.icon" class="process__icon" />
          </span>
          <h3 class="process__title wf-h4">{{ step.title }}</h3>
          <p class="process__body wf-body-2">{{ step.body }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.process {
  padding-block: var(--space-block-default);
  background: var(--bg-alt);
}

/* Liste des temps. Mobile: empiles. La ligne d'horizon n'apparait qu'au desktop,
 * la ou les pastilles s'alignent sur une meme rangee. */
.process__steps {
  margin: 4.8rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr;
  gap: 3.2rem;
}
.process__step {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Pastille opaque: elle se pose SUR la ligne d'horizon et la masque a son aplomb,
 * de sorte que la ligne ne reste visible qu'entre les pastilles (le lien d'un temps
 * au suivant). Meme materiau que les autres blocs (ambre doux, icone bleu confiance). */
.process__pastille {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 5.2rem;
  height: 5.2rem;
  border-radius: var(--radius);
  background: var(--accent-call-soft);
  box-shadow: var(--elev-low);
  margin-bottom: 2rem;
}
.process__icon {
  width: 2.8rem;
  height: 2.8rem;
  color: var(--accent-trust);
}
.process__title {
  margin: 0;
}
.process__body {
  margin-top: 1.2rem;
  max-width: 42ch;
  color: var(--text-muted);
}

@container site (min-width: 768px) {
  .process__steps {
    position: relative;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4rem;
    align-items: start;
  }
  /* Ligne d'horizon, a l'aplomb du centre des pastilles (2.6rem = moitie de 5.2rem).
   * Filet doux pleine largeur, fondu aux extremites pour qu'il se pose sans bord
   * dur. Les pastilles opaques le masquent: il relie les temps entre eux. */
  .process__steps::before {
    content: '';
    position: absolute;
    top: 2.6rem;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      to right,
      transparent,
      color-mix(in oklch, var(--text-base) 14%, transparent) 12%,
      color-mix(in oklch, var(--text-base) 14%, transparent) 88%,
      transparent
    );
    z-index: 0;
  }
  /* Languette ambre d'amorce: le geste « ancre au sol » de la famille, posee au
   * depart de la ligne (sous la premiere pastille). */
  .process__steps::after {
    content: '';
    position: absolute;
    top: 2.6rem;
    left: 0;
    width: 3.2rem;
    height: 2px;
    background: var(--accent-call);
    z-index: 0;
  }
}
</style>
