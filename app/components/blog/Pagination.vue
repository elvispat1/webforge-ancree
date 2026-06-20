<script setup lang="ts">
/* Pagination du blog (liste + archives). Nav sobre: Precedent, numeros de page,
 * Suivant. URL: page 1 = basePath nu, page N>1 = basePath/page/N. Le composant ne
 * connait pas la route courante, il derive tout de page/totalPages/basePath.
 * Liens <NuxtLink> crawlables (prerendu statique). Le maillon actif n'est pas un
 * lien (span aria-current, page courante non cliquable).
 *
 * Langage Ancree: numeros en slab (Bitter) poses sur la surface par une ombre
 * chaude (le bord, pas un filet dur); le numero COURANT est ancre au sol (navy
 * plein + racine ambre en pied, echo de la languette du heros). NB: numeros de
 * PAGE = navigation, jamais une numerotation d'elements (regle no-numbering
 * site-wide respectee). Masque entierement quand il n'y a qu'une page. */

const props = defineProps<{
  /** Page courante (1-indexee). */
  page: number
  /** Nombre total de pages. */
  totalPages: number
  /** Racine de la collection paginee, ex '/blog' ou '/blog/prevention'. */
  basePath: string
}>()

const { t } = useI18n()

/** URL d'une page: page 1 = basePath nu; page N>1 = basePath/page/N. */
function hrefFor(n: number): string {
  return n === 1 ? props.basePath : `${props.basePath}/page/${n}`
}

const pages = computed(() => Array.from({ length: props.totalPages }, (_, i) => i + 1))
const hasPrev = computed(() => props.page > 1)
const hasNext = computed(() => props.page < props.totalPages)
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" :aria-label="t('a11y.pagination')">
    <!-- Precedent: present seulement si une page le precede. La grille a 3
         colonnes garde les numeros centres meme quand un bord manque. -->
    <NuxtLink
      v-if="hasPrev"
      :to="hrefFor(page - 1)"
      class="pagination__edge pagination__edge--prev"
      :aria-label="t('a11y.previous_page')"
    >
      <Icon name="lucide:chevron-left" class="pagination__chevron" aria-hidden="true" />
      <span class="pagination__edge-label">{{ t('a11y.previous_page') }}</span>
    </NuxtLink>

    <ol class="pagination__list">
      <li v-for="n in pages" :key="n" class="pagination__item">
        <span
          v-if="n === page"
          class="pagination__num pagination__num--current"
          aria-current="page"
        >{{ n }}</span>
        <NuxtLink v-else :to="hrefFor(n)" class="pagination__num">{{ n }}</NuxtLink>
      </li>
    </ol>

    <!-- Suivant: present seulement s'il reste une page apres. -->
    <NuxtLink
      v-if="hasNext"
      :to="hrefFor(page + 1)"
      class="pagination__edge pagination__edge--next"
      :aria-label="t('a11y.next_page')"
    >
      <span class="pagination__edge-label">{{ t('a11y.next_page') }}</span>
      <Icon name="lucide:chevron-right" class="pagination__chevron" aria-hidden="true" />
    </NuxtLink>
  </nav>
</template>

<style scoped>
/* Grille 3 colonnes: bord gauche, numeros centres, bord droit. Une colonne vide
 * (premiere/derniere page) laisse les numeros parfaitement centres, sans cale. */
.pagination {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: clamp(0.8rem, 2vw, 1.6rem);
  margin-top: clamp(3.2rem, 6vh, 5.2rem);
}

.pagination__list {
  grid-column: 2;
  justify-self: center;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Numero: tuile slab posee. L'ombre chaude (+ un filet inset a peine perceptible)
 * definit le bord, jamais un trait dur. Chiffres a chasse fixe (rangee stable). */
.pagination__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4.4rem;
  height: 4.4rem;
  padding-inline: 0.8rem;
  border-radius: var(--radius-md);
  background: var(--bg-lift);
  box-shadow:
    var(--elev-flush),
    inset 0 0 0 var(--line-width) color-mix(in oklch, var(--text-base) 12%, transparent);
  color: var(--text-base);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.7rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-decoration: none;
  transition:
    transform var(--motion-duration-hover) var(--motion-ease-settle),
    box-shadow var(--motion-duration-hover) var(--motion-ease-settle);
}

/* Survol d'un numero cliquable: l'ombre se renforce, la tuile se souleve d'un
 * cheveu (posee plus haut). A l'appui, elle redescend au sol (« se pose »). */
a.pagination__num:hover {
  transform: translateY(-1px);
  box-shadow:
    var(--elev-low),
    inset 0 0 0 var(--line-width) color-mix(in oklch, var(--text-base) 24%, transparent);
}
a.pagination__num:active {
  transform: translateY(0);
  box-shadow:
    var(--elev-flush),
    inset 0 0 0 var(--line-width) color-mix(in oklch, var(--text-base) 24%, transparent);
}

/* Page courante: ancree au sol. Navy plein, racine ambre en pied (la languette
 * d'ancrage, echo du heros), ombre posee. Non cliquable. */
.pagination__num--current {
  background: var(--bg-deep);
  color: var(--text-ondeep);
  box-shadow:
    var(--elev-low),
    inset 0 -3px 0 0 var(--accent-call);
  cursor: default;
}

/* Precedent / Suivant: fantome a filet, chevron + libelle. */
.pagination__edge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 4.4rem;
  padding-inline: 1.4rem;
  border-radius: var(--radius-md);
  background: transparent;
  box-shadow: inset 0 0 0 var(--line-width) color-mix(in oklch, var(--text-base) 18%, transparent);
  color: var(--text-base);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.5rem;
  text-decoration: none;
  transition:
    background-color var(--motion-duration-hover) var(--motion-ease-settle),
    box-shadow var(--motion-duration-hover) var(--motion-ease-settle);
}
.pagination__edge--prev {
  grid-column: 1;
  justify-self: start;
}
.pagination__edge--next {
  grid-column: 3;
  justify-self: end;
}
.pagination__edge:hover {
  background: color-mix(in oklch, var(--text-base) 5%, transparent);
  box-shadow: inset 0 0 0 var(--line-width) color-mix(in oklch, var(--text-base) 34%, transparent);
}
.pagination__chevron {
  width: 1.8rem;
  height: 1.8rem;
  flex: none;
}

/* Focus clavier dedie: l'anneau epouse le rayon (coherent avec le bouton). */
.pagination__num:focus-visible,
.pagination__edge:focus-visible {
  outline: var(--focus-ring-width) solid var(--accent-trust);
  outline-offset: var(--focus-ring-offset);
  border-radius: var(--radius-md);
}

/* Compact: sous la mesure etroite, les libelles Precedent/Suivant cedent la
 * place aux chevrons seuls (l'aria-label porte toujours l'intitule complet). */
@container site (max-width: 520px) {
  .pagination__edge-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .pagination__edge {
    padding-inline: 1rem;
  }
}
</style>
