<script setup lang="ts">
/* Services: grille a colonnes variables, cartes arrondies a ombre chaude, icones
 * line-art. Asymetrie posee: une carte vedette plus large, en bleu nuit, parmi
 * des cartes blanches (mosaique legere, pas une grille parfaitement reguliere).
 * Aucune numerotation. href present -> la carte devient un lien (page service). */
import type { ServicesBlock } from '~/types/blocks'
import type { SectionCta } from '~/content/blocks'

const props = defineProps<ServicesBlock>()
const { t } = useI18n()
const NuxtLink = resolveComponent('NuxtLink')

const ctas = computed<SectionCta[]>(() =>
  props.ctaHref && props.ctaLabel ? [{ label: props.ctaLabel, href: props.ctaHref }] : []
)
</script>

<template>
  <section class="services">
    <div class="wf-container">
      <SectionHead :eyebrow="eyebrow" :heading="heading" :lead="lead" />

      <ul class="services__grid section-grid" data-reveal-stagger>
        <li
          v-for="item in items"
          :key="item.title"
          class="services__card"
          :class="{ 'services__card--featured': item.featured }"
        >
          <component
            :is="item.href ? NuxtLink : 'div'"
            :to="item.href || undefined"
            class="services__card-inner"
          >
            <span class="services__icon-wrap">
              <Icon :name="item.icon" class="services__icon" aria-hidden="true" />
            </span>
            <h3 class="services__title wf-h4">{{ item.title }}</h3>
            <p class="services__body wf-body-2">{{ item.summary }}</p>
            <span v-if="item.href" class="services__more">
              {{ t('ui.learn_more') }}
              <Icon name="lucide:arrow-right" aria-hidden="true" />
            </span>
          </component>
        </li>
      </ul>

      <SectionCta :ctas="ctas" />
    </div>
  </section>
</template>

<style scoped>
.services {
  padding-block: var(--space-block-default);
  background: var(--bg-base);
}
.services__grid {
  margin: var(--space-head-content) 0 0;
  padding: 0;
  list-style: none;
}
.services__card {
  /* Mobile (4 pistes de la section-grid): chaque carte prend toute la largeur. */
  grid-column: 1 / -1;
  border-radius: var(--radius-lg);
}
.services__card-inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
  padding: 3.2rem;
  background: var(--bg-lift);
  border-radius: var(--radius-lg);
  box-shadow: var(--elev-mid);
  color: var(--text-base);
  text-decoration: none;
  /* Ancre au sol: au survol, la carte se RECHAUFFE simplement (le fond chauffe,
   * la pastille d'icone s'allume en ambre plein, l'icone passe au navy). Le texte
   * ne bascule PAS: ni brusque, ni illisible, ni un lift. Vitesse moyenne (line,
   * 240ms), courbe ease-out DOUCE et graduelle (pas le settle front-loaded). */
  transition: background-color var(--motion-duration-line) var(--motion-ease-out);
}
.services__icon-wrap,
.services__icon {
  transition:
    background-color var(--motion-duration-line) var(--motion-ease-out),
    color var(--motion-duration-line) var(--motion-ease-out);
}

/* Carte blanche: le fond se teinte d'ambre doux (texte navy intact, lisible). */
.services__card:not(.services__card--featured) a.services__card-inner:hover {
  background: var(--accent-call-soft);
}
/* Carte vedette navy: le fond se rechauffe legerement (reste sombre, texte clair
 * intact). */
.services__card--featured a.services__card-inner:hover {
  background: color-mix(in oklch, var(--bg-deep) 86%, var(--accent-call));
}
/* Les deux: la pastille d'icone s'allume en ambre plein, l'icone passe au navy. */
a.services__card-inner:hover .services__icon-wrap {
  background: var(--accent-call);
}
a.services__card-inner:hover .services__icon {
  color: var(--navy);
}
.services__icon-wrap {
  display: grid;
  place-items: center;
  width: 5.2rem;
  height: 5.2rem;
  border-radius: var(--radius);
  background: var(--accent-call-soft);
  margin-bottom: 2rem;
}
.services__icon {
  width: 2.8rem;
  height: 2.8rem;
  color: var(--accent-trust);
}
.services__title {
  margin: 0;
}
.services__body {
  margin-top: var(--space-card-title-body);
  color: var(--text-muted);
}
.services__more {
  margin-top: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--accent-trust);
}
.services__more svg {
  width: 1.7rem;
  height: 1.7rem;
  transition: transform var(--motion-duration-line) var(--motion-ease-out);
}
a.services__card-inner:hover .services__more svg {
  transform: translateX(4px);
}

/* Carte vedette: bleu nuit, plus large. Le moment fort de la grille. */
.services__card--featured .services__card-inner {
  background: var(--bg-deep);
  color: var(--text-ondeep);
  box-shadow: var(--elev-mid);
}
.services__card--featured .services__icon-wrap {
  background: color-mix(in oklch, white 12%, transparent);
}
.services__card--featured .services__icon {
  color: var(--accent-call);
}
.services__card--featured .services__title {
  color: var(--text-ondeep);
}
.services__card--featured .services__body {
  color: color-mix(in oklch, var(--text-ondeep) 80%, transparent);
}
.services__card--featured .services__more {
  color: var(--accent-call);
}

/* Tablette: 2 cartes par rangee, calees sur 2 des 4 pistes de la section-grid
 * (la source unique reste la grille de page; pas de grid-template-columns redeclare). */
@container site (min-width: 640px) {
  .services__card {
    grid-column: span 2;
  }
}
/* Desktop: mosaique calee sur les 16 pistes de la page. Rangee 1 = vedette (8) +
 * paire etroite (4 + 4); rangee 2 = paire mediane (8 + 8). Largeurs qui varient
 * (DESIGN.md), hauteurs egales par rangee via align-items: stretch. */
@container site (min-width: 1024px) {
  /* Les 16 pistes et la gouttiere 2rem viennent de .section-grid (source unique).
   * Ici on ne pilote que l'egalite de hauteur par rangee et le placement. */
  .services__grid {
    align-items: stretch;
  }
  .services__card {
    grid-column: span 8;
  }
  .services__card:nth-child(2),
  .services__card:nth-child(3) {
    grid-column: span 4;
  }
  .services__card--featured {
    grid-column: span 8;
  }
  .services__card--featured .services__title {
    max-width: 22ch;
  }
  .services__card--featured .services__body {
    max-width: 52ch;
  }
}
</style>
