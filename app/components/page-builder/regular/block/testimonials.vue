<script setup lang="ts">
/* Temoignages: un MUR asymetrique, pas une grille reguliere (DESIGN.md: facon
 * mosaique legere). Vrai masonry par colonnes CSS, les cartes coulent en hauteurs
 * inegales avec des decalages poses a la main au desktop. Une carte d'ancrage en
 * bleu nuit casse le champ blanc (le moment fort du mur). Chaque carte: cinq
 * etoiles ambre, la citation, puis le nom et la VILLE du client (renforce le
 * local). Distinct du mur de citations uniforme de Minimaliste. Aucune
 * numerotation. La section peint son fond tout de suite; seul le mur est anime. */
import type { BlockBase } from '~/types/blocks'
import type { TestimonialsContent } from '~/content/testimonials'

type TestimonialsBlock = BlockBase<'testimonials'> & TestimonialsContent

const props = defineProps<TestimonialsBlock>()

/* La carte d'ancrage (bleu nuit) est posee en deuxieme position: assez tot pour
 * ancrer le haut du mur, decalee de la premiere colonne (asymetrie posee). */
const anchorIndex = computed(() => (props.items.length > 2 ? 1 : 0))
</script>

<template>
  <section class="tm">
    <div class="wf-container">
      <SectionHead :eyebrow="eyebrow" :heading="heading" />

      <ul class="tm__wall" data-reveal-stagger>
        <li
          v-for="(item, i) in items"
          :key="item.name + item.city"
          class="tm__card"
          :class="{ 'tm__card--anchor': i === anchorIndex }"
        >
          <figure class="tm__figure">
            <Icon name="lucide:quote" class="tm__mark" aria-hidden="true" />
            <blockquote class="tm__quote wf-body-2">{{ item.quote }}</blockquote>
            <figcaption class="tm__cite">
              <span class="tm__name wf-caption">{{ item.name }}</span>
              <span class="tm__city">
                <Icon name="lucide:map-pin" class="tm__pin" aria-hidden="true" />
                {{ item.city }}
              </span>
            </figcaption>
          </figure>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.tm {
  padding-block: var(--space-block-default);
  background: var(--bg-alt);
}

/* Mur en masonry par colonnes: les cartes coulent en hauteurs inegales, jamais
 * une grille reguliere. Une colonne au mobile, puis deux, puis trois. */
.tm__wall {
  margin: 4.8rem 0 0;
  padding: 0;
  list-style: none;
  column-count: 1;
  column-gap: 2rem;
}
.tm__card {
  break-inside: avoid;
  margin-bottom: 2rem;
}

.tm__figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 3rem;
  background: var(--bg-lift);
  border-radius: var(--radius-lg);
  box-shadow: var(--elev-low);
  color: var(--text-base);
  transition:
    transform var(--motion-duration-hover) var(--motion-ease-settle),
    box-shadow var(--motion-duration-hover) var(--motion-ease-settle);
}
.tm__card:hover .tm__figure {
  transform: translateY(-4px);
  box-shadow: var(--elev-high);
}

/* Le grand guillemet, marqueur ambre pose en tete de la citation (la citation
 * porte le temoignage; pas de rang d'etoiles uniforme qui sonne faux). */
.tm__mark {
  width: 3.6rem;
  height: 3.6rem;
  color: color-mix(in oklch, var(--accent-call) 75%, transparent);
}
.tm__quote {
  margin-top: 1rem;
  text-wrap: pretty;
}
.tm__cite {
  margin-top: 2rem;
  padding-top: 1.8rem;
  border-top: var(--line-hair);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-style: normal;
}
.tm__name {
  color: var(--text-base);
}
.tm__city {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-body);
  font-size: 1.4rem;
  color: var(--text-muted);
}
.tm__pin {
  width: 1.6rem;
  height: 1.6rem;
  flex: none;
  color: var(--accent-trust);
}

/* Carte d'ancrage: bleu nuit, le moment fort du mur. Etoiles et nom passent au
 * clair, le pin a l'ambre. */
.tm__card--anchor .tm__figure {
  background: var(--bg-deep);
  border-color: transparent;
  color: var(--text-ondeep);
  box-shadow: var(--elev-mid);
}
.tm__card--anchor .tm__mark {
  color: color-mix(in oklch, var(--accent-call) 85%, transparent);
}
.tm__card--anchor .tm__quote {
  color: var(--text-ondeep);
}
.tm__card--anchor .tm__cite {
  border-top-color: color-mix(in oklch, white 18%, transparent);
}
.tm__card--anchor .tm__name {
  color: var(--text-ondeep);
}
.tm__card--anchor .tm__city {
  color: color-mix(in oklch, var(--text-ondeep) 78%, transparent);
}
.tm__card--anchor .tm__pin {
  color: var(--accent-call);
}

@container site (min-width: 640px) {
  .tm__wall {
    column-count: 2;
  }
}
@container site (min-width: 1024px) {
  .tm__wall {
    column-count: 3;
    column-gap: 2.4rem;
  }
  .tm__card {
    margin-bottom: 2.4rem;
  }
  /* Decalages poses a la main: le haut des colonnes respire en escalier
   * (asymetrie posee), sans toucher au contenu. La premiere carte de chaque
   * colonne porte le decalage; les suivantes coulent dessous. */
  .tm__card:nth-child(2) {
    margin-top: 4rem;
  }
  .tm__card:nth-child(3) {
    margin-top: 8rem;
  }
}
</style>
